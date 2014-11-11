var GOOGLE_API_KEY = "AIzaSyDjR_Icuc789VOUUdapZJ5fHroLQ7bU8zA"
var OAUTH2_CLIENT_ID = '824806387372-fis3vkdukrjte9r2vogci2eg206ga0tb.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/plus.me'
];

googleApiClientReady = function() {
  gapi.client.setApiKey(GOOGLE_API_KEY);
	triggerAuth();
  loadYoutubeDataAPIClientInterfaces();
}

// The client ID is obtained from the Google Developers Console
// at https://console.developers.google.com/.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.


// Upon loading, the Google APIs JS client automatically invokes this callback.
function triggerAuth(){
  gapi.auth.init(function() {
    window.setTimeout(checkAuth, 1);
  });
}

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
function checkAuth() {
  gapi.auth.authorize({
    client_id: OAUTH2_CLIENT_ID,
    scope: OAUTH2_SCOPES,
    immediate: true
  }, handleAuthResult);
}

// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    $('.pre-auth').hide();
    $('.post-auth').show();
    loadGooglePlusAPIClientInterfaces();
    loadYoutubeDataAPIClientInterfaces();
  } else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    initializeLoginButton();
  }
}

// Load the client interfaces for the YouTube Analytics and Data APIs, which
// are required to use the Google APIs JS client. More info is available at
function loadYoutubeDataAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function() {
    console.log("Load Youtube API successfully");
  });
}

function loadGooglePlusAPIClientInterfaces() {
  gapi.client.load('plus', 'v1').then(function(){
    console.log("Load Google Plus API successfully");
    var request = gapi.client.plus.people.get({
      'userId': 'me'
    });
    request.then(function(resp) {
      setProfilePicture(resp.result.image.url);
    }, function(reason) {
      console.log("There is error in retrieving user info");
    });
  });
}

function setProfilePicture(url){
  loginButton = $('#profileButton')[0];
  $(loginButton).addClass('profile-button');
  $(loginButton).removeClass('login-button');
  $(loginButton).css('background', 'url("' + url + '") no-repeat');
}

function initializeLoginButton(){
  loginButton = $('#profileButton')[0];
  $(loginButton).addClass('profile-button');
  $(loginButton).removeClass('login-button');
  $(loginButton).click(function() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
        }, handleAuthResult);
  });
}


