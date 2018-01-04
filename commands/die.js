const config = require('../config.json');

module.exports = msg=>{
  //Only let me do this
  if(!config.admins.includes(msg.author.id))
    return msg.reply('You first!');

  if(msg.content === '!die')
    msg.reply('Okay, dying...').then(()=>{
      console.log('Reboot requested by ' + msg.author.tag);
      process.exit(1);
    })

  if(msg.content === '!die forever')
    msg.reply('No hard feelings . . .').then(()=>{
      console.log('Final shut down requested by ' + msg.author.tag);
      process.exit(0);
    })
}
