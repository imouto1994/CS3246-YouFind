var request = require('request');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
	
	var searchURL = req.query.searchURL;
	var options = {
		url: searchURL,
		method: "GET",
		headers:{
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
		},
		followRedirect: true,
		followAllRedirects: false,
		maxRedirects: 3
	}
	request(options, function(error, response, body){
		res.writeHead(200, {'Content-Type':'text/html'});
		res.write(body);
		res.end();
	})
});

module.exports = router;
