var express = require('express');
var router = express.Router();
var auth = require('./utils/auth');

router.use('/token', require('./controllers/Token'))
router.use('/me', auth.protect() , require('./controllers/Me'))
router.use('/site', auth.protect() , require('./controllers/Site'))
router.use('/site/config', auth.protect() , require('./controllers/Site/config'))
router.use('/page', auth.protect() , require('./controllers/Page'))
router.use('/media', auth.protect() , require('./controllers/Media'))
router.use('/file', auth.protect() , require('./controllers/File'))

module.exports = router;