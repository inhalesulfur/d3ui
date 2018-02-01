define([
    "d3",
    "ui"
], 
function (  
    d3,
    ui
){	
    function ReqursiveObject(){
		var EditorInstance = {
			someCollection:{
				"a":1,
				"b":2,
				"c":3
			},
			someObjectArray:[{
				"a":4,
				"b":5,
				"c":6
			}],
			somePrimitiveArray:[
				"a",
				"b",
				"c"
			],
			somePrimitive:"Hello Kitty"
		}
        var uiObject = new ui.templates.ReqursiveObject({
			constructors:{
				Object:ui.templates.ObjectEditor
			}
		});
        this.enter = function(uiParentNode){
            uiObject.enter(uiParentNode);
            uiObject.update({
				data:{
					Editor:EditorInstance
				}
			});
        }
        this.exit = function(){
            uiObject.exit();
        }
    }
    ReqursiveObject.desc = "Редактор JS-объектов";
    return ReqursiveObject;
});