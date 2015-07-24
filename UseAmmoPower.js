// https://gist.github.com/Caleth/77aa90a4d0a328bfca48

var UseAmmoPower = UseAmmoPower || (function () {
    'use strict';

    var version = 0.1,
		schemaVersion = 0.1,

	ch = function (c) {
	    var entities = {
	        '<': 'lt',
	        '>': 'gt',
	        "'": '#39',
	        '@': '#64',
	        '{': '#123',
	        '|': '#124',
	        '}': '#125',
	        '[': '#91',
	        ']': '#93',
	        '"': 'quot',
	        '-': 'mdash',
	        ' ': 'nbsp'
	    };

	    if (_.has(entities, c)) {
	        return ('&' + entities[c] + ';');
	    }
	    return '';
	},

	capitalize = function (s) {
	    return s.charAt(0).toUpperCase() + s.slice(1);
	},

	showHelp = function () {
	    sendChat('',
			'/w gm '
+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+ '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+ 'UseAmmoPower v' + version
	+ '</div>'
	+ '<div style="padding-left:10px;margin-bottom:3px;">'
		+ '<p>UseAmmoPower provides a way to instrument and track daily and encounter powers.  It is intended for D&D 4E, but could be used for any system that requires the capability to flag abilities as used and reset them.  Using an instrumented ability will mark it used and remove it as a token action. (<i>Caveat: it will disappear the next time the owner deselects the token.</i>)</p>'
		+ '<p>Daily powers are restored to token actions after <b>!long-rest</b> is executed.  Encounter abilities are restored to token actions after <b>!short-rest</b> or <b>!long-rest</b> is executed.  Activating a used power will whisper to the player and GM that the power was already used.</p>'
	+ '</div>'
	+ '<b>Commands</b>'
	+ '<div style="padding-left:10px;">'
		+ '<b><span style="font-family: serif;">!add-use-power --' + ch('<') + 'Character Name' + ch('>') + ' [--[ encounter | daily ] ' + ch('<') + 'number' + ch('>') + ' [' + ch('<') + 'number' + ch('>') + ' ...] ...]</span></b>'
		+ '<div style="padding-left: 10px;padding-right:20px">'
			+ '<p> For all character names, case is ignored and you may use partial names so long as they are unique.  For example, ' + ch('"') + 'King Maximillian' + ch('"') + ' could be called ' + ch('"') + 'max' + ch('"') + ' as long as ' + ch('"') + 'max' + ch('"') + ' does not appear in any other names.  Exception:  An exact match will trump a partial match.  In the previous example, if a character named ' + ch('"') + 'Max' + ch('"') + ' existed, it would be the only character matched for <b>--max</b>.</p>'
			+ '<p>Omitting any <b>--encounter</b> and <b>--daily</b> parameters will cause a list of the character' + ch("'") + 's powers with the expected index numbers (<i>Caveat: These numbers will change if you add powers to the character.  You should look them up again before instrumenting if you have changed the list of powers.</i>)</p>'
			+ '<ul>'
				+ '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+ '<b><span style="font-family: serif;">--' + ch('<') + 'Character Name' + ch('>') + '</span></b> ' + ch('-') + ' This is the name of the character to list or instrument powers for.'
				+ '</li> '
				+ '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+ '<b><span style="font-family: serif;">--' + ch('<') + '[ encounter | daily ]' + ch('>') + ' ' + ch('<') + 'number' + ch('>') + ' [' + ch('<') + 'number' + ch('>') + ' ...]</span></b> ' + ch('-') + ' This specifies a list of abilities to instrument as either encounter or daily powers.  You can specify as many powers as you like by number after these arguments.  Numbers that do not index abilities or values that are not numbers are ignored. Duplicates are ignored.  If you specify the same number to both an <b>--encounter</b> and a <b>--daily</b> parameter, it will be reported as an error.  Powers that are already instrumented will be changed (So, if an ability is already instrumented as an encounter power and you specify it as a daily power, it will be changed to a daily power.).'
				+ '</li> '
			+ '</ul>'
		+ '</div>'
	+ '</div>'
	+ '<div style="padding-left:10px;">'
		+ '<b><span style="font-family: serif;">!short-rest</span></b>'
		+ '<div style="padding-left: 10px;padding-right:20px">'
			+ '<p>This command restores all expended encounter powers to token macros.</p>'
		+ '</div>'
	+ '</div>'
	+ '<div style="padding-left:10px;">'
		+ '<b><span style="font-family: serif;">!long-rest</span></b>'
		+ '<div style="padding-left: 10px;padding-right:20px">'
			+ '<p>This command restores all expended encounter and daily powers to token macros.</p>'
		+ '</div>'
	+ '</div>'
	+ '<div style="padding-left:10px;">'
		+ '<b><span style="font-family: serif;">!use-power ' + ch('<') + 'Type' + ch('>') + '  ' + ch('<') + 'Ability ID' + ch('>') + '</span></b>'
		+ '<div style="padding-left: 10px;padding-right:20px">'
			+ '<p>This command requires 2 parameters.  It is usually added by the instrumenting code.  If you copy it from one ability to another, it will be updated with the correct Ability ID on save.  Duplicating an existing character will also cause the new character' + ch("'") + 's abilities to be corrected.  All abilities are validated and updated on restart of the API.</p>'
		+ '</div>'
	+ '</div>'
	+ '<div style="padding-left:10px;">'
		+ '<b><span style="font-family: serif;">!use-ammo &lt;Token/Character ID&gt; &lt;Attribute&gt; &lt;Count&gt;</span></b>'
		+ '<div style="padding-left: 10px;padding-right:20px">'
			+ '<p>' + ch('<') + 'Token/Character ID' + ch('>') + ' - Internal ID of the user. Either copied from !get-represents or @{Name|character_id}</p>'
			+ '<p>' + ch('<') + 'Attribute' + ch('>') + ' - Name of the attribute used to track available usages.</p>'
			+ '<p>' + ch('<') + 'Count' + ch('>') + ' - How many usages removed per use of the power.</p>'
			+ '<p>This command requires 3 parameters.</p>'
		+ '</div>'
	+ '</div>'
+ '</div>'
			);
	},

	instrumentPower = function (type, power) {
	    var action = power.object.get('action'),
			match = action.match(/!use-power\s+\S+\s+\S+/);

	    if (match) {
	        action = action.replace(/!use-power\s+\S+\s+\S+/, '!use-power ' + type + ' ' + power.object.id);
	    } else {
	        action = '!use-power ' + type + ' ' + power.object.id + '\n' + action;
	    }
	    power.object.set({ action: action });
	},
	validateAndRepairAbility = function (obj) {
	    var action = obj.get('action'),
			match = action.match(/!use-power\s+(\S+)\s+(\S+)/);
	    if (match && match[2] && match[2] !== obj.id) {
	        action = action.replace(/!use-power\s+\S+\s+\S+/, '!use-power ' + match[1] + ' ' + obj.id);
	        obj.set({ action: action });
	    }
	},

	handleInput = function (msg) {
	    var args,
		who,
		obj,
		chars,
		match,
		notice,
		abilities,
		data,
		dup,
		cmds;

	    if (msg.type !== "api") {
	        return;
	    }

	    var who = getObj('player', msg.playerid).get('_displayname').split(' ')[0];
	    args = msg.content.split(" ");
	    switch (args[0]) {

	        case '!short-rest':
	            if (!isGM(msg.playerid)) {
	                sendChat('', '/w ' + who + ' '
						+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+ '<span style="font-weight:bold;color:#990000;">Error:</span> '
							+ 'Only the GM can initiate a short rest.'
						+ '</div>'
					);
	            } else {
	                refreshEncounter();
	                refreshAmmo();
	            }
	            break;

	        case '!long-rest':
	            if (!isGM(msg.playerid)) {
	                sendChat('', '/w ' + who + ' '
						+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+ '<span style="font-weight:bold;color:#990000;">Error:</span> '
							+ 'Only the GM can initiate a long rest.'
						+ '</div>'
					);
	            }
	            else {
	                refreshEncounter();
	                refreshDaily();
	                refreshAmmo();
	            }
	            break;

	        case '!use-ammo':
	            if (4 !== args.length) {
	                showHelp();
	                return;
	            }
	            handleAmmo(msg, who, args);
	            break;

	        case '!use-power':
	            if (3 !== args.length) {
	                showHelp();
	                return;
	            }
	            handlePower(msg, args, who);
	            break;

	        case '!add-use-power':
	            if (!isGM(msg.playerid)) {
	                sendChat('', '/w ' + who + ' '
						+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+ '<span style="font-weight:bold;color:#990000;">Error:</span> '
							+ 'Only the GM can instrument abilites for user-power.'
						+ '</div>'
					);
	            }
	            else {
	                handleAddPower(msg, args, who);
	            }
	            break;
	    }

	},

	refreshEncounter = function () {
	    _.chain(state.UseAmmoPower.usedPowers.encounter)
		.uniq()
		.map(function (id) {
		    return getObj('ability', id);
		})
		.reject(_.isUndefined)
		.each(function (a) {
		    a.set({
		        istokenaction: true
		    });
		});
	    state.UseAmmoPower.usedPowers.encounter = [];
	},
	refreshDaily = function () {
	    _.chain(state.UseAmmoPower.usedPowers.daily)
		.uniq()
		.map(function (id) {
		    return getObj('ability', id);
		})
		.reject(_.isUndefined)
		.each(function (a) {
		    a.set({
		        istokenaction: true
		    });
		});
	    state.UseAmmoPower.usedPowers.daily = [];
	},
	refreshAmmo = function () {
	    _.chain(state.UseAmmoPower.usedPowers.ammo)
		.uniq()
		.each(function (ammo) {
		    _.chain(ammo.abilities)
			.map(function (o) {
			    return getObj('ability', o.id);
			})
			.reject(_.isUndefined)
			.each(function (o) {
			    o.set({
			        istokenaction: true
			    });
			});
		    var attr = findObjs({ _type: 'attribute', _characterid: ammo.character, name: ammo.name });
		    if (attr && attr[0]) {
		        attr[0].set({ current: attr[0].get('max') });
		    }
		});
	},
	handleAmmo = function (msg, who, args) {
	    var chr = getObj('character', args[1]), token;
	    if (!chr) {
	        token = getObj('graphic', args[1]);
	        if (token) {
	            chr = getObj('character', token.get('represents'));
	        }
	    }
	    if (chr) {
	        var attr = findObjs({ _type: 'attribute', _characterid: chr.id, name: args[2] })[0],
				amount = parseInt(args[3], 10),
				val = parseInt(attr.get('current'), 10) || 0,
				max = parseInt(attr.get('max'), 10) || 10000,
				adj = (val - amount),
				valid = true,
				abilities;

	        abilities = _.chain(findObjs({ type: 'ability', characterid: chr.id }))
			.uniq()
			.filter(function (o) {
			    var action = o.get('action'),
					match = action.match(/!use-ammo\s+\S+\s+(\S+)\s+\S+/);
			    return match && match[1] && (match[1].toLowerCase() == args[2].toLowerCase());
			})
			.value();

	        if (adj < 0) {
	            sendChat('Powers', (isGM(msg.playerid) ? '/w gm ' : '')
					+ '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
						+ '<b>' + chr.get('name') + '</b> does not have enough ' + attr.get('name') + '.  Needs ' + amount + ', but only has '
						+ '<span style="color: #ff0000;">' + val + '</span>.'
					+ '</div>'
					);
	            valid = false;
	        } else if (adj > max) {
	            sendChat('Powers', (isGM(msg.playerid) ? '/w gm ' : '')
					+ '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
						+ '<b>' + chr.get('name') + '</b> does not have enough storage space for ' + attr.get('name') + '. Needs ' + adj + ', but only has '
						+ '<span style="color: #ff0000;">' + max + '</span>.'
					+ '</div>'
					);
	            valid = false;
	        }

	        if (isGM(msg.playerid) || valid) {
	            attr.set({ current: adj });

	            _.chain(abilities)
				.filter(function (o) {
				    var action = o.get('action'),
						match = action.match(/!use-ammo\s+\S+\s+(\S+)\s+(\S+)/);
				    return match && match[2] && (parseInt(match[2], 10) > adj);
				})
				.each(function (o) {
				    o.set({
				        istokenaction: false
				    });
				});

	            var ammo = _.findWhere(state.UseAmmoPower.usedPowers.ammo, { name: attr.get('name'), character: chr.id });
	            if (!ammo) {
	                state.UseAmmoPower.usedPowers.ammo.push({ name: attr.get('name'), character: chr.id, abilities: abilities });
	            } else {
	                ammo.abilities = abilities;
	            }
	            sendChat('Powers', (isGM(msg.playerid) ? '/w gm ' : '')
					+ '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
						+ '<b>' + chr.get('name') + '</b> ' + ((amount > 0) ? 'uses' : 'gains') + ' ' + Math.abs(amount) + ' ' + attr.get('name') + ' and has ' + adj + ' remaining.'
					+ '</div>'
					);
	        }
	    } else {
	        sendChat('Powers', (isGM(msg.playerid) ? '/w gm ' : '')
				+ '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
					+ ((undefined !== token) ? ('Token id [' + args[1] + '] does not represent a character. ') : ('Character/Token id [' + args[1] + '] is not valid. '))
					+ 'Please be sure you are specifying it correctly, either with @{selected|token_id} or copying the character id from: !get-represents @{selected|token_id} '
				+ '</div>'
				);
	    }
	},
	handlePower = function (msg, args, who) {
	    if (_.contains(['encounter', 'daily'], args[1])) {
	        var obj = getObj('ability', args[2]);
	        if (obj) {
	            obj.set({
	                istokenaction: false
	            });
	            if (_.contains(state.UseAmmoPower.usedPowers[args[1]], args[2])) {
	                var notice = '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                + '<span style="font-weight:bold;color:#990000;">Error:</span> '
                                + capitalize(args[1]) + ' Power ' + '[' + obj.get('name') + '] has already been used.'
                            + '</div>';
	                if (!isGM(msg.playerid)) {
	                    sendChat('', '/w gm ' + notice);
	                }
	                sendChat('', '/w ' + who + ' ' + notice);

	            } else {
	                state.UseAmmoPower.usedPowers[args[1]].push(args[2]);
	            }
	            return;
	        }

	    } else {
	        sendChat('', '/w ' + who + ' '
                + '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    + '<span style="font-weight:bold;color:#990000;">Error:</span> '
                    + 'Only durations of "encounter" and "daily" are supported.  Do not know what to do with [' + args[1] + '].'
                + '</div>'
            );
	        return;
	    }
	},
	handleAddPower = function (msg, args, who) {
	    var chars,
		match,
		abilities,
		data,
		dup,
		cmds;

	    args = _.rest(msg.content.split(" --"));
	    if (args.length) {
	        chars = findObjs({ type: 'character', archived: false });
	        match = _.chain([args[0]])
			.map(function (n) {
			    var l = _.filter(chars, function (c) {
			        return c.get('name').toLowerCase() === n.toLowerCase();
			    });
			    return (1 === l.length ? l : _.filter(chars, function (c) {
			        return -1 !== c.get('name').toLowerCase().indexOf(n.toLowerCase());
			    }));
			})
			.flatten()
			.value();

	        if (1 !== match.length) {
	            if (match.length) {
	                sendChat('', '/w ' + who + ' '
						+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+ '<span style="font-weight:bold;color:#990000;">Error:</span> '
							+ 'Character [<b>' + args[0] + '</b>] is ambiguous and matches ' + match.length + ' names: <b><i> '
							+ _.map(match, function (e) {
							    return e.get('name');
							}).join(', ')
							+ '</i></b>'
						+ '</div>'
					);
	            } else {
	                sendChat('', '/w ' + who + ' '
						+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+ '<span style="font-weight:bold;color:#990000;">Error:</span> '
							+ 'Character [<b>' + args[0] + '</b>] does not match any names.'
						+ '</div>'
					);
	            }
	        }
	        else {
	            match = match[0];
	            abilities = findObjs({ type: 'ability', characterid: match.id });
	            data = _.chain(abilities)
					.sort(function (o) {
					    return o.get('name').toLowerCase();
					})
					.map(function (o, idx) {
					    var action = o.get('action'),
							match = action.match(/!use-(?:power|ammo)(?:\s+(\S+)){2,3}/);

					    return {
					        name: o.get('name'),
					        current: (match && match[1]),
					        index: ++idx,
					        object: o
					    };
					}, 0)
					.value();

	            if (1 === args.length) {
	                sendChat('', '/w ' + who + ' '
						+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+ '<div style="border-bottom: 1px solid black;font-weight:bold;size:110%;">Available Powers:</div>'
							+ '<div><ol>'
								+ _.reduce(data, function (context, o) {
								    return context + '<li>' + o.name + (o.current ? ' <b>[' + o.current + ']</b>' : '') + '</li>';
								}, '')
							+ '</ol></div>'
						+ '</div>'
					);
	            }
	            else {
	                cmds = _.chain(args)
						.rest()
						.map(function (c) {
						    var work = c.split(/\s+/),
								cmd = work[0].toLowerCase(),
								powers = _.chain(work)
											.rest()
											.map(function (p) {
											    return (parseInt(p, 10) - 1);
											})
											.filter(function (v) {
											    return !!v && (v) < data.length;
											})
											.value();
						    return {
						        type: cmd,
						        which: powers
						    };
						})
						.filter(function (o) {
						    var types = ['encounter', 'daily'];
						    if (_.contains(types, o.type)) {
						        return true;
						    }
						    sendChat('', '/w ' + who + ' '
								+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
									+ '<span style="font-weight:bold;color:#990000;">Warning:</span> '
									+ 'Ignoring instrumenting type [<b>' + o.type + '</b>].  Only supported types: <b>' + types.join(', ') + '</b>'
								+ '</div>'
							);
						    return false;
						})
						.reduce(function (context, o) {
						    context[o.type] = _.uniq(_.union(context[o.type], o.which));
						    return context;
						}, { encounter: [], daily: [] })
						.value();

	                dup = _.intersection(cmds.encounter, cmds.daily);
	                if (dup.length) {
	                    sendChat('', '/w ' + who + ' '
							+ '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
								+ '<span style="font-weight:bold;color:#990000;">Error:</span> '
								+ 'Powers cannot be both encounter and daily.  Please specify each power only for one type.  Duplicates: <b>' + dup.join(', ') + '</b>'
							+ '</div>'
						);
	                } else {
	                    _.each(cmds.encounter, function (e) {
	                        instrumentPower('encounter', data[e]);
	                    });
	                    _.each(cmds.daily, function (e) {
	                        instrumentPower('daily', data[e]);
	                    });
	                }
	            }
	        }
	    } else {
	        showHelp();
	    }
	},

	checkInstall = function () {
	    if (!_.has(state, 'UsePower') || state.UsePower.version !== schemaVersion) {
	        state.UseAmmoPower = {
	            version: schemaVersion,
	            usedPowers: {
	                encounter: [],
	                daily: []
	            }
	        };
	    }
	    _.each(findObjs({ type: 'ability' }), validateAndRepairAbility);
	},

	registerEventHandlers = function () {
	    on('chat:message', handleInput);
	    on('add:ability', validateAndRepairAbility);
	    on('change:ability:action', validateAndRepairAbility);
	};

    return {
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall
    };
}());

on("ready", function () {
    'use strict';

    if ("undefined" !== typeof isGM && _.isFunction(isGM)) {
        UseAmmoPower.CheckInstall();
        UseAmmoPower.RegisterEventHandlers();
    } else {
        log('--------------------------------------------------------------');
        log('UseAmmoPower requires the isGM module to work.');
        log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625');
        log('--------------------------------------------------------------');
    }
});