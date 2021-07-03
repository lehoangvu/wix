var express = require('express');
var config = require('config');
var validator = require('validator');
var router = express.Router();
var mongo = require('./../../mongo');
var nanoid = require('nanoid');

const LIMIT = 20;

router.delete('/', async function(req, res) {
  const db = mongo.getDb(); 
  let {
    id
  } = req.body;

  let errors = [];
  let status = 400;

  if(!id) {
    status = 400;
    errors.push({field: "url", message: "Id không hợp lệ"});
  }

  if(errors.length == 0) {
    let rs = await db.collection('wix_contacts').deleteOne({
      id,
      user_id: req.auth.user_id
    })
    console.log(rs)
    // if(rs.modifiedCount == 1 || rs.matchedCount == 1) {
      return res.send({
        success: true
      })
    // }
    if(errors.length === 0) {
      // has error when insert
      status = 400;
      errors.push("Có lỗi sảy ra!");
      res.status(status).json({errors})  
    }
  } else {
    res.status(status).json({errors})
  }
})

router.put('/', async function(req, res) {
  const db = mongo.getDb(); 
  let {
    url,
    siteId
  } = req.body;

  let errors = [];
  let status = 400;

  if(!url) {
    status = 400;
    errors.push({field: "url", message: "Url không hợp lệ"});
  }

  if(!siteId) {
    status = 400;
    errors.push({field: "site", message: "Không tìm thấy site"});
  }

  if(siteId) {
    let qrs = await db.collection('wix_sites').findOne(
    {
      id: siteId,
      user_id: req.auth.user_id
    });
    if(!qrs) {
      status = 400;
      errors.push({field: "site", message: "Không tìm thấy site"});
    }
  }

  if(errors.length == 0) {
    let qr = await db.collection('wix_contacts').findOne(
    {
      url,
      site_id: siteId,
      user_id: req.auth.user_id
    });
    if(qr) {
      status = 400;
      errors.push({field: "url", message: "Url đã được sử dụng"});
    }
  }

  if(errors.length == 0) {
    let media = {
    	id: nanoid(10),
      user_id: req.auth.user_id,
      site_id: siteId,
    	url,
    	createdAt: (new Date()).getTime()
    }
    let rs = await db.collection('wix_contacts').insertOne(media)
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

  let {siteId} = req.query

  if(!siteId) {
    res.status(500).json("Không tìm thấy site")
  }

  let qrs = await mongo.getDb().collection('wix_contacts').find({
    user_id: req.auth.user_id,
    site_id: siteId
  }).sort({_id: -1}).limit( limit || LIMIT ).skip( ((page || 1) - 1) * limit )

  let data = (await qrs.toArray()).map(item => {
    return {
      id: item.id,
      url: item.url,
      createdAt: item.createdAt
    };
  })

  let totalResult = await mongo.getDb().collection('wix_contacts').countDocuments({
    user_id: req.auth.user_id,
    site_id: siteId
  });

  let results = {
    data,
    total: totalResult
  }

  res.send(results)
})
router.get('/:siteId', async function(req, res) {
  let {siteId} = req.params
  if(!siteId) {
    res.status(500).json("Không tìm thấy site")
  }

  let page = await mongo.getDb().collection('wix_').findOne({
    user_id: req.auth.user_id,
    site_id: siteId,
    id: pageId
  })
  if(page) {
    let fileQr = await mongo.getDb().collection('wix_file_pages').find({
      page_id: pageId
    }).sort({_id: -1})
    let files = await fileQr.toArray();
    page.files = []
    page.files = files.map(file => ({
      id: file.file_id,
      name: file.name
    }))

    // remove stuff
    delete page._id;
    // delete page.site_id;
    delete page.user_id;

    return res.json(page)
  } else {
    return res.status(400).json({
      errors: ["Không tìm thấy trang"]
    })
  }
})

module.exports = router;