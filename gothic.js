var Gothic = Gothic || (function() {
    'use strict';

    var HandleChat = function(msg) {
        // Get the API Chat Command
        msg.who = msg.who.replace(" (GM)", "");
        msg.content = msg.content.replace("(GM) ", "");
        var command = msg.content.split(" ", 1);

        if (command == "!target") {
            ResolveShooting(msg.content.split(" --"));
        } else if (command == "!move-phase") {
            MovePhase();
        }
    },
    HandleMove = function(obj,prev) {
        var lock = state.Movement[obj.get("represents")],
            mark = {};
    	if (lock) {
            var point = [obj.get("left"), obj.get("top")],
                Ship = getShip(obj),
                minAngle = lock.angle - Number(getAttribute(Ship, "turn")),
                maxAngle = lock.angle + Number(getAttribute(Ship, "turn"));
            if (!IsPointInPolygon(point, lock.path)) {
                var edge = getPointOnEdge(point, lock.path);
                mark.left = edge[0];
                mark.top = edge[1];
                obj.set(mark)
            };
            if (obj.get("rotation") > maxAngle) obj.set("rotation", maxAngle);
            if (obj.get("rotation") < minAngle) obj.set("rotation", minAngle);
		} else {
            mark = {left: prev.left, top: prev.top, rotation: prev.rotation}
    	    obj.set(mark);
		}
	},
    GraphicRemoved = function(obj) {
        var ship = obj.get("controlledby").split(",")[1];
        if (ship) {
            state.Movement[ship] = undefined;
        }
    },
    ResolveShooting = function(args) {
        if (!args || !args.length == 3) return;
        var Shooter = getObj('graphic',args[1]),
            Target = getObj('graphic',args[2]);
        if (!Target || !Shooter) return;
        var firingSolution = new FiringSolution(Shooter, Target);
        sendChat("Shooting", Shooter.get("name") + " fires at " + Target.get("name") + ": " + firingSolution.Dice_Expression());
    },
    MovePhase = function() {
        state.Movement = {}
        var ships = findObjs({_type:'graphic'});
        _.each(ships, function(obj){
            if (!obj || !obj.get("represents")) return;
            var marker = new MoveMarker(obj);
            marker.Draw();
            state.Movement[obj.get("represents")] = marker.ConvexHull()
        });
    }
    return {
        HandleChat: HandleChat,
        HandleMove: HandleMove,
        GraphicRemoved: GraphicRemoved
    };
}());

on("chat:message", function (msg_orig) {
    // Exit if not an api command
    if (msg_orig.type != "api") return;
    Gothic.HandleChat(_.clone(msg_orig));
});

on('change:graphic', Gothic.HandleMove);
on('destroy:path', Gothic.GraphicRemoved);

state.Movement = {}

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

function IsPointInPolygon(point, poly) {
    var i, j, c;
    for (i = 0, j = poly.length - 1, c = false; i < poly.length; j = i++) {
        if (((poly[i][1] > point[1]) != (poly[j][1] > point[1])) && (point[0] < (poly[j][0] - poly[i][0]) * (point[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])) c = !c;
    }
    return c;
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
        broad = getAttribute(this.ShooterClass, "side"),
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
    switch (getAttribute(this.ShooterClass, "orders")){
        case "Ahead":
        case "Turn":
        case "Stop":
        case "Brace":
            weapons /= 2;
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
    return this.Weapon_Expression() + this.Lance_Expression() + this.Bombard_Expression();
};

function RerollOnce(num) {
    var res = ""
    for(var i = 0; i<num; i++) {
        res += "2d6k1,"
    }
    return res.substring(0, res.length - 1)
}

FiringSolution.prototype.Weapon_Expression = function(){
    var Armour = this.Armour_Facing(),
        Column = this.Gunnery_Column(),
        Strength = this.WeaponStrength("weapons");
    if (!Column || !Strength || !Armour) return "";
    if (getAttribute(this.ShooterClass, "orders") == "Lock") {
//        return "\nGunnery: [[{" + this.Column_Strength(Column, Strength) + "d6ro<" + (Armour - 1) + "}>" + Armour + "]] Hits";
        return "\nGunnery: [[{" + RerollOnce(this.Column_Strength(Column, Strength)) + "}>" + Armour + "]] Hits";
    } else {
        return "\nGunnery: [[" + this.Column_Strength(Column, Strength) + "d6>" + Armour + "]] Hits";
    }
};

FiringSolution.prototype.Lance_Expression = function(){
    var Strength = this.WeaponStrength("lances");
    if (!Strength) return "";
    if (getAttribute(this.ShooterClass, "orders") == "Lock") {
//        return "\nLances: [[{" + Strength + "d6ro<3}>4]] Hits";
        return "\nLances: [[{" + RerollOnce(Strength) + "}>4]] Hits";
    } else {
        return "\nLances: [[" + Strength + "d6>4]] Hits";
    }
};

FiringSolution.prototype.Bombard_Expression = function(){
    var Column = this.Gunnery_Column(),
        Strength = this.WeaponStrength("bombard");
    if (!Column || !Strength) return "";
    if (getAttribute(this.ShooterClass, "orders") == "Lock") {
//        return "\nBombard: [[{" + this.Column_Strength(Column, Strength) + "d6ro<3}>4]] Hits";
        return "\nBombard: [[{" + RerollOnce(this.Column_Strength(Column, Strength)) + "}>4]] Hits";
    } else {
        return "\nBombard: [[" + this.Column_Strength(Column, Strength) + "d6>4]] Hits";
    }
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
    this.Origin = [Number(Ship.get("left")), Number(Ship.get("top"))];
    this.Turns = Number(getAttribute(this.ShipClass, "turn")) * Math.PI / 180.0;
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
        Remaining = Number(getAttribute(this.ShipClass, "speed")) - Forward,
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
    return {path: PathArray, 
        origin: [min.minX, min.minY], 
        width: min.maxX - min.minX, 
        height: min.maxY - min.minY, 
        angle: this.Ship.get("rotation"),
        left: this.Ship.get("left"),
        top: this.Ship.get("top")
    };
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

    createObj("path",{ 
            pageid: Campaign().get("playerpageid"), 
            layer: "objects", 
            left: hull.origin[0] + (hull.width / 2),
            top: hull.origin[1] + (hull.height / 2),
            width: hull.width,
            height: hull.height,
            path: pathString,
            stroke: "#0f0",
            controlledby: "all," + this.Ship.get("represents")
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

function dot(u, v) {return u[0] * v[0] + u[1] * v[1]}
function norm(v) {return Math.sqrt(dot(v, v))}
function dist(u, v) {return norm([u[0]-v[0], u[1]-v[1]])}

function closestPoint(point, segment) {
    var v = [segment[1][0] - segment[0][0], segment[1][1] - segment[0][1]],
        w = [point[0] - segment[0][0], point[1] - segment[0][1]],
        c1 = dot(w,v),
        c2 = dot(v,v),
        b = c1 / c2,
        Pb = [segment[0][0] + b * v[0], segment[0][1] + b * v[1]];
    
    // the closest point is outside the segment and nearer to P0
    if ( c1 <= 0 )   
        return segment[0];

    // the closest point is outside the segment and nearer to P1
    if ( c2 <= c1 ) 
        return segment[1];

    return Pb;
}

function getPointOnEdge(point, poly) {

    var bestDistance = undefined,
        bestPoint;

    var i, j;
    for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var closestInS = closestPoint(point, [poly[j], poly[i]]),
            d = dist(point, closestInS);
        if (!bestDistance || d < bestDistance) {
            bestDistance = d;
            bestPoint = closestInS; 
        }
    };

    return bestPoint;
}