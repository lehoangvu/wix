// console.log(require('config').get('mongo'))
var mongo = {
	db: null,
	connect: function() {
		return new Promise(function(resolve, reject) {
			const MongoClient = require("mongodb").MongoClient;

			// Connection URL
			const config = require('config').get('mongo');

			// Create a new MongoClient
			const client = new MongoClient(`mongodb+srv://${config.username}:${config.password}@${config.hostname}/${config.database}`, { useNewUrlParser: true, useUnifiedTopology: true });

			// Use connect method to connect to the Server
			client.connect(function(err) {
				if (err) {
					console.log(err);
					reject(err)
				} else {
					console.log("Connected successfully to server");
					mongo.db = client.db();
					resolve()
				}
			});
		})
	},
	getDb: function() {
		return mongo.db;
	}
}

module.exports = mongo