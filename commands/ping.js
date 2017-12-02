module.exports = msg=>{
  if (msg.content === '!ping') {
    msg.reply('Pong!');
  }
}
