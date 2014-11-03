var App = App || {};

App.main = (function(){
	var hasSwitchedToSecondView = false
 	var currentImageURL = null;
	var english = /^[A-Za-z0-9]*$/;

 	/* Reconfigure text field for search field after switching view */
	function configureTextField(input){
		setTimeout(function(){
			window.fancyInput.setCaretHeight(input);
			window.fancyInput.inputResize(input);
		}, 200);
	}

	/* Read uploaded image */
	function readImage(input) {
		if ( input.files && input.files[0] ) {
	        var FR= new FileReader();
	        FR.onload = function(e) {
	        	var uploadedImageData = e.target.result.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "");
	        	$.ajax({
	        		url: 'https://api.imgur.com/3/image',
	        		type: 'POST',
	        		headers: {
	        			Authorization: 'Client-ID 33f456285414f75',
	        			Accept: 'application/json'
	        		},
	        		data: {
	        			image: uploadedImageData,
	        			type: 'base64'
	        		},
	        		dataType: 'JSON',
	        		success: function(json){
	        			currentImageURL = json.data.link;
	        			App.modal.removeAllModals();
	        		},
	        		error: function(json){
	        			// TODO: add notifications to user
	        			console.log("Cannot upload image");
	        		}
	        	})
	        };       
	        FR.readAsDataURL( input.files[0] );
    	}
	}

	/* Switch from initial view to second view */
	function switchToSecondView(input){
		if(!hasSwitchedToSecondView){
			var headerElement = $('.youfind-header');
			var textFieldElement = $('.text-field-1');
			$(headerElement).removeClass('youfind-header');
			$(headerElement).addClass('youfind-header-2');
			$(textFieldElement).removeClass('text-field-1');
			$(textFieldElement).addClass('text-field-2');
			configureTextField(input);
			hasSwitchedToSecondView = true;
		}
	}

	/* Check if image URL does exist */
	function imageExists(url, callback) {
	  	var img = new Image();
	  	img.onload = function() { callback(true); };
	  	img.onerror = function() { callback(false); };
	  	img.src = url;
	}

	function search() {
		console.log('Start searching');
		if(currentImageURL == null){
			console.log('There has not been any uploaded image');
			return;
		}
		processImageSearch();
	}

	function processImageSearch() {
		var googleImageSearchURL = 'https://images.google.com/searchbyimage?site=search&image_url=' + currentImageURL;
		var termScoresList = [];
		var termsList = [];	
		
		$.ajax({
			url: '/search',
			type: 'GET',
			data: {
				searchURL: googleImageSearchURL
			},
			beforeSend: function() {
				$('.grid ul').empty();
				$('.grid').html('<i class="fa fa-circle-o-notch fa-spin"></i>');
			},
			success: function(data) {
				extractTerms(data);
				searchVideos();
			},
			error: function(data) {
				console.log(data);
			}
		});

		function searchVideos(terms) {
			var str = ""
			for(var i = 0; i < termScoresList.length && i < 5; i++){
				if(termScoresList[i].score > 10){
					str += termScoresList[i].term + " ";
				}
			}
			var textQueryTerms = $('.fancyInput').text().trim().split('\\s+');
			for(term in textQueryTerms){
				if(str.indexOf(textQueryTerms[term]) == -1){
					str += textQueryTerms[term] + " ";
				}
			}
			console.log("Query String: " + str);
			var request = gapi.client.youtube.search.list({
				part: 'snippet',
				q: str.trim(),
				maxResults: 10,
				order: 'relevance',
				type: 'video',
			});
			request.execute(function(response) {
				var result = response.result;
				videos = []
				for(index in result.items){
					item = result.items[index];
					video = {};
					video.id = item.id.videoId;
					video.title = item.snippet.title;
					video.description = item.snippet.description;
					video.thumbnail = item.snippet.thumbnails.medium.url;
					videos.push(video);
				}
				displayResults(videos);
			});
		}

		function displayResults(videos){
			$('.grid').html('<ul></ul>');
			for(index in videos){
				video = videos[index];
				html  = '<li><figure>'
				html += '<a href="https://www.youtube.com/watch?v=' + video.id + '" target="_blank">'
				html += '<img src="' + video.thumbnail + '"></a></figure></li>';
				$('.grid ul').append(html);
			}
		}

		function extractTerms(data) {
			var start = new Date();				
			var bestGuess = $(data).find(".qb-b").text();
			var searchResult = $(data).find(".srg");

			var tokenizedBestGuess = tokenizeText(bestGuess);
			appendToTermScoreList(tokenizedBestGuess, 5)

			$(searchResult).find('.rc').each(function(){
				var title = $(this).find('.r').text();
				var content = $(this).find('.st').text();

				//only consider English webpage
				if(!isEnglish(title)) return;

				var tokenizedTitle = tokenizeText(title);
				var tokenizedContent = tokenizeText(content);

				//add filtered terms to a final array
				appendToTermScoreList(tokenizedTitle, 3);
				appendToTermScoreList(tokenizedContent, 1, true);

				console.log(title);
				console.log("Best guess'\t"+tokenizedBestGuess);
				console.log("Filtered titles\t"+tokenizedTitle);
				console.log("Filtered contents\t"+tokenizedContent);
				console.log($(this));
			})
		    termScoresList.sort(compare);
			console.log("result");
			var result = "";
			termScoresList.forEach(function(termScore){
				result += termScore.term+" "+termScore.score+"\t";
			})
			console.log(result);
			var end = new Date();
			console.log("Timing for Dom analysis:\t"+(end-start)+" ms");
		}

		function appendToTermScoreList(array, score, isSortNeeded){

			$.each(array, function(i, term){
				var matchIndex = $.inArray(term, termsList)
			    if(matchIndex === -1){
					var termScore = {term: term, score: score};
			    	termScoresList.push(termScore);
			    	termsList.push(term);
			    } else {
			    	termScoresList[matchIndex].score += score;
			    	if(term != termScoresList[matchIndex].term)
			    		console.log("Match error "+term+" "+termScoresList[matchIndex].term+" "+matchIndex);
			    }
			});
		}

		function compare(termScore1, termScore2){
			//sorted in descending order, so switch the order of the two terms
			return termScore2.score - termScore1.score;
		}

		function isEnglish(text) {
			for(var i = 0; i < text.length; i++){
				if(text.charCodeAt(i) > 127)
					return false;
			}
			return true;
		}

		function tokenizeText(text){

			var tokenizedTexts = text.split(/[.,\/ -]/);
			var filteredTerms = [];

			for(var i = 0; i < tokenizedTexts.length; i++){
				var token = tokenizedTexts[i];

				if(!isEnglish(token)) continue;  //remove non_English terms
					
				var filteredTokens = token.match(/[A-Za-z0-9]+/g); //remove special characters
				if(!filteredTokens) continue;
				filteredTokens.forEach(function(filteredToken){ 
					if(filteredToken != ""){
						filteredTerms.push(filteredToken.toLowerCase());
					}
				})
			}
			return filteredTerms;
		}
	}

	return {
		initializeFancyInput: function(){
			$('#searchTextField').fancyInput();
		},
		bindEnterKey: function() {
			$("#searchTextField").on('keypress', function(e){
				if(e.which == 13){ // is 'Enter' key
					switchToSecondView(this);
					search();
				}
			});
		},
		bindUploadButton: function(){
			$('#imageFileChooser').change(function(e){
				readImage(this);
			});
		},
		bindAcceptButton: function(){
			$('.youfind-modal-accept').on('click', function(e){
				imageExists($('#imageURLTextField').val(), function(isValid){
					if(isValid){
						currentImageURL = $('#imageURLTextField').val();
						App.modal.removeAllModals();
					} else {
						// TODO: add notifications to user
						console.log('Invalid URL');
					}
				})
			});
		},
		bindSearchButton: function(){
			$('.search-button').on('click', function(e) {
				e.preventDefault();
				switchToSecondView($('#searchTextField'));
				search();
			});
		}
	}
})();

$(document).ready(function(){
	App.main.initializeFancyInput();
	App.main.bindEnterKey();
	App.main.bindUploadButton();
	App.main.bindAcceptButton();
	App.main.bindSearchButton();
});