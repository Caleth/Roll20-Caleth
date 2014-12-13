String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

// VARIABLE & FUNCTION DECLARATIONS
on("chat:message", function (msg) {
    // Exit if not an api command
    if (msg.type != "api") return;

    // Get the API Chat Command
    msg.who = msg.who.replace(" (GM)", "");
    msg.content = msg.content.replace("(GM) ", "");
    var command = msg.content.split(" ", 1);

    if (command == "!build-monster") {
        if (!msg.selected) return;
        var n = msg.content.split(" ", 2);
        var Token = getObj("graphic", n[1]);
        if (Token.get("subtype") != "token") return;

        // USER CONFIGURATION
        var USE_POWER_CARDS = true; // Uses power cards instead of text only macros
        var SHOW_DEFENSES = true; // Adds monster defenses as token actions

        // REPLACE SPECIAL CHARACTERS StatBlock = StatBlock.replace(//g, "");
        var StatBlock = unescape(Token.get("gmnotes"));
        StatBlock = StatBlock.split("<br>");
        var MonsterName = StatBlock.shift();
        var line = StatBlock.shift();

        // CHECK FOR DUPLICATE CHARACTERS
        var CheckSheet = findObjs({
            _type: "character",
            name: MonsterName
        });

        // DO NOT CREATE IF SHEET EXISTS
        if (CheckSheet.length > 0) {
            sendChat("ERROR", "This monster already exists.");
            return;
        }

        // CREATE CHARACTER SHEET & LINK TOKEN TO SHEET
        var Monster = createObj("character", {
            avatar: Token.get("imgsrc"),
            name: MonsterName,
            gmnotes: Token.get("gmnotes"),
            archived: false
        });

        var AddAttributeMax = function _AddAttributeMax(attr, value) {
            return createObj("attribute", {
                name: attr,
                current: value,
                max: value,
                characterid: Monster.id
            });
        }

        var AddAttribute = function _AddAttribute(attr, value) {
            if (value === undefined) {log(attr); return;}
            return createObj("attribute", {
                name: attr,
                current: value,
                characterid: Monster.id
            });
        }

        var AddPower = function _AddPower(mpname, powerstring) {
            return createObj("ability", {
                name: mpname,
                description: "",
                action: powerstring,
                istokenaction: true,
                characterid: Monster.id
            });
        }

        AddAttribute("npc-name", MonsterName);
        AddAttribute("sheet_type", "npc");
        // GET LEVEL, ROLE, & XP
        AddAttribute("npc-level", parseInt(line.match(/\d+/g)));
        var Role = line.split(" ").slice(2);
        if (Role.length == 1) {
            AddAttribute("npc-role", Role[0].capitalize());
        } else {
            AddAttribute("npc-sub-role", Role[0].capitalize());
            AddAttribute("npc-role", Role[1].capitalize());
        }
        line = StatBlock.shift();

        // GET SIZE, ORIGIN, TYPE AND KEYWORDS
        typeline = line.trim().split(" ");
        AddAttribute("npc-size", typeline.shift().capitalize());
        AddAttribute("npc-origin", typeline.shift().capitalize());
        var Type = "";
        while (typeline.length > 0 && typeline[0].charAt(0) !== "(") {
            Type += typeline.shift() + " ";
        }
        AddAttribute("npc-type", Type.trim().capitalize());
        if (line.match(/\([\w, ]+\)/g)) {
            AddAttribute("npc-keywords", line.match(/\([\w, ]+\)/g)[0]);
        }
        line = StatBlock.shift();

        // GET XP
        AddAttribute("npc-xp", parseInt(line.match(/([\d,]+)/g)[0].replace(",", "")));
        line = StatBlock.shift();

        // GET HIT POINTS & BLOODIED VALUE
        var HitPoints = parseInt(line.match(/\d+/g)[0]);
        AddAttributeMax("npc-hp", HitPoints);
        if (line.match(/\d+/g).length>1) {
            AddAttribute("npc-bloodied", parseInt(line.match(/\d+/g)[1]));
        }
        line = StatBlock.shift();

        // GET DEFENSES
        var Defenses = line.match(/\d+/g);
        AddAttribute("npc-ac", parseInt(Defenses[0]));
        AddAttribute("npc-fort", parseInt(Defenses[1]));
        AddAttribute("npc-ref", parseInt(Defenses[2]));
        AddAttribute("npc-will", parseInt(Defenses[3]));
        line = StatBlock.shift();

        // GET MOVEMENT MODES
        AddAttribute("npc-speed", parseInt(line.match(/Speed (\d+)/i)[1]));
        if (line.match(/Burrow/gi)) {
            AddAttribute("npc-speed-burrow", parseInt(line.match(/Burrow (\d+)/i)[1]));
        }
        if (line.match(/Climb/gi)) {
            AddAttribute("npc-speed-climb", parseInt(line.match(/Climb (\d+)/i)[1]));
        }
        if (line.match(/Fly/gi)) {
            AddAttribute("npc-speed-fly", parseInt(line.match(/Fly (\d+)/i)[1]));
        }
        if (line.match(/Swim/gi)) {
            AddAttribute("npc-speed-swim", parseInt(line.match(/Swim (\d+)/i)[1]));
        }
        if (line.match(/Teleport/gi)) {
            AddAttribute("npc-speed-teleport", parseInt(line.match(/Teleport (\d+)/i)[1]));
        }
        line = StatBlock.shift();

        // GET RESISTANCE / IMMUNITY
        var found = false;
        if (line.match(/Resist/i)) {
            AddAttribute("npc-resist", line.match(/Resist ([^;]+)/i)[1]);
            found = true;
        }
        if (line.match(/Immune/i)) {
            AddAttribute("npc-immune", line.match(/Immune ([^;])+/i)[1]);
            found = true;
        }
        if (line.match(/Vulnerability/i)) {
            AddAttribute("npc-vunerable", line.match(/Vulnerability ([^;]+)/i)[1]);
            found = true;
        }
        line = (found) ? StatBlock.shift() : line;
        if (line.match(/Saving Throws/)) {
            line = StatBlock.shift();
        }

        AddAttribute("npc-initiative", parseInt(line.match(/Initiative ([-\+]\d+)/i)[1]));
        line = StatBlock.shift();
        AddAttribute("npc-perception", parseInt(line.match(/Perception ([-\+]\d+)/i)[1]));
        found = true;
        var senses = "";
        while (found) {
            line = StatBlock.shift();
            found = false;
            if (line.match(/Darkvision/i) || line.match(/Low-Light Vision/i) || line.match(/Tremorsense/i)) {
                senses += line + "\n";
                found = true;
            }
        }
        if (senses !== "") AddAttribute("npc-senses", senses);

        var Power;
        var count = 0, macro, multi;
        if (line.match(/Traits/i)) {
            Section = line;
            line = StatBlock.shift();
            while (!isNewSection(line)) {
                Power = line.split("\u2022")[0].replace(/^O /, "");
                AddAttribute("repeating_trait_" + count + "_trait-name", Power);
                if (line.match(/Aura/i)) {
                    Token.set("aura1_radius", 5*parseInt(line.match(/Aura (\d+)/i)[1]));
                    Token.set("aura1_square", true);
                }
                AddAttribute("repeating_trait_" + count + "_trait-text", StatBlock.shift());
                line = StatBlock.shift();
            }
        }

        var ActionTypes = {
            "m": "Melee Basic",
            "r": "Ranged Basic",
            "M": "Melee",
            "R": "Ranged",
            "A": "Area",
            "C": "Close"
        };
        var Sections = {
            "Standard Actions": "repeating_standard_",
            "Move Actions": "repeating_move_",
            "Minor Actions": "repeating_minor_",
            "Triggered Actions": "repeating_triggered_",
            "Free Actions": "repeating_free_",
            "Other Actions": "repeating_free_"
        }
        while (isNewSection(line)) {
//            log("Start of " + line);
            Section = Sections[line];
            count = 0;
//            Monster[Section] = {};
            line = StatBlock.shift();
            while (!isNewSection(line) && !(line.match(/^Skills/i)) && !(line.match(/^Str /i))) {
                Power = line.split(" \u2022 ")[0].replace(/^\w /, "").replace(/\(.+\)/, "");
                macro = "!power --format|dnd4e --emote|@{npc-name} uses @{" + Section + count + "_action-name} --name|@{" + Section + count + "_action-name}";
                AddAttribute(Section + count + "_action-name", Power);
                AddPower(Power, "@{" + Section + count + "_action-macro}");
                AddAttribute(Section + count + "_action-type", ActionTypes[line.charAt(0)]);
                multi = (line.charAt(0)=="A" || line.charAt(0)=="C")
                line = StatBlock.shift();
                if (line.match(/^Requirement/i)) {
                    AddAttribute(Section + count + "_action-require", line.replace(/Requirement: /i, ""));
                    macro += " --Requirement|@{" + Section + count + "_action-require}";
                    line = StatBlock.shift();
                }
                if (line.match(/^Trigger/i)) {
                    AddAttribute(Section + count + "_action-trigger", line.replace(/Trigger: /i, ""));
                    macro += " --Trigger|@{" + Section + count + "_action-trigger}";
                    line = StatBlock.shift();
                }
                if (line.match(/^Attack/i)) {
                    line = line.replace(/Attack[\w \(\)]*: /i, "");
                    if (line.match(/;/)) {
                        AddAttribute(Section + count + "_action-range", line.split(";")[0]);
                        AddAttribute(Section + count + "_action-attack-bonus", parseInt(line.split(";")[1].match(/[-\+]\d+/)[0]));
                        macro += " --Range|@{" + Section + count + "_action-range}";
                    } else {
                        AddAttribute(Section + count + "_action-attack-bonus", parseInt(line.match(/[-\+]\d+/)[0]));
                    }
                    AddAttribute(Section + count + "_action-defence", line.split("vs. ")[1]);
                    if (multi) {
                        macro += " --attack?{Number of Targets|1}|[[1d20+@{" + Section + count + "_action-attack-bonus}]]"; 
                    } else {
                        macro += " --attack|[[1d20+@{" + Section + count + "_action-attack-bonus}]]"; 
                    }
                    macro += " --defense|@{" + Section + count + "_action-defence}";
                    line = StatBlock.shift();
                }
                if (line.match(/^Hit/i)) {
                    var hitline = line.replace(/Hit: /i, "").split(" damage");
                    AddAttribute(Section + count + "_action-damage", hitline[0]);
                    AddAttribute(Section + count + "_action-hit", hitline[1]);
                    macro += " --damage|[[@{" + Section + count + "_action-damage}]]@{" + Section + count + "_action-hit}";
                    line = StatBlock.shift();
                }
                if (line.match(/^Secondary Attack/i)) {
                    line = line.replace(/Secondary Attack: /i, "");
                    macro += " --Secondary Attack|[[1d20+@{" + Section + count + "_action-attack-bonus}]] vs @{" + Section + count + "_action-defence}"; 
                    line = StatBlock.shift();
                    if (line.match(/^Hit/i)) {
                        var hitline = line.replace(/Hit: /i, "").split(" damage");
                        macro += " --Secondary Hit|[["+ hitline[0] + "]]" + hitline[1];
                        line = StatBlock.shift();
                    }
                }
                if (line.match(/^Miss/i)) {
                    AddAttribute(Section + count + "_action-miss", line.replace(/Miss: /i, ""));
                    macro += " --Miss|@{" + Section + count + "_action-miss}";
                    line = StatBlock.shift();
                }
                if (line.match(/^Effect/i)) {
                    AddAttribute(Section + count + "_action-effect", line.replace(/Effect: /i, ""));
                    macro += " --Effect|@{" + Section + count + "_action-effect}";
                    line = StatBlock.shift();
                }
                if (line.match(/^Aftereffect/i)) {
                    AddAttribute(Section + count + "_action-aftereffect", line.replace(/Aftereffect: /i, ""));
                    macro += " --Aftereffect|@{" + Section + count + "_action-aftereffect}";
                    line = StatBlock.shift();
                }
                AddAttribute(Section + count + "_action-macro", macro);
                count++;
            }
//            log("End of " + Section + ": " + line);
        }

        if (line.match(/Skills/i)) {
            skillsline = line.replace(/Skills /i, "").split(",");
            //            Monster.Skills = {};
            for (var i = 0; i < skillsline.length; i++) {
                //                Monster.Skills[skillsline[i].match(/\w+/)[0]] = parseInt(skillsline[i].match(/\d+/)[0]);
            }
            line = StatBlock.shift();
        }

        AddAttribute("npc-strength", parseInt(line.match(/\d+/g)[0]));
        line = StatBlock.shift();
        AddAttribute("npc-dexterity", parseInt(line.match(/\d+/g)[0]));
        line = StatBlock.shift();
        AddAttribute("npc-wisdom", parseInt(line.match(/\d+/g)[0]));
        line = StatBlock.shift();
        AddAttribute("npc-constitution", parseInt(line.match(/\d+/g)[0]));
        line = StatBlock.shift();
        AddAttribute("npc-intelligence", parseInt(line.match(/\d+/g)[0]));
        line = StatBlock.shift();
        AddAttribute("npc-charisma", parseInt(line.match(/\d+/g)[0]));
        line = StatBlock.shift();

//        Monster.Alignment = line.match(/Alignment (\w+ \w+)/i)[1];
//        Monster.Languages = line.match(/Languages (.*)/i)[1];

        // SET TOKEN VALUES
        Token.set("represents", Monster.id);
        Token.set("name", MonsterName);
        Token.set("showplayers_name", true);
        Token.set("bar1_value", HitPoints);
        Token.set("bar1_max", HitPoints);
        Token.set("showplayers_bar1", true);
    }
});

function isNewSection(line) {
    return line.match(/^Standard Actions$/i) || line.match(/^Move Actions$/i) || line.match(/^Minor Actions$/i) || line.match(/^Triggered Actions$/i) || line.match(/^Other Actions$/i) || line.match(/Free Actions/i);
}