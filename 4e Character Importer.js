var CharacterImport = CharacterImport || {};

on("chat:message", function (msg) {
    // Exit if not an api command
    if (msg.type != "api") return;

    // Get the API Chat Command
    var content = msg.content.replace("(GM) ", ""),
        command = content.split(" ", 1);

    if (command == "!build-character") {
        var args = content.split(" ");
        args.shift();
        var selected = _.pluck(msg.selected, '_id')
        
        _.each(_.union(args,selected), function(id){
            var Token = getObj("graphic",id);
            CharacterImport.Process(Token);
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
    
    function UsageFormat(Usage) {
        switch(Usage) {
            case "At-Will":
            case "Encounter":
            case "Daily":
                return Usage.toLowerCase()
            default:
                return "item"
        }
    }
    
    function PowerWeapons(PowerString, Weapons, prefix, Attack, MultiTarget, PowerName) {
        if (!Weapons) {return PowerString;}
        var keys = _.keys(Weapons),
            values = _.values(Weapons),
            index = 1,
            res;

        function AddWeaponPower(Weapon, Name){
            var res2 = PowerString;
            res2 = res2.replace(/\$Attack/gi, "[[1d20 + " + Weapon.AttackBonus + "]]");
            res2 = res2.replace(/\$Damage/gi, "[[" + Weapon.Damage + "]]")
            res2 += AddTags(Weapon, {Enhancement: Weapon.Enhancement});
            var attrName = prefix + "weapon-" + index++,
                attr = AddPCAttribute(attrName, res2);
            return " --" + Name + "|" + attrName;
        }
        
        if (/main weapon and off-hand weapon/.test(Attack)) {
            var Main = keys.shift(),
                Off = keys.shift(),
                obj;
            mAttack = " --Main Attack|[[1d20 + " + Weapons[Main].AttackBonus + "]] vs. AC";
            mDamage = " --Main Hit|[[" + Weapons[Main].Damage + "]]";
            oAttack = " --Off Attack|[[1d20 + " + Weapons[Off].AttackBonus + "]] vs. AC";
            oDamage = " --Off Hit|[[" + Weapons[Off].Damage + "]]";
            Main = mAttack + mDamage + AddTags(Weapons[Main], {Mod: "Main", Enhancement: Weapons[Main].Enhancement});
            Off = oAttack + oDamage + AddTags(Weapons[Off], {Mod: "Off", Enhancement: Weapons[Off].Enhancement});
            res = PowerString.replace(/ \-\-Attack(.(?!\-\-(?!Hit)))+/, Main + Off)
            var attrName = prefix + "weapon-" + index++,
                attr = AddPCAttribute(attrName, res);
            res = "!buttons " + Character.id + " " + MultiTarget + " " + PowerName + " --" + "Melee|" + attrName;
            res += _.chain(Weapons)
                    .pick(keys)
                    .map(AddWeaponPower)
                    .reduce(function(cmd, next) {return cmd += next}, "")
                    .value()
        } else {
            res = "!buttons " + Character.id + " " + MultiTarget + " " + PowerName;
            res += _.chain(Weapons)
                    .pick(keys)
                    .map(AddWeaponPower)
                    .reduce(function(cmd, next) {return cmd += next}, "")
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
        var indent;
        if (typeof content === Object) {return "";}
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
            case "Attack":
                tag = "Attack" + ((this && this.MultiAttack) ? "#" + this.MultiAttack.toString() : "");
                content = content.replace(/\w+( \+\d)? vs./gi, "$Attack vs.");
                content = (/ or /.test(content)) ? content.replace(/\$Attack (.+) or /, "") : content;
                content += ' of %%token_name%%'
                break;
            case "Hit":
                tag = "Hit" + ((this && this.MultiDamage) ? "#" + this.MultiDamage.toString() : "");
                content = content.replace(/\d\[W\]( \+ [\w]+ modifier)?/gi, "$Damage");
                content = content.replace(/\dd\d+( \+ [\w]+ modifier)?/gi, "$Damage");
                content = content.replace(/ Level 21:([^\.]*)\./, '');
                break;
            case "Critical":
                if (this.Enhancement) {content = content.replace(/1(d\d damage) per plus/, this.Enhancement.toString() + "$1")}
                break;
        }
        content = content.replace(/<table>[^<]+<\/table>/gi, "");
        content = content.replace(/([\d]?d[\d]+)/gi, "[[$1]]");
        if (this.Mod) tag = this.Mod + " " + tag
        if (content !== "") return " --" + indent + tag + "|" + content;
    }
    
    function AddTags(Source, context) {
        return _.chain(Source)
        .map(MakeTag, context)
        .reduce(function (ps, tag) {return ps += tag}, "")
        .value();
    }
    
    function MakePower(Power, idx, Name) {
        // BUILD POWERSTRING
        var PowerString = "!power --format|" + UsageFormat(Power["Power Usage"]) + " --name|" + Power.Name,
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

        PowerString += AddTags(Power, {MultiAttack: MultiAttack, MultiDamage: MultiDamage});
        PowerString = PowerWeapons(PowerString, Power.Weapons, prefix, Attack, String(MultiTarget), Power.Name);

        var Usage = "", 
            ability = AddPCPower(Power.Name, "%{" + Name + "|-" + prefix + "}", true), 
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

        if (Power.Weapons && _.keys(Power.Weapons).length > 1) {
            ability.set("action", Usage + "!buttons " + macro.id);                
        } else {
            ability.set("action", Usage + "%{" + Name + "|-" + prefix + "}");        
        }        
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
    _.each(parsed.RulesElements, function(elem) {
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
    _.each(parsed.Powers, function(power, name) {
        power.Name = name;
        MakePower(power, power_count++, CharacterName);
    });
    _.each(parsed["Item Powers"], function(value, name) {
        var Powers = value.split("Power");
        Powers.shift();
        _.each(Powers, function(text, index) {
            var ItemPower = {Name: (Powers.length > 1) ? name + " " + ++index : name}
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
            MakePower(ItemPower, power_count++, CharacterName);
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
