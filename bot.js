const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '!ping') {
    msg.reply('Pong!');
  }
});

client.on('message', msg => {
  //Only let me do this
  if(msg.content === '!die' && config.admins.includes(msg.author.id)){
    msg.reply('Okay, dying...').then(()=>{
      process.exit(1);
    })
  }
})

client.login(config.token);
