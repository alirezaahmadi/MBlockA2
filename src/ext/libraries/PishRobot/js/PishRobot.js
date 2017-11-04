// demo.js

(function(ext) {
    var device = null;
    var _rxBuf = [];

    var _values = {};
    var indexs = [];
    var cnt = 0;

    var Raw = [];
    var tm_bytes = [];
    var confim = 1;

    var N_MoveSpeed = 0xE0;
    var N_Wheelalignment = 0xE5;
    
    var N_Line2Floor = 0x60;
    var N_MoveOnceOnBoard = 0x70;
    var N_Move1sec = 0x75;
    var N_ChangeWheels = 0x80;
    var N_SetWheels = 0x85;
    var N_ChangeWheel = 0x90;
    var N_SetWheel = 0x95;
    var N_SetFollowingspeed = 0x98;

    var N_DC = 0x51;
    var N_Servo = 0x52;
    var N_LCD = 0x58;
    var N_LED = 0x54;
    var N_LightS = 0x15;
    var N_SoundS = 0x25;
    var N_IR = 0x45;
    var N_TouchS = 0x85; 

    var _bytes= []; 
    var in_bytes= []; 
    var Chacksum = 0;
    var Sum_Chars = 0;
    var ToolID = 0;
    var Param1 = 0;
    var Param2 = 0;
    var Param3 = 0;
    var tx_ToolName = 0;

    var sign_in= 0;
    var Hand_found_req = 0;
    var Extp_Confirm = 0;

    var levels = {
        HIGH:1,
        LOW:0
    };

    var DCMotor = {
        M1:1,
        M2:2,
        M3:3,
        M4:4  
    }

    var Servo = {
        S1:1,
        S2:2,
        S3:3,
        S4:4
    }

    var BLStatus = {
        ON:1,
        OFF:0
    }

    var OutputChannel = {
        AD1:1,
        AD2:2,
        AD3:3,
        AD4:4,
        AD5:5,
        AD6:6,
        AD7:7,
        AD8:8
    };

    var Direc = {
        Left:1,
        Right:2,
        Both:3
    }

    var Intersect = {
        Left:1,
        Right:2,
        Both:3,
        Rear:4
    }

    var Wheel  = {
        Left:1,
        Right:2,
        Both:3
    }

    var Color = {
        Black:1,
        White:2
    }

    var direction = {
        CW:0,
        CCW:1
    }

    var DirecBi = {
        Forward:1,
        Backward:2
    }

    var turn = {
        Left:3,
        Right:4
    }

    var CL = {
        Blue:2,
        Green:3
    }

    var DirecM = {
        Left:11,
        Right:12,
        Both:13
    }

    var Conf = {
        No:0,
        Yes:1
    }
    
    // Reset call from main application callback
    ext.resetAll = function(){Sign_out_check();};
    
    ext.runArduino = function(){};

    // PRC connect - connects the PRC to the MBlock
    ext.PRCCon = function(){
        Sign_in_check();
    }

    // PRC Disconnect - Diconnects PRC From MBlock
    ext.PRCDis = function(){
        Sign_out_check();
    }


    //*******************Beginner***********************************
    // block/stop - write command 
    ext.stop = function(){
        Set_Param(N_MoveOnceOnBoard, 0, 0, 0, 0);
    }
    // block/MoveForwardOnceOnBoard 
    // write command - will pause the loop for second confirm
    // froward 
    // default speed value 80 
    ext.MoveForwardOnceOnBoard = function(){
        Set_Param(N_MoveOnceOnBoard, 1, 80, 0, 0);   
    }
    // block/TurnLeftOnceOnBoard 
    // write command - will pause the loop for second confirm
    // left 
    // default speed value 80
    ext.TurnLeftOnceOnBoard = function(){
        Set_Param(N_MoveOnceOnBoard, 3, 80, 0, 0);
    }
    // block/TurnLeftOnceOnBoard 
    // write command - will pause the loop for second confirm
    // right 
    // default speed value 80
    ext.TurnRightOnceOnBoard = function(){
        Set_Param(N_MoveOnceOnBoard, 4, 80, 0, 0);
    }
    // block/MoveForwardOneSec 
    // write command - will pause the loop for second confirm
    // forward 
    // default speed value 80
    ext.MoveForwardOneSec = function(){
        Set_Param(N_Move1sec, 1, 80, 10, 0); 
    }
    // block/MoveBackwardOneSec 
    // write command - will pause the loop for second confirm
    // backward 
    // default speed value 80 
    // default time: 1sec 
    ext.MoveBackwardOneSec = function(){
        Set_Param(N_Move1sec, 2, 80, 10, 0); 
    }
    // block/TurnLeftOneSec 
    // write command - will pause the loop for second confirm
    ///left 
    // default speed value 80 
    // default time: 1sec 
    ext.TurnLeftOneSec = function(){
        Set_Param(N_Move1sec, 3, 80, 10, 0);
    }
    // block/TurnRightOneSec 
    // write command - will pause the loop for second confirm 
    // right 
    // default speed value 80 
    // default time: 1sec 
    ext.TurnRightOneSec = function(){
        Set_Param(N_Move1sec, 4, 80, 10, 0);
    }
    // block/Beep 
    // write command  
    // toolName: Light sensor 
    // ToolID: 0x01 
    // On-time: 0.1sec 
    // off-time: 0.1sec 
    ext.Beep= function(){
        Set_Param(N_LightS, 1, 1, 1, 0);

    }
    // block/Hand found 
    // read command 
    // request ToolName: touch sensor 
    // default toolID: 0x03 
    // returns: boolean 
    // action thershold: 135
    ext.HandFound = function(){
        Request(N_TouchS, 0x03);
        tx_ToolID = 0x03;
        Hand_found_req = 1;
    }

    //**************************Intermediate***********************
    // block/Buzzer 
    // write command  
    // toolName: Light sensor 
    // ToolID: 0x01 
    // On-time: 0.0sec 
    // off-time: 0.0sec 
    // tune : value
    ext.Buzzer = function(value){
        Set_Param(N_LightS, 1, 0, 0, value);
    }
    // block/Buzzer 
    // write command  
    // toolName: Light sensor 
    // ToolID: 0x00 (all) 
    // On-time: 0.0sec 
    /// off-time: 0.0sec 
    // tune : 0 : mute
    ext.BuzzerStop = function(){
        Set_Param(N_LightS, 0, 0, 0, 0);
    }
    // block/changewheels
    // write command
    // param 1: speed of first wheel
    // param 2: speed of second wheel
    // PxSign : 1 for positive , 2 for Negative 
    ext.ChangeWheels = function(Param1,Param2){
        var P1Sign = 0;
        var P2Sign = 0;
        if(Param1<0){
            Param1 = Param1 * -1;
            P1Sign = 2;
        }
        else{
            P1Sign = 1;
        }
        if(Param2<0){
            Param2 = Param2 * -1;
            P2Sign = 2;
        }
        else{
            P2Sign = 1;
        }
        Set_Param(N_ChangeWheels, Param1, Param2, P1Sign, P2Sign);
    }
    // block/SetWheels
    // write command
    // param 1: speed of first wheel
    // param 2: speed of second wheel
    // PxSign : 1 for positive , 2 for Negative 
    ext.SetWheels = function(Param1,Param2){
        var P1Sign = 0;
        var P2Sign = 0;
        if(Param1<0){
            Param1 = Param1 * -1;
            P1Sign = 2;
        }
        else{
            P1Sign = 1;
        }
        if(Param2<0){
            Param2 = Param2 * -1;
            P2Sign = 2;
        }
        else{
            P2Sign = 1;
        }
        Set_Param(N_SetWheels, Param1, Param2, P1Sign, P2Sign);
    } 
    // block/ChangeWheel
    // write command
    // param 1: left:1 , right:2 , Both:3 
    // param 2: speed of first wheel
    // PxSign : 1 for positive , 2 for Negative 
    ext.ChangeWheel = function(Param1,Param2){
        var P2Sign = 0;
        if(Param2<0){
            Param2 = Param2 * -1;
            P2Sign = 2;
        }
        else{
            P2Sign = 1;
        }
        Set_Param(N_ChangeWheel, Wheel[Param1], Param2, P2Sign, 0);
    } 
    // block/SetWheel
    // write command
    // param 1: left:1 , right:2 , Both:3 
    // param 2: speed of first wheel
    // PxSign : 1 for positive , 2 for Negative 
    ext.SetWheel = function(Param1,Param2){
        var P2Sign = 0;
        if(Param2<0){
            Param2 = Param2 * -1;
            P2Sign = 2;
        }
        else{
            P2Sign = 1;
        }
        Set_Param(N_SetWheel, Wheel[Param1], Param2, P2Sign, 0);
    }
    // block/LinetoFloor
    // write command - third type - will pause the loop for second confirm
    // param 1: black:1 , white:2 
    // param 2: left:1 , right:2 , Both:3
    //  
    ext.LinetoFloor = function(Param1,Param2) {
        Set_Param(N_Line2Floor, Color[Param1], Direc[Param2], 0, 0);
    };
    // block/LinetoFloor
    // write command
    // param 1: black:1 , white:2 
    // param 2: left:1 , right:2 , Both:3 
    ext.Linetointersection = function(Param1,Param2) {
        Set_Param(N_Line2Floor, Color[Param1], Intersect[Param2], 0, 0);
    };
    // block/ColoLED - sets On the LEDs on Motor sockets
    // write command
    // param 1: left:11 , right:12 , Both:13 
    // param 2: Blue:2 , Green:3
    ext.ColoLED = function(Prarm1,Param2){
        Set_Param(N_LED, DirecM[Prarm1], CL[Param2], 0, 0); 
    }
    // block/ClearLED - sets Off the LEDs on Motor sockets
    // write command
    // param 1: left:11 , right:12 , Both:13 
    // param 2: Blue:2 , Green:3
    ext.ClearLED = function(Prarm1){
        Set_Param(N_LED, DirecM[Prarm1], 0, 0, 0); 
    }
    // block/SetFollowingspeed 
    // write command 
    // param 1 : speed
    ext.SetFollowingspeed = function(Param1){
        Set_Param(N_SetFollowingspeed, Param1, 0, 0, 0);
    } 
    // block/MoveForwardOnceOnBoard 
    // write command - will pause the loop for second confirm
    // param 1 : Forward:1, Backward:2 
    // default speed value 80 
    ext.MoveForwardOnceOnBoard = function(Param1){
        Set_Param(N_MoveOnceOnBoard, DirecBi[Param1], 80, 0, 0);   
    }
    // block/TurnLOnceOnBoard 
    // write command - will pause the loop for second confirm
    // param 1 : Left:3, Right:4 
    // default speed value 80 
    ext.TurnLOnceOnBoard = function(Param1){
        Set_Param(N_MoveOnceOnBoard, turn[Param1], 80, 0, 0);
    } 
    // block/MovebySec 
    // write command - will pause the loop for second confirm
    // param 1 : Left:3, Right:4 
    // default speed value 80
    // param 2 : time  
    ext.MovebySec = function(Param1, Param2){
        Set_Param(N_Move1sec, DirecBi[Param1], 80, Param2*10, 0); 
    }
    // block/TurnbySec 
    // write command - will pause the loop for second confirm
    // param 1 : Left:3, Right:4 
    // default speed value 80
    // param 2 : time 
    ext.TurnbySec = function(Param1, Param2){
        Set_Param(N_Move1sec, turn[Param1], 80, Param2*10, 0);
    }

    //*************************Advanced****************************
    // block/LED
    // write command
    // param 1 : ToolID - port number : N_LED
    // param 2 : Param1 - high:1 , low:0
    ext.LED = function(ToolID,Param1) {
        Set_Param(N_LED, OutputChannel[ToolID], levels[Param1], Param2, Param3);
    };
    // block/get_light
    // read command - will pause the loop to get the answer
    // param 1 : ToolID - port number :N_LightS
    ext.get_light = function(ToolID){
        Request(N_LightS, OutputChannel[ToolID]);
    };
    // block/get_distance
    // read command - will pause the loop to get the answer
    // param 1 : ToolID - port number :N_LightS
    ext.get_distance = function(ToolID){
        Request(N_IR, OutputChannel[ToolID]);
    };
    // block/get_touch
    // read command - will pause the loop to get the answer
    // param 1 : ToolID - port number :N_LightS
    ext.get_touch = function(ToolID){
        Request(N_TouchS, OutputChannel[ToolID]);
    };
    // block/DCMotor
    // read command - will pause the loop for second confirm
    // param 1 : ToolID - port number :N_LightS
    // param 2 : Param1 - speed
    // param 3 : Param2 - Direction CW:0 , CCW:1
    ext.DCMotor = function(ToolID,Param1,Param2){
        Set_Param(N_DC, DCMotor[ToolID], Param1, direction[Param2], 0);
    }
    // block/Servo
    // read command - will pause the loop for second confirm
    // param 1 : ToolID - port number :N_LightS
    // param 2 : Param1 - angle
    // param 3 : Param2 - speed
    ext.Servo = function(ToolID,Param1,Param2){
        Set_Param(N_Servo, Servo[ToolID], Param1, Param2, 0);
    }
    // block/BuzzerBip
    // read command - will pause the loop for second confirm
    // param 1 : Count - times of repeat
    // param 2 : ONTime 
    // param 3 : OffTime 
    ext.BuzzerBip = function(Count,ONTime,OffTime){
        Set_Param(N_LightS, Count, ONTime*10, OffTime*10, 0);
    }
    // block/LCDUpdate - writes 2 strings with lenght of 8 bytes on LCD line
    // read command - will pause the loop for second confirm
    // param 1 : String1 
    // param 2 : String2  
    // param 3 : xPos  - (0 ~ 8)
    // param 2 : yPos  - (0 ~ 8)
    // param 3 : BackLight - ON :1 , Off:0
    ext.LCDUpdate = function(String1,String2,xPos,yPos,BackLight){
        String_full = String1.concat(String2);
        LCD_Param(N_LCD, BLStatus[BackLight], xPos, yPos, String_full);
    }
    // block/Wheelalignment
    // read command - will pause the loop for second confirm
    // param 1 : Param1:(Save)Conf - No:0 , Yes :0
    // param 2 : Param2:left wheel offset 
    // param 3 : Param3:right wheel offset 
    ext.Wheelalignment = function(Param1, Param2, Param3){
        Set_Param(N_Wheelalignment, Conf[Param1], Param2, Param3, 0);
    }
    // block/MoveSpeed
    // read command - will pause the loop for second confirm
    // param 1 : Param1:(Save)Conf - No:0 , Yes :0
    // param 2 : Param2: speed (adjust vlaue)
    ext.MoveSpeed = function(Param1, Param2){
        Set_Param(N_MoveSpeed, Conf[Param1], Param2, 0, 0);
    }

    //************************Base Functions******************************
    // Resets all the local variables and counters used in extensions
    function Reset_status(){
        _rxBuf = [];
        bytes = [];
        _index = 0;
        in_bytes = [];
        index_tmp =0;
        confim = 1;
        Extp_Confirm = 0;
        _bytes = []; 
    }
    //Sign in function  - connects the PRC to software and switches to scratch mode
    function Sign_in_check(){
        if(!sign_in){
            if(device){
                Reset_status();
                device.send([0x53,0x53]);
                sign_in = 1;
            }
        }
    }
    //Sign out function - disconnects the PRC from software and switches to normal mode
    function Sign_out_check(){
        if(sign_in){
            Reset_status();
            _bytes.push(0xAA);
            _bytes.push(0xAA);
            _bytes.push(0x45);
            _bytes.push(0x58);
            _bytes.push(0x9d);
            _bytes.push(0x00);
            device.send(_bytes);
            _bytes = [];
            sign_in = 0;
        }
    }
    // main Request command - send 6 byte to PRC to read a specific value for PRC 
    // pauses the loop to get answer  - the answer has to be sent by same toolNAme, toolID and port number    
    // param 1 : ToolName - typoe of device or IO
    // param 2 : ToolID - port number
    function Request(ToolName, ToolID){
        Sign_in_check();
        if(!confim){
            device.send(_bytes);
        }
        if(confim == 1){
            tx_ToolName = ToolName;
            tx_ToolID = ToolID;
            _bytes = [];
            Chacksum = ToolName + ToolID;
            _bytes.push(0xAA);
            _bytes.push(0xAA);
            _bytes.push(ToolName);
            _bytes.push(ToolID);
            _bytes.push(Chacksum & 0xFF);
            _bytes.push((Chacksum & 0xFF00) >> 8);
            device.send(_bytes);
            confim = 2;
        }
    }
    // main write Command - sneds 8 bytes as a callback of write blocks to change a value on PRC
    // waits for confirm packet and acknowledgement - the confirmm has to be sent by same toolNAme:0xff, toolID:0x55  
    // param 1 : ToolName - typoe of device or IO
    // param 2 : ToolID - port number
    // param 3 : Param1 
    // param 4 : Param2
    // param 5 : Param3
    function Set_Param(ToolName, ToolID, Param1, Param2, Param3){
        Sign_in_check();
        //if(_bytes.length == 0){confim = 1;}
        if(!confim){
            device.send(_bytes);
        }
        if(confim == 1){
            _bytes = [];
            tx_ToolName = ToolName;
            tx_ToolID = ToolID;
            Chacksum = ToolName + ToolID + Param1 + Param2 + Param3;
            _bytes.push(0xAA);
            _bytes.push(0xAA);
            _bytes.push(ToolName);
            _bytes.push(ToolID);
            _bytes.push(Param1);ToolName
            _bytes.push(Param2);
            _bytes.push(Param3);
            _bytes.push(Chacksum & 0xFF);
            _bytes.push((Chacksum & 0xFF00) >> 8);
            //for(var _cnt=0; _cnt <=1;_cnt++ )device.send(_bytes); 
            device.send(_bytes); 
            confim = 2;
        }
    }
    // main function of writting desired bytes on PRC's LCD 
    // waits for confirm packet and acknowledgement - the confirmm has to be sent by same toolNAme:0xff, toolID:0x55  
    // param 1 : ToolName - typoe of device or IO (LCD)
    // param 2 : BackLight - port number
    // param 3 : xPos - courser pose in x direction
    // param 4 : yPos - courser pose in y direction
    // param 5 : String - desired string with lenght of 8 bytes
    function LCD_Param(ToolName, BackLight, xPos, yPos, String){
        Sign_in_check();
        if(!confim){
            device.send(_bytes);
        }
        else if(confim== 1){

            var utf8 = unescape(encodeURIComponent(String));
            var arr = [];
            for (var i = 0; i < utf8.length; i++) {
                arr.push(utf8.charCodeAt(i));
            }
            
            for(cnt=0; cnt<arr.length; cnt++){Sum_Chars += arr[cnt];}

            Chacksum = Sum_Chars + ToolName + BackLight + xPos + yPos;
            _bytes = [];
            tx_ToolName = ToolName;
            tx_ToolID = ToolID;
            _bytes.push(0xAA);
            _bytes.push(0xAA);
            _bytes.push(ToolName);
            _bytes.push(BackLight);
            _bytes.push(xPos);
            _bytes.push(yPos);
            _bytes.push(arr[0]);
            _bytes.push(arr[1]);
            _bytes.push(arr[2]);
            _bytes.push(arr[3]);
            _bytes.push(arr[4]);
            _bytes.push(arr[5]);
            _bytes.push(arr[6]);
            _bytes.push(arr[7]);
            _bytes.push(Chacksum & 0xFF);
            _bytes.push((Chacksum & 0xFF00) >> 8);
            device.send(_bytes);  
            Chacksum = 0;
            Sum_Chars = 0;
            utf8 = [];
            arr =[];
            confim = 2;
        }
    }


    //************************System Functions******************************
    // Main function for getting bytes from specified ports Com/Bluetooth - and handleing all requests and errors of communicatin
    var PacketLength = 9;
    var _index = 0;
    var index_tmp = 0;
    function processData(bytes) { 
        trace(bytes);
        //device.send([in_bytes.length,bytes.length]);
        if(bytes[0] != 0x39){
            for(cnt = _index; cnt<bytes.length; cnt++){ // attach all received bytes together in one stream of data
                in_bytes.push(bytes[cnt]);
            }
            //device.send([in_bytes.length,bytes.length]);
            if(in_bytes.length == PacketLength){
                for(_index=0;_index<in_bytes.length;_index++){
                    var c = in_bytes[_index];
                    _rxBuf.push(c);
                    if(_rxBuf.length >= PacketLength ){ // if lenght got equal with 9 (defualt packet lenght)
                        if(_rxBuf[0] == 0xaa && _rxBuf[1] == 0xaa ){
                            if(_rxBuf[2] == tx_ToolName && _rxBuf[3] == tx_ToolID ){
                                _values = _rxBuf[4];
                                if(N_TouchS == tx_ToolName && Hand_found_req==1){ // hand found response sepration
                                    if(_values >= 135)responseValue(0x90,true);
                                    else if(_values < 135)responseValue(0x90,false);
                                    tm_bytes[0] =_values;
                                    confim = 1;
                                    _rxBuf = [];
                                    bytes = [];
                                    in_bytes = [];
                                    index_tmp =0;
                                    _index = 0;
                                    Hand_found_req =0;
                                    break;
                                }
                                else{   // main read response of read blocks
                                    _values = _rxBuf[4];
                                    responseValue(1,_values);
                                    tm_bytes[0] =_values;
                                    confim = 1;
                                    _rxBuf = [];
                                    bytes = [];
                                    in_bytes = [];
                                    index_tmp =0;
                                    _index = 0;
                                    break;
                                }
                            }
                            else if(_rxBuf[2] == 0xff && _rxBuf[3] == 0x55 ){ // main write confirm
                                if(tx_ToolName == 0x60 || tx_ToolName == 0x70 || tx_ToolName == 0x71 || tx_ToolName == 0x75 || tx_ToolName == 0x76){ 
                                    Extp_Confirm = 1;
                                    _bytes = [];
                                    confim = 2;
                                    _rxBuf = [];
                                    bytes = [];
                                    in_bytes = [];
                                    index_tmp =0;
                                    _index = 0;
                                    Reset_status();
                                    suspendThread("2");
                                    break;                          
                                }
                                else{   
                                    _bytes = [];
                                    confim = 1;
                                    Extp_Confirm = 0;
                                    _rxBuf = [];
                                    bytes = [];
                                    in_bytes = [];
                                    index_tmp =0;
                                    _index = 0;
                                    break;
                                }
                            }
                            else if(_rxBuf[2] == 0xee && _rxBuf[3] == 0x44 ){ //Error request detection
                                //_bytes = [];
                                confim = 0;
                                _rxBuf = [];
                                bytes = [];
                                in_bytes = [];
                                index_tmp =0;
                                _index = 0;
                                break;
                            }
                            else if(_rxBuf[2] == 0xcc && _rxBuf[3] == 0x33 ){ // second confirm detection
                                _bytes = []; 
                                confim = 1;
                                Extp_Confirm = 0;
                                _rxBuf = [];
                                bytes = [];
                                in_bytes = [];
                                index_tmp =0;
                                _index = 0;
                                resumeThread("2");
                                
                                break;
                            }
                            else{   // last value to read response
                                responseValue(1,tm_bytes[0]);    
                                confim = 0; 
                                break; 
                            }
                        }
                    _rxBuf = [];
                    bytes = [];
                    _index = 0;
                    in_bytes = [];
                    index_tmp =0;
                    }
                }     
            }
            else if(in_bytes.length == 0x12){   //hanndleing all borken pachakes in recieve port with lenght of 17 bytes
                // all third type of confirmation rquired blocks are listed here by their ToolNames
                if(tx_ToolName == 0x60 ||  tx_ToolName == 0x70 || tx_ToolName == 0x71 || tx_ToolName == 0x75 || tx_ToolName == 0x76){
                    in_bytes = [];
                    index_tmp =0; 
                }
                _value = bytes[0];
                _bytes = []; 
                confim = 1;
                Extp_Confirm = 0;
                _rxBuf = [];
                bytes = [];
                _index = 0;
                in_bytes = [];
                index_tmp =0;
            }
        }
    }

    // Extension API interactions
    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        potentialDevices.push(dev);

        if (!device) {
            tryNextDevice();
        }
    }

    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        device = potentialDevices.shift();
        if (device) {
            device.open({ stopBits: 0, bitRate: 115200, ctsFlowControl: 0 }, deviceOpened);
        }
    }
    var watchdog = null;
    function deviceOpened(dev) {
        if (!dev) {
            // Opening the port failed.
            tryNextDevice();
            return;
        }
        device.set_receive_handler('PishRobot', processData);
    };

    ext._deviceRemoved = function(dev) {
        if(device != dev) return;
        device = null;
    };

    ext._shutdown = function() {
        if(device) device.close();
        device = null;
    };

    ext._getStatus = function() {
        if(!device) return {status: 1, msg: 'PishRobot-PRC disconnected'};
        if(watchdog) return {status: 1, msg: 'Probing for PishRobot-PRC'};
        return {status: 2, msg: 'PishRobot-PRC connected'};
    }

    var descriptor = {};
    ScratchExtensions.register('PishRobot', descriptor, ext, {type: 'serial'});
})({});
