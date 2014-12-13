var Gothic = Gothic || (function() {
    'use strict';

    var HandleChat = function(msg) {
        // Get the API Chat Command
        msg.who = msg.who.replace(" (GM)", "");
        msg.content = msg.content.replace("(GM) ", "");
        var command = msg.content.split(" ", 1);

        if (command == "!target") {
            ResolveShooting(msg.content.split(" --"), msg.selected);
        } else if (command == "!move-phase") {
            DrawMove(msg.who);
        }
    },
    ResolveShooting = function(args, list) {
        if (!args || !args.length == 2 || !list || list.length < 1) return;
        var Target = getObj('graphic',args[1]);
        if (!Target) return;
        _.each(list, function(obj){
            var Shooter = getObj('graphic',obj.id);
            if (!Shooter) return;
            firingSolution = new FiringSolution(Shooter, Target);
            sendChat("Shooting", Shooter.get("name") + " fires at " + Target.get("name") + ": " + firingSolution.Dice_Expression());
        });
    },
    DrawMove = function(player) {
        var ships = findObjs({_type:'graphic'});
        _.each(ships, function(obj){
            if (!obj) return;
            new MoveMarker(obj).Draw();
        });
    }
    return {
        HandleChat: HandleChat
    };
}());

on("chat:message", function (msg_orig) {
    // Exit if not an api command
    if (msg_orig.type != "api") return;
    Gothic.HandleChat(_.clone(msg_orig));
});

function getShip(Token) {
    if (!Token || !Token.get("represents")) return;
    return getObj('character', Token.get('represents'));
};

function getAttribute(Ship, attr) {
    if (!Ship || !attr) return;
    var results = findObjs({_type: 'attribute', _characterid: Ship.id, name: attr});
    if (!results || results.length !== 1) {
        return;
    }
    return results[0].get("current");
};

function setAttribute(Ship, attr, value) {
    if (!Ship || !attr) return;
    var results = findObjs({_type: 'attribute', _characterid: Ship.id, name: attr});
    if (!results || results.length !== 1) {
        return;
    }
    results[0].set({"current": value});
};

function rotatePoint(pt, center, angleDeg) {
    var angleRad = (angleDeg/180)*Math.PI,
        cosAngle = Math.cos(angleRad),
        sinAngle = Math.sin(angleRad),
        dx = (pt[0]-center[0]),
        dy = (pt[1]-center[1]);

    pt[0] = center[0] + (dx*cosAngle-dy*sinAngle);
    pt[1] = center[1] + (dx*sinAngle+dy*cosAngle);
    return pt;
};

function FiringSolution(Shooter, Target){
    this.Shooter = Shooter;
    this.Target = Target;
    
    this.ShooterClass = getShip(Shooter);
    this.TargetClass = getShip(Target);
    
    deltaX = Target.get("left") - Shooter.get("left");
    deltaY = Shooter.get("top") - Target.get("top");
    this.ShotAngle = Math.atan2(deltaX,deltaY) * Math.PI / 180.0;
    this.Distance = Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY,2))/70;
};

FiringSolution.prototype.Port = ['port_1_', 'port_2_', 'port_3_'];
FiringSolution.prototype.Starboard = ['starboard_1_', 'starboard_2_', 'starboard_3_'];

FiringSolution.prototype.Calculate_Angle = function(){
    var TargetAngle = this.Target.get("rotation")%360,
        Orientation = (360 + this.ShotAngle - TargetAngle)%360;
    
    if(Orientation < 45 || Orientation >= 315){
        return "Moving Away"
    } else if ( Orientation < 135 || Orientation >= 225) {
        return "Abeam"
    } else {
        return "Closing"
    }
};

FiringSolution.prototype.Calculate_Arc = function(){
    var TargetAngle = this.Shooter.get("rotation")%360,
        Orientation = (360 - this.ShotAngle + TargetAngle)%360;
    
    if(Orientation < 45 || Orientation >= 315){
        return "Rear"
    } else if (Orientation < 135) {
        return "Left"
    } else if (Orientation >= 235) {
        return "Right"
    } else {
        return "Front"
    }
};

FiringSolution.prototype.Gunnery_Column = function(){
    var ShipClass = getAttribute(this.TargetClass, "class"),
        Orientation = this.Calculate_Angle(),
        Column;
    if (ShipClass == "Defences"){
        Column = 1;
    } else if (ShipClass == "Ordnance") {
        Column = 5;
    } else if (Orientation == "Closing") {
        Column = 2;
    } else if (Orientation == "Moving Away") {
        Column = 3;
    } else if (Orientation == "Abeam") {
        Column = 4;
    }
    
    if (ShipClass == "Escort") Column++
    if (this.Distance >= 30) Column++
    else if (this.Distance < 15) Column--
    
    return (Column < 1) ? 1 : (Column > 5) ? 5 : Column
};

FiringSolution.prototype.Armour_Facing = function() {
    var Armour = getAttribute(this.TargetClass, "armour"),
        Orientation = this.Calculate_Angle();
    switch (Orientation) {
        case "Closing":
            switch (Armour) {
                case '6+':
                case '6+ front/5+':
                case '6+ front/4+':
                case '6+/5+/4+':
                    return 6;
                case '5+':
                    return 5;
                case '4+':
                    return 4;
            };
        case "Moving Away":
            switch (Armour) {
                case '6+':
                    return 6;
                case '5+':
                case '6+ front/5+':
                    return 5;
                case '4+':
                case '6+ front/4+':
                case '6+/5+/4+':
                    return 4;
            };
        case "Abeam":
            switch (Armour) {
                case '6+':
                    return 6;
                case '5+':
                case '6+ front/5+':
                case '6+/5+/4+':
                    return 5;
                case '4+':
                case '6+ front/4+':
                    return 4;
            };
    }
};

FiringSolution.prototype.WeaponStrength = function (type) {
    var Arc = this.Calculate_Arc(),
        broad = getAttribute(this.ShooterClass, "tab"),
        weapons = 0,
        i;
    switch (Arc) {
        case "Left":
            for (i = 0; i < broad; i++) {
                weapons += this.Weapon_Available(this.Port[i], type);
            }
            weapons += this.Weapon_Available("dorsal_", type);
            weapons += (getAttribute(this.ShooterClass, "prow_arc") == "Left/Front/Right") ? this.Weapon_Available("prow_", type) : 0;
            break;
        case "Right":
            for (i = 0; i < broad; i++) {
                weapons += this.Weapon_Available(this.Starboard[i], type);
            }
            weapons += this.Weapon_Available("dorsal_", type);
            weapons += (getAttribute(this.ShooterClass, "prow_arc") == "Left/Front/Right") ? this.Weapon_Available("prow_", type) : 0;
            break;
        case "Front":
            {
                weapons += this.Weapon_Available("dorsal_", type);
                weapons += this.Weapon_Available("prow_", type);
                break;
            }
    }
    return weapons;
};

FiringSolution.prototype.Weapon_Available = function(weapon, type){
    var aType = getAttribute(this.ShooterClass, weapon + "type"),
        range = getAttribute(this.ShooterClass, weapon + "range"),
        used = getAttribute(this.ShooterClass, weapon + "used");
    if ((aType == type) && (this.Distance < range) && (used != "on")) 
    {
        setAttribute(this.ShooterClass, weapon + "used", "on");
        return parseInt(getAttribute(this.ShooterClass, weapon + "power"), 10);
    } else {
        return 0;
    };
}

FiringSolution.prototype.Dice_Expression = function(){
    return this.Weapon_Expression() + this.Lance_Expression();
};

FiringSolution.prototype.Weapon_Expression = function(){
    var Armour = this.Armour_Facing(),
        Column = this.Gunnery_Column(),
        Strength = this.WeaponStrength("weapons");
    if (!Column || !Strength || !Armour) return "";
    return "\nGunnery: [[" + this.Column_Strength(Column, Strength) + "d6>" + Armour + "]] Hits"
};

FiringSolution.prototype.Lance_Expression = function(){
    var Strength = this.WeaponStrength("lances");
    if (!Strength) return "";
    return "\nLances: [[" + Strength + "d6>4]] Hits"
};

FiringSolution.prototype.Column_Strength = function(Column, Strength){
    switch (Column) {
        case 1:
            return Math.round(Strength * 0.9);
        case 2:
            return Math.round(Strength * 0.7);
        case 3:
            return Math.round(Strength * 0.5);
        case 4:
            return Math.round(Strength * 0.35);
        case 5:
            return Math.round(Strength * 0.2);
    }
}

function MoveMarker (Ship){
    this.Ship = Ship;
    this.ShipClass = getShip(Ship);
    this.Origin = [parseInt(Ship.get("left"), 10), parseInt(Ship.get("top"), 10)];
    this.Turns = parseInt(getAttribute(this.ShipClass, "turn"), 10) * Math.PI / 180.0;
};

MoveMarker.prototype.MinForwardMove = function (){
    switch(getAttribute(this.ShipClass, "type")){
        case "Battleship":
            return 15;
        case "Cruiser":
            return 10;
        case "Escort":
            return 0;
    }
};

MoveMarker.prototype.ConvexHull = function(){
    var Forward = this.MinForwardMove(),
        Remaining = parseInt(getAttribute(this.ShipClass, "speed"), 10) - Forward,
        Origin = this.Origin, 
        Turns = this.Turns,
        Angle = (180+this.Ship.get("rotation"))%360,
        PathArray = [[0,0]],
        pathString,
        min = {maxX: false, minX: false, maxY: false, minY: false};

    PathArray.push([0, Forward]);
    _.each(_.range(-1, 1.1, 0.1), function(frac){
        PathArray.push([Math.sin(frac * Turns) * Remaining, Forward + (Math.cos(frac * Turns) * Remaining)]);
    });
    PathArray.push([0, Forward]);
    PathArray.push([0,0]);
    
    _.each(PathArray, function(list) {
        list[0] *= 70;
        list[1] *= 70;
    });
    PathArray = _.map(PathArray, function(pt){
        return rotatePoint(pt, [0,0], Angle);
    });
    _.each(PathArray, function(list) {
        list[0] += Origin[0];
        list[1] += Origin[1];
    });
    
    _.each(PathArray, function(list) {
        if(this.maxX === false || list[0] > this.maxX) this.maxX = list[0];
        if(this.minX === false || list[0] < this.minX) this.minX = list[0];
        if(this.maxY === false || list[1] > this.maxY) this.maxY = list[1];
        if(this.minY === false || list[1] < this.minY) this.minY = list[1];
    }, min);
//    Origin[0] += min.minX;
//    Origin[1] += min.minY;
    return {path: PathArray, origin: [min.minX, min.minY], width: min.maxX - min.minX, height: min.maxY - min.minY};
}

MoveMarker.prototype.Draw = function(){
    var hull = this.ConvexHull(),
        PathArray = hull.path,
    pathString = "[[\"M\"," + PathArray[0][0] + "," + PathArray[0][1] + "],";
    pathString += "[\"L\"," + PathArray[1][0] + "," + PathArray[1][1] + "],";
    pathString += "[\"L\"," + PathArray[2][0] + "," + PathArray[2][1] + "],";
    _.each(_.range(3,22,2), function(i){
        // Bezier Control point so curve passes through original PathArray[3]
        var cX = (2*PathArray[i][0] - PathArray[i-1][0]/2 - PathArray[i+1][0]/2),
            cY = (2*PathArray[i][1] - PathArray[i-1][1]/2 - PathArray[i+1][1]/2);
        pathString += "[\"Q\"," + cX + "," + cY + "," + PathArray[i+1][0] + "," + PathArray[i+1][1] + "],"
//        pathString += "[\"L\"," + PathArray[i][0] + "," + PathArray[i][1] + "],";
//        pathString += "[\"L\"," + PathArray[i+1][0] + "," + PathArray[i+1][1] + "],";
    });
    pathString += "[\"L\"," + PathArray[23][0] + "," + PathArray[23][1] + "],";
    pathString += "[\"L\"," + PathArray[24][0] + "," + PathArray[24][1] + "]]";
    log(this.Ship.get("name"))
    log(PathArray[0]);
    log(hull.origin);

    createObj("path",{ 
            pageid: Campaign().get("playerpageid"), 
            layer: "objects", 
            left: hull.origin[0] + (hull.width / 2),
            top: hull.origin[1] + (hull.height / 2),
            width: hull.width,
            height: hull.height,
            path: pathString,
            stroke: "#0f0",
            controlledby: "all"
      });
};

MoveMarker.prototype.DrawX = function(Point){
    createObj("path",{ 
            pageid: Campaign().get("playerpageid"), 
            layer: "objects", 
            left: Point[0]-70,
            top: Point[1]-70,
            rotation: 0,
            path: "[[\"M\"," + (Point[0]-70) + "," + (Point[1]-70) + "],[\"L\"," + (Point[0]+70) + "," + (Point[1]+70) + "]]",
            stroke: "#0f0",
            controlledby: "all"
      });
    createObj("path",{ 
            pageid: Campaign().get("playerpageid"), 
            layer: "objects", 
            left: Point[0]+70,
            top: Point[1]-70,
            rotation: 90,
            path: "[[\"M\"," + (Point[0]-70) + "," + (Point[1]-70) + "],[\"L\"," + (Point[0]+70) + "," + (Point[1]+70) + "]]",
            stroke: "#0f0",
            controlledby: "all"
      });
}