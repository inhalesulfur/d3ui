define([
    "d3",
    "ui"
], 
function (  
    d3,
    ui
){	
    function InputTable(){
        var rows = [
            {cells:[{value:Math.random()}, {value:Math.random()}, {value:Math.random()}]},
            {cells:[{value:Math.random()}, {value:Math.random()}, {value:Math.random()}]},
            {cells:[{value:Math.random()}, {value:Math.random()}, {value:Math.random()}]}
        ];
        var updateLog = new UpdateLog();
        var randButton = new Button();
        randButton.ref.button.enter.classed["lui-button"] = true;
        randButton.ref.button.enter.html = "Рандомизировать";
        randButton.ref.button.enter.on.click = function(){
            rows = [];
            var n = Math.ceil(Math.random()*3);
            var m = Math.ceil(Math.random()*3);
            for (var i = 0; i < n; i++){
                var row = {cells:[]};
                for (var j = 0; j < m; j++){
                    row.cells.push({value:Math.random()})
                } 
                rows.push(row);
            }
            table.update();
            inputBox.update();
        };
        
        var table = new Table();
        table.ref.rows.data.array = function() { return rows}; 
        table.ref.cells.data.array = function(d, i) {return d.cells};
        var inputBox = new InputBox();
        inputBox.ref.input.enter.classed["lui-input"] = true;
        inputBox.ref.input.enter.on.input = function(d, i) { 
            d.value = this.value;
            updateLog.log("Обновлено значение " + d.value);
        }; 
        inputBox.ref.input.update.property.value = function(d, i) { return d.value };
        
        table.enter(document.body);
        inputBox.enter(table.ref.cells);
               
        this.enter = function(uiParentNode){
            randButton.enter(uiParentNode);
            table.enter(uiParentNode);
            updateLog.enter(uiParentNode);
            inputBox.enter(table.ref.cells);
            inputBox.update();
        }
        this.exit = function(){
            table.exit();
            randButton.exit();
            updateLog.exit();
        }
    }
    InputTable.desc = "Визуализация таблицы с полями ввода для каждой ячейки";
    
    function Table(){
        ui.Template.call(this, {factory:"Table"});
        this.elements.wrap = new ui.Node({node:"table", ref:"wrap"});
        this.elements.wrap.childs.rows = new ui.Node({node:"tr", ref:"rows"});
        this.elements.wrap.childs.rows.childs.cells = new ui.Node({node:"td", ref:"cells"});
        this.updateRef();
    }
    function InputBox(){
        ui.Template.call(this, {factory:"InputBox"});
        this.elements.input = new ui.Node({node:"input", ref:"input"});
        this.updateRef();
    }
    function Button(){
        ui.Template.call(this, {factory:"Button"});
        this.elements.button = new ui.Node({node:"button", ref:"button"});
        this.updateRef();
    }
    function UpdateLog(){
        var logs = [];
        var self = this;
        ui.Template.call(this, {factory:"UpdateLog"});
        this.elements.wrap = new ui.Node({node:"div", ref:"wrap"});
        this.elements.wrap.childs.logs = new ui.Node({node:"div", ref:"logs"});
        this.elements.wrap.childs.logs.childs.remove = new ui.Node({node:"span", ref:"remove"});
        this.elements.wrap.childs.logs.childs.msg = new ui.Node({node:"span", ref:"msg"});
        this.updateRef();
        this.ref.logs.data.array = function() { return logs }; 
        this.ref.msg.enter.html = function(d, i) { return d }; 
        this.ref.remove.enter.html = "x";
        this.ref.remove.enter.style["padding"] = "0px 5px";
        this.ref.remove.enter.attr.class = "lui-button";
        this.ref.remove.enter.on.click = function(d, i){
            logs.splice(i, 1);
            self.update();
        }; 
        this.log = function(msg){
            logs.push(msg);
            this.update();
        }
    }
    
    
    return InputTable;
});