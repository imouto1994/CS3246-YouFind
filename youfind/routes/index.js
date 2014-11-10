var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	var url = require('url');
 	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	res.render('index', { title: 'Express',  imageUrl:query.imageUrl });
});

module.exports = router;
