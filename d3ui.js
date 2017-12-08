(function(t,n){
    if(typeof exports === "object"&&typeof module !== "undefined"){
        n(exports)
    }
    else if (typeof define === "function" && define.amd){
        define(["exports"],n)
    }
    else {
        n(t.d3ui=t.d3ui||{})
    }
})(this,function(ui){
    "use strict";
    var d3;
    ui.setD3 = function(_d3) {
        d3 = _d3;
        d3.selection.prototype.apply = apply;
        d3.selection.prototype.applyAll = applyAll;
        d3.transition.prototype.apply = apply;
        d3.transition.prototype.applyAll = applyAll;
        
    }; 
    ui.Node = uiNode; 
    ui.Template = uiTemplate;
    var nodeIdGen = new IdGenerator;
    var templateIdGen = new IdGenerator;
    function IdGenerator(){
        var id = 0;
        this.getId = function(){ id++; return id; }
    }    
    function uiDefinition(){
        this.property = {};
        this.attr = {};
        this.style = {};
        this.on = {};
        this.classed = {};
    }
    function uiCollection(){
    }
    uiCollection.prototype.each = function(func, recursive){
        var collName = this.constructor.name;
        for (var i in this){
            if(!this.hasOwnProperty(i)) continue;
            var nodeName = this[i].constructor.name;
            if (recursive && nodeName == collName)
                uiCollection.prototype.each.call(this[i], func, recursive);
            else
                func.call(this, this[i], i);
        }
    }
    function uiReference(){
    }
    uiReference.prototype = new uiCollection;
    uiReference.prototype.addElement = function(path, element){
        var pathArray = path.split(".");
        var location = this;
        pathArray.forEach(function(item, i, arr){
            if (i == arr.length - 1){
                location[item] = element;
            }
            else{
                if (!(location[item] instanceof uiReference))
                    location[item] = new uiReference();
                location = location[item];
            }
        })
    }
    
    function uiNode(nodeDef){
        if (typeof nodeDef === "undefined") nodeDef = {};
        var undefined;
        this.node = nodeDef.node || "div";
        this.ref = nodeDef.ref;
        this.enter = new uiDefinition();
        this.update = new uiDefinition();
        this.childs = new uiCollection();
        this.data = {array:undefined, key:undefined};
        this.datum = {array:undefined, update:new uiDefinition()};
        this.on = {enter:undefined, update:undefined, exit:undefined};
    }
    function bindParent(parent){
        this.parent = parent;
        if (!parent.childComponents)
            parent.childComponents = new uiCollection();
        parent.childComponents[this.id] = this;
        this.updateChildComponents = function (config){
            this.elements.each(function(element, el){
                updateElement(element, el)
            });
            function updateElement(element, el){
                if (element.childComponents){
                    element.childComponents.each(function(item){
                        item.update(config);
                    })
                }
            }
        }
        
    }
    function uiTemplate(templateDef){
        if (typeof templateDef === "undefined") templateDef = {};
        
        if (templateDef && templateDef.factory)
            this.factory = templateDef.factory;
        if (templateDef && templateDef.module)
            this.module = templateDef.module;
        this.elements = new uiCollection();
        this.ref = new uiReference();
        
        this.enter = enter.bind(this);
        this.update = update.bind(this);
        this.updateRef = updateRef.bind(this);
        this.exit = exit.bind(this);
        function enter(uiParentNode){
            if (typeof uiParentNode.selection === "undefined") uiParentNode.selection = d3.select(uiParentNode);
                
            if (this.id){
                this.exit();
            }
            this.id = templateIdGen.getId();
            bindParent.call(this, uiParentNode);
            createElements(uiParentNode, this.elements);
        }
        function update(config){
            if (typeof this.id === "undefined") return;
            joinElements(this.parent, this.elements);
            updateElements(this.parent, this.elements, config);
            if (config){
                if (config.updateChildComponents)
                    this.updateChildComponents({updateChildComponents:true});
            }
        }
        function exit(){
            if (this.id){
                this.elements.each(function(item) { item.selection.remove() });
                delete this.parent.childComponents[this.id];
                delete this.id;
            }
        }
        function updateRef(){
            var self = this;
            this.elements.each(function(element){
                updateNodeRef(element);
            });
            function updateNodeRef(node){
                if (node.ref){
                    self.ref.addElement(node.ref, node);
                }
                if (node instanceof uiArray){
                    node.each(function(element){
                        updateNodeRef(element);
                    });
                }
                else {
                    node.childs.each(function(element){
                        updateNodeRef(element);
                    });
                }                    
            }
        }        
        
        function uiAttr(element, el){
            var moduleName = templateDef.module?templateDef.module.name:"";
            var factoryName = templateDef.factory?templateDef.factory.name:"";
            var attr = {};
            if (moduleName) attr["d3ui-module"] = moduleName;
            if (factoryName) attr["d3ui-factory"] = factoryName;
            if (el) attr["d3ui-node"] = el;
            if (element.id) attr["d3ui-id"] = element.id;
            return { attr:attr }
        }
        function createElements(parentElement, elements){
            elements.each(function(element, el){
                appendElement(element, el);
            })
            function appendElement(element, el){
               
                element.parent = parentElement;
                element.id = nodeIdGen.getId();
                element.selector = element.node + "[d3ui-id='"+element.id+"']";
                
                if (element.data.array) {
					element.type = "join";
                    var selection = parentElement.selection;
                    var data = selection.selectAll(element.selector).data(element.data.array, element.data.key);
                    
                    element.exited = data.exit();
                    exitElement(element, true);
                    
                    element.entered = data.enter().append(element.node)
                        .applyAll(element.enter)
                        .applyAll(uiAttr(element, el));
                    if (element.on.enter && element.entered && element.entered.nodes().length) element.on.enter.call(element);
                    
                    element.selection = element.entered.merge(data)
                        .applyAll(element.update);
                }
                else {
                    if (parentElement.type  === "join"){
                        element.type = "join";
                        element.entered = parentElement.entered.append(element.node)
                            .applyAll(element.enter)
                            .applyAll(uiAttr(element, el));
                        if (element.on.enter && element.entered && element.entered.nodes().length) element.on.enter.call(element);
                    
                        element.selection = parentElement.selection.select(element.selector)
                            .applyAll(element.update);
                    }
                    else{
						element.type = "element";
                        element.selection = parentElement.selection.append(element.node)
                            .applyAll(element.enter)
                            .applyAll(uiAttr(element, el));
                    }
                }
                if (element.datum.array){
                    element.selection.datum(element.datum.array).applyAll(element.datum.update);
                }
                createElements(element, element.childs);           
            };
        };
        function exitElement(element, top){
            if (element.exited.nodes().length === 0) return;
            if (typeof element.exited === "undefined") element.exited = element.parent.exited.select(element.selector);
            if (element.childComponents) element.childComponents.each(function(item) { item.elements.each(exitElement)});
            element.childs.each(exitElement);
            if (element.on.exit && element.exited && element.exited.nodes().length) {
                element.on.exit.call(element);
            }
            if (top === true) element.exited.remove();
            delete element.exited;
        }
        function joinElements(parentElement, elements){
            elements.each(function(element, el){
                joinElement(element, el);
            })
            function joinElement(element, el){
                
                if (element.data.array){
                    var selection = parentElement.selection;
                    var data = selection.selectAll(element.selector).data(element.data.array, element.data.key);
                    
                    element.exited = data.exit();
                    exitElement(element, true);
                    
                    element.entered = data.enter().append(element.node)
                        .applyAll(element.enter)
                        .applyAll(uiAttr(element, el));
                    if (element.on.enter && element.entered && element.entered.nodes().length) element.on.enter.call(element);
                    
                    element.selection = element.entered.merge(data)
                        .applyAll(element.update);
                }
                else if (parentElement.type  === "join"){
                    element.entered = parentElement.entered.append(element.node)
                        .applyAll(element.enter)
                        .applyAll(uiAttr(element, el))
                        .applyAll(element.update);
                    if (element.on.enter && element.entered && element.entered.nodes().length) element.on.enter.call(element);
                    element.selection = parentElement.selection.select(element.selector);
                }
                joinElements(element, element.childs);
            }
        }
        function updateElements(parentElement, elements, config){
            if (typeof config === "undefined") config = {};
            elements.each(function(element, el){
                updateElement(element, el);
            })
            function updateElement(element, el){                
                var selection = element.selection;
                if (config.transition) selection = selection.transition(config.transition);
                selection.applyAll(element.update);
                
                if (element.datum.array){
                    selection.datum(element.datum.array).applyAll(element.datum.update);
                }
                if (element.on.update) element.on.update.call(element);
                updateElements(element, element.childs, config);
            }
        }
    }
    function apply(func, struct){
        if (func !== "attr" && func !== "property" && func !== "on" && func !== "classed" && func !== "style"){
            if (typeof this[func] === "function")
                this[func](struct);
        }
        else if (typeof struct === "function"){
            var transition;
            if (this.constructor.name === "Gn")
                transition = this;
            this.each(function (d, i){
                var selection = d3.select(this);
                if (transition) selection = selection.transition(transition)
                selection.apply(func, struct.apply(this, arguments));
            })
        }
        else if (struct instanceof Array){ 
            var n = struct.length;
            for (var i = 0; i < n; i++){
                this.apply(func, struct[i]);
            }
        }
        else{ 
            for (var key in struct){
                this[func](key, struct[key]);
            }   
        }
        return this;
    }
    function applyAll(struct){
        if (typeof struct === "function"){
            var transition;
            if (this.constructor.name === "Gn")
                transition = this;
            this.each(function (d, i){
                var selection = d3.select(this);
                if (transition) selection = selection.transition(transition)
                selection.applyAll(struct.call(this, d, i));
            })
        }
        else if (struct instanceof Array){ 
            var n = struct.length;
            for (var i = 0; i < n; i++){
                this.applyAll(func, struct[i]);
            }
        }
        else{
            if (struct.call) this.apply("call", struct.call);
            if (struct.html) this.apply("html", struct.html);
            for (var func in struct){
                if (!struct.hasOwnProperty(func)) continue;
                if (func !== "call" && func !== "html")
                    this.apply(func, struct[func])
            }
        }
        return this;
    }
});