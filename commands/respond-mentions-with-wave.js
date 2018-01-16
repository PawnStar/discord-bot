module.exports = {
  //onStart(client)
  onStart: null,
  onCommand: null,
  onMessage: (msg, client)=>{
    if(msg.isMentioned(client.user))
      return msg.reply(':wave:');
  }
}
