define( [ 
], function ( 
){
    var chatBotError = new ChatBotError;
    function ChatBot(config){
        var origin = config.url;
        this.request = request;
        function request(user_id, question){
            return new Promise(function(resolve, reject){
                chatBotRequest(user_id, question)
                .then(resolve)
                .catch(reject);
            });
        }
        function chatBotRequest(user_id, question){
            return new Promise(function(resolve, reject){
                var params = $.param({user_id:user_id, question:encodeURIComponent(question)});
                var path = origin + "?" + params;
                $.ajax(
                {
                    url:path,
                    success:function(e){
                        var json;
                        try{
                            json = JSON.parse(e);
                        }
                        catch(e){
                            reject(chatBotError.reject(1, e));
                        }
                        resolve(json);
                    },
                    error:function(e){
                        e.origin = origin;
                        reject(chatBotError.reject(2, e));
                    },
                })
            })
        }
	}
    function ChatBotError(){
        var errors = [
            { code:0, msg:"unknown error" },
            { code:1, msg:"JSON.parse error" },
            { code:2, msg:"connection error" }
        ];
        this.reject = function (id, e) { return { error:errors[id], event:e } };
    }
	return ChatBot;
} );