var express = require('express');
var config = require('config');
var axios = require('axios');
var md5 = require('md5');
var validator = require('validator');
var router = express.Router();
var mongo = require('./../../mongo');
var nanoid = require('nanoid');
var auth = require('./../../utils/auth');

router.put('/', async function(req, res) {
  const { username, password, email } = req.body;
  let errors = [];
  let status = 400;
  if(!email || !validator.isEmail(email)) {
  	status = 400;
  	errors.push({field: 'email', message: "Email không hợp lệ"});
  }
  if(!username || validator.isEmpty(username)) {
  	status = 400;
  	errors.push({field: 'username', message: "Username không được trống"});
  }
  if(!password || validator.isEmpty(password) || password.length < 8) {
  	status = 400;
  	errors.push({field: 'password', message: "Mật khẩu không được trống hoặc ngắn hơn 8 ký tự"});
  }
  // if has no input error, check db customer exist
  if(errors.length === 0) {
  	let existUser = await mongo.getDb().collection('wix_users').findOne({
  		email
  	})
  	if(existUser) {
  		status = 400;
  		errors.push({field: 'email', message: "Email đã được sử dụng"});
  	}
  }

	if(errors.length === 0) {
		// create user
		let user = {
			id: nanoid(10),
			username, email, password: md5(password), createdAt: (new Date()).getTime()
		}
		let qr = await mongo.getDb().collection('wix_users').insertOne(user);
		if(qr.insertedCount === 1) {
			res.send({
				token: auth.sign({user_id: user.id, email: user.email})
			});
		}
	} else {
		res.status(status).json({errors})
	} 

})

router.post('/', async function(req, res) {
  const { password, email } = req.body;
  let errors = [];
  let status = 400;
  if(!email || !validator.isEmail(email)) {
  	status = 400;
  	errors.push({
      field: "email",
      message: "Email không hợp lệ"
    });
  }
  if(!password || validator.isEmpty(password)) {
  	status = 400;
  	errors.push({
      field: "password",
      message: "Mật khẩu không được trống"
    });
  }
  // if has no input error, check db customer exist
  if(errors.length === 0) {
  	let existUser = await mongo.getDb().collection('wix_users').findOne({
  		email,
  		password: md5(password)
  	})
  	if(existUser) {
  		res.send({
				token: auth.sign({user_id: existUser.id, email: existUser.email})
			});
  	} else {
  		status = 404;
  		errors.push({
        field: "email",
        message: "Thông tin đăng nhập không đúng"
      });
  	}
  }
  res.status(status).json({errors})
})

module.exports = router;