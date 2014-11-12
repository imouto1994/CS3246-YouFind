var App = App || {}

App.modal = (function(){
	function showModal() {
		var modalWindow = $('#' + $(this).attr('data-modal'));
		$(modalWindow).addClass('youfind-show');
	}

	function removeAllModals() {
		$('.youfind-modal').removeClass('youfind-show');
		var player = document.getElementById('resultPlayer');
		if(player){
			player.stopVideo();
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
			if(typeof preProcessFunc != 'undefined'){
				preProcessFunc();
			}
			var modalWindow = $('#' + $(triggerButton).attr('data-modal'));
			var closeButtons = $(modalWindow).find('.youfind-modal-cancel');
			$(triggerButton).on('click', showModal);
			$(closeButtons).on('click', removeAllModals);
		}
	}
})();

$(document).ready(function(){
	App.modal.linkOverlay();
	App.modal.linkModal($('#imageButton'), function(){
		var buttonIcon = $('#imageFileChooser').prev('i');
		var acceptIcon = $('.youfind-accept-button').children('i');
		$(buttonIcon).attr('class', 'fa fa-upload');
		$(acceptIcon).attr('class', '');

	});
	App.modal.linkModal($('#settingsButton'));
});