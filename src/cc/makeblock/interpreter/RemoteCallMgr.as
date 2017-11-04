package cc.makeblock.interpreter
{
	import flash.utils.clearTimeout;
	import flash.utils.setTimeout;
	
	import blockly.runtime.Interpreter;
	import blockly.runtime.Thread;
	
	import extensions.ScratchExtension;
	import extensions.SerialDevice;
	import extensions.SocketManager;

	public class RemoteCallMgr
	{
		static public const Instance:RemoteCallMgr = new RemoteCallMgr();
		private var myInterpreter:Interpreter ;
		private const requestList:Array = [];
		private var timerId:uint;
		private var reader:PacketParser;
		private var oldValue:Object=0;
		public var list:Vector.<Thread> = new Vector.<Thread>();
		public var info:Array = [];
		public var tmp_info:Array = [];
		public function RemoteCallMgr()
		{
			reader = new PacketParser(onPacketRecv);
			myInterpreter = new Interpreter(new ArduinoFunctionProvider());
		}
		public function init():void
		{
			SerialDevice.sharedDevice().dataRecvSignal.add(__onSerialRecv);
		}
	
		public function interruptThread():void
		{
			if(requestList.length <= 0){
				return;
			}
			var info:Array = requestList.shift();
			var thread:Thread = info[0];
			thread.interrupt();
			clearTimeout(timerId);
			send();
		}
		
		public function stopAllThreads():void
		{
			myInterpreter.stopAllThreads();
		}

		public function suspendThread():void
		{
			if(tmp_info.length > 0){
				var thread:Thread = tmp_info[0];
				if(thread != null){
					thread.suspend();
					//thread.interrupt();
				}
			}
		}

		public function resumeThread():void
		{
			if(tmp_info.length > 0){
				var thread:Thread = tmp_info[0];
				if(thread != null){
					thread.resume();
				}
			}
		}

		private function __onSerialRecv(bytes:Array):void
		{
			if(SocketManager.sharedManager().isConnected){
			}else{
					reader.append(bytes);
			}
		}

		public function onPacketRecv(value:Object=null):void
		{
			if(requestList.length <= 0){
				return;
			}
			var info:Array = requestList.shift();
			var thread:Thread = info[0];
			if(thread != null){
				if(info[4] > 0){
					if(arguments.length > 0){
						thread.push(value);
					}else{
						thread.push(0);
					}
				}
				resetStatus();
				thread.resume();
			}
			clearTimeout(timerId);
			send();
			oldValue = value||oldValue;
		}
		
		public function call(thread:Thread, method:String, param:Array, ext:ScratchExtension, retCount:int):void
		{
			var needSend:Boolean = (0 == requestList.length);
			requestList.push(arguments);
			if(needSend){
				send();
			}
		}
		
		public function resetStatus():void
		{
			if(requestList.length <= 0){
				return;
			}
			var info:Array = requestList[0];
			var ext:ScratchExtension = info[3];
			ext.js.call("Resetstatus", info[2], null);
		}
		
		private function send():void
		{
			if(requestList.length <= 0){
				return;
			}
			var info:Array = requestList[0];
			var ext:ScratchExtension = info[3];
			if(info[1] == "MoveForwardOnceOnBoard" || info[1] == "TurnLeftOnceOnBoard" || info[1] == "TurnRightOnceOnBoard" || info[1] == "MoveForwardOneSec"
				|| info[1] == "MoveBackwardOneSec" || info[1] == "TurnLeftOneSec" || info[1] == "TurnRightOneSec" || info[1] == "LinetoFloor"
				|| info[1] == "Linetointersection" || info[1] == "MoveOnceOnBoard" || info[1] == "TurnLOnceOnBoard" || info[1] == "MovebySec"
				|| info[1] == "TurnbySec"){tmp_info = requestList[0];}
			ext.js.call(info[1], info[2], null);
			if(info[1]=="runBuzzer")
			{
				timerId = setTimeout(onTimeout, 5000);
			}
			else
			{
				timerId = setTimeout(onTimeout, 500);
			}
			
		}
		
		private function onTimeout():void
		{
			if(requestList.length <= 0){
				return;
			}
			var info:Array = requestList[0];
			if(info[4] > 0){
				onPacketRecv(oldValue);
			}else{
				onPacketRecv();
			}
		}
	}
}