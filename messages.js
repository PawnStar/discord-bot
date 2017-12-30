const config = require('./config.json');
const fs = require('fs');

// DB file gotten from https://pastebin.com/493R8wLC
const messageDb = fs.readFileSync('./messages.db', {encoding: 'utf8'});

// Format this whole thing
const messages = messageDb.split("    return").map(messageBlock=>{
  const block = messageBlock
    .split('\n')
    .filter(s=>(s != '' && s != '\r'))
    .slice(1)
    .map(s=>{
      return s
        .slice(7)
        .slice(0,-2)
        // Formatting fix
        .replace('{i}', '_')
        .replace('{/i}', '_')
    });
  return block;
}).filter(s=>(s && s.length > 0));

console.log("Loaded " + messages.length + " creepy Monika messages");

//Helpers
const sleep = (ms) => (new Promise(resolve => setTimeout(resolve, ms)))
const randMessage = ()=>messages[Math.floor(Math.random() * messages.length)];



sendMessages = async (channel, user)=>{
  console.log(user.tag);

  // Pick random set of messages
  const messages = randMessage();

  // Set typing indicator
  await channel.startTyping();

  // Let us be typing for a bit
  await sleep(1000);

  // Send all the messages
  for(message of messages){
    await channel.stopTyping();
    const fixedMessage = message.replace('[player]', user.toString());
    await channel.send(fixedMessage);
    await channel.startTyping();
    await sleep(3000);
  }

  // Unmark typing
  await channel.stopTyping();
}

module.exports = sendMessages;
