define([
    "d3",
    "ui"
], 
function (  
    d3,
    ui
){	
    function ReqursiveObject(){
        var uiObject = new ui.templates.ReqursiveXml();
        this.enter = function(uiParentNode){
            uiObject.enter(uiParentNode);
            uiObject.update({data:document});
        }
        this.exit = function(){
            uiObject.exit();
        }
    }
    ReqursiveObject.desc = "Визуализация произвольного xml-узла";
    return ReqursiveObject;
});