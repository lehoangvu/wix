var express = require('express');
var router = express.Router();
var mongo = require('./../../mongo')
router.get('/', async function(req, res) {
	// get site
	let sites = await (await mongo.getDb().collection('wix_sites').find({
	    user_id: req.auth.user_id
	  }).sort({_id: -1})).toArray();

	let info = {...req.auth}
	delete info.iat

  res.json({
  	...info, 
  	sites
  })
})

module.exports = router;



router.get('/', async function(req, res) {
  const limit = req.query.limit ? parseInt(req.query.limit) : LIMIT;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  let qrs = await mongo.getDb().collection('wix_sites').find({
    user_id: req.auth.user_id
  }).sort({_id: -1}).limit( limit || LIMIT ).skip( ((page || 1) - 1) * limit )

  let data = (await qrs.toArray()).map(item => {
    return {
      id: item.id,
      domain: item.domain,
    };
  })

  let totalResult = await mongo.getDb().collection('wix_sites').countDocuments({
    user_id: req.auth.user_id
  });

  let results = {
    data,
    total: totalResult
  }

  res.send(results)
})