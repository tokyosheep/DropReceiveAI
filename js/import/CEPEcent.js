
const csInterface = new CSInterface();
class RegisterEvent{
    constructor(event){
        this.event = event;
        
    }
    
    dispatchEvent(){
        return new Promise(resolve=>{
            csInterface.addEventListener(event_type,(e)=>{
                CEP_event.textContent = e.type;
                resolve(e);
            });
        });
    }
}