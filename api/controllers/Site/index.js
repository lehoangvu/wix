var express = require('express');
var config = require('config');
var validator = require('validator');
var router = express.Router();
var mongo = require('./../../mongo');
var nanoid = require('nanoid');

const default_domain = config.get('default_domain')

const LIMIT = 10;
  
router.post('/', async function(req, res) {
  const {
    domain,
    siteId
  } = req.body;
  let errors = [];
  let status = 400;
  if(!domain || !validator.isFQDN(`${domain}${default_domain}`)) {
    status = 400;
    errors.push("Domain không hợp lệ");
  }
  if(!siteId) {
    status = 400;
    errors.push("Không tìm thấy site");
  }

  if(errors.length == 0) {
    const db = mongo.getDb();
    // update site
    let site = {
      domain,
      updatedAt: (new Date()).getTime(),
    };
    let rs = await db.collection('wix_sites').updateOne({
      id: siteId
    }, {
      $set: site
    })
    if(rs.modifiedCount == 1 || rs.matchedCount == 1) {
      return res.send({
        success: true
      })
    }
    if(errors.length === 0) {
      // has error when insert
      status = 400;
      errors.push("Không tìm thấy site!");
      res.status(status).json({errors})  
    }
  } else {
    res.status(status).json({errors})
  }
})
router.put('/', async function(req, res) {
  const {
    domain
  } = req.body;

  let errors = [];
  let status = 400;
  if(!domain || !validator.isFQDN(`${domain}${default_domain}`)) {
    status = 400;
    errors.push({field: "domain", message: "Domain không hợp lệ"});
  }

  const db = mongo.getDb();

  if(errors.length == 0) {
    let qr = await db.collection('wix_sites').findOne(
    {
      domain,
      user_id: req.auth.user_id
    });
    if(qr) {
      status = 400;
      errors.push({field: "domain", message: "Domain đã được sử dụng"});
    }
  }

  if(errors.length == 0) {
    // add site
    let site = {
      id: nanoid(10),
      user_id: req.auth.user_id,
      domain,
      createdAt: (new Date()).getTime(),
    };
    let rs = await db.collection('wix_sites').insertOne(site)
    if(rs.insertedCount == 1) {
      return res.send({
        success: true
      })
    }
    if(errors.length === 0) {
      // has error when insert
      status = 400;
      errors.push("Có lỗi xảy ra!");
    }

    res.status(status).json({errors})  
  } else {
    res.status(status).json({errors})
  }
})
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

module.exports = router;