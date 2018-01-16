const mongoose = require('mongoose');

/**
 * Database
 */
var dbUrl = process.env.MONGOHQ_URL || 'mongodb://localhost/aoede';
var connection = mongoose.createConnection(dbUrl);
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {
	console.log('connected to database')
});

module.exports = connection;
