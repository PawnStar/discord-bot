const EventEmitter = require('events');

module.exports = (client)=>{
  const commandListener = new EventEmitter();

  commandListener.on('ping', require('./ping'));
  commandListener.on('die', require('./die'));
  commandListener.on('clock', require('./clock'));
  commandListener.on('roll', require('./roll'));

  client.on('message', msg => {
    if(msg.content[0] !== '!')
      return;

    const command = msg.content.slice(1).split(' ')[0];
    commandListener.emit(command, msg, client);
  })
}
