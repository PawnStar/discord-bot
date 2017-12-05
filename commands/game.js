const config = require('../config.json');

var childProcess = null;

//Todo: make this work?

module.exports = msg=>{
  const split = msg.content.indexOf(' ');
  let command;

  if(split < 0)
    command = '';
  else
    command = msg.content.slice(split + 1);

  if(!childProcess)
    startGame();
}


function startGame(){

}
