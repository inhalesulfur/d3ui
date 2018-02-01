define([
    "d3",
    "ui"
], 
function (  
    d3,
    ui
){	
    function ReqursiveObject(){
        var uiObject = new ui.templates.ReqursiveObject({
			showPrototype:true,
			showConstructor:true
		});
        this.enter = function(uiParentNode){
            uiObject.enter(uiParentNode);
            uiObject.update({data:{ui:ui}});
        }
        this.exit = function(){
            uiObject.exit();
        }
    }
    ReqursiveObject.desc = "Визуализация произвольного JS-объекта";
    return ReqursiveObject;
});