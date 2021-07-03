var express = require('express');
var config = require('config');
var validator = require('validator');
var router = express.Router();
var mongo = require('./../../mongo');
var nanoid = require('nanoid');
var File = require('./../../libs/File');

const LIMIT = 10;


router.post('/', async function(req, res) {
  const db = mongo.getDb(); 
  let {
    file_id,
    page_id,
    name,
    content
  } = req.body;

  let errors = [];
  let status = 400;

  if(!file_id) {
    status = 400;
    errors.push({field: "file", message: "Không tìm thấy file"});
  }

  if(file_id) {
    let qrs = await db.collection('wix_files').findOne(
    {
      id: file_id,
    });
    if(!qrs) {
      status = 400;
      errors.push({field: "file", message: "Không tìm thấy file"});
    }
  }

  if(file_id && page_id && name) {
    let qrs2 = await db.collection('wix_file_pages').findOne(
    {
      name: name,
      page_id,
      file_id: {$ne: file_id}
    });
    if(qrs2) {
      status = 400;
      errors.push({field: "name", message: "Tên file đã được sử dụng"});
    }
  }

  if(errors.length == 0) {
    File.update(file_id, name, content)
    .then(async id => {
      let qrs3 = await db.collection('wix_file_pages').updateOne(
      {
        file_id: file_id,
        page_id: page_id,
        user_id: req.auth.user_id
      },
      {$set: {
        name: name
      }});
      if(qrs3.modifiedCount == 1 || qrs3.matchedCount == 1) {
        return res.send({
          success: true
        })
      } else {
        res.status(400).send({
          errors: ['Có lỗi sảy ra!']
        })
      }
    })
    .catch(err => {
      console.log(err)
      if(err.field) {
        // has error when insert
        status = 400;
        errors.push(err);
      }

      res.status(status).json({errors})
    })

  } else {
    res.status(status).json({errors})
  }
})

router.put('/', async function(req, res) {
  const db = mongo.getDb(); 
  let {
    page_id,
    name,
    content
  } = req.body;

  let errors = [];
  let status = 400;

  if(!page_id) {
    status = 400;
    errors.push({field: "page", message: "Không tìm thấy trang"});
  }

  if(page_id) {
    let qrs = await db.collection('wix_pages').findOne(
    {
      id: page_id,
      user_id: req.auth.user_id
    });
    if(!qrs) {
      status = 400;
      errors.push({field: "page", message: "Không tìm thấy trang"});
    }
  }

  if(page_id && name) {
    let qrs2 = await db.collection('wix_file_pages').findOne(
    {
      name: name,
      page_id
    });
    if(qrs2) {
      status = 400;
      errors.push({field: "name", message: "Tên file đã được sử dụng"});
    }
  }

  if(errors.length == 0) {
    File.create(name, content)
    .then(async id => {
      let qrs3 = await db.collection('wix_file_pages').insertOne(
      {
        name: name,
        page_id,
        user_id: req.auth.user_id,
        file_id: id,
        id: nanoid(6)
      });
      if(qrs3.insertedCount === 1) {
        return res.send({
          success: true,
          id,
          name: name,
          content
        })
      } else {
        res.status(400).send({
          errors: ['Có lỗi sảy ra!']
        })
      }
    })
    .catch(err => {
      if(err.field) {
        // has error when insert
        status = 400;
        errors.push(err);
      }

      res.status(status).json({errors})
    })

  } else {
    res.status(status).json({errors})
  }
})
router.get('/', async function(req, res) {
  const {id} = req.query;
  if(!id) {
    res.status(500).json("Không tìm thấy file")
  }

  let qrs = await mongo.getDb().collection('wix_file_pages').findOne({
    user_id: req.auth.user_id,
    file_id: id
  })
  if(qrs) {
    let file = await File.read(qrs.file_id)
    if(file) {
      return res.json({
        id: file.id,
        content: file.content,
        name: file.name,
        removeable: file.removeable
      })
    }
  }
  res.status(400).json({
    errors: ['File không tồn tại hoặc bị xóa']
  })
})

router.delete('/', async function(req, res) {
  const {id} = req.query;
  if(!id) {
    res.status(500).json("Không tìm thấy file")
  }

  let qrs = await mongo.getDb().collection('wix_file_pages').deleteOne({
    user_id: req.auth.user_id,
    removeable: {$ne: false},
    file_id: id
  })
  if(qrs.deletedCount == 1) {
    let removed = await File.remove(id)
    if(removed) {
      return res.send({
        success: true
      })
    }
  }
  res.status(400).json({
    errors: ['File không tồn tại hoặc bị xóa']
  })
})

module.exports = router;