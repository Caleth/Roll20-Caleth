(function() {
    var oldCreateObj = createObj;
    createObj = function() {
        var obj = oldCreateObj.apply(this, arguments);
        if (obj && !obj.fbpath) {
            obj.fbpath = obj.changed._fbpath.replace(/([^\/]*\/){4}/, "/");
        }
        return obj;
    }
}());

on("chat:message", function (msg) {
    // Exit if not an api command
    if (msg.type != "api") return;

    // Get the API Chat Command
    msg.who = msg.who.replace(" (GM)", "");
    msg.content = msg.content.replace("(GM) ", "");
    var command = msg.content.split(" ", 1);

    if (command == "!build-character") {
        if (!msg.selected) return;
        var n = msg.content.split(" ", 2);
        var Token = getObj("graphic", n[1]);
        
        if (Token === undefined || Token.get("subtype") != "token") return;
        // USER CONFIGURATION
        var USE_POWER_CARDS = true;
        var gmnotes;
        
        gmnotes = unescape(Token.get("gmnotes")).split("<br>").join("\n");
        var stats = JSON.parse(gmnotes);
        log("parsed successfully");

        // GET NAME OF CHARACTER
        var CharacterName = stats.Vitals.name;

        // CHECK FOR DUPLICATE CHARACTERS
        var CheckSheet = findObjs({
            _type: "character",
            name: CharacterName
        });

        var Character, charLevel;
        
        // DO NOT CREATE IF SHEET EXISTS
        if (CheckSheet.length > 0) {
            log("Updating " + CharacterName)
            Character = CheckSheet[0];
        } else {
            log("Creating " + CharacterName)

            // CREATE CHARACTER SHEET & LINK TOKEN TO SHEET
            Character = createObj("character", {
                avatar: Token.get("imgsrc"),
                name: CharacterName,
//                gmnotes: Token.get("gmnotes"),
                archived: false
            });
        }

        function AddPCAttributeMax(attr, value) {
            if (!value) {
                return;
            }
            var currentAttribute = findObjs({ 
              _type: "attribute",
              _characterid: Character.id,
              name: attr
            });
            if (currentAttribute[0] && !/^repeating/.test(attr)) {
                currentAttribute[0].set({current: value, max: value});
                return currentAttribute[0];
            } else {
                return createObj("attribute", {
                    name: attr,
                    current: value,
                    max: value,
                    characterid: Character.id
                });
            }
        }

        function AddPCAttribute(attr, value) {
            if (!value) {
                return;
            }
            var currentAttribute = findObjs({ 
              _type: "attribute",
              _characterid: Character.id,
              name: attr
            });
            if (currentAttribute[0]) {
                currentAttribute[0].set({current: value});
                return currentAttribute[0];
            } else {
                return createObj("attribute", {
                    name: attr,
                    current: value,
                    characterid: Character.id
                });
            }
        }

        function AddPCPower(powername, powerstring, tokenaction) {
            var currentAbility = findObjs({ 
              _type: "ability",
              _characterid: Character.id,
              name: powername
            });
            if (currentAbility[0]) {
                currentAbility[0].set({description: "", action: powerstring, istokenaction: tokenaction});
                return currentAbility[0];
            } else {
                return createObj("ability", {
                    name: powername,
                    description: "",
                    action: powerstring,
                    istokenaction: tokenaction,
                    characterid: Character.id
                });
            }
        }

        function MakePower(Power, idx, Name) {
            // BUILD POWERSTRING
            var PowerString = "!power --format|dnd4e --name|" + Power.Name;

            // CHECK FOR MULTIPLE ATTACK POWERS
            var MultiTarget = (Power.Target) ? isMultiTarget(Power.Target) : (Power.Targets) ? isMultiTarget(Power.Targets) : (Power[" Target"]) ? isMultiTarget(Power[" Target"]) : (Power[" Targets"]) ? isMultiTarget(Power[" Targets"]) : "";            
            var MultiAttack = (Power.Attack) ? isMultiAttack(Power.Attack, MultiTarget) : (Power[" Attack"]) ? isMultiAttack(Power[" Attack"], MultiTarget) : "";
            var prefix = "power-" + idx;
            var MultiDamage = (Power["Attack Type"] && (/Melee/.test(Power["Attack Type"]) || /Ranged/.test(Power["Attack Type"]))) ? MultiAttack : "";

            PowerString += (Power.Display) ? " --title|" + Power.Display : "";
            PowerString += (Power["Power Usage"]) ? " --usage|" + Power["Power Usage"] : "";
            PowerString += (Power["Action Type"]) ? " --action|" + Power["Action Type"] : "";
            PowerString += (Power.Flavor) ? " --emote|" + Power.Flavor : "";

            var indent;
            for (var tag in Power) {
                var content = Power[tag];
                if (tag.match(/^\s+/)) { 
                    indent = "^" + tag.match(/^\s+/).length; 
                } else { 
                    indent = "";            
                };
                tag = tag.trim();
                switch (tag) {
                    case "Name":
                    case "Display":
                    case "Power Usage":
                    case "Action Type":
                    case "Flavor":
                    case "Level":
                    case "Power Type":
                    case "AttackBonus":
                    case "Level 21":
                    case "vs":
                    case "Damage":
                    case "Ability":
                        break;
                    case "HitComponents":
                    case "DamageComponents":
//                        log(content.split(". "));
                        break;
                    case "Attack":
                        if (Power.AttackBonus && Power.vs) {
                            content = content.substring(content.indexOf("vs")).replace(/vs. \w+/, "");
                            PowerString += " --attack" + MultiAttack + "|[[1d20 + " + Power.AttackBonus + "]]";
                            PowerString += " --defense|" + Power.vs + content;
                            break;
                        }
                    default:
                        content = content.replace(/([\d]?d?[\d]+\s*\+\s*)?your (\w+) modifier/gi, "[[$1@{$2-mod}]]");
                        if (/Attack Type/.test(tag)) {
                            tag = tag.replace(/Attack Type/, "Range")
                        } else if (/Attack/.test(tag) && /vs/.test(content)) {
                            if (Power.AttackBonus) {
                                content = "[[1d20 + " + Power.AttackBonus + "]] vs " + content.split("vs.")[1];
                            } else {
                                content = "[[1d20 + 0]] vs " + content.split("vs.")[1];
                            }
                        } else if (/Hit/.test(tag)) {
                            if (!indent) {
                                tag = "damage" + MultiDamage;
                            } 
                            if (!isNaN(content.charAt(0))) {
                                if (Power.Damage) {
                                    content = "[[" + Power.Damage + "]] " + content.substring(content.indexOf("damage"));                        
                                } else {
                                    content = "[[" + content.substring(0, content.indexOf(" ")) + "]] " + content.substring(content.indexOf("damage"));
                                }
                            }
                            content = content.replace(/Increase damage to .+ at 21st level\./, "");
                            content = content.replace(/Level 21: .+ damage\./, "");
                        } else if (/Critical/.test(tag)) {
                            if (!Power.Damage) break;
                            content = Power.Damage.replace(/([\d])+d([\d]+)/, "($1*$2)") + content;
                            content = '[[' + content.substring(0,content.indexOf("damage")-1) + ']] ' + content.substring(content.indexOf("damage"));
                        } else {
                            content = content.replace(/([^\[])([\d]?d[\d]+)([^\]])/g, "$1[[$2]]$3");
                        }
                        
                        content = content.replace(/Level (\d+): [^\.]+\./gi, function (match, level) {
                            return (parseInt(level) <= charLevel) ? match : "";
                        });
                        
                        if (content !== "") {
                            PowerString += " --" + indent + tag.trim() + "|" + content;
                        }
                        break;
                }
            }

            var Mark = "", Usage = "";
            if (!isNaN(MultiTarget) && MultiTarget !== "") {
                Mark = '!mark';
                for (var i = 1; i <= MultiTarget; i++) {
                    Mark += " @{target|Target " + i + "|token_id}";            
                }
                Mark += "\n"
            } else if (MultiTarget !== "") {
                Mark = "!mark @{target|Target 1|token_id} @{target|Target 2|token_id} @{target|Target 3|token_id}";
                Mark += " @{target|Target 4|token_id} @{target|Target 5|token_id} @{target|Target 6|token_id}\n";
            }
            
            var ability = AddPCPower(Power.Name, "%{" + Name + "|-" + prefix + "}", true);
            
            var augment = Power.Name.match(/Augment (\d+)/);
            if (augment && parseInt(augment[1])) {
                Usage = "!use-ammo " + Character.id + " power-points " + parseInt(augment[1]) + "\n"
            } else if (/Daily/.test(Power["Power Usage"]) || /Consumable/.test(Power["Power Usage"])) {
                Usage = "!use-power daily " + ability.id + "\n";
            } else if (/Encounter \(Special\)/.test(Power["Power Usage"])) {
                Usage = "!use-ammo " + Character.id + " placeholder 1\n"
            } else if (/Encounter/.test(Power["Power Usage"])) {
                Usage = "!use-power encounter " + ability.id + "\n";
            }
            
            ability.set("action", Usage + "%{" + Name + "|-" + prefix + "}");
            
            // FILL IN power_idx_ ATTRIBUTES
            AddPCAttribute(prefix + "-name", Power.Name);
            AddPCAttribute(prefix + "-action", (Power["Action Type"]) ? Power["Action Type"] : "");
            AddPCAttribute(prefix + "-range", (Power["Attack Type"]) ? Power["Attack Type"] : "");
            AddPCAttribute(prefix + "-level", (Power.Level) ? Power.Level : "");
            AddPCAttribute(prefix + "-useage", (Power["Power Usage"]) ? Power["Power Usage"] : "");
            AddPCAttribute(prefix + "-macro", Mark + PowerString);
            AddPCAttribute(prefix + "-toggle", "on");

        }

        function StatTotal(stat) {
            if (stat === undefined) {
                return 0;
            } else if (typeof (stat) === "object") {
                return stat.Total;
            } else {
                return stat;
            }
        }

        function AddPCSpeed(speed) {
            if (typeof (speed) === 'object') {
                var base = 0,
                    armor = 0,
                    item = 0,
                    misc = 0;
                for (var bonus in speed) {
                    switch (bonus) {
                        case "Total":
                            base += speed[bonus];
                            break;
                        case "Armor":
                            armor = speed[bonus];
                            base -= speed[bonus];
                            break;
                        case "item":
                            item = speed[bonus];
                            base -= speed[bonus];
                            break;
                        default:
                            base -= speed[bonus];
                            misc += speed[bonus];
                    }
                    AddPCAttribute("speed-base", base);
                    AddPCAttribute("speed-armor", armor);
                    AddPCAttribute("speed-item", item);
                    AddPCAttribute("speed-misc", misc);
                }
            } else {
                AddPCAttribute("speed-base", speed);
            }
        }

        function AddPCAttributeBreakdown(name, attr) {
            if (typeof (attr) === 'object') {
                var armor = 0,
                    clas = 0,
                    feat = 0,
                    enh = 0,
                    item = 0,
                    misc = 0;
                for (bonus in attr) {
                   if (bonus === undefined) continue;
                   switch (bonus) {
                        case "Total":
                            break;
                        case "Armor":
                            armor = attr[bonus];
                            break;
                        case "Class":
                            clas = attr[bonus];
                            break;
                        case "Feat":
                            feat = attr[bonus];
                            break;
                        case "Enhancement":
                            enh = attr[bonus];
                            break;
                        case "item":
                            item = attr[bonus];
                            break;
                        default:
                            misc += attr[bonus];
                    }
                    AddPCAttribute(name + "-armor", armor);
                    AddPCAttribute(name + "-class", clas);
                    AddPCAttribute(name + "-feat", feat);
                    AddPCAttribute(name + "-enh", enh);
                    AddPCAttribute(name + "-item", item);
                    AddPCAttribute(name + "-misc", misc);
                }
            }
        }

        // ADD ATTRIBUTES TO SHEET (character sheet version)
        charLevel = parseInt(stats.Level);
        AddPCAttribute("level", stats.Level);
        var HP = AddPCAttributeMax("hp", StatTotal(stats["Hit Points"]));
        var Surges = AddPCAttributeMax("surges", StatTotal(stats["Healing Surges"]));
        AddPCAttribute("surge-value-bonus", StatTotal(stats["Healing Surge Value"]));
        
        var str = StatTotal(stats.Strength);
        var con = StatTotal(stats.Constitution);
        var dex = StatTotal(stats.Dexterity);
        var int = StatTotal(stats.Intelligence);
        var wis = StatTotal(stats.Wisdom);
        var cha = StatTotal(stats.Charisma);
        AddPCAttribute("strength", str);
        AddPCAttribute("constitution", con);
        AddPCAttribute("dexterity", dex);
        AddPCAttribute("intelligence", int);
        AddPCAttribute("wisdom", wis);
        AddPCAttribute("charisma", cha);
        AddPCAttribute("saving-throw-mods", StatTotal(stats["Saving Throws"]));

        AddPCAttributeBreakdown("ac", stats.AC);
        if (dex > int) {
            AddPCAttribute("ac-highest", "@{dexterity-mod}");
        } else {
            AddPCAttribute("ac-highest", "@{intelligence-mod}");
        }
        AddPCAttributeBreakdown("fort", stats["Fortitude Defense"]);
        if (str > con) {
            AddPCAttribute("fort-highest", "@{strength-mod}");
        } else {
            AddPCAttribute("fort-highest", "@{constitution-mod}");
        }
        AddPCAttributeBreakdown("ref", stats["Reflex Defense"]);
        if (dex > int) {
            AddPCAttribute("ref-highest", "@{dexterity-mod}");
        } else {
            AddPCAttribute("ref-highest", "@{intelligence-mod}");
        }
        AddPCAttributeBreakdown("will", stats["Will Defense"]);
        if (wis > cha) {
            AddPCAttribute("fort-highest", "@{wisdom-mod}");
        } else {
            AddPCAttribute("fort-highest", "@{charisma-mod}");
        }
        AddPCAttributeBreakdown("init", stats["Initiative Misc"]);

        AddPCSpeed(stats.Speed);

        AddPCAttribute("xp", stats.Vitals.Experience);
        AddPCAttribute("age", stats.Vitals.Age);
        AddPCAttribute("height", stats.Vitals.Height);
        AddPCAttribute("weight", stats.Vitals.Weight);
        AddPCAttribute("gender", stats.Vitals.Gender);
        AddPCAttribute("alignment", stats.Vitals.Alignment);

        log("basics succeded");

        var NamedElements = {
            "Class": "class",
                "Paragon Path": "paragon",
                "Epic Destiny": "epic",
                "Race": "race",
                "Deity": "deity",
                "Size": "size",
                "Vision": "init-special-senses"
        };
        var RepeatElements = {
            "Feat": {
                "repeat": "repeating_feats_",
                    "name": "_feat",
                    "count": 0
            },
                "Class Feature": {
                "repeat": "repeating_class-feats_",
                    "name": "_class-feat",
                    "count": 0
            },
                "Racial Trait": {
                "repeat": "repeating_race-feats_",
                    "name": "_race-feat",
                    "count": 0
            }
        };
        var languages = [];
        _.each(stats.RulesElements, function(elem) {
            var repeat;
            if (NamedElements[elem.type] !== undefined) {
                AddPCAttribute(NamedElements[elem.type], elem.name);
            } else if (RepeatElements[elem.type] !== undefined) {
                repeat = RepeatElements[elem.type].repeat + RepeatElements[elem.type].count++ + RepeatElements[elem.type].name;
                AddPCAttribute(repeat, elem.name + " " + elem.shortdescription);
            } else if (elem.type == "Language") {
                languages.push(elem.name);
            }
        });
        AddPCAttribute("lang", languages.join(", "));

        log("elements succeded");

        // ADD SKILLS
        var SkillList = ["Acrobatics", "Arcana", "Athletics", "Bluff", "Diplomacy", "Dungeoneering", "Endurance", "Heal", "History", "Insight", "Intimidate", "Nature", "Perception", "Religion", "Stealth", "Streetwise", "Thievery"];
        var ArmourPenSkills = ["Acrobatics", "Athletics", "Endurance", "Stealth", "Thievery"];
        var MiscMod = 0;
        var Trained = 0;
        var ShowTrained = "";
        _.each(SkillList, function(skill) {
            Trained = stats[skill + " Trained"] / 5;
            MiscMod = StatTotal(stats[skill + " Misc"]);
            AddPCAttribute(skill.toLowerCase() + "-trained", Trained);
            AddPCAttribute(skill.toLowerCase() + "-misc", MiscMod);
        });
        _.each(ArmourPenSkills, function(skill) {
            AddPCAttribute(skill.toLowerCase() + "-pen", StatTotal(stats["Armor Penalty"]));
        });

        log("skills succeded");

        // ADD POWERS
        var power_count = 0;
        _.each(stats.Powers, function(power) {
            MakePower(power, ++power_count, CharacterName);
        });
        _.each(stats["Item Powers"], function(power) {
            var Powers = power.Text.split("Power");
            Powers.shift();
            _.each(Powers, function(text, index) {
                var ItemPower = {Name: (Powers.length > 1) ? power.Name + " " + ++index : power.Name}
                var UseKeys = text.match(/\(([^\)]+)\)/);
                UseKeys = (UseKeys) ? UseKeys[1].split(/[\*\u2022]/) : [];
                if (UseKeys.length > 0) {
                    ItemPower["Power Usage"] = "Item (" + UseKeys[0].trim() + ")";
                } else {
                    ItemPower["Power Usage"] = "Item";
                }
                if (UseKeys.length > 1) {
                    ItemPower.Keywords = UseKeys[1].trim();
                }
                ItemPower["Action Type"] = text.substring(text.indexOf(':') + 2, text.indexOf('.'));
                text = text.substring(text.indexOf('.') + 1);
                if (!/:/.test(text)) {
                    ItemPower.Text = text;
                } else {
                    text = text.replace(/((?:Augment \d+)|(?:\w+)):([^\.]+\.)/gi, function(match, key, value) {
                        ItemPower[key] = value.trim();
                    });
                }
                MakePower(ItemPower, ++power_count, CharacterName);
            });
        });
        
        log("powers succeded");

        // ADD LOOT
        var loot_count = 0;
        _.each(stats.Loot, function(item) {
            var name, value, weight, quantity, disc;
            name = item.name;
            quantity = (item.count) ? item.count : 0;
            if (item.elements === undefined) {
                value = (item.Gold) ? item.Gold : 0;
                weight = (item.Weight) ? item.Weight : 0;
                disc = (item["Full Text"]) ? item["Full Text"] : "";
            } else {
                value = (item.elements["2"].Gold) ? item.elements["2"].Gold : 0;
                weight = (item.elements["1"].Weight) ? item.elements["1"].Weight : 0;
                disc = (item.elements["1"]["Full Text"]) ? item.elements["1"]["Full Text"] : ""
                disc += "\n" + (item.elements["2"].Property) ? item.elements["2"].Property : ""
                disc += (item.elements["2"].Special) ? item.elements["2"].Special : "";
            }
            
            if (quantity > 0) {
                AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-name", name);
                AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-value", value);
                AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-weight", weight);
                AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-quantity", quantity);
                AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-disc", disc);
                loot_count++;
            }
        });

        log("loot succeded");
        // SET TOKEN SETTINGS
        Token.set("represents", Character.id);
        Token.set("name", CharacterName);
        Token.set("showname", true);
        Token.set("showplayers_name", true);
        Token.set("bar1_link", HP.id);
        Token.set("showplayers_bar1", true);
        Token.set("bar2_link", Surges.id);
        Token.set("showplayers_bar2", true);
        Token.set("light_hassight", true);
    }
});