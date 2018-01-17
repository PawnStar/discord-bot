module.exports = {
  //onStart(client)
  onStart: null,
  onCommand: null,
  onMessage: (msg, client)=>{
    if(!msg.isMentioned(client.user))
      return;
    if(msg.content.trim().substr(-1) === '?'){
      msg.handled = true;
      msg.reply(Math.random() < .5 ? 'Yes' : 'No')
      return false;
    }
  }
}
