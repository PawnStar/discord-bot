const { DateTime } = require('luxon');

const config = require('../config.json');
const diffUnits = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'];

module.exports = (msg, clock)=>{
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
