const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');
const sendMessage = require('./messages');

let timeout;

const getRandomMinutes = (min,max)=>Math.floor((Math.random() * (max - min) + min) * 60000);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const target = client.channels.get(config.target);

  if(!target){
    console.log("Could not log into target channel.");
    process.exit(1);
  }

  client.on('message', message=>{
    if(message.channel != target)
      return;
    console.log("Message: " + message);
  });

  const checkChannel = ()=>{
    //const waitTime = getRandomMinutes(15,500);
    const waitTime = 10000;

    console.log("Waiting " + waitTime/1000 + " seconds");

    setTimeout(()=>{
      const people = target.recipients;// .filter(person=>person.presence.status === 'online');

      const user = people.random();
      if(!user){
        console.log("Nobody in channel");
        return checkChannel();
      }

      sendMessage(target, user).then(checkChannel);

    }, waitTime);
  }

  checkChannel();
});

client.login(config.token);

client.on('error', console.log);
