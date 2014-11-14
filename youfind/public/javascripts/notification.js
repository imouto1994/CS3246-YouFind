var App = App || {}

App.notification = (function(){
  return {
    showMessage: function(message){
      $('.youfind-noti-message').text(message);
      $('.youfind-noti-icon').attr('class', 'youfind-noti-icon fa fa-smile-o');
      $('.youfind-noti').removeClass('youfind-noti-error');
      $('.youfind-noti').addClass('youfind-noti-success');
      $('.youfind-noti').removeClass('youfind-noti-hide');
      setTimeout(function(){
        $('.youfind-noti').addClass('youfind-noti-hide');
      }, 2000);
    },
    showError: function(message){
      $('.youfind-noti-message').text(message);
      $('.youfind-noti-icon').attr('class', 'youfind-noti-icon fa fa-frown-o');
      $('.youfind-noti').removeClass('youfind-noti-success');
      $('.youfind-noti').addClass('youfind-noti-error');
      $('.youfind-noti').removeClass('youfind-noti-hide');
      setTimeout(function(){
        $('.youfind-noti').addClass('youfind-noti-hide');
      }, 2000);
    }
  }
})();