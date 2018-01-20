const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const chrono = require('chrono-node');
const yargs = require('yargs');

const diffUnits = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'];

// Data schema
const KirksHouse = new mongoose.Schema({
  time: {type: Number, required: true},
  name: {type: String, required: true},
  addedBy: {type: String, required: true},
  addedOn: {type: String, required: true},
  addedIn: {type: String, required: true},
  deleted: {type: Boolean, required: true},
  deletedOn: {type: Number},
  deletedBy: {type: String}
});

module.exports = {
  onStart: (client, db)=>{
    db.KirksHouse = db.model('KirksHouse', KirksHouse, 'rpEvents');
  },
  onCommand: async (msg, client, db)=>{
    const arguments = yargs.command('!clock [mode] [name] [time..]').parse(msg.content);
    const now = DateTime.local().valueOf();

    // Query
    if(!arguments.mode){
      const event = await db.KirksHouse.findOne({
        time: { $gt: now },
        addedIn: msg.channel.id,
        deleted: false
      }).sort('time').exec();

      if(!event)
        return msg.reply('Could not find any events');

      msg.reply(event.name + ' in ' + formatDiff(DateTime.fromMillis(event.time)));
    }

    // Add
    if(arguments.mode === 'add'){
      const name = arguments.name;
      const time = arguments.time.join(' ');
      const parsedTime = chrono.parseDate(time);
      const luxonObject = DateTime.fromJSDate(parsedTime);

      const event = new db.KirksHouse({
        time: luxonObject.valueOf(),
        name: name,
        addedBy: msg.author.id,
        addedOn: DateTime.local().valueOf(),
        addedIn: msg.channel.id,
        deleted: false
      })

      event.save((err)=>{
        if(err){
          msg.reply('Error adding "' + formatDiff(luxonObject) + '"');
          return console.log(err)
        }

        msg.reply('Added event "' + name + '" in ' + formatDiff(luxonObject));
      })
    }

    // Remove
    if(arguments.mode === 'remove'){
      if(!arguments.name)
        return msg.reply('You need to specify an event name');

      const event = await db.KirksHouse.findOne({
        name: arguments.name,
        time: { $gt: now },
        addedIn: msg.channel.id,
        deleted: false
      }).sort('time').exec();

      if(!event)
        return msg.reply('No event found by that name');

      event.deleted = true;
      event.deletedBy = msg.author.id;
      event.deletedOn = DateTime.local().valueOf();

      event.save((err)=>{
        if(err){
          msg.reply('Error removing event "' + arguments.name + '"');
          return console.log(err)
        }

        msg.reply('Removed event "' + arguments.name + '"');
      })
    }

    // List
    if(arguments.mode === 'list'){
      const now = DateTime.local().valueOf();

      const events = await db.KirksHouse.find({
        time: { $gt: now },
        addedIn: msg.channel.id,
        deleted: false
      });

      if(!events || !events.length)
        return msg.reply('Found no events');

      const eventNameLength = events.reduce((length, current)=>{
        if(current.name.length > length)
          return current.name.length;
        return length;
      }, 0);

      const pre = events.map(
        event=>event.name.padEnd(eventNameLength + 4) + DateTime.fromMillis(event.time).toLocaleString(DateTime.DATETIME_SHORT)
      ).join('\n');

      msg.reply('```' + pre + '```');
    }
  }
}

const formatDiff = (dateTime)=>{
  let timeUntil = dateTime.diffNow(diffUnits);
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
