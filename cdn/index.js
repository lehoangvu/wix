let express = require("express");
let app = express();
let mongo = require("./mongo");
let utils = require('./libs')

const _404 = res => {
	res.status(404).send('404 fucking page!')
}

app.get("/:site_id/:page_id/:version/:name", async function(req, res) {
	try {
		const { site_id, page_id, version, name } = req.params
		let file = await mongo.getDb().collection('wix_release').findOne({
			site_id,
			page_id,
			version: parseInt(version),
			name
		})
		let contentType = utils.getFileContentType(file.name)
		res.set('content-type', contentType)
		res.send(file.content)
	} catch(e) {
		console.log(e)
		return _404(res)
	}
})

module.exports = {
	app,
	prepare: async () => {
		return mongo.connect()
	}
}