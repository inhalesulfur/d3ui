define([
    "d3",
    "ui"
], 
function (  
    d3,
    ui
){    
    function RegularPolygon(){
        faceCount = 3;
        var faces = [];
        for (var i = 0; i < faceCount; i++) {faces.push(i+1)}
        
        var layout = new Layout();
        var polygon = new ui.templates.RegularPolygon({faceCount:faceCount});
        
        var tools = new ui.Template();
        var button = new ui.Node({node:"span"});
        button.data.array = function() {return faces};
        button.enter.classed["lui-button"] = true;
        button.update.html = function(d) { return "Грань " + d };
        button.enter.on.click = function(d, i){ polygon.selectFace(d-1) };
        var range = new ui.Node({node:"input"});
        range.enter.attr.type = "range";
        range.enter.attr.min = 1;
        range.enter.attr.max = 10;
        range.update.property.value = function() { return faceCount };
        range.enter.on.input = function(){
            faceCount = this.value;
            polygon.exit();
            polygon = new ui.templates.RegularPolygon({faceCount:faceCount});
            enterPolygon(layout.ref.body);
            faces = [];
            for (var i = 0; i < faceCount; i++) {faces.push(i+1)}
            tools.update();
        }
        
        tools.elements.range = range;
        tools.elements.button = button;
        this.enter = function(uiParentNode){
            layout.enter(uiParentNode);
            tools.enter(layout.ref.head);
            tools.update();
            enterPolygon(layout.ref.body);
        }
        function enterPolygon(uiParentNode){
            polygon.enter(uiParentNode);
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