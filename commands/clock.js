const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const chrono = require('chrono-node');

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
    db.KirksHouse = db.model('KirksHouse', KirksHouse, 'rpEvents');
  },
  onCommand: async (msg, client, db)=>{
    const args = msg.content.split(' ');

    // Make sure we got called for the right command
    if(args[0] !== '!clock') return;

    // Query
    if(!args[1]){
      return oldStuff(msg, client);
    }

    // Add
    if(args[1] === 'add'){
      const time = args.slice(2).join(' ');
      const parsedTime = chrono.parseDate(time);
      const luxonObject = DateTime.fromJSDate(parsedTime);

      const event = new db.KirksHouse({
        time: luxonObject.valueOf(),
        addedBy: msg.author.id,
        addedOn: DateTime.local().valueOf(),
        deleted: false
      })

      event.save((err)=>{
        if(err){
          msg.reply('Error adding "' + formatDiff(luxonObject) + '"');
          return console.log(err)
        }

        msg.reply('Added "' + formatDiff(luxonObject) + '" as ' + event._id);
      })
    }

    // Remove (dunno how to do this)
    if(args[1] === 'remove'){
      if(!args[2])
        return msg.reply('You need to specify an event id');

      const event = await db.KirksHouse.findOne({_id: args[2], deleted: false});
      if(!event)
        return msg.reply('No event found by that id');

      event.deleted = true;
      event.deletedBy = msg.author.id;
      event.deletedOn = DateTime.local().valueOf();

      event.save((err)=>{
        if(err){
          msg.reply('Error removing event ' + args[2]);
          return console.log(err)
        }

        msg.reply('Removed event ' + args[2]);
      })
    }

    // List
    if(args[1] === 'list'){

    }
  }
}

const formatDiff = (dateTime)=>{
  let timeUntil = dateTime.diffNow(diffUnits);

  console.log(dateTime);
  console.log(DateTime.local());

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

  return messageString.trim();
}
