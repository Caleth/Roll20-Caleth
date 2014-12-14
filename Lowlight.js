// Dynamic Lowlight Source Generator v0.3.2
// by Dom Bonanni @ShnizmuffiN

//Tints to determine parent lights and their children
var parentTint = '#ffff01';
var childTint = '#ffff02';

on("ready", function() {

  dynamicLowlight();

  on("add:graphic", function(obj) {
    //Will only be called for new objects that get added, since existing objects have already been loaded before the ready event fires.
  });
});

// Events
//----------

on("add:graphic", function(obj) {
  //Will be called for all new graphics, including ones that already existed at the start of the play session.
});

on('change:graphic:light_otherplayers', function(obj, prev) {
  //Will be called when light sources are enabled/disabled.
});

on('change:graphic:represents', function(obj, prev) {
  //Called every time a token starts or stops representing a character.
});

// Chat Commands
//----------

on("chat:message", function(msg) {
  //This allows players to enter !sr <number> to roll a number of d6 dice with a target of 4.
  if (msg.type == "api" && msg.content == '!dll-kill') {
    log('Killing Lowlights!');
    var lowlightSources = findLowlightSources();
    var lowlights = findLowlights();

    //reset all normal lights
    _.each(lowlightSources, function(lowlightSource) {
      if (lowlightSource.get('tint_color') === parentTint) {
        lowlightSource.set('tint_color', 'transparent');
      }
    });

    //move the actual lowlight to the top of the grid and remove player ownership, since we can't actually delete them.
    _.each(lowlights, function(lowlight){
      lowlight.set({
        'controlledby': '',
        'width': 5,
        'height': 5,
        'left': 70,
        'top': 70,
        'layer': 'gmlayer'
      });
    });
  }

  if (msg.type == "api" && msg.content == '!dll') {
    log('Creating Lowlight!');
    dynamicLowlight();
  }

});

// Functions
//----------

function dynamicLowlight(){
    //Who's got eyeballs?
  var sightedTokens = findSightedTokens();
  log(sightedTokens);

  //Define some empty arrays for different classes of vision.
  var lowlightCharacters = populateLowlightCharacters(sightedTokens);
  var darkvisionCharacters = populateDarkvisionCharacters(sightedTokens);

  //Get the lights everyone can see.
  var lowlightSources = findLowlightSources();
  log(lowlightSources);

  _.each(lowlightSources, function(lowlightSource) {
    //determine if the lowlightSource already has a child by checking its tint color

    if (lowlightSource.get('tint_color') === parentTint) {
      //if so, goto the child and make sure all the lowlight characters own it
      log('this lightsource ' + lowlightSource.id + ' has a child already.');
    } else {
      lowlightSource.set('tint_color', parentTint);
      //if not, create a child, bind their movements, and flag the lowlight source as having a child.
      //then, give all the lowlight charcters ownership of it.
      var lowlight = createObj("graphic", _.extend(
        lowlightSource.toJSON(), {
          'light_radius': (lowlightSource.get('light_radius') * 2),
          'light_dimradius': (lowlightSource.get('light_dimradius') * 2),
          'left': lowlightSource.get('left'),
          'top': lowlightSource.get('top'),
          'imgsrc': 'https://s3.amazonaws.com/files.d20.io/images/4128148/TEBLVm2XwEapwIb_rX5hUQ/thumb.png?1400807183',
          'light_otherplayers': false,
          'controlledby': lowlightCharacters

        }));

      lowlight = fixNewObject(lowlight);
      toBack(lowlight);

      lowlight.set({
        'light_otherplayers': false,
        'controlledby': lowlightCharacters,
        'width': 5,
        'height': 5,
        'name': 'child of ' + lowlightSource.id,
        'tint_color': childTint
      });

      on('change:graphic:left', function() {
        lowlight.set('left', (lowlightSource.get('left')));
      });

      on('change:graphic:top', function() {
        lowlight.set('top', (lowlightSource.get('top')));
      });
      //log(lowlightSource);
    }

    //log(lowlightSource.get('tint_color'));
  });

  //log results
  log(lowlightCharacters);
  log(darkvisionCharacters);
  //log("There are "+lowlightPlayers.length+" tokens with lowlight vision");
  //log(lowlightPlayers);
}

function fixNewObject(obj) {
  var p = obj.changed._fbpath;
  var new_p = p.replace(/([^\/]*\/){4}/, "/");
  obj.fbpath = new_p;
  return obj;
}

function findSightedTokens() {
  var sightedTokens = findObjs({
    //_pageid: Campaign().get("playerpageid"),
    _type: "graphic",
    _subtype: "token",
    light_hassight: true,
  });

  log("There are " + sightedTokens.length + " tokens with vision in the campaign");

  return sightedTokens;
}

function populateLowlightCharacters(sightedTokens) {
  var populationLowlightCharacters = [];

  _.each(sightedTokens, function(sightedToken) {
    //determine if a token represents a character.
    if (sightedToken.get('represents') !== '') {
      //if so, get the vision attribute from that character and sort them into vision arrays
      var sightedCharacter = getObj('character', sightedToken.get('represents'));
      var vision = findObjs({
        _type: 'attribute',
        _characterid: sightedCharacter.id,
        name: 'vision'
      }, {
        caseInsensitive: true
      })[0];

      //...and pop them into the arrays we defined.
      if (vision !== null && vision.get('current') == 'lowlight') {

        log(sightedCharacter.get('name') + ' has lowlight vision.');

        populationLowlightCharacters.push(sightedCharacter.get('controlledby').split(","));

      }
    }

    //if not, ignore them.
  });

  populationLowlightCharacters = _.flatten(populationLowlightCharacters);
  populationLowlightCharacters = _.uniq(populationLowlightCharacters);
  log(populationLowlightCharacters);
  return populationLowlightCharacters;
}

function populateDarkvisionCharacters(sightedTokens) {
  var populationDarkvisionCharacters = [];

  _.each(sightedTokens, function(sightedToken) {
    //determine if a token represents a character.
    if (sightedToken.get('represents') !== '') {
      //if so, get the vision attribute from that character and sort them into vision arrays
      var sightedCharacter = getObj('character', sightedToken.get('represents'));
      var vision = findObjs({
        _type: 'attribute',
        _characterid: sightedCharacter.id,
        name: 'vision'
      }, {
        caseInsensitive: true
      })[0];

      //...and pop them into the arrays we defined.
      if (vision !== null && vision.get('current') == 'darkvision') {
        log(sightedCharacter.get('name') + ' has darkvision.');

        populationDarkvisionCharacters.push(sightedCharacter.get('controlledby').split(","));

      }
    }

    //if not, ignore them.
  });
  populationDarkvisionCharacters = _.flatten(populationDarkvisionCharacters);
  populationDarkvisionCharacters = _.uniq(populationDarkvisionCharacters);
  log(populationDarkvisionCharacters);
  return populationDarkvisionCharacters;
}

function findLowlightSources() {
  var lowlightSources = findObjs({
    //_pageid: Campaign().get("playerpageid"),
    _type: "graphic",
    light_otherplayers: true
  });

  log("There are " + lowlightSources.length + " sources of light in the campaign");

  return lowlightSources;
}

function findLowlights() {
  var lowlights = findObjs({
    _type: 'graphic',
    tint_color: childTint
  });

  log("There are " + lowlights.length + " lowlights in the campaign");

  return lowlights;
}