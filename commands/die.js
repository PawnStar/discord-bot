const config = require('../config.json');

module.exports = msg=>{
  //Only let me do this
  if(msg.content === '!die')
    if(config.admins.includes(msg.author.id)){
      msg.reply('Okay, dying...').then(()=>{
        process.exit(1);
      })
    }else
      msg.reply('You first!');
}
