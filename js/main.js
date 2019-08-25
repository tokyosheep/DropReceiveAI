window.onload = () =>{
    "use strict";
    const csInterface = new CSInterface();
    themeManager.init();
    const extensionId = csInterface.getExtensionID(); 
    const filePath = csInterface.getSystemPath(SystemPath.EXTENSION) +`/js/`;
    const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) +`/jsx/`;
    csInterface.evalScript(`$.evalFile("${extensionRoot}json2.js")`);//json2読み込み
    const brdgeId = "DropAndConnect";
    const imgList = document.getElementById("imgList");
    const btn_test = document.getElementById("btn_test"); 
    const loadImgEvent = ["documentAfterDeactivate"];
    const imgExt = [".tif",".tiff",".jpg",".jpeg",".psd",".psb",".png",".gif",".eps"];
    
    const path = require("path");
    const fs = require("fs");
    
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
    /*bridgeから　データを受け取った時のイベント*/
    class Exportfiles extends Listening{
        constructor(sender){
            super(sender);
        }
        
        async recive(message){
            console.log(message);
            const msg = await messageHandler(message).catch(err => console.log(err));
            console.log(msg);
            const illustratorRun = new IllustratorProcess(msg);
            
            
            function messageHandler(message){
                return new Promise(resolve=>{
                    const payload = VulcanInterface.getPayload(message);
                    const object = JSON.parse(payload);
                    resolve(object);
                });    
            }
            
        }
        
    }
    
    const exPDF = new Exportfiles(brdgeId);
    
    /*illustrator側」のプロセス*/
    class IllustratorProcess{
        constructor(msg){
            this.msg = msg;
            console.log(this.msg);
            if(this.msg.app !== "illustrator"){
                return;
            }
            
            if(this.msg.AI){
                this.exportPDFfiles();
            }
            if(this.msg.img){
                this.rePlaceImages();
            }
            if(this.msg.folder){
                this.allReplaces();
            }
        }
        
        allReplaces(){
            const files = fs.readdirSync(this.msg.pathList[0]);
            const images = files.filter(f => imgExt.some( e => path.extname(f).toLowerCase() === e));
            const fullPathList = images.map(v => path.join(this.msg.pathList[0],v));//取得したパスを全て
            console.log(fullPathList);
            csInterface.evalScript(`rePlaceAll(${JSON.stringify(fullPathList)})`,()=>{
                create.loadImages();
            });
        }
        
        exportPDFfiles(){
            const saveType = Array.from(document.getElementsByClassName("saveRadio")).find(v=> v.checked);
            console.log(saveType);
            const savedata = {
                files:this.msg.pathList,
                saveType:saveType.id,
                resize:parseFloat(ratio.value)
            }
            console.log(savedata);
            if(savedata.saveType === "resize" && !isResize(savedata.resize)){
                csInterface.evalScript(`alert("resizeの値を入力し直してください")`);
                return false;
            }
            csInterface.evalScript(`saveDropedFile(${JSON.stringify(savedata)})`);
            
            function isResize(value){
                return (!isNaN(value)||value > 1 ||value < 100);
            }
        }
        
        rePlaceImages(){
             const replaceImg = Array.from(document.getElementsByClassName("images")).find(v => v.checked);
             console.log(replaceImg);
             if(replaceImg === undefined || replaceImg == null){return}
             const object = {
                 path:replaceImg.dataset.path,
                 file:this.msg.pathList,
                 index:replaceImg.dataset.index
             }
             console.log(object);
             csInterface.evalScript(`rePlaceImg(${JSON.stringify(object)})`,()=>{
                 create.loadImages();
             });
        }
        
        
    }
    
    /*アクティブドキュメントが変わった時に画像データをパネル上で読み込み。*/
    class CreateForm{
        constructor(parent,inputClass,eventType){
            this.parent = parent;
            this.inputClass = inputClass;
            this.eventType = eventType;
            this.eventType.forEach(v => this.dispatchEvent(v));
        }
        
        async loadImages(){
            const images = await getReplaceImages().catch(err => alert(err));
            removeChild(this.parent);
            this.boxes = images.map((v,i)=>{
                this.createRadio(v,i);
            }); 
        }
        
        dispatchEvent(event){
            csInterface.addEventListener(event,(e)=>{
                console.log(e);
                this.loadImages();
            })
        }
        
        createRadio(obj,index){
            const li = document.createElement("li");
            this.parent.appendChild(li);
            const label = document.createElement("label");
            label.classList.add("topcoat-radio-button");
            li.appendChild(label);
            
            const _input = document.createElement("input");
            _input.type = "radio";
            _input.classList.add(this.inputClass);
            _input.name = this.inputClass;
            _input.dataset.path = obj.path;
            _input.dataset.index = index;
            label.appendChild(_input);
            
            const div = document.createElement("div");
            div.classList.add("topcoat-radio-button__checkmark");
            label.appendChild(div);
            const span = document.createElement("span");
            span.textContent = obj.name;
            label.appendChild(span);
            return {li:li,label:label,input:_input,div:div,span:span};
        }
    }
    
    const create = new CreateForm(imgList,"images",loadImgEvent);
    
    function getReplaceImages(){
        return new Promise((resolve,reject)=>{
            csInterface.evalScript(`$.evalFile("${extensionRoot}getPlacedItem.jsx")`,(o)=>{
                if(!o){
                    reject(o);
                }
                resolve(JSON.parse(o));
            });
        });
    }
    
    function removeChild(parent){
        while(parent.firstChild){
            parent.removeChild(parent.firstChild);
        }
    }
    
    /*debug event
    btn_test.addEventListener("click",()=>{
        const replaceImg = Array.from(document.getElementsByClassName("images")).find(v => v.checked);
        console.log(replaceImg);
        if(replaceImg===undfined || replaceImg ==null){return}
        csInterface.evalScript(`rePlaceImg(${JSON.stringify({path:replaceImg.dataset.path})})`);
    });
    */
}
