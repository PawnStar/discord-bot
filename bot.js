const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');
const commandListener = require('./loadCommands');

const db = require('./db');

//Attach command listeners
commandListener(client, db);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('To invite to server visit https://discordapp.com/oauth2/authorize?client_id=' + client.user.id + '&scope=bot&permissions=0');
});

client.login(config.token);
