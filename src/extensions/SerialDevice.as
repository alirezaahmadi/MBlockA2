package extensions
{
	import flash.events.Event;
	import flash.utils.ByteArray;
	
	import blockly.signals.Signal;

	public class SerialDevice
	{
		private static var _instance:SerialDevice;
		private var _ports:Array = [];
		private var _currPort:String="";
		public function SerialDevice()
		{
		}
		public static function sharedDevice():SerialDevice{
			if(_instance==null){
				_instance = new SerialDevice;
			}
			return _instance;
		}
		public function set port(v:String):void{
			if(_ports.indexOf(v)==-1){
				_ports.push(v);
			}
		}
		
		public function get port():String{
			if(_ports.length>0){
				return _ports[_ports.length-1];
			}
			return "";
		}
		public function get ports():Array{
			return _ports;
		}
		public function get currPort():String
		{
			_currPort = port || _currPort;
			return _currPort;
		}
		public function onConnect(port:String):void{
			this.port = port;
		}
		public function open(param:Object,openedHandle:Function):void{
			var stopBits:uint = param.stopBits
			var bitRate:uint = param.bitRate;
			var ctsFlowControl:uint = param.ctsFlowControl;
			if(ConnectionManager.sharedManager().open(this.port,bitRate)){
				openedHandle(this);
				ConnectionManager.sharedManager().removeEventListener(Event.CHANGE,onReceived);
				ConnectionManager.sharedManager().addEventListener(Event.CHANGE,onReceived);
			}else{
				ConnectionManager.sharedManager().onClose(this.port);
			}
		}
		private var _receiveHandlers:Array=[];
		public function clearAll():void{
			_ports=[];
			_receiveHandlers.length = 0;
		}
		public function clear(v:String):void{
			var index:int = _ports.indexOf(v);
			_ports.splice(index);
			_receiveHandlers.length = 0;
		}
		public function set_receive_handler(name:String,receiveHandler:Function):void{
			if(receiveHandler!=null){
				for(var i:uint = 0;i<_receiveHandlers.length;i++){
					if(name==_receiveHandlers[i].name){
						_receiveHandlers.splice(i);
						break;
					}
				}
				_receiveHandlers.push({name:name,handler:receiveHandler});
			}
		}
		public function send(bytes:Array):void{
			var buffer:ByteArray = new ByteArray();
			for(var i:int=0;i<bytes.length;i++){
				buffer[i] = bytes[i];
			}
			MBlock.app.scriptsPart.onSerialSend(buffer);
			ConnectionManager.sharedManager().sendBytes(buffer);
		}
		
		public const dataRecvSignal:Signal = new Signal(Array);
		
		private function onReceived(evt:Event):void
		{
			var _receivedBuffer:ByteArray = ConnectionManager.sharedManager().readBytes();
			//因为在字符模式下，发送的byte被修改过position（可以参考 ScriptsPart::onSerialSend()）,
			//所以接收的byte的position也是有影响的，所以这里要初始化一下position，否则造成无法读取接收的值，导致一系列问题，比如字符模式下发收卡顿问题 谭启亮 20161121
			_receivedBuffer.position=0;
			var _receivedBytes:Array = [];
			while(_receivedBuffer.bytesAvailable > 0){
				_receivedBytes.push(_receivedBuffer.readUnsignedByte());
			}
			_receivedBuffer.clear();
			if(_receivedBytes.length > 0){
				dataRecvSignal.notify(_receivedBytes);
			}
			if(_receiveHandlers.length <= 0 || _receivedBytes.length <= 0){
				return;
			}
			for(var i:int=0;i<_receiveHandlers.length;i++){
				var receiveHandler:Function = _receiveHandlers[i].handler;
				if(receiveHandler!=null){
					try{
						receiveHandler(_receivedBytes);
					}catch(err:*){
						trace(err);
					}
				}
			}
		}
		public function get connected():Boolean{
			return SerialManager.sharedManager().isConnected||HIDManager.sharedManager().isConnected||BluetoothManager.sharedManager().isConnected;
		}
		public function close():void{
//			ConnectionManager.sharedManager().close();
		}
	}
}