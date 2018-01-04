const config = require('../config.json');
const child_process = require('child_process');
var path = require('path');

var childProcess = null;

var gamesInProgress = {};

//Todo: make this work?

module.exports = msg=>{
  const split = msg.content.indexOf(' ');
  let command;

  if(split < 0)
    command = '';
  else
    command = msg.content.slice(split + 1);

  if(!gamesInProgress[msg.channel.id])
    startGame(msg.channel);
  else
    writeGame(msg.channel, command);
}

function writeGame(channel, command){
  try{
    const childProcess = gamesInProgress[channel.id];
    const stream = childProcess.stdin;

    if(command === 'exitGame'){
      channel.send('Closing game');
      gamesInProgress[channel.id] = null;
      return childProcess.kill('SIGKILL');
    }

    stream.write(command + ' \n');
  } catch (ex) {
    channel.send('Oops!  Game crashed.');
  }
}

function startGame(channel){
  const gamePath = path.join(__dirname, './ifvms/runGame.js');

  channel.send('Opening game "Galatea" by Emily Short . . .');

  childProcess = child_process.fork(gamePath, [], {stdio: 'pipe'});
  childProcess.stdout.on('data', data=>{
    if(data.toString('ascii').trim !== '')
      channel.send(data.toString('ascii'));
  })

  gamesInProgress[channel.id] = childProcess;

  childProcess.stdin.write(' \n');
}
