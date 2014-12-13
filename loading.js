/*
  To use:
  1. Create a page called "Loading"
  2. On the object layer create a textbox
*/
on("ready", function(obj) {
    
	var displaySpeed = 10000;
	var numChars = 35;
    var tips = [
		"When the DM asks you 'Really? Are you sure?', you say 'NO.'",
		"Use perception checks often. Or get stabbed in the back. Up to you.",
		"Slower travel is safer travel. Moving faster leaves you more open to random encounters.",
		"Never split the party.",
		"Nature checks can help you identify an unknown monster - and its weaknesses.",
		"Use your social skills often; violence isn’t always the answer! Just usually.",
		"Be sure to learn the lore, your DM probably worked very hard on it.",
		"Roleplaying your character makes the DM happy. Happy DMs are nice DMs",
		"All the coins are multiples of 10 or 100 of each other.",
		"If the campaign is getting too serious for you,why not start truble at the tavern.",
		"Vulnerability means more damage. Resistance means less damage.",
		"On a 1 you fumble an attack, you automatically miss.",
		"On a 20 you crit an attack, dealing maximum damage.",
		"This is a tabletop game, not Skyrim. For the love of God, think outside the box.",
		"Whenever you divide a number in the game, round down!",
		"If a skill contest results in a tie, the situation remains the same as it was before the contest.",
		"To make a group ability check, everyone in the group makes the ability check. If at least half the group succeeds, the whole group succeeds.",
		"Medium creature carrying capacity is your Strength score multiplied by 10.",
		"Medium creature lift capacity is your Strength score multiplied by 20.",
		"Medium creature push or drag capacity is your Strength score multiplied by 50.",
		"If you carry weight in excess of 10 times your Strength score, you are slowed. (speed =10ft)",
		"You add your Strength modifier to your attack roll and your damage roll when attacking with a melee weapon",
		"You add your Dexterity modifier to your attack roll and your damage roll when attacking with a ranged weapon",
		"If your Constitution changes, your hit point maximum changes as well.",
		"While climbing or swimming, each foot of movement costs 1 extra foot (2 extra feet in difficult terrain)",
		"When you make a long jump, you cover a number of feet up to your Athletics check if you move at least 10 feet on foot immediately before the jump.",
		"When you make a standing long jump, you cover a number of feet up to 1/2 your Athletics check.",
		"When you make a high jump, you leap into the air a number of feet equal to your Athletics check if you move at least 10 feet before the jump.",
		"When you make a standing high jump, you leap into the air a number of feet equal to 1/2 your Athletics check.",
		"A creature can hold its breath for 5 rounds, then it must pass increasingly difficult Endurance checks each round.",
		"In a lightly obscured area, creatures take a -2 penalty to attack rolls.",
		"In a heavily obscured area, creatures effectively suffer from the blinded condition, which includes a -5 penalty to attack rolls.",
		"A creature with blindsight can perceive its surroundings without relying on sight,",
		"A creature with truesight can, sees in normal and magical darkness, see invisible objects, automatically detect visual illusions and succeed on saving throws against them, and perceive the original form of a creature that is transformed by magic.",
		"A character can spend one or more Healing Surges at the end of a short rest",
		"A short rest is a period of downtime, at least 5 minutes long, during which a character does nothing more strenuous than eating, drinking, reading, and tending to wounds.",
		"At the end of a long rest, a character regains all lost hit points. The character also regains all Healing Surges, recharges all Daily Powers and has 1 Action Point.",
		"You can use downtime between adventures to recover from a debilitating injury, disease, or poison.",
		"The time between adventures is a great chance to perform research, gaining insight into mysteries that have unfurled over the course of the campaign.",
		"Every foot of movement in difficult terrain costs 1 extra foot.",
		"Whenever you switch movement methods, subtract the distance you’ve already moved from the new speed.",
		"Standing up from prone takes up your movement for the turn.",
		"Every foot of movement while crawling costs 1 extra foot.",
		"While squeezing through a space, a creature must spend 1 extra foot for every foot it moves there",
		"Creature can squeeze through a space that is large enough for a creature one size smaller than it.",
		"When you attack a target that you can’t see, you a -5 penalty to the attack roll.",
		"You add a proficiency bonus to your attack roll when you attack using a weapon with which you have proficiency",
		"Ranged attacks provoke oppertunity attacks if you are adjacent to a hostile creature who can see you",
		"Your ranged attack roll has a -2 penalty when your target is beyond normal range.",
		"A target with half cover effectively has a +2 bonus to AC and Defences.",
		"A target with three-quarters cover effectively has a +5 bonus to AC and Defences.",
		"A target with total cover can’t be targeted directly by an attack or a spell.",
		"A target of your grab must be no more than one size larger than you.",
		"You can drag or carry the grabbed creature if you succeed on a Strength check vs the grabbed creatures Fortitude but your speed is halved.",
		"To escape a grab use your movement and succeed on a Athletics vs Fortitude or Acrobatics vs Reflex check.",
		"To grab do a Strength check vs the target’s Reflex",
		"You can make a special melee attack to shove a creature 5ft away from you",
		"The target of your shove must be no more than one size larger than you.",
		"To shove, make a Strength check vs Fortitude",
		"Multiple instances of resistance or vulnerability that affect the same damage type count as only the highest",
		"When you make a death saving throw and roll a 20, you may use your second wind",
		"You can stabalize a creature on a successful DC 15 Heal check.",
		"You can choose to deal non lethal damage at the instant the damage is dealt.",
		"The effects of the same spell cast multiple times don’t combine.",
		"A blinded fails checks that requires sight. Attack rolls against the creature have combat advantage, and the creature’s attack rolls have a -5 penalty.",
		"A dazed creature only has a standard action on its turn, and it cannot make immediate or oppertunity actions outside its turn.",
		"A deafened creature can’t hear and takes a -10 penalty to perception checks.",
		"A grabbed creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.",
		"A prone creature has a -2 penalty on attack rolls.",
		"A melee attack roll against a prone creature has combat advantage."
		"A prone creature has +2 to its defences against ranged attacks from nonadjacent enemies."
    ];

	 setInterval(function() {
	 
		var currentPage = getObj("page", Campaign().get("playerpageid"));
		var pageName = currentPage.get("name");
		
		if(pageName != "Loading") return;
		
		var text = findObjs({
			_type: "text",
			_pageid: currentPage.get("_id"),
			layer: "objects"
		})[0];
	
     	var pickone = Math.floor(Math.random()*tips.length);

		var countChars = 0;
		var formatedText = "";
		for (i = 0; i < tips[pickone].length; i++) { 
			formatedText += tips[pickone].charAt(i);
			
			if(tips[pickone].charAt(i) == " " && countChars > numChars){
				formatedText += "\n";
				countChars = 0;
			}
			countChars++;
		}
		
		text.set("text", formatedText);
		log( "new tip: "+ text.get("text"));
	}, displaySpeed); //take an action every 5 seconds
   
});