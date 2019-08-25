function PDF(path){
    var savePath = new File(path);
    var option = new PDFSaveOptions();
    option.compatibility = PDFCompatibility.ACROBAT7;
    activeDocument.saveAs(savePath,option);
}

function saveDropedFile(savedata){
    for(var i=0;i < savedata.files.length;i++){
        try{
            var f = new File(savedata.files[i]);
            app.open(f);
            if(savedata.saveType === "resize"){
                resizeExport(savedata);
            }else{
                PDF(f);
                activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            }
            
        }catch(e){
            alert(e);
        }
    }
}

function resizeExport(savedata){
    unlockItems();
    app.executeMenuCommand("selectall");//メニューコマンド実行
    app.executeMenuCommand("group");
    app.selection[0].resize(savedata.resize,savedata.resize);
    fitArtBoard();
    PDF(activeDocument.path+"/resize"+activeDocument.name);
    activeDocument.close(SaveOptions.DONOTSAVECHANGES);  
}

function unlockItems(){
    layerUnlock(activeDocument.layers);
    var p = activeDocument.pageItems;
    for(var i=0;i < p.length;i++){
        try{
            //p[i].selected = true;
        }catch(e){
            p[i].locked = false;
            //p[i].selected = true;
        }
    }
    
    
function layerUnlock(lay){
        for(var i=0;i<lay.length;i++){
            lay[i].locked = false;
            $.writeln(lay[i].layers.length);
            if(lay[i].layers.length > 0){
                layerUnlock(lay[i].layers);
            }
        }
    }
}


function fitArtBoard(){
    app.executeMenuCommand("selectallinartboard");
    var flag = activeDocument.fitArtboardToSelectedArt(0);
    if(!flag){
        alert("there's no any artboard");
        return false;
    }else{
        return true;
    }
}

function rePlaceImg(obj){
    //alert(obj.index);
    var places = activeDocument.placedItems;
    for(var i=0;i<places.length;i++){
        //alert(places[i].file);
        if(places[i].file == obj.path && i == obj.index){
            //alert(i);
            places[i].file = new File(obj.file);
            
        }
    }
    return;
}

function rePlaceAll(images){
    var places = activeDocument.placedItems;
    for(var i=0;i<places.length;i++){
        for(var n=0;n<images.length;n++){
            var f = new File(images[n]);
            if(places[i].file.name == f.name){
                places[i].file = f;
            }
        }
    }
    return;
}