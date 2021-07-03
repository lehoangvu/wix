var express = require('express');
var config = require('config');
var validator = require('validator');
var router = express.Router();
var mongo = require('./../../mongo');
var nanoid = require('nanoid');
var isEmpty = require('lodash/isEmpty');

router.get('/:siteId', async function(req, res) {
  let { siteId } = req.params;
  // get site
  let site = await mongo.getDb().collection('wix_sites').findOne({
    user_id: req.auth.user_id,
    id: siteId
  })
  if(!site) {
    // get config
    return res.status(404).json({error: "Không tìm thấy site"})
  }
  let config = await mongo.getDb().collection('wix_site_config').findOne({
    site_id: siteId
  })
  if( isEmpty(config) ) {
    config = {
      // write default config here

    }
  }

  // remove id in responnse
  delete config._id

  return res.json({
    config
  })
})
router.get('/:siteId/domain', async function(req, res) {
  let { siteId, domainId } = req.query;
  const db = mongo.getDb()
  let domains = await (await db.collection('wix_site_domain').find({
      siteId,
    }).sort({created_at: -1})).toArray()

  res.json({
    data: domains.map(item => {
      delete item._id
      return item
    })
  })
})
router.post('/:siteId/domain', async function(req, res) {
  const db = mongo.getDb()
  let { siteId } = req.params;
  let { domain, domainId } = req.body;

  // validate with regex
  let regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  if(regex.test(domain)) {
    res.status(400)
    return res.json({
      errors: [
        {
          field: "domain",
          message: "Domain không hợp lệ(không bao gồm http/https: vd: abc.com)"
        }
      ]
    })
  }


  // get site
  let site = await db.collection('wix_sites').findOne({
    user_id: req.auth.user_id,
    id: siteId
  })
  if(!site) { 
    return res.status(404).json({error: "Không tìm thấy site"})
  }

  // find with domain 
  let domainExist = await db.collection('wix_site_domain').findOne({
    site_id: siteId,
    domain
  })
  if(domainExist) {
    return res.status(500).json({error: "Domain đã được sử dụng"})
  }

  // insert to db
  db.collection('wix_site_domain').updateOne({
    id: domainId
  }, {
    $set: {
      domain,
      updated_at: new Date().getTime()
    }
  })

  res.json({
    domain
  })
})
router.put('/:siteId/domain', async function(req, res) {
  const db = mongo.getDb()
  let { siteId } = req.params;
  let { domain } = req.body;

  // validate with regex
  let regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
  if(!regex.test(domain)) {
    res.status(400)
    return res.json({
      errors: [
        {
          field: "domain",
          message: "Domain không hợp lệ(không bao gồm http/https: vd: abc.com)"
        }
      ]
    })
  }


  // get site
  let site = await db.collection('wix_sites').findOne({
    user_id: req.auth.user_id,
    id: siteId
  })
  if(!site) { 
    return res.status(404).json({errors: [{field: "domain", message: "Không tìm thấy site"}]})
  }

  // find with domain 
  let domainExist = await db.collection('wix_site_domain').findOne({
    site_id: siteId,
    domain
  })
  if(domainExist) {
    return res.status(500).json({errors: [{field: "domain", message: "Domain đã được sử dụng"}]})
  }

  // insert to db
  db.collection('wix_site_domain').insertOne({
    site_id: siteId,
    domain,
    id: nanoid(6),
    created_at: new Date().getTime(),
    updated_at: new Date().getTime()
  })

  res.json({
    domain
  })

})

router.delete('/:siteId/domain', async function(req, res) {
  const db = mongo.getDb()
  let { siteId } = req.params;
  let { ids } = req.body;
  
  // get site
  let site = await db.collection('wix_sites').findOne({
    user_id: req.auth.user_id,
    id: siteId
  })

  if(!site) { 
    return res.status(404).json({error: "Không tìm thấy site"})
  }

  let qrs = await mongo.getDb().collection('wix_site_domain').deleteMany({
    id: {$in: ids}
  })
  if(qrs.deletedCount == ids.length) {
    res.send({success: true})
  } else {
    return res.status(404).json({error: "Có lỗi khi xóa tên miền"})
  }

})

module.exports = router;