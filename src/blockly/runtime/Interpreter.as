package blockly.runtime
{
	import cc.makeblock.interpreter.RemoteCallMgr;

	public class Interpreter
	{
		private var virtualMachine:VirtualMachine;
		private var compiler:JsonCodeToAssembly;
		
		public function Interpreter(functionProvider:FunctionProvider)
		{
			virtualMachine = new VirtualMachine(functionProvider);
			compiler = new JsonCodeToAssembly();
		}
		
		public function compile(blockList:Array):Array
		{
			var codeList:Array = compiler.translate(blockList);
			return codeList;
		}
		
		public function execute(blockList:Array):Thread
		{
			return executeAssembly(compile(blockList));
		}
		
		public function executeAssembly(codeList:Array):Thread
		{		
			var thread:Thread = new Thread(codeList);
			virtualMachine.startThread(thread);
			//RemoteCallMgr.Instance.resetStatus();
			return thread;
		}
		
		public function stopAllThreads():void
		{
			//RemoteCallMgr.Instance.resetStatus();
			virtualMachine.stopAllThreads();
		}
		
		public function getCopyOfThreadList():Vector.<Thread>
		{
			return virtualMachine.getCopyOfThreadList();
		}
		
		public function getThreadCount():uint
		{
			return virtualMachine.getThreadCount();
		}
	}
}