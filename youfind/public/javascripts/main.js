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
			var buttonIcon = $('#imageFileChooser').prev('i');
      var FR= new FileReader();
      FR.onload = function(e) {
      	var uploadedImageData = e.target.result.replace(
      													/^data:image\/(png|jpg|jpeg|gif);base64,/, "");
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
      		beforeSend: function(){
      			$(buttonIcon).removeClass('fa-upload');
      			$(buttonIcon).addClass('fa-circle-o-notch fa-spin');
      		},
      		success: function(json){
      			$(buttonIcon).removeClass('fa-circle-o-notch fa-spin');
      			$(buttonIcon).addClass('fa-check-circle');
      			currentImageURL = json.data.link;
      			App.modal.removeAllModals();
      			$('.search-button').trigger('click');
      		},
      		error: function(json){
      			$(buttonIcon).removeClass('fa-circle-o-notch fa-spin');
      			$(buttonIcon).addClass('fa-warning');
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
		var videos = []

		
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

			var order = 'relevance';
			var selectedOrder = $("input[type='radio'][name='order']:checked");
			if(selectedOrder.length > 0){
				order = selectedOrder.val();
			}
			console.log(order);
			var request = gapi.client.youtube.search.list({
				part: 'snippet',
				q: str.trim(),
				maxResults: 10,
				order: order,
				type: 'video'
			});
			request.execute(function(response) {
				var result = response.result;
				var counter = 0;
				if (result.items.length == 0) {
					displayNoResults();
				} else {
				for(index in result.items){
					var item = result.items[index];
					var video = {};
					video.id = item.id.videoId;
					video.title = item.snippet.title;
					video.publishedAt = item.snippet.publishedAt;
					video.description = item.snippet.description;
					video.channelTitle = item.snippet.channelTitle;
					video.thumbnail = item.snippet.thumbnails.medium.url;

					searchStatistics(video, result.items.length);
				}
				}
			});
		}

		function searchStatistics(video, count){

			var videoRequest = gapi.client.youtube.videos.list({
				part: 'statistics, topicDetails, recordingDetails',
				id: video.id,
			});

			counter = 0;
			videoRequest.execute(function(videoResponse){
				var videoResult = videoResponse.result;
				video.viewCount = videoResult.items[0].statistics.viewCount;

				if(videoResult.items[0].recordingDetails) {
					video.location = videoResult.items[0].recordingDetails.location;
					console.log("video "+videos.length+"has location");
					console.log(video.location);
				}
				videos.push(video);
				//only display results when this is the last video
				if(counter >= count - 1){
					displayResults();
				}
				counter++;
			});
		}

		function printText(obj){
			if(typeof obj == 'object')
				for(var key in obj){
		    		if(key == "text")
		    			console.log(obj[key]);
		    		printText(obj[key]);
		    	}
		}

		function displayResults(){
			$('.grid').html('<ul></ul>');
			for(index in videos){
				video = videos[index];
				var html = "<li>"
				html +=	"<figure>"
				html +=		'<div class="youfind-result-thumbnail">'
				html += 		'<div class="youfind-overlay">'
				html += 			'<button type="button" value="' +  video.id + '" class="button play-button youfind-modal-trigger" data-modal="videoModal">'
				html +=					'<i class="fa fa-play-circle"></i>'
				html +=     		'</button>'
				html += 		'</div>'
				html += 		'<img src="' + video.thumbnail + '">'
				html +=		'</div>'
				html +=		'<figcaption>'
				html +=			'<h3 class="youfind-result-title">' + video.title + '</h3>'
				html += 		'<p class="youfind-result-channel">' + video.channelTitle + '</p>'
				html += 		'<p class="youfind-result-date">' + video.publishedAt.substr(0, video.publishedAt.indexOf("T")) + '</p>'
				html +=			'<p class="youfind-result-views">' + video.viewCount + ' views</p>'
				html += 		'<p class="youfind-result-description">' + video.description + '</p>'
				html +=			'<div class="g-ytsubscribe"></div>'
				html += 	'</figcaption>'
			 	html += '</figure>'
				html += '</li>'
			 	$('.grid ul').append(html);
			}
			bindPlayButtons();
			addSubscrButtons();
		}

		function displayNoResults() {
			$('.grid').html('<h1>No results found.</h1>');
		}

		function bindPlayButtons(){
			$('.play-button').each(function(){
				$(this).on('click', function(e){
					console.log("TEST");
					var player = document.getElementById('resultPlayer');
					if(typeof player != 'undefined'){
						player.loadVideoById($(this).attr('value'));
					}
					relevanceFeedback($(this).parents("li")[0]);
				})
				App.modal.linkModal(this);
			})
		}

		function addSubscrButtons(){
			$.getScript("https://apis.google.com/js/platform.js");
			$(".g-ytsubscribe").each(function(index, element){
				var channelTitle = $(this).siblings(".youfind-result-channel").text();
				if(channelTitle != ""){
					$(this).attr("data-channel", channelTitle);
				}
			})
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
			})
		  termScoresList.sort(compare);
			console.log("Result: ");
			var result = "";
			termScoresList.forEach(function(termScore){
				result += termScore.term+" "+termScore.score+"\t";
			})
			console.log(result);
			var end = new Date();
			console.log("Timing for Dom analysis:\t"+(end-start)+" ms");
		}

		/*get video topics using topic IDs and change term score with video title, description and related topics*/
		function relevanceFeedback(videoHtml){
			console.log("relevanceFeedback");
			console.log(videoHtml);
			var videoTitle = $(videoHtml).find(".youfind-result-title").text();
			var videoDescription = $(videoHtml).find(".youfind-result-description").text();
			console.log(videoTitle);
			console.log(videoDescription);
			var tokenizedTitle = tokenizeText(videoTitle);
			var tokenizedDescription = tokenizeText(videoDescription);

			appendToTermScoreList(tokenizedTitle, 3);
			appendToTermScoreList(tokenizedDescription, 1);

			termScoresList.sort(compare);
			var result = "";
			termScoresList.forEach(function(termScore){
				result += termScore.term+" "+termScore.score+"\t";
			})
			console.log(result);
		}

		function appendToTermScoreList(array, score, isSortNeeded){

			$.each(array, function(i, term){
				var aScore = score;
				if(isStopWord(term))
					aScore = score * 0.5;
				var matchIndex = $.inArray(term, termsList);
			    if(matchIndex === -1){
					var termScore = {term: term, score: aScore};
			    	termScoresList.push(termScore);
			    	termsList.push(term);
			    } else {
			    	termScoresList[matchIndex].score += aScore;
			    	if(term != termScoresList[matchIndex].term)
			    		console.log("Match error "+term+" "+termScoresList[matchIndex].term+" "+matchIndex);
			    }
			});
		}

		function isStopWord(word){
			return ($.inArray(word, stopWordList) != -1);
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
		initializeYoutubePlayer: function(){
			var params = { allowScriptAccess: "always", allowFullScreen: "true"};
    	var atts = { id: "resultPlayer"};
    	swfobject.embedSWF("http://www.youtube.com/v/M7lc1UVf-VE?enablejsapi=1&playerapiid=ytplayer&version=3","youtube-api-player", "640", "360", "8", null, null, params, atts);
    	console.log("Load Youtube Player Successfully");
		},
		bindEnterKey: function() {
			$("#searchTextField").on('keypress', function(e){
				if(e.which == 13){ // is 'Enter' key
					$('.search-button').trigger('click');
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
				var acceptButton = this;
				var acceptIcon = $(acceptButton).children('i')[0]
				$(acceptIcon).attr("class", "fa fa-circle-o-notch fa-spin");
				imageExists($('#imageURLTextField').val(), function(isValid){
					if(isValid){
						$(acceptIcon).removeClass('fa-circle-o-notch fa-spin');
      			$(acceptIcon).addClass('fa-check-circle');
						currentImageURL = $('#imageURLTextField').val();
						App.modal.removeAllModals();
						$('.search-button').trigger('click');
					} else {
						$(acceptIcon).removeClass('fa-circle-o-notch fa-spin');
      			$(acceptIcon).addClass('fa-warning');
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
		},
		detectUrlQuery: function(){
			var imageUrlQuery = $("#imageUrl").text();
			//Detect whether the http request is sent with image url query (in most case, via chrome extension)
			if(imageUrlQuery!= "undefined"){
				imageExists(imageUrlQuery, function(isValid){
					if(isValid){
						currentImageURL = imageUrlQuery;
						App.modal.removeAllModals();
						switchToSecondView(imageUrlQuery);
						search();
					} else {
						// TODO: add notifications to user
						console.log('Invalid URL');
					}
				});
			};
		}
	}
})();

$(document).ready(function(){
	App.main.initializeYoutubePlayer();
	App.main.bindEnterKey();
	App.main.bindUploadButton();
	App.main.bindAcceptButton();
	App.main.bindSearchButton();
	App.main.detectUrlQuery();
});
