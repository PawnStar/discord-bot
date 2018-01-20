const schedule = require('node-schedule');
const chrono = require('chrono-node');
const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const yargs = require('yargs');

const diffUnits = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'];

const scheduledEvents = {};

/**
 * Date Schema
 */
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
  /**
   * Startup
   */
  onStart: async (client, db)=>{
    // Attach database model
    db.KirksHouse = db.model('KirksHouse', KirksHouse, 'rpEvents');

    // Schedule
    const now = DateTime.local().valueOf();
    const events = await db.KirksHouse.find({
      time: { $gt: now },
      deleted: false
    }).sort('time').exec();

    for(event of events){
      const channel = client.channels.get(event.addedIn);
      scheduleEventReminders(event, channel);
    }
  },

  /**
   * On command
   */
  onCommand: async (msg, client, db)=>{

    /**
     * Parse arguments with yargs
     */
    const arguments = yargs.command('!clock [mode] [name] [time..]').parse(msg.content);

    /**
     * Compute now
     */
    const now = DateTime.local().valueOf();

    /**
     * No arguments, query the next event
     */
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

    /**
     * Argument is add, insert a new one
     */
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

        scheduleEventReminders(event, msg.channel);

        msg.reply('Added event "' + name + '" in ' + formatDiff(luxonObject));
      })
    }

    /**
     * Argument is remove
     */
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

        removeEventReminders(event);

        msg.reply('Removed event "' + arguments.name + '"');
      })
    }

    /**
     * Argument is list
     */
    if(arguments.mode === 'list'){
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

/**
 * Helper formatting function
 */
const formatDiff = (dateTime, endTime)=>{
  let timeUntil = dateTime.diffNow(diffUnits);

  if(endTime)
    timeUntil = endTime.diff(dateTime, diffUnits);

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

/**
 * Helper scheduling function
 */
const scheduleEventReminders = (event, channel)=>{
  const eventTime = DateTime.fromMillis(event.time);
  const reminders = [
    eventTime.minus({ days: 1 }),
    eventTime.minus({ hours: 2 }),
    eventTime.minus({ hours: 1 }),
    eventTime.minus({ minutes: 30 }),
    eventTime.minus({ minutes: 20 }),
    eventTime.minus({ minutes: 10 }),
    eventTime.minus({ minutes: 5 }),
    eventTime.minus({ seconds: 60 }),
    eventTime.minus({ seconds: 30 }),
    eventTime.minus({ seconds: 20 }),
    eventTime.minus({ seconds: 10 }),
    eventTime.minus({ seconds: 3 }),
    eventTime.minus({ seconds: 2 }),
    eventTime.minus({ seconds: 1 })
  ];

  let scheduledReminders = reminders.map(date=>{
    const diff = formatDiff(date, eventTime);
    return schedule.scheduleJob(date.toJSDate(), ()=>{
      channel.send(event.name + " in " + diff);
    })
  }).filter(reminder=>reminder!=null);

  scheduledReminders.push(schedule.scheduleJob(eventTime.toJSDate(), ()=>{
    channel.send(event.name + " now!");
  }));

  scheduledEvents[event._id] = scheduledReminders;
}

const removeEventReminders = (event)=>{
  const reminders = scheduledEvents[event._id];

  for(reminder of reminders){
    reminder.cancel();
  }
}
