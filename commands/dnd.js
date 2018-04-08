const yargs = require('yargs');
const get5e = require('./dnd/get5eTools.js');
const fs = require('fs');
const path = require('path')

const filePath = path.join(__dirname, './dnd/5ecache.json')

let hasLoaded = false;
let data = null;

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
    msg.reply('```' + JSON.stringify(data) + '```');

  },
  onMessage: null
}
