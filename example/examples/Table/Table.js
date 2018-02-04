define([
    "d3",
    "ui"
], 
function (  
    d3,
    ui
){	
    function TableExample(){
        var rows = [
            {cells:[{value:Math.random()}, {value:Math.random()}, {value:Math.random()}]},
            {cells:[{value:Math.random()}, {value:Math.random()}, {value:Math.random()}]},
            {cells:[{value:Math.random()}, {value:Math.random()}, {value:Math.random()}]}
        ];
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
        };
        
        var table = new ui.Template({factory:"Table"});;
        table.elements.wrap = new ui.Node({node:"table", ref:"wrap"});
        table.elements.wrap.childs.rows = new ui.Node({node:"tr", ref:"rows"});
        table.elements.wrap.childs.rows.childs.cells = new ui.Node({node:"td", ref:"cells"});
        table.updateRef();
        table.ref.rows.data.array = function() { return rows}; 
        table.ref.cells.data.array = function(d, i) {return d.cells};
		table.ref.cells.update.html = function(d) { return d.value};
                       
        this.enter = function(uiParentNode){
            randButton.enter(uiParentNode);
            table.enter(uiParentNode);
            table.update();
        }
        this.exit = function(){
            table.exit();
            randButton.exit();
        }
    }
    TableExample.desc = "Визуализация таблицы";
    
    function Table(){
        ui.Template.call(this, {factory:"Table"});
        this.elements.wrap = new ui.Node({node:"table", ref:"wrap"});
        this.elements.wrap.childs.rows = new ui.Node({node:"tr", ref:"rows"});
        this.elements.wrap.childs.rows.childs.cells = new ui.Node({node:"td", ref:"cells"});
        this.updateRef();
    }
	function InputTable(){
        Table.call(this);
		this.ref.cells.childs.input = new ui.Node({node:"input", ref:"input"});
        this.updateRef();
    }
    function Button(){
        ui.Template.call(this, {factory:"Button"});
        this.elements.button = new ui.Node({node:"button", ref:"button"});
        this.updateRef();
    } 
    
    return TableExample;
});