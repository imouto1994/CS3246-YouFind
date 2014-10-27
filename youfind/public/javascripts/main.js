var App = App || {};

App.main = (function(){
	var hasSwitchedToSecondView = false
 	var currentImageURL = null;

 	/* Reconfigure text field for search field after switching view */
	function configureTextField(input){
		window.fancyInput.setCaretHeight(input);
		window.fancyInput.inputResize(input);
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
		$.ajax({
			url: '/search',
			type: 'GET',
			data: {
				searchURL: googleImageSearchURL
			},
			success: function(data) {
				var infos = $(data).find(".srg");
				console.log(data);
			},
			error: function(data) {
				console.log(data);
			}
		});
	}

	return {
		initializeFancyInput: function(){
			$('#searchTextField').fancyInput();
		},
		bindEnterKey: function() {
			$("#searchTextField").on('keypress', function(e){
				if(e.which == 13){ // is 'Enter' key
					switchToSecondView(this);
					//search();
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