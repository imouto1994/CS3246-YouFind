var App = App || {}

App.modal = (function(){
	function showModal(triggerButton) {
		var modalWindow = $('#' + $(triggerButton).attr('data-modal'));
		$(modalWindow).addClass('youfind-show');
	}

	function removeAllModals() {
		$('.youfind-modal').removeClass('youfind-show');
		var player = document.getElementById('resultPlayer');
		if(typeof player != 'undefined'){
			try {
				player.stopVideo();
			} catch (err){
				console.log("Error in stopping the video")
			}
		}
	}

	return {
		removeAllModals: removeAllModals,
		linkOverlay: function(){
			var overlay = $('.youfind-overlay');
			$(overlay).on('click', removeAllModals);
		},
		linkModal: function(triggerButton, preProcessFunc){
			if(!$(triggerButton).hasClass('youfind-modal-trigger')){
				return;
			}
			var modalWindow = $('#' + $(triggerButton).attr('data-modal'));
			var closeButtons = $(modalWindow).find('.youfind-modal-cancel');
			$(triggerButton).on('click', function(e){
				e.preventDefault();
				if(typeof preProcessFunc != 'undefined'){
					preProcessFunc();
				}
				showModal(this);
			});
			$(closeButtons).on('click', removeAllModals);
		}
	}
})();

$(document).ready(function(){
	App.modal.linkOverlay();
	App.modal.linkModal($('#imageButton'), function(){
		var buttonIcon = $('#imageFileChooser').prev('i');
		var acceptIcon = $('.youfind-modal-accept').children('i')[0];
		$(buttonIcon).attr('class', 'fa fa-upload');
		$(acceptIcon).attr('class', '');
	});
	App.modal.linkModal($('#settingsButton'));
});