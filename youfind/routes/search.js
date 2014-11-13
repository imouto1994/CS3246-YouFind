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
	var start = new Date();
	request(options, function(error, response, body){

		var end = new Date();
		console.log("Image search time:\t"+(end - start)+" ms");

		res.writeHead(200, {'Content-Type':'text/html'});
		res.write(body);
		res.end();
	})
});

module.exports = router;
