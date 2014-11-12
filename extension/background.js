//@author: Yichao, wangycbeyond@gmail.com. All rights reserved.
var finderUrl = "http://localhost:2110";

function triggerScript(){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {text:"triggerImagePin"}, function(response) {
	  	if(response.type == "received"){
	  		console.log("response received");
	  	}
	  });
	});
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.text == "redirect"){
			var imageUrl = finderUrl + "?imageUrl=" + request.query;
			chrome.tabs.create({url: imageUrl});
			sendResponse({type: "received"});
		}
	}
)

function redirect(info){
	var imageUrl = inderUrl + "?imageUrl=" + info.srcUrl;
	chrome.tabs.create({url: imageUrl});
}


function editContextMenu(){
	chrome.contextMenus.create({title: "YouFind", contexts:["image"], onclick: redirect});
}


// Set up a click handler so that we can merge all the windows.
chrome.browserAction.onClicked.addListener(triggerScript);
//add title to menu item
editContextMenu();
