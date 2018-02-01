
require.config({
    paths: {
        d3:"../lib/d3",
        ui:"../ui",
        css:"../lib/css",
        text:"../lib/text",
        moment:"../lib/moment",
        codemirror:"../lib/codemirror",
        javascript:"../lib/javascript"     
    }
});

require([
    "d3",
    "ui",
    "examples/InputTable/InputTable",
    "examples/ReqursiveObject/ReqursiveObject",
    "examples/ReqursiveXml/ReqursiveXml",
    "examples/RegularPolygon/RegularPolygon",
    "examples/ObjectEditor/ObjectEditor",
    "examples/Chat/Chat"
], 
function (  
    d3,
    ui,
    InputTable,
    ReqursiveObject,
    ReqursiveXml,
    RegularPolygon,
    ObjectEditor,
    Chat
){    
    var examples = [
        {
            label:"InputTable",
            constructor:InputTable
        },
        {
            label:"ReqursiveObject",
            constructor:ReqursiveObject
        },
        {
            label:"ReqursiveXml",
            constructor:ReqursiveXml
        },
        {
            label:"RegularPolygon",
            constructor:RegularPolygon
        },
        {
            label:"ObjectEditor",
            constructor:ObjectEditor
        }/*,
        {
            label:"Chat",
            constructor:Chat
        }*/
    ]
    var exampleSelect = new ui.templates.SelectBox();
    exampleSelect.ref.option.data.array = examples;
    exampleSelect.ref.option.enter.html = function(d, i) { return d.label };
    exampleSelect.ref.select.enter.classed["lui-select"] = true;
    exampleSelect.ref.select.enter.on.change = function(){
        var i = this.selectedIndex;
        example.exit();
        example = new examples[i].constructor;
        example.enter(layout.ref.body);
    };
    
    var example = new examples[0].constructor;
    var templateTree = new ui.dev.TemplateTree;
    var layout = new Layout();
    
    layout.enter(document.body);  
    exampleSelect.enter(layout.ref.head);
    example.enter(layout.ref.body);
   
    templateTree.enter(layout.ref.graph);
    templateTree.setRoot(document.body);
    
        
    function Layout(templateDef){
        templateDef || (templateDef = {});
        ui.Template.call(this, {factory:"Layout", module:templateDef.module});
        this.elements.head = new ui.Node({ref:"head"});
        this.elements.body = new ui.Node({ref:"body"});
        this.elements.graph = new ui.Node({ref:"graph"});
        this.updateRef();
        this.ref.head.enter.style.width = "100%";
        this.ref.head.enter.style.height = "30px";
        this.ref.body.enter.style.width = "100%";
        this.ref.body.enter.style.height = "270px";
        this.ref.body.enter.style.overflow = "hidden";
        this.ref.graph.enter.style.overflow = "hidden";
        this.ref.graph.enter.style.height = "calc(100% - 300px)";
        this.ref.graph.enter.style.position = "relative";
        this.ref.body.enter.style.position = "relative";
        this.ref.body.enter.style.overflow = "auto";
    }
    
    $(window).resize(function(){
    });
});