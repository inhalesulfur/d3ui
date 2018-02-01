define([
    "d3",
    "ui"
], 
function (  
    d3,
    ui
){    
    function RegularPolygon(){
        var faces = [1, 2, 3];
        
        var layout = new Layout();
        var polygon = new ui.templates.RegularPolygon({faceCount:faces.length});
        
        var buttons = new ui.Template();
        buttons.elements.button = new ui.Node({node:"span"});
        buttons.elements.button.data.array = faces;
        buttons.elements.button.enter.classed["lui-button"] = true;
        buttons.elements.button.enter.html = function(d) { return "Грань " + d };
        buttons.elements.button.enter.on.click = function(d, i){ polygon.selectFace(d-1) };
        
        this.enter = function(uiParentNode){
            layout.enter(uiParentNode);
            buttons.enter(layout.ref.head);
            polygon.enter(layout.ref.body);
            polygon.ref.faces.each(function(face, i){
                var placeholder = new Placeholder();
                placeholder.ref.content.enter.html = "Грань " + (i+1);
                placeholder.ref.content.enter.style.border = "1px solid black";
                placeholder.ref.content.enter.style.height = "100%";
                placeholder.enter(face);
            })
        }
        this.exit = function(){
            layout.exit();
        }
    }
    function Layout(templateDef){
        templateDef || (templateDef = {});
        ui.Template.call(this, {factory:"Layout", module:templateDef.module});
        this.elements.head = new ui.Node({ref:"head"});
        this.elements.body = new ui.Node({ref:"body"});
        this.updateRef();
        this.ref.head.enter.style.height = "30px";
        this.ref.body.enter.style.width = "300px";
        this.ref.body.enter.style.height = "calc(100% - 30px)";
        this.ref.body.enter.style.position = "relative";
        this.ref.body.enter.style.overflow = "hidden";
    }
    function Placeholder(templateDef){
        templateDef || (templateDef = {});
        ui.Template.call(this, {factory:"Placeholder", module:templateDef.module});
        this.elements.content = new ui.Node({ref:"content"});
        this.updateRef();
    }
    RegularPolygon.desc = "";
    return RegularPolygon;
});