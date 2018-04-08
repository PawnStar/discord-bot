const yargs = require('yargs');
const get5e = require('./dnd/get5eTools.js');
const fs = require('fs');
const path = require('path')
const Fuse = require('fuse.js');
console.log(Fuse);

const CLASS_BLUE = 7000290;
const SPELL_WHITE = 16777215;
const MAX_RESULTS = 4;

const filePath = path.join(__dirname, './dnd/5ecache.json')

const SKL_ABV_ABJ = "A";
const SKL_ABV_EVO = "V";
const SKL_ABV_ENC = "E";
const SKL_ABV_ILL = "I";
const SKL_ABV_DIV = "D";
const SKL_ABV_NEC = "N";
const SKL_ABV_TRA = "T";
const SKL_ABV_CON = "C";

const SKL_ABJ = "Abjuration";
const SKL_EVO = "Evocation";
const SKL_ENC = "Enchantment";
const SKL_ILL = "Illusion";
const SKL_DIV = "Divination";
const SKL_NEC = "Necromancy";
const SKL_TRA = "Transmutation";
const SKL_CON = "Conjuration";

SP_SCHOOL_ABV_TO_FULL = {};
SP_SCHOOL_ABV_TO_FULL[SKL_ABV_ABJ] = SKL_ABJ;
SP_SCHOOL_ABV_TO_FULL[SKL_ABV_EVO] = SKL_EVO;
SP_SCHOOL_ABV_TO_FULL[SKL_ABV_ENC] = SKL_ENC;
SP_SCHOOL_ABV_TO_FULL[SKL_ABV_ILL] = SKL_ILL;
SP_SCHOOL_ABV_TO_FULL[SKL_ABV_DIV] = SKL_DIV;
SP_SCHOOL_ABV_TO_FULL[SKL_ABV_NEC] = SKL_NEC;
SP_SCHOOL_ABV_TO_FULL[SKL_ABV_TRA] = SKL_TRA;
SP_SCHOOL_ABV_TO_FULL[SKL_ABV_CON] = SKL_CON;

let hasLoaded = false;
let data = null;

// Various type accessor functions
const lookups = {
  'class': (msg, search)=>{
    classes = data.classes;

    var fuse = new Fuse(classes, {
      keys: ['name']
    })

    results = fuse.search(search.join(' '));

    if(!results)
      return msg.reply('Couldn\'t find a class by that name')

    msg.reply("I found " + results.length + " results for you:")
    for(result of results)
      msg.channel.sendEmbed({
        color: CLASS_BLUE,
        title: result.name,
        fields: [
          {
            name: 'Hit Dice',
            value: result.hd.number + 'd' + result.hd.faces,
            inline: true
          },
          {
            name: 'Proficiencies',
            value: 'TODO: actually parse this',
            inline: true
          }
        ]
      })
  },
  'spell': (msg, search)=>{
    var rawSpells = data.spells;
    var spellArrays = Object.keys(rawSpells)
      .filter(key=> key!='index' && key != 'roll20')
      .map(key=>rawSpells[key])

    spellMap = {};
    spells = [];

    for(spellArray of spellArrays)
      for(spell of spellArray)
        if(spellMap[spell.name])
          continue;
        else{
          spellMap[spell.name] = true;
          spells.push(spell);
        }

    var fuse = new Fuse(spells, {
      keys: ['name']
    })

    results = fuse.search(search.join(' '));

    if(!results)
      return msg.reply('Couldn\'t find a spell by that name')

    if(results.length > MAX_RESULTS){
      msg.reply('Limiting results to most relevant ' + MAX_RESULTS)
      results = results.slice(0, MAX_RESULTS);
    } else
      msg.reply("I found " + results.length + " results for you:")

    for(result of results)
      msg.channel.sendEmbed({
        color: SPELL_WHITE,
        title: result.name + ' (' + result.level + ' level ' + SP_SCHOOL_ABV_TO_FULL[result.school] + ')',
        description: result.entries.join('\n')
      })
  }
}

module.exports = {
  // Load D&D data on start
  onStart: client=>{
    if(fs.existsSync(filePath)){
      console.log('Loaded D&D data from cache')
      data = require(filePath);
      hasLoaded = true;
      return;
    }

    console.log('Loading D&D data from teh interwebs . . .')
    get5e().then(d=>{
      console.log('Loaded D&D data');
      data = d;
      hasLoaded = true;
      fs.writeFile(filePath, JSON.stringify(data), (err)=>{
        console.log('Cached D&D data');
      })
    })
  },

  // Query data on command
  onCommand: (msg, client)=>{
    if(!hasLoaded)
      return msg.reply("I'm sorry, I haven't loaded my D&D database yet");

    const arguments = yargs.command('!dnd [type] [search...]').parse(msg.content);

    if(lookups[arguments.type])
      return lookups[arguments.type](msg, arguments.search)

    types = Object.keys(lookups).join(', ');
    msg.reply('Unknown search type "' + arguments.type + '".  Acceptable searches are: ' + types);
  },
  onMessage: null
}
