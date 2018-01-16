const fs = require('fs');
const EventEmitter = require('events');

console.log("Reading commands . . .")

let commands = [];

fs.readdirSync('./commands').forEach(file=>{
  const result = file.match(/^([^.]*)\.js/);

  if(result){
    console.log("  Loading file '" + file + "'")
    commands.push({
      name: result[1],
      command: require('./commands/' + file)
    });
  }else{
    console.log("  Unrecognized command file '" + file + "'");
  }
})

module.exports = (client, db)=>{
  const commandListener = new EventEmitter();
  const messageListener = new EventEmitter();

  for(index of commands){
    // Commands that export a function are understood to be event handlers
    if(typeof index.command === 'function')
      commandListener.on(index.name, index.command);

    // Commands that export an object can have an onStart handler,
    // as well as an onCommand handler, and an onMessage handler
    if(typeof index.command === 'object'){
      const command = index.command;

      if(command.onStart)
        command.onStart(client, db);
      if(command.onCommand)
        commandListener.on(index.name, command.onCommand);
      if(command.onMessage)
        messageListener.on('message', command.onMessage);
    }
  }

  client.on('message', msg => {
    if(msg.content[0] == '!'){
      const command = msg.content.slice(1).split(' ')[0];
      if(!commandListener.emit(command, msg, client, db))
        msg.reply('Unrecognized command!')
    }
    messageListener.emit('message', msg, client, db);
  })
}
