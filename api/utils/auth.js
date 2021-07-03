const mongo = require('../mongo');
const jwt = require('jsonwebtoken');
const config = require("config"); 

const sign = (payload) => {
	return jwt.sign(payload, config.get("secret"));
}
const verify = (token) => {
	return jwt.verify(token, config.get("secret"));
}

module.exports = {
	protect: () => async (req, res, next) => {
		try{
			let token = req.headers['x-auth'];
			const data = verify(token);
			if(data.user_id) {
				// get user
				let dbUser = await mongo.getDb().collection('wix_users').findOne({
					id: data.user_id
				})

				if(dbUser) {
					// get site
					// let dbSite = await mongo.getDb().collection('wix_sites').findOne({
					// 	user_id: dbUser.id
					// })
					// if(dbSite) {
					// 	req.site = dbSite;
					// }
					req.auth = {username: dbUser.username, ...data};
					return next();
				}
			}
			res.status(401).send('Unauthorize')
		} catch(e) {
			console.log(e)
			res.status(401).send('Unauthorize')
		}
	},
	sign,
	verify
}
