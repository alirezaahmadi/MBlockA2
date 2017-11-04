package cc.makeblock.interpreter
{
	import blockly.runtime.Interpreter;
	import blockly.runtime.Thread;
	
	import blocks.Block;
	import cc.makeblock.interpreter.RemoteCallMgr;
	
	import scratch.ScratchObj;
	
	public class BlockInterpreter
	{
		static public const Instance:BlockInterpreter = new BlockInterpreter();
		
		private var converter:BlockJsonPrinter;
		private var realInterpreter:Interpreter;
		
		public function BlockInterpreter()
		{
			Thread.EXEC_TIME = 5;
			realInterpreter = new Interpreter(new ArduinoFunctionProvider());
			converter = new BlockJsonPrinter();
		}
		
		public function execute(block:Block, targetObj:ScratchObj):Thread
		{
			var funcList:Array = targetObj.procedureDefinitions();
			var blockList:Array = [];
			for each(var funcBlock:Block in funcList){
				blockList.push.apply(null, converter.printBlockList(funcBlock));
			}
			
			blockList.push.apply(null, converter.printBlockList(block));
			var allBlockOp:Array = [];
			getAllBlocksOp(blockList,allBlockOp);
			for(var i:int=0;i<allBlockOp.length;i++)
			{
				MBlock.app.track("/blocks/"+allBlockOp[i]);
			}
//			trace("begin==================");
//			trace(JSON.stringify(blockList));
//			var codeList:Array = realInterpreter.compile(blockList);
//			trace(codeList.join("\n"));
//			trace("end==================");
			var thread:Thread = realInterpreter.execute(blockList);
			thread.userData = new ThreadUserData(targetObj, block);
			return thread;
		}
		private function getAllBlocksOp(blist:Array,resultArr:Array):void
		{
			for(var i:int=0;i<blist.length;i++)
			{
				if(blist[i].code)
				{
					resultArr.push(blist[i].type);
					getAllBlocksOp(blist[i].code,resultArr);
				}
				if(blist[i].condition)
				{
					getAllBlocksOp([blist[i].condition],resultArr);
				}
				if(blist[i].argList)
				{
					getAllBlocksOp(blist[i].argList,resultArr);
				}
				if(blist[i].method)
				{
					resultArr.push(blist[i].method);
				}
			}
		}
		public function stopAllThreads():void
		{
			//RemoteCallMgr.Instance.resetStatus();
			realInterpreter.stopAllThreads();
		}
		
		public function hasTheadsRunning():Boolean
		{
			return realInterpreter.getThreadCount() > 0;
		}
		/*
		public function stopThreadByBlock(block:Block):void
		{
			for(var t:* in threadDict){
				if(threadDict[t] == block){
					t.interrupt();
				}
			}
		}
		*/
		public function isRunning(block:Block, targetObj:ScratchObj):Boolean
		{
			var list:Vector.<Thread> = realInterpreter.getCopyOfThreadList();
			for each(var t:Thread in list){
				var userData:ThreadUserData = t.userData;
				if(userData.block == block && userData.target == targetObj){
					return true;
				}
			}
			return false;
		}
		public function stopThread(block:Block, targetObj:ScratchObj):void
		{
			
			var list:Vector.<Thread> = realInterpreter.getCopyOfThreadList();
			for each(var t:Thread in list){
				var userData:ThreadUserData = t.userData;
				if(userData.block == block && userData.target == targetObj){
					//RemoteCallMgr.Instance.resetStatus();
					t.interrupt();
				}
			}
		}
		
		public function stopObjAllThreads(obj:ScratchObj):void
		{
			if(null == obj){
				return;
			}
			var threadList:Vector.<Thread> = realInterpreter.getCopyOfThreadList();
			for(var i:int=threadList.length-1; i>=0; --i){
				var thread:Thread = threadList[i];
				if(ThreadUserData.getScratchObj(thread) === obj){
					//RemoteCallMgr.Instance.resetStatus();
					thread.interrupt();
				}
			}
		}
		
		public function stopObjOtherThreads(t:Thread):void
		{
			var target:ScratchObj = ThreadUserData.getScratchObj(t);
			var threadList:Vector.<Thread> = realInterpreter.getCopyOfThreadList();
			for(var i:int=threadList.length-1; i>=0; --i){
				var thread:Thread = threadList[i];
				if(t != thread && ThreadUserData.getScratchObj(thread) === target){
					//RemoteCallMgr.Instance.resetStatus();
					thread.interrupt();
				}
			}
		}
	}
}