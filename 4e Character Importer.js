var CharacterImport = CharacterImport || {};

on("chat:message", function (msg) {
    // Exit if not an api command
    if (msg.type != "api") return;
    
    // Get the API Chat Command
    var content = msg.content.replace("(GM) ", ""),
        command = content.split(" ", 1),
        args = content.split(" "),
        selected = _.pluck(msg.selected, '_id');

    if (command == "!build-character") {
        args.shift();

        _.each(_.union(args, selected), function (id) {
            CharacterImport.Process(getObj("graphic", id));
        });
    }
});

CharacterImport.Process = function (Token) {
    if (Token === undefined || Token.get("subtype") != "token") return;
    // USER CONFIGURATION
    var USE_POWER_CARDS = true;
    var gmnotes = unescape(Token.get("gmnotes")).split("<br>").join("\n");
    var parsed = JSON.parse(gmnotes);
    var stats = parsed.StatBlock;
    log("parsed successfully");

    // GET NAME OF CHARACTER
    var CharacterName = parsed.Vitals.name;

    // CHECK FOR DUPLICATE CHARACTERS
    var CheckSheet = findObjs({
        _type: "character",
        name: CharacterName
    });

    var Character, charLevel;
<<<<<<< HEAD
    
    if (CheckSheet.length > 0) {
        sendChat("CharacterImport", "/w GM Updating " + CharacterName)
=======

    if (CheckSheet.length > 0) {
        log("Updating " + CharacterName)

>>>>>>> origin/master
        // DO NOT CREATE IF SHEET EXISTS
        Character = CheckSheet[0];
    } else {
        sendChat("CharacterImport", "/w GM Creating " + CharacterName)

        // CREATE CHARACTER SHEET & LINK TOKEN TO SHEET
        Character = createObj("character", {
            avatar: Token.get("imgsrc"),
            name: CharacterName,
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
            currentAttribute[0].set({ current: value, max: value });
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
            currentAttribute[0].set({ current: value });
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
<<<<<<< HEAD
        _.map(findObjs({ 
          type: "ability",
          characterid: Character.id,
          name: powername
        }), function(obj){obj.remove()});

        return createObj("ability", {
            name: powername,
            description: "",
            action: powerstring,
            istokenaction: tokenaction,
            characterid: Character.id
        });
=======
        var currentAbility = findObjs({
            _type: "ability",
            _characterid: Character.id,
            name: powername
        });
        if (currentAbility[0]) {
            currentAbility[0].set({ description: "", action: powerstring, istokenaction: tokenaction });
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
>>>>>>> origin/master
    }

    function UsageFormat(Usage) {
        switch (Usage) {
            case "At-Will":
            case "Encounter":
            case "Daily":
                return Usage.toLowerCase()
            default:
                return "item"
        }
    }

    function PowerWeapons(PowerString, Weapons, prefix, Attack, MultiTarget, PowerName) {
        if (!Weapons) { return PowerString; }
        var keys = _.keys(Weapons),
            values = _.values(Weapons),
            index = 1,
            res;

        function AddWeaponPower(Weapon, Name) {
            var res2 = PowerString;
<<<<<<< HEAD
            res2 = res2.replace(/\$Attack/gi, "[[ 1d20 [$Atk] + " + Weapon.AttackBonus + "]]")
                       .replace(/\$Damage/gi, "[[" + Weapon.Damage + "]]");
            res2 += AddTags(Weapon, {Enhancement: Weapon.Enhancement, Damage: Weapon.Damage});
=======
            res2 = res2.replace(/\$Attack/gi, "[[1d20 + " + Weapon.AttackBonus + "]]");
            res2 = res2.replace(/\$Damage/gi, "[[" + Weapon.Damage + "]]")
            res2 += AddTags(Weapon, { Enhancement: Weapon.Enhancement });
>>>>>>> origin/master
            var attrName = prefix + "weapon-" + index++,
                attr = AddPCAttribute(attrName, res2);
            return " --" + Name + "|" + attrName;
        }

        if (/main weapon and off-hand weapon/.test(Attack)) {
            var Main = keys.shift(),
                Off = keys.shift(),
                obj;
<<<<<<< HEAD
            mAttack = " --Main Attack|[[ 1d20 [$AtkMain] + " + Weapons[Main].AttackBonus + "]] vs. AC";
            mDamage = " --?? $AtkMain.base > 1 AND $AtkMain.base < 20 ?? Main Hit|[[" + Weapons[Main].Damage + "]]";
            oAttack = " --Off Attack|[[ 1d20 [$AtkOff] + " + Weapons[Off].AttackBonus + "]] vs. AC";
            oDamage = " --?? $AtkOff.base > 1 AND $AtkOff.base < 20 ?? Off Hit|[[" + Weapons[Off].Damage + "]]";
                condition = "";
            Main = mAttack + mDamage + AddTags(Weapons[Main], _.extend({}, Weapons[Main], {Mod: "Main"}));
            Off = oAttack + oDamage + AddTags(Weapons[Off], _.extend({}, Weapons[Off], {Mod: "Off"}));
=======
            mAttack = " --Main Attack|[[1d20 + " + Weapons[Main].AttackBonus + "]] vs. AC";
            mDamage = " --Main Hit|[[" + Weapons[Main].Damage + "]]";
            oAttack = " --Off Attack|[[1d20 + " + Weapons[Off].AttackBonus + "]] vs. AC";
            oDamage = " --Off Hit|[[" + Weapons[Off].Damage + "]]";
            Main = mAttack + mDamage + AddTags(Weapons[Main], { Mod: "Main", Enhancement: Weapons[Main].Enhancement });
            Off = oAttack + oDamage + AddTags(Weapons[Off], { Mod: "Off", Enhancement: Weapons[Off].Enhancement });
>>>>>>> origin/master
            res = PowerString.replace(/ \-\-Attack(.(?!\-\-(?!Hit)))+/, Main + Off)
            var attrName = prefix + "weapon-" + index++,
                attr = AddPCAttribute(attrName, res);
            res = "!buttons " + Character.id + " " + MultiTarget + " " + PowerName + " --" + "Melee|" + attrName;
            res += _.chain(Weapons)
                    .pick(keys)
                    .map(AddWeaponPower)
                    .reduce(function (cmd, next) { return cmd += next }, "")
                    .value()
        } else {
            res = "!buttons " + Character.id + " " + MultiTarget + " " + PowerName;
            res += _.chain(Weapons)
                    .pick(keys)
                    .map(AddWeaponPower)
                    .reduce(function (cmd, next) { return cmd += next }, "")
                    .value()
        }
        return res;
    }

    function MakeTitleTip(Power) {
        var res = " --title|";
        res += (Power.Display) ? Power.Display : "";
        res += (Power.Keywords) ? "<br/>Keywords: " + Power.Keywords : "";
        res += (Power["Attack Type"]) ? "<br/>Attack Type: " + Power["Attack Type"] : "";
        res += (Power.Requirement) ? "<br/>Requirement: " + Power.Requirement : "";
        return (res !== " --title|") ? res : "";
    }

    function MakeTag(content, tag) {
<<<<<<< HEAD
        var indent, condition;
        if (typeof content === Object) {return "";}
        if (tag.match(/^\s+/)) { 
            indent = "^" + tag.match(/^\s+/).length; 
        } else { 
            indent = "";            
=======
        var indent;
        if (typeof content === Object) { return ""; }
        if (tag.match(/^\s+/)) {
            indent = "^" + tag.match(/^\s+/).length;
        } else {
            indent = "";
>>>>>>> origin/master
        };
        tag = tag.trim();
        switch (tag) {
            case "Name":
            case "Display":
            case "Power Usage":
            case "Action Type":
            case "Keywords":
            case "Attack Type":
            case "Requirement":
            case "Level":
            case "Power Type":
            case "AttackBonus":
            case "Level 21":
            case "vs":
            case "Damage":
            case "Ability":
            case "Weapons":
            case "Class":
            case "AttackStat":
            case "Defense":
            case "HitComponents":
            case "DamageComponents":
            case "Enhancement":
            case "Special":
                return "";
            case "Flavor":
                return " --emote|" + content;
            case "Conditions":
                if (content.match("Quarry")) {condition = "?? %%cond.Quarry%% > 0 ??"}
                break;
            case "Attack":
                tag = "Attack" + ((this && this.MultiAttack) ? "#" + this.MultiAttack.toString() : "");
                content = content.replace(/\w+( \+\d)? vs./gi, "$Attack vs.");
                content = (/ or /.test(content)) ? content.replace(/\$Attack (.+) or /, "") : content;
                content += ' of %%token_name%%'
                break;
            case "Hit":
                condition = "?? $Atk" + ((this.Mod) ? this.Mod : "") + ".base > 1 ?? ";
                condition += "?? $Atk" + ((this.Mod) ? this.Mod : "") + ".base < 20 ?? ";
                tag = "Hit" + ((this && this.MultiDamage) ? "#" + this.MultiDamage.toString() : "");
                content = content.replace(/\d\[W\]( \+ [\w]+ modifier)?/gi, "$Damage")
                                 .replace(/\dd\d+( \+ [\w]+ modifier)?/gi, "$Damage");
                break;
            case "Critical":
<<<<<<< HEAD
                condition = "?? $Atk" + ((this.Mod) ? this.Mod : "") + ".base == 20 ?? ";
                if (this.Damage) {content = String(this.Damage).replace("d", "*") + content}
                if (this.Enhancement) {content = content.replace(/1(d\d damage) per plus/, this.Enhancement.toString() + "$1")}
=======
                if (this.Enhancement) { content = content.replace(/1(d\d damage) per plus/, this.Enhancement.toString() + "$1") }
>>>>>>> origin/master
                break;
        }
        content = content.replace(/\<table\>.*?\<\/table\>/gi, "")
                         .replace(/<table>.*?<\/table>/gi, "")    
                         .replace(/ Level \d+:.*?\./g, '')
                         .replace(/Increase .*? at \d+(th|st|nd|rd) level\./g, '')
                         .replace(/ At \d+(th|st|nd|rd) level.*?\./g, '')
                         .replace(/((\dd)?\d+)((\dd)?\d+|[ \+\-\*\d])+/gi, function(match) {return "[[ " + match.trim() + " ]] "});
        if (this.Mod) tag = this.Mod + " " + tag
        if (condition) tag = condition + tag
        if (content !== "") return " --" + indent + tag + "|" + content;
    }

    function AddTags(Source, context) {
        return _.chain(Source)
        .map(MakeTag, context)
        .reduce(function (ps, tag) { return ps += tag }, "")
        .value();
    }

    function MakePower(Power, idx, Name) {
        // BUILD POWERSTRING
        var PowerString = "!power --format|" + UsageFormat(Power["Power Usage"]) + " --name|" + Power.Name + " --charid|" + Character.id,
            // CHECK FOR MULTIPLE ATTACK POWERS
            prefix = "repeating_powers_" + idx + "_",
            Target = (Power.Target) ? Power.Target : (Power.Targets) ? Power.Targets : (Power[" Target"]) ? Power[" Target"] : (Power[" Targets"]) ? Power[" Targets"] : undefined,
            Attack = (Power.Attack) ? Power.Attack : (Power[" Attack"]) ? Power[" Attack"] : undefined,
            MultiTarget = (Target) ? isMultiTarget(Target) : "",
            MultiAttack = (Attack) ? isMultiAttack(Attack, MultiTarget) : "",
            MultiDamage = (Power["Attack Type"] && (/Melee/.test(Power["Attack Type"]) || /Ranged/.test(Power["Attack Type"]))) ? MultiAttack : "";

        // TITLE & SUBTITLES
        PowerString += MakeTitleTip(Power);
        PowerString += (Power["Power Usage"]) ? " --leftsub|" + Power["Power Usage"] : "";
        PowerString += (Power["Action Type"]) ? " --rightsub|" + Power["Action Type"] : "";
        PowerString += (Power.Flavor) ? " --emote|" + Power.Flavor : "";

        PowerString += AddTags(Power, { MultiAttack: MultiAttack, MultiDamage: MultiDamage });
        PowerString = PowerWeapons(PowerString, Power.Weapons, prefix, Attack, String(MultiTarget), Power.Name);

<<<<<<< HEAD
        var Usage = "", 
            ability = AddPCPower(Power.Name, "@{" + Name + "|" + prefix + "macro}", true), 
=======
        var Usage = "",
            ability = AddPCPower(Power.Name, "%{" + Name + "|-" + prefix + "}", true),
>>>>>>> origin/master
            augment = Power.Name.match(/Augment (\d+)/);

        if (augment && parseInt(augment[1])) {
            Usage = "!use-ammo " + Character.id + " power-points " + parseInt(augment[1]) + "\n"
        } else if (/Daily/.test(Power["Power Usage"]) || /Consumable/.test(Power["Power Usage"])) {
            Usage = "!use-power daily " + ability.id + "\n";
        } else if (/Encounter \(Special\)/.test(Power["Power Usage"])) {
            Usage = "!use-ammo " + Character.id + " placeholder 1\n"
        } else if (/Encounter/.test(Power["Power Usage"])) {
            Usage = "!use-power encounter " + ability.id + "\n";
        }

        // FILL IN power_idx_ ATTRIBUTES
        AddPCAttribute(prefix + "name", Power.Name);
        AddPCAttribute(prefix + "action", (Power["Action Type"]) ? Power["Action Type"] : "");
        AddPCAttribute(prefix + "range", (Power["Attack Type"]) ? Power["Attack Type"] : "");
        AddPCAttribute(prefix + "level", (Power.Level) ? Power.Level : "");
        AddPCAttribute(prefix + "useage", (Power["Power Usage"]) ? Power["Power Usage"] : "");
        var macro = AddPCAttribute(prefix + "macro", PowerString);
        AddPCAttribute(prefix + "toggle", "on");
<<<<<<< HEAD
=======

        if (Power.Weapons && _.keys(Power.Weapons).length > 1) {
            ability.set("action", Usage + "!buttons " + macro.id);
        } else {
            ability.set("action", Usage + "%{" + Name + "|-" + prefix + "}");
        }
>>>>>>> origin/master
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
    AddPCAttribute("init-highest", "@{dexterity-mod}")
    AddPCAttributeBreakdown("init", stats["Initiative Misc"]);

    AddPCSpeed(stats.Speed);

    AddPCAttribute("xp", parsed.Vitals.Experience);
    AddPCAttribute("age", parsed.Vitals.Age);
    AddPCAttribute("height", parsed.Vitals.Height);
    AddPCAttribute("weight", parsed.Vitals.Weight);
    AddPCAttribute("gender", parsed.Vitals.Gender);
    AddPCAttribute("alignment", parsed.Vitals.Alignment);

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
<<<<<<< HEAD
    _.each(parsed.RulesElements, function(elem) {
=======
    _.each(parsed.RulesElements, function (elem) {
        var repeat;
>>>>>>> origin/master
        if (NamedElements[elem.type] !== undefined) {
            AddPCAttribute(NamedElements[elem.type], elem.name);
        } else if (RepeatElements[elem.type] !== undefined) {
            var repeat = RepeatElements[elem.type].repeat + RepeatElements[elem.type].count++ + RepeatElements[elem.type].name,
                text = elem.name + ((elem["Short Description"]) ? ":\n" + elem["Short Description"] : "");
            AddPCAttribute(repeat, text);
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
    _.each(SkillList, function (skill) {
        Trained = stats[skill + " Trained"] / 5;
        MiscMod = StatTotal(stats[skill + " Misc"]);
        AddPCAttribute(skill.toLowerCase() + "-trained", Trained);
        AddPCAttribute(skill.toLowerCase() + "-misc", MiscMod);
    });
    _.each(ArmourPenSkills, function (skill) {
        AddPCAttribute(skill.toLowerCase() + "-pen", StatTotal(stats["Armor Penalty"]));
    });

    log("skills succeded");

    // ADD POWERS
    var power_count = 0;
    _.each(parsed.Powers, function (power, name) {
        power.Name = name;
        MakePower(power, power_count++, CharacterName);
    });
    _.each(parsed["Item Powers"], function (value, name) {
        var Powers = value.split("Power");
        Powers.shift();
        _.each(Powers, function (text, index) {
            var ItemPower = { Name: (Powers.length > 1) ? name + " " + ++index : name }
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
                text = text.replace(/((?:Augment \d+)|(?:\w+)):([^\.]+\.)/gi, function (match, key, value) {
                    ItemPower[key] = value.trim();
                });
            }
            MakePower(ItemPower, power_count++, CharacterName);
        });
    });

    log("powers succeded");

    var Slots = {
        "Head": "Head",
        "Neck": "Neck",
        "Arms": "Arms",
        "Hands": "Hands",
        "Ring 1": "Ring 1",
        "Ring 2": "Ring 2",
        "One-hand": "Weapon",
        "Two-hand": "Weapon",
        "Off-hand": "Off Hand",
        "Waist": "Waist",
        "Body": "Armor",
        "Feet": "Feet",
        "Tattoo": "Tattoo",
        "Holy Symbol": "Holy Symbol",
        "Ki Focus": "Ki Focus"
    };

    // ADD LOOT
    var loot_count = 0;
<<<<<<< HEAD
    _.each(parsed.Loot, function(item, name) {
        var value, weight, quantity, disc, slot;
        if (_.has(item,"type")) {
=======
    _.each(stats.Loot, function (item) {
        var name, value, weight, quantity, disc;
        name = item.name;
        quantity = (item.count) ? item.count : 0;
        if (item.elements === undefined) {
>>>>>>> origin/master
            value = (item.Gold) ? item.Gold : 0;
            weight = (item.Weight) ? item.Weight : 0;
            quantity = (item.count) ? item.count : 1;
            disc = (item["Full Text"]) ? item["Full Text"] + "\n" : "";
            disc += (item.Power) ? item.Power + "\n" : "";
            slot = (item["Item Slot"] && item.equip) ? Slots[item["Item Slot"]] : "None"
        } else {
            var Base = _.find(_.values(item), function (e){ return e.type !== "Magic Item" }),
                Magic = _.find(_.values(item), function (e){ return e.type === "Magic Item" });
            value = (Magic.Gold) ? Magic.Gold : 0;
            weight = (Base.Weight) ? Base.Weight : 0;
            quantity = (Base.count) ? Base.count : 1;
            disc = (Base["Full Text"]) ? Base["Full Text"] + "\n" : ""
            disc += (Magic.Property) ? Magic.Property + "\n" : ""
            disc += (Magic.Special) ? Magic.Special + "\n" : "";
            disc += (Magic.Power) ? Magic.Power + "\n" : "";
            slot = (Base["Item Slot"] && Base.equip) ? Slots[Base["Item Slot"]] : "None"
        }
<<<<<<< HEAD
        
        AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-name", name);
        AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-value", value);
        AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-weight", weight);
        AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-quantity", quantity);
        AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-disc", disc);
        AddPCAttribute("repeating_inventory_" + loot_count + "_mba-mod", slot);
        loot_count++;
=======

        if (quantity > 0) {
            AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-name", name);
            AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-value", value);
            AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-weight", weight);
            AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-quantity", quantity);
            AddPCAttribute("repeating_inventory_" + loot_count + "_inventory-disc", disc);
            loot_count++;
        }
>>>>>>> origin/master
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

function isMultiTarget(Target) {
    switch (Target.trim()) {
        case undefined:
        case "Personal":
        case "You":
            return "";
        case "That ally":
        case "That target of the at-will attack":
        case "The ally hit by the triggering enemy's attack":
        case "The ally in burst damaged by a critical hit":
        case "The ally making the opportunity attack":
        case "The ally targeted by the triggering power":
        case "The ally that was hit by the triggering attack":
        case "The ally who was hit":
        case "The attacked ally in burst":
        case "The attacking creature":
        case "The attacking creature.":
        case "The attacking enemy":
        case "The character affected by the forced movement":
        case "The character hit or missed by the triggering attack":
        case "The character in the burst who takes the damage":
        case "The character who takes the damage.":
        case "The character who was hit":
        case "The creature hit by the triggering attack":
        case "The creature subjected to forced movement":
        case "The creature that hit you":
        case "The creature that made the triggering attack":
        case "The creature that took damage":
        case "The creature whose space was entered":
        case "The creature with your psychic spark":
        case "The creature you hit":
        case "The creature you hit or missed":
        case "The creature you intimidated or hit":
        case "The creature your ally damaged":
        case "The creature's corpse":
        case "The damaged ally in the burst":
        case "The enemy":
        case "The enemy in the burst":
        case "The enemy nearest to you in burst":
        case "The enemy that hit you":
        case "The enemy that subjected you to the effect":
        case "The enemy you hit":
        case "The enemy you missed":
        case "The enemy you released":
        case "The nearest enemy to you that you can see":
        case "The same creature you hit with a critical hit":
        case "The secondary target takes ongoing 10 radiant damage and cannot benefit from concealment or total concealment (save ends both).":
        case "The square you just teleported out of in the burst":
        case "The target of the triggering ally's attack":
        case "The target of your triggering attack":
        case "The triggering ally":
        case "The triggering ally and one enemy in burst":
        case "The triggering ally in burst":
        case "The triggering ally in the burst":
        case "The triggering ally in the burst":
        case "The triggering ally's implement or weapon":
        case "The triggering attacker":
        case "The triggering attacker and each enemy adjacent to it":
        case "The triggering character":
        case "The triggering character in burst":
        case "The triggering character in the burst":
        case "The triggering creature":
        case "The triggering creature in burst":
        case "The triggering enemy":
        case "The triggering enemy":
        case "The triggering enemy in burst":
        case "The triggering enemy in the burst":
        case "The triggering enemy or ally in burst":
        case "The triggering enemy.":
        case "The triggering summoned creature":
        case "The triggering target creature":
        case "Triggering creature":
        case "One ally in the burst.":
        case "1 creature":
        case "An enemy marked by you or that is marking you":
        case "An enemy you missed with an attack during this turn":
        case "One aberrant creature you can see in burst":
        case "One adjacent creature granting combat advantage to you.":
        case "One adjacent enemy":
        case "One adjacent medium or larger enemy.":
        case "One ally":
        case "One ally":
        case "One ally adjacent to triggering enemy":
        case "One ally adjacent to you":
        case "One ally adjacent to you before the teleport":
        case "One ally adjacent to your familiar":
        case "One ally in burst":
        case "One ally in burst adjacent to your spirit companion or one object in burst you can lift adjacent to your spirit companion":
        case "One ally in burst other than the triggering character":
        case "One ally in burst targeted by the triggering attack":
        case "One ally in burst who can see you":
        case "One ally in burst you can see":
        case "One ally in burst, or each ally in burst if this is your first turn of the encounter":
        case "One ally in burst, or each ally in burst if you have reduced an enemy to 0 hit points during this turn":
        case "One ally in burst.":
        case "One ally in the burst":
        case "One ally in the burst":
        case "One ally in the burst who can see you":
        case "One ally in the burst who is not bloodied":
        case "One ally or one prone enemy":
        case "One ally other than the triggering ally":
        case "One ally subject to a dazing, dominating, or stunning effect that a save can end":
        case "One ally wearing a ring from this set":
        case "One ally who can see or hear you":
        case "One ally who died during this encounter as a result of failing three death saving throws.":
        case "One ally who has line of sight to you and can hear you":
        case "One ally who is the same size as you":
        case "One ally with line of sight to you":
        case "One ally you can see":
        case "One ally you can see in burst":
        case "One ally, helpless enemy, or object that weighs 400 pounds or less and isn't carried by another creature":
        case "One ally's weapon":
        case "One axe, flail, heavy blade, light blade, pick, or spear":
        case "One axe, heavy blade, light blade, pick, or spear":
        case "One axe, heavy blade, light blade, pick, or spear.":
        case "One bloodied ally":
        case "One bloodied ally in burst":
        case "One bloodied ally in the burst":
        case "One bloodied creature":
        case "One bloodied creature designated as your quarry":
        case "One bloodied enemy":
        case "One bloodied or dying ally or a dead ally who died during this encounter":
        case "One bloodied or prone creature":
        case "One bloodied or unconscious ally":
        case "One creature":
        case "One Creature":
        case "One creature adjacent to the character who spent the healing surge":
        case "One creature adjacent to the flaming sphere":
        case "One creature adjacent to the sword":
        case "One creature adjacent to the thrall":
        case "One creature adjacent to the warrior":
        case "One creature adjacent to you":
        case "One creature adjacent to your beast companion":
        case "One creature adjacent to your familiar":
        case "One creature attacked by your ally":
        case "One creature designated as your quarry":
        case "One creature flanked by you and an ally":
        case "One creature from which you are hidden":
        case "One creature grabbed by you":
        case "One creature granting combat advantage to you":
        case "One creature granting you combat advantage":
        case "One creature in blast":
        case "One creature in burst":
        case "One creature in burst that you can see and that you have cover or concealment against":
        case "One creature in burst you can see":
        case "One creature in burst.":
        case "One creature in the blast":
        case "One creature in the burst":
        case "One creature Level 11: One or two creatures Level 21: Each enemy adjacent to you":
        case "One creature Level 11: One or two creatures Level 21: One, two, or three creatures":
        case "One creature Level 21: One or two creatures":
        case "One creature marked by an ally":
        case "One creature marked by you":
        case "One creature marked by your Swordmage Aegis power":
        case "One creature not targeted by the triggering attack":
        case "One creature of size Large or smaller":
        case "One creature of size Large or smaller.":
        case "One creature of your size or larger":
        case "One creature of your size or smaller":
        case "One creature or object":
        case "One creature or two creatures adjacent to each other":
        case "One creature or unattended object":
        case "One creature other than the attacker":
        case "One creature other than the triggering enemy":
        case "One creature other than the triggering enemy or the ally who was hit":
        case "One creature taking ongoing fire damage":
        case "One creature targeted by the triggering ally's attack":
        case "One creature that can hear you":
        case "One creature that can hear you in burst":
        case "One creature that can see and hear you":
        case "One creature that can see and hear you in the burst":
        case "One creature that can see you":
        case "One creature that cannot sense your current location":
        case "One creature that died no more than 24 hours ago":
        case "One creature that has your deathmark":
        case "One creature that is marked by you":
        case "One creature that is no more than one size category larger than you":
        case "One creature that is not involved in combat and that is lower level than you":
        case "One creature that is prone, adjacent to blocking terrain, or adjacent to an ally":
        case "One creature that is surprised or unaware of your presence":
        case "One creature that is your prey":
        case "One creature that is your quarry":
        case "One creature that is your size, smaller than you, or one size category larger.":
        case "One creature that isn't deafened":
        case "One creature that shares a language with you":
        case "One creature within 10 squares of you":
        case "One creature within your melee reach":
        case "One creature within your melee reach.":
        case "One creature you are hidden from":
        case "One creature you can see":
        case "One creature you can see in blast":
        case "One creature you can see in burst":
        case "One creature you can see in the burst":
        case "One creature you can see that isn't marked by you":
        case "One creature you have combat advantage against":
        case "One creature you have marked":
        case "One creature you have not attacked during this turn":
        case "One creature you hit on your previous turn":
        case "One creature you summoned":
        case "One creature you're flanking":
        case "One creature, or two creatures that are adjacent to each other":
        case "One creature, or two or three creatures that are adjacent to at least one other target.":
        case "One creature.":
        case "One dazed or stunned ally in the burst that you can see":
        case "One dead ally":
        case "One dead creature":
        case "One dead or dying ally in burst":
        case "One door, gate, or similar object":
        case "One dying ally":
        case "One dying ally in burst":
        case "One dying ally in the burst":
        case "One dying creature":
        case "One empty cup, flask, or similar container that can hold up to 1 gallon of liquid":
        case "One enemy":
        case "One enemy":
        case "One enemy adjacent to you in the blast":
        case "One enemy adjacent to your quasit companion":
        case "One enemy closest to you":
        case "One enemy granting combat advantage to you":
        case "One enemy in blast":
        case "One enemy in burst":
        case "One enemy in burst granting combat advantage to you or an ally":
        case "One enemy in burst other than the triggering enemy":
        case "One enemy in burst you can see":
        case "One enemy in the burst":
        case "One enemy in the burst whose Will is equal to or lower than 12 + your level":
        case "One enemy in the burst; for every two shadows you spend, this power targets an additional enemy in the burst.":
        case "One enemy in the burst.":
        case "One enemy marked by you":
        case "One enemy other than the one you hit":
        case "One enemy subject to your defender aura":
        case "One enemy that can see and hear you":
        case "One enemy that has four of your shrouds on it":
        case "One enemy that has not yet been attacked by a Dancing Bolts attack and is within 2 squares of an enemy that has been hit by the Dancing Bolt power.":
        case "One enemy that has not yet been attacked by a Dancing Bolts attack and is within 2 squares of an enemy that has been hit by the Dancing Bolt secondary attack power.":
        case "One enemy that is not your oath of enmity target":
        case "One enemy you can see":
        case "One enemy you can see in burst":
        case "One enemy you can see in the burst that is affected by your dragonfear.":
        case "One enemy you just marked.":
        case "One enemy, or two enemies if you are bloodied":
        case "One flail, hammer, mace, or staff":
        case "One flail, hammer, mace, or staff.":
        case "One flammable object that isn't carried by another creature":
        case "One hammer, mace, or staff":
        case "One held weapon":
        case "One helpless intelligent enemy":
        case "One immobilized or prone creature":
        case "One Large or larger creature":
        case "One Large or smaller creature":
        case "One living creature you have grabbed":
        case "One Medium or smaller object that is not fastened in place or held by a creature":
        case "One melee weapon":
        case "One metal object":
        case "One nonflying creature":
        case "One nonhostile creature that has Intelligence 5 or higher":
        case "One nonliving object of 5 lb. or less that you are holding":
        case "One nonminion creature in burst":
        case "One nonminion creature you just damaged.":
        case "One object":
        case "One object or unoccupied square":
        case "One object or vehicle":
        case "One object that is sized for a Medium or Small creature, is not inside a container, does not contain anything, and is not held, worn, or carried by anyone other than you.":
        case "One object that weighs 20 pounds or less and isn't carried by another creature":
        case "One other enemy within range.":
        case "One randomly determined creature adjacent to you":
        case "One spider or drow":
        case "One square":
        case "One square":
        case "One square of stone, mud, or dirt":
        case "One suit of armor or one weapon.":
        case "One target":
        case "One target granting you combat advantage":
        case "One unattended medium or smaller non-magical, inanimate object in burst":
        case "One unattended object or vehicle":
        case "One undead creature":
        case "One undead creature in blast":
        case "One undead creature in burst":
        case "One weapon":
        case "One weapon or implement":
        case "One weapon or implement in burst":
        case "One weapon you are holding":
        case "One weapon you are wielding":
        case "One weapon you're holding":
        case "One weapon you're wielding":
        case "One willing ally":
        case "One willing ally in the burst":
        case "One willing creature in the burst":
        case "You and one ally":
        case "You and one ally in burst":
        case "You and one ally in the burst":
        case "You and one ally in the burst adjacent to the triggering enemy":
        case "You and one ally in the burst.":
        case "You and one enemy":
        case "You or an allied Keeper of the Everflow in the burst":
        case "You or an ally":
        case "You or an ally within 5 squares of the enemy.":
        case "You or one ally":
        case "You or one ally":
        case "You or one ally (the target must be bloodied)":
        case "You or one ally in burst":
        case "You and one Small or Medium ally in the burst":
        case "You if you're bloodied or one bloodied ally":
        case "You or one ally in burst; target must be bloodied":
        case "You or one ally in burst; the target must be adjacent to the triggering ally":
        case "You or one ally in burst; the target must be bloodied":
        case "You or one ally in range":
        case "You or one ally in the burst":
        case "You or one ally in the burst":
        case "You or one ally in the burst; the target must be bloodied":
        case "You or one ally within 20 squares":
        case "You or one ally within the burst":
        case "You or one ally you can see":
        case "You or one ally you can see in the burst":
        case "You or one ally; must be bloodied and have at least two healing surges remaining":
        case "You or one ally; the target must have a healing surge":
        case "You or one creature":
        case "You or one creature in the burst":
        case "You or one other ally in the burst":
        case "You or one willing ally":
        case "You or one willing, stunned, or helpless creature in the burst":
        case "You or the ally":
        case "You or the ally in burst":
        case "You or you and one ally":
            return "1";
        case "One of two creatures":
        case "One or two allies":
        case "One or two allies in burst":
        case "One or two allies in burst or you and one ally in burst":
        case "One or two allies in the burst":
        case "One or two allies who can hear you in the burst":
        case "One or two allies who each have two healing surges or fewer":
        case "One or two creatures":
        case "One or two creatures":
        case "One or two creatures adjacent to one of your allies in range":
        case "One or two creatures in burst":
        case "One or two creatures in the blast":
        case "One or two creatures in the burst":
        case "One or two creatures marked by you":
        case "One or two creatures.":
        case "One or two enemies":
        case "One or two enemies in blast":
        case "Two allies in burst adjacent to the enemy":
        case "Two allies in burst or you and one ally in burst":
        case "Two allies you can see or you and one ally you can see":
        case "Two creatures":
        case "Two creatures adjacent to each other":
        case "Two creatures in burst":
        case "Two creatures within 5 squares of each other":
        case "Two enemies within 3 squares of each other":
        case "Two unoccupied squares":
        case "You and one ally in burst or two allies in burst":
        case "You and one ally in burst, or two allies in burst":
        case "You and one or two allies in burst":
        case "You and one or two allies in the burst":
        case "You and two allies in burst":
            return "2";
        case "One, two or three creatures":
        case "One, two, or three allies in burst":
        case "One, two, or three creatures":
        case "One, two, or three creatures adjacent to you at any point during the shift":
        case "One, two, or three creatures and/or unoccupied squares":
        case "One, two, or three creatures in burst":
        case "One, two, or three creatures in the burst":
        case "One, two, or three creatures Level 21: Target an additional creature.":
        case "One, two, or three enemies":
        case "One, two, or three enemies adjacent to you during your movement":
        case "One, two, or three enemies in burst":
        case "One, two, or three squares in the burst":
        case "One, two, or three targets that can hear you in burst":
        case "Up to three targets of the at-will attack":
        case "You and one, two, or three allies in burst":
            return "3";
        case "One, two, three, or four creatures":
        case "One, two, three, or four creatures, each adjacent to at least one tortured elemental":
        case "Up to four creatures in burst":
            return "4";
        case "One, two, three, four, or five creatures":
            return "5";
        case "You and all allies in burst":
        case "You and any ally in burst":
        case "You and each ally":
        case "You and each ally in burst":
        case "You and each ally in burst other than the triggering ally":
        case "You and each ally in the blast":
        case "You and each ally in the burst":
        case "You and each ally in the burst":
        case "You and each ally within 5 squares of you":
        case "You and each ally you can see in burst, to a maximum of five targets":
        case "You and each bloodied ally in burst":
        case "You and each creature in the burst":
        case "You and each enemy in burst":
        case "You and each surprised ally in burst":
        case "You and each willing ally in burst":
        case "All allies within burst":
        case "All enemies in burst":
        case "All enemies within the area of the burst":
        case "Each ally in blast":
        case "Each ally in burst":
        case "Each ally in burst missed by the triggering attack":
        case "Each ally in burst that can hear you":
        case "Each ally in burst that can see you":
        case "Each ally in burst who can see you":
        case "Each ally in the burst":
        case "Each ally in the burst.":
        case "Each ally who can hear you in burst":
        case "Each ally who can hear you in the burst":
        case "Each bloodied ally in burst":
        case "Each bloodied enemy in the burst":
        case "Each bloodied, dazed, stunned, or prone ally in the burst":
        case "Each conjuration and zone in the burst":
        case "Each creature adjacent to the enemy you hit":
        case "Each creature in blast":
        case "Each creature in blast you can see":
        case "Each creature in blast. The creature that triggered this power must be in the area of the blast.":
        case "Each creature in burst":
        case "Each creature in burst (choose one defense for each target)":
        case "Each creature in burst and each enemy marked by you":
        case "Each creature in burst centered on the primary target of the Vestige of Solis attack.":
        case "Each creature in burst or blast":
        case "Each creature in burst you can see":
        case "Each creature in burst. Roll a d4, and you can exclude a number of targets equal to the result.":
        case "Each creature in square":
        case "Each creature in the blast":
        case "Each creature in the blast, which must include the triggering enemy":
        case "Each creature in the burst":
        case "Each creature in the burst and each creature adjacent to your familiar":
        case "Each creature in the burst centered on the triggering creature":
        case "Each creature in the burst you can see":
        case "Each creature in the wall":
        case "Each creature in wall":
        case "Each creature standing on the bridge (including you, if applicable)":
        case "Each creature that has the shadow origin or the undead keyword in burst":
        case "Each creature with the dragon keyword in burst":
        case "Each creature you can see in burst":
        case "Each creature you can see in the burst":
        case "Each dead ally in burst":
        case "Each devil in burst":
        case "Each elemental enemy in the burst":
        case "Each enemy adjacent to the thrall":
        case "Each enemy adjacent to you":
        case "Each enemy adjacent to your dream form":
        case "Each enemy designated as your quarry":
        case "Each enemy from which you are hidden":
        case "Each enemy in blast":
        case "Each enemy in blast and each enemy adjacent to you":
        case "Each enemy in blast you can see":
        case "Each enemy in burst":
        case "Each enemy in burst and each enemy adjacent to your spirit companion":
        case "Each enemy in burst centered on the triggering enemy":
        case "Each enemy in burst other than the primary target":
        case "Each enemy in burst that has a creature origin related to a skill you're trained in":
        case "Each enemy in burst that is adjacent to you or an ally":
        case "Each enemy in burst that is taking ongoing damage":
        case "Each enemy in burst that you can see":
        case "Each enemy in burst you can see":
        case "Each enemy in burst you can see.":
        case "Each enemy in burst.":
        case "Each enemy in range":
        case "Each enemy in the blast":
        case "Each enemy in the burst":
        case "Each enemy in the burst whose Will is equal to or less than 12 + your level":
        case "Each enemy in the burst you can see":
        case "Each enemy in the wall":
        case "Each enemy marked by you in burst":
        case "Each enemy that can hear and understand you in the burst":
        case "Each enemy that can see you in the burst":
        case "Each enemy who can hear and understand you in the burst.":
        case "Each enemy whose space your spirit companion entered as part of this movement":
        case "Each enemy within reach during the shift":
        case "Each enemy within the zone created by guarded land":
        case "Each enemy you can see":
        case "Each enemy you can see and is not adjacent to you in burst":
        case "Each enemy you can see in blast":
        case "Each enemy you can see in burst":
        case "Each enemy you can see in the blast":
        case "Each enemy you can see in the burst":
        case "Each enemy you can see when you first use the power":
        case "Each enemy you move adjacent to while shifting":
        case "Each flanking enemy in the burst":
        case "Each hidden or invisible enemy in the burst whose Will is equal to or lower than 12 + your level":
        case "Each humanoid enemy in burst that can hear you":
        case "Each nonprone creature in burst":
        case "Each of your shaman conjurations and zones in burst":
        case "Each of your zones in burst":
        case "Each undead creature in blast":
        case "Each undead creature in burst":
        case "Each unmarked enemy in burst":
        case "Each weapon you or an ally is wielding in burst":
        case "Enemies in blast":
        case "Enemies in burst":
        case "Enemies in burst that are touching the ground":
        case "Enemies in the blast":
        case "One or more allies in burst":
        case "One or more creatures in burst":
        case "You or one ally in burst or you and each ally in burst":
        case "Your oath of enmity target and each enemy in burst":
            return "?{Number of Targets|1}";
        default:
            return "";
    }
}

function isMultiAttack(Attack, MultiTarget) {
    Attack = Attack.replace(/(or )?(and )?\w+( \+\s?\d+)? vs\. \w+[,\.]? /, "");
    switch (Attack.trim()) {
        case "(if square is unoccupied), one attack per target":
        case "(main weapon and off-hand weapon), one attack per target":
        case "(melee; main weapon and off-hand weapon) (ranged), one attack per target":
        case "(melee) (ranged), one attack per target":
        case "Make a number of attack rolls equal to the number of targets, and then assign each roll to a target.":
        case "one attack per target. If you target one creature, you gain a +2 bonus to the damage roll. If you target two creatures, you take a –2 penalty to both attack rolls.":
        case "one attack per target":
            return MultiTarget;
        case "(main weapon and off-hand weapon), two attacks per target":
        case "(main) (offhand), two attacks per target":
        case "If you're wielding two melee weapons, you can attack each target with both your main weapon and your off-hand weapon.":
            return "2*(" + MultiTarget + ")";
        case "(main weapon and off-hand weapon), two attacks":
        case "(main weapon and off-hand weapon). Make two attack rolls—one with each weapon— and use the higher result.":
        case "(melee or ranged), two attacks":
        case "(melee; main weapon and off-hand weapon) (ranged), two attacks":
        case "If the target is your oath of enmity target and no enemies are adjacent to you, you can make two attack rolls and use either result.":
        case "Make the attack roll twice and use either result.":
        case "Make the attack twice against the target.":
        case "Make the attack twice, once with your main weapon and once with your off-hand weapon.":
        case "Make the attack twice, once with your main weapon and once with your off-hand weapon":
        case "Make the attack twice.":
        case "Make two attack rolls and use the higher result.":
        case "Make two attack rolls, take the higher result, and apply it to both targets.":
        case "Make two attack rolls.":
        case "two attacks (main weapon and off-hand weapon)":
        case "two attacks. Each attack can score a critical hit on a roll of 18–20.":
        case "two attacks. If the first attack hits, you gain a +5 bonus to the attack roll for the second attack. If the first attack misses, make the second attack normally.":
        case "two attacks":
        case "You can make two attack rolls and use the higher result if you are hidden from the target before the attack. In addition, if you are hidden and have superior cover or total concealment when you attack, you remain hidden after the attack.":
        case "You can move your speed. At any point during your move, you can make two attacks with a melee weapon or two attacks with a ranged weapon.":
        case "You make the attack twice, distributing the attacks between the targets or making both attacks against one.":
        case "You make two attack rolls and use either result.":
            return "2";
        case "(melee) (ranged), three attacks":
        case "Make the attack three times: first with your main weapon, then with your off-hand weapon, and then with your main weapon. Before each attack, you shift 1 square.":
        case "Make the attack three times.":
        case "Make three attack rolls. If any of them hit, resolve them as a single hit, and all of them must miss for the attack to miss.":
        case "Primary two attacks. If none of your allies are adjacent to you, make three attacks instead.":
        case "three attacks (at least one attack with each weapon)":
        case "three attacks. If the first attack hits, you gain a +5 bonus to the second and third attack rolls. If the first attack misses, roll the second and third attacks normally.":
        case "three attacks":
        case "If you attack fewer than three enemies, you can make the attack twice against one of the targets.":
            return "3";
        case "Make the attack four times, twice with your main weapon and twice with your off-hand weapon.":
        case "Make the attack four times.":
            return "4";
        case "Alternate main and off-hand weapon attacks until you miss or until you make five attacks. As soon as an attack misses, this power ends.":
        case "five attacks":
            return "5";
        default:
            return MultiTarget;
    }
}
