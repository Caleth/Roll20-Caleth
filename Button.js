on("chat:message", function (msg) {
    // Exit if not an api command
    if (msg.type != "api") return;

    // Get the API Chat Command
    var content = msg.content.replace("(GM) ", ""),
        command = content.split(" ", 1);

    if (command == "!button") {
        var args = content.split(" ");
        args.shift();
        var attrs = findObjs({characterid:args[0], name:args[1]}),
            newMsg = _.clone(msg),
            player_obj = getObj("player", msg.playerid);
        newMsg.content = attrs[0].get("current").replace('#?{Number of Targets|1}', args[2]);
        log(newMsg.content);
        PowerCardScript.Process(newMsg, player_obj);
    }
    if (command == "!buttons") {
        var args = content.split(" ");
        args.shift();
        var charId = args.shift(),
            targets = args.shift(),
            weapons = args.join(' ').split(' --'),
            power = weapons.shift(),
            message = _.chain(weapons)
                .map(function(w){
                    var a = w.split('|');
                    return ' [' + a[0] + '](!button ' + charId + ' ' + a[1] + ' ' + targets +')';
                }).reduce(function(a, b){
                    return a + b;
                }, msg.who.split(' ')[0] + ' ').value();
        
        sendChat(power, '/w ' + message);
    }
});    