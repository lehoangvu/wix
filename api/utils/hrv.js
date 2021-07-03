const axios = require('axios');
const mongo = require('./../mongo');

module.exports = {
	getService(shop) {
		return new Promise(function(resolve, reject) {
			const db = mongo.getDB();
			db.collection('hrv_site').findOne({
				shop: shop
			}, function(err, result) {
				if(err || result == null) {
					return reject('Cannot get shop info.')
				}
				let caller = (service, options = {}) => {
					return axios({
						headers: {
							'Authorization': `Bearer ${result.access_token}`,
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						baseURL: `https://${result.shop}/admin/`,
						url: `${service}.json`,
						...options
					})
				}
				resolve(caller)
			})
		})
	},
}