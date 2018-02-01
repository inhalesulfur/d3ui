// JavaScript
define( [ 
	"d3",
	"ui",
	"./Chat.m",
    "css!./Chat.css"
], function ( 
	d3,
    ui,
	Model
){
    var uiNode = ui.Node;
    var uiTemplate = ui.Template;
	var DropButton = ui.templates.DropButton;
    var messageTypes ={
        error:ErrorMessage,
        connectionError:ConnectionErrorMessage,
        text:TextMessage,
        json:JsonMessage,
        kpi:KpiMessage,
        option:OptionMessage,
        unknown:UnknownMessage
    }
    function Chat(){
        var module = "Chat";
        var uiParentNode = document.body;
        var model = new Model;
        var width = 600;
        var height = 500;
        var buttonWidth = 60;
        var buttonHeight = 60;
        /*var hideStyle = {
            width: "100px",
            height: "34px",
            left: "0px",
            top: "0px"
        };
        var showStyle = function(){ return {
            width: width + "px",
            height: height + "px",
            left: 110 - width + "px",
            top: 44 - height + "px"
        }}*/
		this.enter = function(){
			
		}
		this.exit = function(){
			chatButton.exit();
		}
        var hideDropStyle = function(){ return{
            position:"absolute",
            width: width + "px",
            height: height + "px",
            left: this.parentNode.clientWidth +"px",
            top: this.parentNode.clientHeight*0.5 - height *0.5 + "px"
        }};
        var showDropStyle = function(){ return {
            width: width + "px",
            height: height + "px",
            left: this.parentNode.clientWidth - width + "px",
            top: this.parentNode.clientHeight*0.5 - height *0.5 + "px"
        }}
        var hideButtonStyle = function(){ return{
            position:"absolute",
            width: buttonWidth + "px",
            height: buttonHeight + "px",
            left: this.parentNode.clientWidth - buttonWidth +"px",
            top: this.parentNode.clientHeight*0.5 - buttonHeight *0.5 + "px"
        }};
        var showButtonStyle = function(){ return {
            width: buttonWidth + "px",
            height: buttonHeight + "px",
            left: this.parentNode.clientWidth - buttonWidth - width + "px",
            top: this.parentNode.clientHeight*0.5 - buttonHeight *0.5 + "px"
        }}
        var chatButton = new DropButton({module:module});
        var label = new ui.Node({node:"span"});
        label.enter.html = "Чат";
        chatButton.ref.button.childs.label = label;
        //chatButton.ref.button.enter.html = function(){ return "Чат"; };
        //chatButton.ref.button.enter.attr.class = "btn btn-primary btn-md";
        chatButton.ref.button.enter.style = hideButtonStyle;
        chatButton.ref.drop.enter.style = hideDropStyle;
        chatButton.enter(uiParentNode);
        chatButton.on("hide", function(){ 
            resizer.disable();
            chatButton.ref.button.selection
                .transition().duration(500)
                .apply("style", hideButtonStyle);
                
            chatButton.ref.drop.selection
                .style("display", "block")
            .transition().duration(500)
                .apply("style", hideDropStyle);
            //chatButton.ref.button.selection.html("Чат")
        });
        chatButton.on("show", function(){ 
            chatButton.ref.button.selection
                .transition().duration(500)
                .apply("style", showButtonStyle);
                
            chatButton.ref.drop.selection
                .style("display", "block")
            .transition().duration(500)
                .apply("style", showDropStyle)
                .transition().duration(200)
                    .on("end.greetings", model.messager.greetings)
                    .on("end.resizer", resizer.enable);
            //chatButton.ref.button.selection.html("Свернуть")
        });
        var layout = new Layout({module:module});
        layout.enter(chatButton.ref.drop);
        var resizer = new Resizer({module:module});
        resizer.enter(chatButton.ref.drop);
        resizer.on("resize", function(){
            width = width + this.dx;
            height = height + this.dy;
            if (width < 400) width = 400;
            if (height < 300) height = 300;
            chatButton.ref.drop.selection.apply("style", showDropStyle);
            chatButton.ref.button.selection.apply("style", showButtonStyle);
        })
        
        var messageBox = new MessageBox({module:module});
        messageBox.ref.message.root.data.array = model.messager.read.messages;
        messageBox.ref.message.sender.update.html = model.messager.read.message.sender;
        messageBox.ref.message.time.update.html = model.messager.read.message.time;
        messageBox.ref.message.body.on.enter = function(){
            this.entered.each(function(d, i){
                var Constractor = messageTypes[d.type];
                if (Constractor){
                    var message = new Constractor({module:module, message:d, messager:model.messager});
                    message.enter(this);
                } 
                
                var dev = new JsonMessage({module:module, message:{dev:d}, messager:model.messager});
                dev.enter(this); 
            })
        }
        messageBox.enter(layout.ref.body);
        model.messager.on("message.messageBox", messageBox.update);
        model.messager.on("message.scroll", messageBox.scrollDown);
        
        var userIcon = new UserIcon({module:module})
        userIcon.ref.text.update.html = model.messager.read.message.FI;
        userIcon.enter(messageBox.ref.message.icon);
        model.messager.on("message.userIcon", userIcon.update);
        
        var inputBox = new InputBox({module:module});
        inputBox.enter(layout.ref.foot);
        inputBox.on("submit.send", model.messager.send);
        
        chatButton.show();
        this.resize = function(){
            chatButton.hide();
        }
	}
    function Layout(templateDef){
        templateDef || (templateDef = {});
        uiTemplate.call(this, {factory:"Layout", module:templateDef.module});
        this.elements.body = new uiNode({ref:"body"});
        this.elements.foot = new uiNode({ref:"foot"});
        this.updateRef();   
    }
    function Resizer(templateDef){
        var leftMargin = 60;
        var topMargin = 10;
        var bottomMargin = 10;
        var disableEvents = true;
        templateDef || (templateDef = {});
        var viewport = new ui.models.Viewport;
        uiTemplate.call(this, {factory:"Resizer", module:templateDef.module});
        var dispatch = d3.dispatch("resize");
        dispatch.on("resize.this", this.update);
        this.on = dispatch.on.bind(dispatch);
        this.elements.wrap = new uiNode({ref:"wrap"});
        this.elements.wrap.childs.leftTop = new uiNode({ref:"leftTop"});
        this.elements.wrap.childs.left = new uiNode({ref:"left"});
        this.elements.wrap.childs.top = new uiNode({ref:"top"});
        this.elements.wrap.childs.bottom = new uiNode({ref:"bottom"});
        this.elements.wrap.childs.leftBottom = new uiNode({ref:"leftBottom"});
        this.updateRef();   
        var ref = this.ref;
        ref.wrap.update.style = function(){
            viewport.update(this);
            return viewport.style;
        }
        ref.wrap.update.classed.disableEvents = function() { return disableEvents };
        ref.left.update.style.height = function() {return viewport.height+"px"};
        ref.top.update.style.width = function() {return viewport.width+"px"};
        ref.bottom.update.style.width = function() {return viewport.width+"px"};
        ref.bottom.update.style.top = function() {return viewport.height+"px"};
        ref.leftBottom.update.style.top = function() {return viewport.height+"px"};
            
        ref.left.enter.call = d3.drag().on("start", resizeLeft);
        function resizeLeft(){
            document.body.style.cursor = "ew-resize";
            d3.event.on("drag", dragMove).on("end", dragEnd);
            var last = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
            function dragMove(d, i){
                var curr = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
                var dx = curr.x - last.x;
                var dy = curr.y - last.y;
                dx = -d3.event.x;
                dy = 0;
                if (d3.event.sourceEvent.pageX < leftMargin) dx = 0;
                if (d3.event.sourceEvent.pageX < leftMargin) dx = 0;
                dispatch.call("resize", {dx:dx, dy:dy});
                last = curr;
            }    
            function dragEnd(){
                document.body.style.cursor = "";
            } 
        }
        ref.top.enter.call = d3.drag().on("start", resizeTop);
        function resizeTop(){
            document.body.style.cursor = "ns-resize";
            d3.event.on("drag", dragMove).on("end", dragEnd);
            var last = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
            function dragMove(d, i){
                document.body.style.cursor = "ns-resize !important";
                var curr = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
                var dx = curr.x - last.x;
                var dy = curr.y - last.y;
                dx = 0;
                dy = -d3.event.y;
                if (d3.event.sourceEvent.pageY < topMargin) dy = 0;
                if (d3.event.y > 0 && dy > 0) dy = 0;
                dispatch.call("resize", {dx:dx, dy:dy});
                last = curr;
            }  
            function dragEnd(){
                document.body.style.cursor = "";
            }   
        }
        ref.bottom.enter.call = d3.drag().on("start", resizeBottom);
        function resizeBottom(){
            document.body.style.cursor = "ns-resize";
            d3.event.on("drag", dragMove).on("end", dragEnd);
            var last = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
            function dragMove(d, i){
                document.body.style.cursor = "ns-resize !important";
                var curr = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
                var dx = curr.x - last.x;
                var dy = curr.y - last.y;
                dx = 0;
                dy = 2*dy;
                if (d3.event.sourceEvent.pageY > document.body.clientHeight - bottomMargin) dy = 0;
                if (d3.event.y < viewport.height && dy > 0) dy = 0;
                dispatch.call("resize", {dx:0, dy:dy});
                last = curr;
            }  
            function dragEnd(){
                document.body.style.cursor = "";
            }   
        }
        ref.leftTop.enter.call = d3.drag().on("start", resizeLeftTop);
        function resizeLeftTop(){
            document.body.style.cursor = "nw-resize";
            d3.event.on("drag", dragMove).on("end", dragEnd);
            var last = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
            function dragMove(d, i){
                var curr = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
                var dx = curr.x - last.x;
                var dy = curr.y - last.y;
                dx = -d3.event.x;
                dy = -d3.event.y;
                if (d3.event.sourceEvent.pageX < leftMargin) dx = 0;
                if (d3.event.sourceEvent.pageY < topMargin) dy = 0;
                if (d3.event.x > 0 && dx > 0) dx = 0;
                if (d3.event.y > 0 && dy > 0) dy = 0;
                dispatch.call("resize", {dx:dx, dy:dy});
                last = curr;
            }   
            function dragEnd(){
                document.body.style.cursor = "";
            }
        }
        ref.leftBottom.enter.call = d3.drag().on("start", resizeLeftBottom);
        function resizeLeftBottom(){
            document.body.style.cursor = "sw-resize";
            d3.event.on("drag", dragMove).on("end", dragEnd);
            var last = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
            function dragMove(d, i){
                var curr = {x:d3.event.sourceEvent.pageX, y:d3.event.sourceEvent.pageY};
                var dx = curr.x - last.x;
                var dy = curr.y - last.y;
                dx = -dx;
                dy = 2*dy;
                if (d3.event.sourceEvent.pageX < leftMargin) dx = 0;
                if (d3.event.sourceEvent.pageY > document.body.clientHeight - bottomMargin) dy = 0;
                if (d3.event.x > 0 && dx > 0) dx = 0;
                if (d3.event.y < viewport.height && dy > 0) dy = 0;
                dispatch.call("resize", {dx:dx, dy:dy});
                last = curr;
            }   
            function dragEnd(){
                document.body.style.cursor = "";
            }
        }
        this.enable = enable.bind(this);
        function enable(){
            disableEvents = false;
            this.update();
        }
        this.disable = disable.bind(this);
        function disable(){
            disableEvents = true;
            this.update();
        }
    }
    function InputBox(templateDef){
        templateDef || (templateDef = {});
        uiTemplate.call(this, {factory:"InputBox", module:templateDef.module});
        
        var dispatch = d3.dispatch("submit");
        this.on = dispatch.on.bind(dispatch);
        this.elements.group = new uiNode({ref:"group"});
        this.elements.group.childs.input = new uiNode({node:"input", ref:"input"});
        this.elements.group.childs.submit = new uiNode({ref:"submit"});
        this.elements.group.childs.submit.childs.button = new uiNode({node:"button", ref:"button"});
        
        this.updateRef();   
        
        this.ref.group.enter.attr.class = "input-group";
        this.ref.input.enter.attr.class = "form-control";
        this.ref.input.enter.attr.type = "text";
        this.ref.input.enter.attr.placeholder = "Напишите сообщение";
        this.ref.submit.enter.attr.class = "input-group-btn";
        this.ref.button.enter.attr.class = "btn btn-default";
        this.ref.button.enter.attr.type = "submit";
        this.ref.button.enter.html = "Отправить";
        var input = this.ref.input;
        this.ref.submit.enter.on.click = function(){
            var value = input.selection.property("value");
            input.selection.property("value", "");
            dispatch.call("submit", null, value);
        }
    }
    function MessageBox(templateDef){
        templateDef || (templateDef = {});
        uiTemplate.call(this, {factory:"MessageBox", module:templateDef.module});
        this.elements.wrap = new uiNode({ref:"wrap"});
        this.elements.wrap.childs.messages = new uiNode({ref:"messages"});
        this.elements.wrap.childs.messages.childs.message = new MessageNode({ref:"message"});
        this.updateRef();  
        var wrap = this.ref.wrap;
        this.scrollDown = function(){
            wrap.selection.property("scrollTop", function(){
                return this.scrollHeight - this.offsetHeight;
            });
        }
    }
    function MessageNode(nodeDef){
        nodeDef || (nodeDef = {});
        uiNode.call(this, {ref:nodeDef.ref+".root"});
        this.childs.icon = new uiNode({ref:nodeDef.ref+".icon"});
        this.childs.content = new uiNode({ref:nodeDef.ref+".content"});
        this.childs.content.childs.head = new uiNode({ref:nodeDef.ref+".head"});
        this.childs.content.childs.head.childs.sender = new uiNode({node:"span", ref:nodeDef.ref+".sender"});
        this.childs.content.childs.head.childs.time = new uiNode({node:"span", ref:nodeDef.ref+".time"});
        this.childs.content.childs.body = new uiNode({ref:nodeDef.ref+".body"});
    }
    function UserIcon(templateDef){
        templateDef || (templateDef = {});
        uiTemplate.call(this, {factory:"UserIcon", module:templateDef.module});
        this.elements.icon = new uiNode({ref:"icon"});
        this.elements.icon.childs.text = new uiNode({node:"span", ref:"text"});
        this.updateRef();  
    }
    function ErrorMessage(templateDef){
        templateDef || (templateDef = {});
        var message = templateDef.message;
        uiTemplate.call(this, {factory:"ErrorMessage", module:templateDef.module});
        this.elements.body = new uiNode({ref:"body"});
        this.updateRef();
        this.ref.body.enter.html = function() { return message.data.error.msg };
    }
    function ConnectionErrorMessage(templateDef){
        templateDef || (templateDef = {});
        var message = templateDef.message;
        uiTemplate.call(this, {factory:"ErrorMessage", module:templateDef.module});
        this.elements.msg = new uiNode({ref:"msg"});
        this.elements.origin = new uiNode({});
        this.elements.origin.childs.link = new uiNode({node:"a", ref:"link"});
        this.updateRef();
        this.ref.msg.enter.html = "Ошибка подключения. Проверьте доступность чат-бота по адресу:";
        this.ref.link.enter.html = function() { return message.data.event.origin };
        this.ref.link.enter.on.click = function() { window.open(message.data.event.origin) };
        this.ref.link.enter.style.cursor = "pointer";
    }
    function TextMessage(templateDef){
        templateDef || (templateDef = {});
        var message = templateDef.message;
        uiTemplate.call(this, {factory:"TextMessage", module:templateDef.module});
        this.elements.body = new uiNode({ref:"body"});
        this.updateRef();
        this.ref.body.enter.html = function() { return message.data.textMessage };
    }
    function UnknownMessage(templateDef){
        templateDef || (templateDef = {});
        var message = templateDef.message;
        uiTemplate.call(this, {factory:"UnknownMessage", module:templateDef.module});
        this.elements.head = new uiNode({ref:"head"});
        this.elements.questions = new uiNode({ref:"questions"});
        this.updateRef();
        this.ref.head.enter.html = "Ваш запрос не распознан. <br/> Возможные запросы:";
        this.ref.questions.data.array = function(){return message.data.questions };
        this.ref.questions.enter.html = function(d, i) { return d.query.map(function(d) { return "{"+d+"}"}).reduce(ui.utils.concater(" ")) }
        
    }
    function KpiMessage(templateDef){
        templateDef || (templateDef = {});
        var message = templateDef.message;
        uiTemplate.call(this, {factory:"KpiMessage", module:templateDef.module});
        this.elements.entities = new uiNode({ref:"entities"});
        this.elements.result = new uiNode({ref:"result.root"});
        this.elements.result.childs.head = new uiNode({ref:"result.head"});
        this.elements.result.childs.body = new uiNode({ref:"result.body"});
        this.elements.result.childs.body.childs.table = new TableNode();
        this.elements.answerText = new uiNode({ref:"answerText"});
        this.elements.dev = new uiNode({ref:"dev"});
        this.updateRef();
        
        this.elements.result.enter.style = {
            "width":"100%",
            "overflow":"auto"
        }
        
        this.ref.result.body.enter.text = function() { return !(message.data && message.data.body)?"": message.data.body.length?"":"Нет данных"}
        this.ref.table.enter.style.display = function(){ return message.data && message.data.body && message.data.body.length?"inline":"none"};
        this.ref.head.cells.data.array = message.data.head;
        this.ref.head.cells.enter.html = function(d, i) { return d };
        this.ref.body.rows.data.array = message.data.body;
        this.ref.body.cells.data.array = function(d, i) { return d };
        this.ref.body.cells.enter.html = function(d, i) { return d };
        
        
        this.ref.answerText.enter.html = function() { return message.data.answer_text };
        this.ref.entities.on.enter = function(){
            this.entered.each(function(d, i){
                var params = new ui.templates.ReqursiveObject({});
                params.enter(this);
                params.update({data:message.data.params});
            });
        }
        
        
        var exportButton = new uiNode({node:"span"});
        exportButton.enter.html = "Экспорт";
        exportButton.enter.attr.class = "lui-button";
        exportButton.enter.style.display = function(){ return message.data && message.data.body && message.data.body.length?"inline":"none"};
        exportButton.enter.on.click = function(){
            ui.utils.savers.csv({
                separator:";",
                head:message.data.head,
                body:message.data.body
            });
        };
        this.ref.result.head.childs.exportButton = exportButton;
        
        
        
        this.ref.dev.on.enter = function(){
            this.entered.each(function(d, i){            
                var dev = new ui.templates.ReqursiveObject({});
                dev.enter(this);
                dev.update({data:{dev:message}});
            });
        }
    }
    function TableNode(def){
        def || (def = {});
        uiNode.call(this, {node:"table", ref:"table"});
        this.childs.thead = new uiNode({node:"thead", ref:"thead"});
        this.childs.thead.childs.rows = new uiNode({node:"tr", ref:"head.rows"});
        this.childs.thead.childs.rows.childs.cells = new uiNode({node:"td", ref:"head.cells"});
        this.childs.tbody = new uiNode({node:"tbody", ref:"tbody"});
        this.childs.tbody.childs.rows = new uiNode({node:"tr", ref:"body.rows"});
        this.childs.tbody.childs.rows.childs.cells = new uiNode({node:"td", ref:"body.cells"});
    }
    function OptionMessage(templateDef){
        templateDef || (templateDef = {});
        var message = templateDef.message;
        var messager = templateDef.messager;
        uiTemplate.call(this, {factory:"OptionMessage", module:templateDef.module});
        this.elements.head = new uiNode({ref:"head"});
        this.elements.body = new uiNode({ref:"body"});
        this.elements.body.childs.options = new uiNode({ref:"options"});
        this.elements.body.childs.options.childs.option = new uiNode({node:"span", ref:"option"});
        this.updateRef();
        this.ref.head.enter.html = message.data.question;
        this.ref.options.data.array = message.data.options;
        this.ref.option.enter.attr.class = "lui-button";
        this.ref.option.enter.html = function(d, i) { return d.label };
        this.ref.option.enter.on.click = function(d, i) { 
            messager.send(d.request) 
            //messager.silentSend(d.request) 
        };
    }
    function JsonMessage(templateDef){
        templateDef || (templateDef = {});
        var message = templateDef.message;
        uiTemplate.call(this, {factory:"JsonMessage", module:templateDef.module});
        var devButton = new uiNode({node:"span"});
        devButton.enter.html = "dev";
        devButton.enter.attr.class = "lui-button";
        devButton.enter.on.click = function(){
            ui.utils.savers.json({
                data:message
            });
        };
        var body = new ui.Node();
        body.data.array = function() { return [message] };
        body.on.enter = function(){
            this.entered.each(function(d, i){
                var obj = new ui.templates.ReqursiveObject({});
                obj.enter(this);
                obj.update({data:d});
            });
        }
        this.elements.upload = devButton;
        this.elements.body = body;
    }
	return Chat;

} );