on("chat:message", function (msg) {
    // Exit if not an api command
    if (msg.type != "api") return;

    // Get the API Chat Command
    var content = msg.content.replace("(GM) ", ""),
        command = content.split(" ", 1);

    if (command == "!button") {
        var args = content.split(" "),
            b = args.shift(),
            charid = args.shift(),
            name = args.shift(),
            targets = args.shift(),
            targetlist = args.join(" ");
        
        var attrs = findObjs({characterid:charid, name:name}),
            newMsg = _.clone(msg),
            player_obj = getObj("player", msg.playerid);
        
        if (attrs[0]){
            newMsg.content = attrs[0].get("current").replace('?{Number of Targets|1}', targets) + targetlist;
            sendChat('', newMsg.content, function(inner){
                PowerCard.Process(inner[0], player_obj);
            });
        }
    }
    
    if (command == "!buttons") {
        var args = content.split(" ");
        args.shift();
        var charId = args.shift(),
            targets = args.shift(),
            weapons = args.join(' ').split(' --'),
            power = weapons.shift(),
            mark = '!mark ' + _.times(Number(targets), function(i){
                return '@{target|Target ' + (i + 1) + '|token_id}';
            }).join(' '),
            targetList = ' --target_list|' + _.times(Number(targets), function(i){
                return '@{target|Target ' + (i + 1) + '|token_id}';
            }).join(' | '),
            message = _.chain(weapons)
                .map(function(w){
                    var a = w.split('|');
                    return '[' + a[0] + '](!button ' + charId + ' ' + a[1] + ' ' + targets + ' #target)';
                }).reduce(function(a, b) {
                    return a + b;
                }, '/w ' + msg.who.split(' ')[0] + ' ')
                .value();
        sendChat(power, message);
            
        findObjs({_type: "macro", name: "target"}, function(obj){obj.remove()});
        createObj("macro", {
            name: "target",
            action: targetList + "\n" + mark,
            visibleto: "all",
            playerid: msg.playerid
        });
    }
});    