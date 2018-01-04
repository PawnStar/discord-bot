const fs = require('fs');
const EventEmitter = require('events');

let commands = [];

fs.readdirSync('./commands').forEach(file=>{
  const result = file.match(/^([^.]*)\.js/);

  if(result){
    commands.push({
      command: result[1],
      commandFunction: require('./commands/' + file)
    });
  }else{
    console.log("Unrecognized commend " + file);
  }
})

module.exports = (client)=>{
  const commandListener = new EventEmitter();

  for(index of commands){
    commandListener.on(index.command, index.commandFunction);
  }

  client.on('message', msg => {
    if(msg.content[0] !== '!')
      return;

    const command = msg.content.slice(1).split(' ')[0];
    if(!commandListener.emit(command, msg, client))
      msg.reply('Unrecognized command!')
  })
}
