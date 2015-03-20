function isMultiTarget(Target) {
    switch (Target.trim()) {
        case undefined:
        case "Personal":
        case "You":
            return 0;
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
            return 1;
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
            return 2;
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
            return 3;
        case "One, two, three, or four creatures":
        case "One, two, three, or four creatures, each adjacent to at least one tortured elemental":
        case "Up to four creatures in burst":
            return 4;
        case "One, two, three, four, or five creatures":
            return 5;
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
            return 9;//"?{Number of Targets|1}";
        default:
            return 0;
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
            return (isNaN(MultiTarget)) ? "2*(" + MultiTarget + ")" : 2 * MultiTarget;
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
            return 2;
        case "(melee) (ranged), three attacks":
        case "Make the attack three times: first with your main weapon, then with your off-hand weapon, and then with your main weapon. Before each attack, you shift 1 square.":
        case "Make the attack three times.":
        case "Make three attack rolls. If any of them hit, resolve them as a single hit, and all of them must miss for the attack to miss.":
        case "Primary two attacks. If none of your allies are adjacent to you, make three attacks instead.":
        case "three attacks (at least one attack with each weapon)":
        case "three attacks. If the first attack hits, you gain a +5 bonus to the second and third attack rolls. If the first attack misses, roll the second and third attacks normally.":
        case "three attacks":
        case "If you attack fewer than three enemies, you can make the attack twice against one of the targets.":
            return 3;
        case "Make the attack four times, twice with your main weapon and twice with your off-hand weapon.":
        case "Make the attack four times.":
            return 4;
        case "Alternate main and off-hand weapon attacks until you miss or until you make five attacks. As soon as an attack misses, this power ends.":
        case "five attacks":
            return 5;
        default:
            return MultiTarget;
    }
}