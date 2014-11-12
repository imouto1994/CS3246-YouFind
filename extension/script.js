//@author: Yichao, wangycbeyond@gmail.com. All rights reserved.

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.text == "triggerImagePin") {
    	toggleImagePin();
      	sendResponse({type: "received"});
    }
});

function qualifyURL(url) {
	var a = document.createElement('a');
	a.href = url;
	return a.href;
}

function toggleImagePin(){

	$("img").wrap("<div class='image-wrapper'></div>");
	$(".image-wrapper").append("<div class='image-over'><img></img></div>");

	var imageUrl = chrome.extension.getURL('icon/icon-48.png');
	$("div.image-over img").attr("src", imageUrl);
	$("div.image-over img").click(function(){
		console.log("clicked");
		var imageUrl = qualifyURL($(this).parent().siblings().attr("src"));
		chrome.runtime.sendMessage({text: "redirect", query: imageUrl}, function(response) {
			if(response.type == "received")
		  		console.log("response received");
		});
	})

	//bind event listener of hover
	$(".image-wrapper").hover(function(){
		$(this).find("div.image-over").fadeIn(100);
	}, function(){
		$(this).find("div.image-over").fadeOut(100);
	})
}
