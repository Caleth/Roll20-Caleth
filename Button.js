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
            t = args.shift(),
            targets = t ? Number(t) : 0,
            weapons = args.join(' ').split(' --'),
            power = weapons.shift(),
            mark = '!mark ' + _.times(targets, function(i){
                return '@{target|Target ' + (i + 1) + '|token_id}';
            }).join(' '),
            targetList = ' --target_list|' + _.times(targets, function(i){
                return '@{target|Target ' + (i + 1) + '|token_id}';
            }).join(' | '),
            message = _.chain(weapons)
                .map(function(w){
                    var a = w.split('|');
                    return '[' + a[0] + '](!button ' + charId + ' ' + a[1] + ' ' + String(targets) + ' #target)';
                }).reduce(function(a, b) {
                    return a + b;
                }, '/w ' + msg.who.split(' ')[0] + ' ')
                .value();
        sendChat(power, message);

        _.map(findObjs({_type: "macro", name: "target"}), function(obj){obj.remove()});
        createObj("macro", {
            name: "target",
            action: targetList + "\n" + mark,
            visibleto: "all",
            playerid: msg.playerid
        });
    }
});

ch = function (c) {
	var entities = {
		'<' : 'lt',
		'>' : 'gt',
		"'" : '#39',
		'@' : '#64',
		'{' : '#123',
		'|' : '#124',
		'}' : '#125',
		'[' : '#91',
        '(' : '#40',
		']' : '#93',
        ')' : '#41',
		'"' : 'quot'
	};

	if(_.has(entities,c) ){
		return ('&'+entities[c]+';');
	} else {
        return c;
    }
}

function WhisperPowerOptions(who, what){
    var Actions = _.chain(filterObjs(function(obj) {
            if (obj.get('characterid') !== what) return false;
            if (obj.get('type') !== 'attribute') return false;
            return obj.get('name').match(/repeating_powers_\d+_action/);
        }))
        .map(function(o){return {name:o.get('name').match(/\d+/)[0], current:o.get('current').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})}})
        .groupBy('current')
        .value(),
        Player = who.get('displayname').split(' ')[0];
    _.each(Actions, function(Powers, Title){
        var names = _.pluck(Powers, 'name'),
            displays = _.map(names, function(i) {
                var name = getAttrByName(what, 'repeating_powers_' + i + '_name'),
                    macro = getAttrByName(what, 'repeating_powers_' + i + '_macro');
                return '{{[' + name + '](' + _.map(macro, ch).join('') + ')}}'
                }).join(' '),
            power = '/w ' + Player + ' &{template:default} {{name=' + Title + '}} ' + displays;
        sendChat('Powers', power);
    });
}