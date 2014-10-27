var App = App || {}

App.modal = (function(){
	function showModal() {
		var modalWindow = $('#' + $(this).attr('data-modal'));
		$(modalWindow).addClass('youfind-show');
	}

	function removeAllModals() {
		$('.youfind-modal').removeClass('youfind-show');
	}

	return {
		removeAllModals: removeAllModals,
		linkOverlay: function(){
			var overlay = $('.youfind-overlay');
			$(overlay).on('click', removeAllModals);
		},
		linkModal: function(triggerButton){
			if(!$(triggerButton).hasClass('youfind-modal-trigger')){
				return;
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
	App.modal.linkModal($('#imageButton'));
});