//@author: Yichao, wangycbeyond@gmail.com. All rights reserved.

console.log('help');
var images = document.getElementsByTagName('img');
for (var i = 0; i < images.length; i++) {
	var img = images[i];
	img.style.opacity = '0.5';
}