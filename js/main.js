window.onload = () =>{
    "use strict";
    const csInterface = new CSInterface();
    themeManager.init();
    const extensionId = csInterface.getExtensionID(); 
    const filePath = csInterface.getSystemPath(SystemPath.EXTENSION) +`/js/`;
    const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) +`/jsx/`;
    csInterface.evalScript(`$.evalFile("${extensionRoot}json2.js")`);//json2読み込み
    const brdgeId = "DropAndConnect";
    
    const ratio = document.getElementById("ratio");
    
    class ConnectAPP{
        constructor(sender){
            this.sender = sender;
            //this.msg;
        }
        
        sendMsg(){
            const vulcanNamespace = VulcanMessage.TYPE_PREFIX + extensionId;
            const msg = new VulcanMessage(vulcanNamespace);
            msg.setPayload(JSON.stringify(this.msg));
            VulcanInterface.dispatchMessage(msg);
        }
    }
    
    
    class Listening extends ConnectAPP{
        constructor(sender){
            super(sender);
            const vulcanNamespace = VulcanMessage.TYPE_PREFIX + this.sender;
            VulcanInterface.addMessageListener(vulcanNamespace,this.recive);
        }
        
        async recieve(){}
    }
    
    class Exportfiles extends Listening{
        constructor(sender){
            super(sender);
        }
        
        async recive(message){
            console.log(message);
            const files = await messageHandler(message).catch(err => console.log(err));
            console.log(files);
            const saveType = Array.from(document.getElementsByClassName("saveRadio")).find(v=> v.checked);
            console.log(saveType);
            const savedata = {
                files:files,
                saveType:saveType.id,
                resize:parseFloat(ratio.value)
            }
            console.log(savedata);
            if(savedata.saveType === "resize" && !isResize(savedata.resize)){
                csInterface.evalScript(`alert("resizeの値を入力し直してください")`);
                return false;
            }
            csInterface.evalScript(`saveDropedFile(${JSON.stringify(savedata)})`);
            
            function messageHandler(message){
                return new Promise(resolve=>{
                    const payload = VulcanInterface.getPayload(message);
                    const object = JSON.parse(payload);
                    resolve(object);
                });    
            }
            
            function isResize(value){
                return (!isNaN(value)||value > 1 ||value < 100);
            }
        }
        
        
        
    }
    
    const exPDF = new Exportfiles(brdgeId);
    
    
}
