const config = require('../config.json');

const roll = new (require('roll'))();

module.exports = (msg, client)=>{
  const split = msg.content.indexOf(' ');

  if(split < 0)
    return msg.reply("Invalid roll command");

  const rollCmd = msg.content.slice(split + 1);

  let result;
  try{
    result = "You rolled " + roll.roll(rollCmd).result;
  }catch (e){
    result = "Invalid dice specifier: `" + rollCmd + "`";
  }

  msg.reply(result);
}
