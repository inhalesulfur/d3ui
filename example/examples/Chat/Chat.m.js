define( [ 
    "d3",
    "ui",
    "moment",
    "./ChatBotApi"
], function ( 
    d3,
    ui,
    moment,
    ChatBot
){ 
    function Chat(moduleDef){
        var currentUser = {
            user_fullname:"Петухов Александр Николаевич",
            user_surname:"Петухов",
            user_name:"Александр",
            org_code:""            
        };
        var user = {name:currentUser.user_fullname, FI:currentUser.user_surname.substr(0, 1) + currentUser.user_name.substr(0, 1), org_code:currentUser.org_code};
        //!!!! сгенерить уникальные id для пользователей
        user.id = Math.random()*10000000;
        var dispatch = d3.dispatch("message");
        var messager = new Messager(user);
        this.on = dispatch.on.bind(dispatch);
        this.messager = messager;        
    }
    function Messager(user){
        var helloCount = 0;
        var helloFlag = false;
        var kpiClarify = true;
        var kpiCount = 0;
        var state = {
            
        };
        var id = 1;
        var chatBot = new ChatBot({
            url:"https://10.247.98.73:5051/request/"
        });
        chatBot.name = "чат-бот";
        chatBot.FI = "ЧБ";
        var messages = [];
        var dispatch = d3.dispatch("message");
        this.on = dispatch.on.bind(dispatch);
        this.send = function(msg){
            if (msg === "") return;
            pushMessage(new Message(user, "text", msg));
            sendRequest(msg);
        }
        this.silentSend = function(msg){
            if (msg === "") return;
            sendRequest(msg);
        }
        this.clearSend = function(msg){
            if (msg === "") return;
            var chain = chatBot.request(user.id, "отмена");
            requests.forEach(function(d){
                chain = chain.then(chatBot.request(user.id, d));
            })
        }
        this.greetings = function(){
            if (helloFlag) return;
            reset();
            pushMessage(new Message(chatBot, "text", "Добрый день. Что вас интересует?"));
            helloFlag = true;
        }
        this.read = {
            messages:function() { return messages },
            message:{
                type:function(d, i) { return d.type },
                time:function(d, i) { return d.dt.format("HH:mm")},
                sender:function(d, i) { 
                    return d.sender.name 
                },
                FI:function(d, i) { return d.sender.FI },
                data:function(d, i) { 
                    return d.data 
                }
            }
        }
        function reset(){
            requests = [];
            kpiClarify = true;
        }
        function pushMessage(message){
            helloFlag = false;
            messages.push(message);
            dispatch.call("message");
        }
        function sendRequest(msg){
            if (msg === "отмена" || msg === "Отмена") {
                reset();
                chatBot.request(user.id, msg)
                .then(processResponse)
                .then(function(response){
                    pushMessage(new Message(chatBot, "text", "Состояние чат-бота сброшено"));
                })
                .catch(processError)
            }
            else{
                chatBot.request(user.id, msg)
                .then(function(response){
                    pushMessage(new Message(chatBot, response.type, response));
                })
                .catch(processError)
            }
            
        }
        function Message(sender, type, data){
            this.sender = sender;
            this.type = type;
            this.data = data;
            this.dt = moment();
        }
        function processError(e){
            e.error || (e.error = {});
            if (e.error.code === 2) pushMessage(new Message(chatBot, "connectionError", e));
            else pushMessage(new Message(chatBot, "error", e));
        }
        function processResponse(response){
            return new Promise(function(resolve, reject){
                response.type = "kpi";
                response.params = {};
                response.view = {};
               // if (response.answer_id) response.finished = true;
                var entityCount = 0;
                ui.utils.each.call(response.entities, function(entity){
                    entityCount++;
                });
                if (entityCount === 0){
                    response.type = "unknown";
                    resolve(response);
                }
                else if (response.entities["Показатель"]){
                    response.type = "kpi";
                    processKpi(response).then(resolve, reject);
                    
                }
                else {
                    resolve(response);
                }
            })
        }
        function selectKpi(){
            
        }
        function processKpi(response){
            return new Promise(function(resolve, reject){
               
                var orgFilter = "'"+user.org_code+"'";
                var reportStart = moment().startOf("month").format("DD.MM.YYYY");
                var reportEnd = moment().format("DD.MM.YYYY");
                var reportType;
                var needed = [];
                if (response.entities["Подразделение"]){
                    var orgArray = response.entities["Подразделение"];
                    orgFilter = getFilterStr(orgArray);
                    response.params["Подразделение"] = orgFilter;
                }
                else {
                    needed.push("подразделение");
                }
                if (response.entities["Период"]){
                    reportStart = response.entities["Период"]["начало"];
                    reportEnd = response.entities["Период"]["конец"];
                    reportType = response.entities["Период"]["тип периода"];
                    response.params["Отчетный период"] = " c "+reportStart+" по "+ reportEnd;
                }
                else {
                    needed.push("отчетный период");
                }
                if (response.entities["Значение"]){
                    response.params["Значение"] = response.entities["Значение"];
                }
                else {
                    needed.push("значение (факт, выполнение)");
                }
                if (response.entities["Показатель"]){
                    response.params["Показатель"] = response.entities["Показатель"].map(function(d) {return d["имя"]});
                }
                /*
                if (response.entities["Показатель"] && response.entities["Показатель"].length && response.entities["Показатель"].length > 5){
                    kpiClarify = false;
                    kpiCount = response.entities["Показатель"].length;
                    response.type = "option";
                    response.question = "Какой показатель Вас интересует?"; 
                    response.options = response.entities["Показатель"].map(function(d) { 
                        var request = d["имя"] + " ";
                        ui.utils.each.call(response.params, function(d, i){
                            request += d + " ";
                        })
                        return {
                            label:d["имя"], request:request
                        }
                    });
                    resolve(response);
                    return;
                }*/
                
                if (needed.length) {
                    response.answer_text = "Уточните " + needed.reduce(concater(", "));
                }else{
                    response.finished = true;
                }
                if (!response.finished){
                    resolve(response);
                    return;
                }
                var kpiArray = response.entities["Показатель"];
                var reportCode = reportType === "месяц"?"m":"*";
                
                var kpiFilter = getFilterStr(kpiArray);
                function getFilterStr(data){
                    var id = data.reduce(function(prev, curr){
                        curr.id.forEach(function(d){
                            prev.push(d);
                        })
                        return prev;
                    }, []);
                    if (id.length === 0) id.push("*");
                    var str = id.map(function(d) { return "'" + d + "'"}).reduce(concater(", "));
                    return str;
                }
                function concater(separator){
                    return function(prev, curr){
                        return prev + separator + curr;
                    }
                }
                kpiClarify = true;
                uploadKpi(response, kpiFilter, orgFilter, "<="+reportEnd + ">="+reportStart, reportCode).then(resolve, reject);
            })
        }
        function uploadKpi(response, kpiFilter, orgFilter, reportDateFilter, reportCode){
            return new Promise(function(resolve, reject){
                var cubeDef = parser.parse(xmlCubeDef);
                cubeDef.kpi.value.replaceVariables({
                   kpi_id_list:kpiFilter,
                   org_code_list:orgFilter,
                   kpi_report_date:reportDateFilter,
                   kpi_report_type:reportCode,
                   kpi_value:"kpi_fact"
                   //current_org_cd:99
                }) 
                var cubeDispatcher = new qlikConnector.CubeDispatcher;
                cubeDispatcher.initFromXml(cubeDef.kpi, function(cubes){
                    cubeDispatcher.release();
                    var head = [
                        "Отчетная дата",
                        "Периодичность",
                        "Код подразделения",
                        "Имя подразделения",
                        "Id показателя",
                        "Блок",
                        "Сегмент",
                        "Название показателя",
                        "Значение",
                        "Ед. измерения"
                    ];
                    var body = [];
                    var map = {};
                    if (cubes.value.data.target.length === 0) map = "Нет данных";
                    cubes.value.data.target.forEach(function(d, i){
                        map[d.block_name] || (map[d.block_name] = {})
                        map[d.block_name][d.segment_name] || (map[d.block_name][d.segment_name] = {}) 
                        map[d.block_name][d.segment_name][d.kpi_name] = {
                            "Отчетная дата":d.kpi_report_date.format("DD.MM.YYYY"),
                            "Периодичность":d.kpi_report_type,
                            "Факт":d.kpi_value + " " + d.kpi_unit
                        }
                        body.push([
                            d.kpi_report_date.format("DD.MM.YYYY"),
                            d.kpi_report_type,
                            d.org_code,
                            d.org_name,
                            d.kpi_id,
                            d.block_name,
                            d.segment_name,
                            d.kpi_name,
                            d.kpi_value,
                            d.kpi_unit
                        ]);
                    });
                    response.view["Результат"] = map;
                    response.head = head;
                    response.body = body;
                    resolve(response);                    
                });
            })
        }
    }
    return Chat;
} );