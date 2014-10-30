var GOOGLE_API_KEY = "AIzaSyDKWii3FU-kCZtQSH7hE-G_luT7dPiwCZg"

googleApiClientReady = function() {
	function loadYoutubeDataApi(){
		gapi.client.load('youtube', 'v3', function() {
			console.log("Load Youtube API successfully")
  		});
	}
	console.log('API Client Ready');
	gapi.client.setApiKey(GOOGLE_API_KEY);
	loadYoutubeDataApi();
}
