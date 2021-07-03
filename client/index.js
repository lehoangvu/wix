let express = require("express");
let app = express();
let mongo = require("./mongo");

const _404 = res => {
	res.status(404).send('404 fucking page!')
}

const getFile = async function(id) {
	let db = mongo.getDb()
	return await db.collection('wix_files').findOne({id})
}

const getSizeFromHostName = async function(hostname) {
	let db = mongo.getDb();
	let site = null;
	if(hostname.indexOf('.mywish.com') != -1) {
		return await db.collection('wix_sites').findOne({domain: hostname})
		return site;
	} else {
		let domain = await db.collection('wix_site_domain').findOne({domain: hostname})
		if(domain) {
			return await db.collection('wix_sites').findOne({id: domain.site_id})
		}
	}
}

app.use(async (req, res, next) => {
	let {hostname, path} = req
	let db = mongo.getDb();
	// get site
	const site = await getSizeFromHostName(hostname);
	
	if(!site) {
		return _404(res)
	}

	console.log(path)

	let indexFile = (await (await db.collection('wix_release').find({
				site_id: site.id,
				path,
				name: 'index.html'
			}).sort({version: -1})).toArray())[0]
	
	if(!indexFile) {
		return _404(res)
	}

	res.send(indexFile.content)

})



module.exports = {
	app,
	prepare: async () => {
		return mongo.connect()
	}
}