const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const diffUnits = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'];

// Data schema
const KirksHouse = new mongoose.Schema({
  time: {type: Number, required: true},
  addedBy: {type: String, required: true},
  addedOn: {type: String, required: true},
  deleted: {type: Boolean, required: true},
  deletedOn: {type: Number},
  deletedBy: {type: String}
});

module.exports = {
  onStart: (client, db)=>{
    db.kirksHouse = db.model(KirksHouse)
  },
  onCommand: async (msg, client, db)=>{
    const args = msg.content.split(' ');

    // Make sure we got called for the right command
    if(msg.content[0] !== '!clock') return;

    // Query
    if(!msg.content[1]){

    }

    // Add
    if(msg.content[1] === 'add')
      console.log('add')

    // Remove

    // List
  }
}

module.exports = (msg, client)=>{
  if(msg.content !== '!clock') return;

  const thisThursday = DateTime.fromObject({
    weekNumber: DateTime.local().weekNumber,
    weekday: 4,
    hour: 18,
    minute: 30
  })

  let timeUntil = thisThursday.diffNow(diffUnits);

  if(timeUntil.as('seconds') < 0)
    timeUntil = thisThursday.plus({days: 7}).diffNow(diffUnits).normalize();

  let messageString = ""

  if(timeUntil.days)
    messageString += timeUntil.days + " day";
  if(timeUntil.days > 1)
    messageString += "s";

  if(timeUntil.hours)
    messageString += " " + timeUntil.hours + " hour";
  if(timeUntil.hours > 1)
    messageString += "s";

  if(timeUntil.minutes)
    messageString += " " + timeUntil.minutes + " minute";
  if(timeUntil.minutes > 1)
    messageString += "s";

  if(timeUntil.seconds)
    messageString += " " + timeUntil.seconds + " second";
  if(timeUntil.seconds > 1)
    messageString += "s";

  msg.reply(messageString + " from now at Kirk's place it is then");
}
