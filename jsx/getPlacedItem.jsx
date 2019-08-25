(function(){
    var places = activeDocument.placedItems;
    var images = [];
    for(var i =0;i<places.length;i++){
        $.writeln(typeof places[i]);
        images[i] = {
            path:places[i].file.toString(),
            name:places[i].file.name};
         //getObject(places[i]);
    }
    return JSON.stringify(images);
    /*
    function getObject(obj){
        $.writeln(obj.file);
        for(var p in obj){
            $.writeln(p);
        }
    }
    */
})();