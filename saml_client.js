if (!Accounts.saml) {
  Accounts.saml = {};
}

Accounts.saml.initiateLogin = function(options, callback, dimensions) {
  // default dimensions that worked well for facebook and google
  var popup = openCenteredPopup(
    Meteor.absoluteUrl("_saml/authorize/"+options.provider+"/"+options.credentialToken),
    (dimensions && dimensions.width) || 650,
    (dimensions && dimensions.height) || 500);

  var checkPopupOpen = setInterval(function() {
    try {
      // Fix for #328 - added a second test criteria (popup.closed === undefined)
      // to humour this Android quirk:
      // http://code.google.com/p/android/issues/detail?id=21061
      var popupClosed = popup.closed || popup.closed === undefined;
    } catch (e) {
      // For some unknown reason, IE9 (and others?) sometimes (when
      // the popup closes too quickly?) throws "SCRIPT16386: No such
      // interface supported" when trying to read 'popup.closed'. Try
      // again in 100ms.
      return;
    }

    if (popupClosed) {
      clearInterval(checkPopupOpen);
      callback(options.credentialToken);
    }
  }, 100);
};

Accounts.saml.idpInitiatedSLO = function(options){
    //Meteor.absoluteUrl("_saml/logout/"+options.provider+"/"+options.credentialToken
    console.log("Options: " + JSON.stringify(options));
    //location.href(Meteor.absoluteUrl("_saml/sloInit/"+options.provider));
    window.open(Meteor.absoluteUrl("_saml/sloInit/"+options.provider));
}

var openCenteredPopup = function(url, width, height) {
  var screenX = typeof window.screenX !== 'undefined'
        ? window.screenX : window.screenLeft;
  var screenY = typeof window.screenY !== 'undefined'
        ? window.screenY : window.screenTop;
  var outerWidth = typeof window.outerWidth !== 'undefined'
        ? window.outerWidth : document.body.clientWidth;
  var outerHeight = typeof window.outerHeight !== 'undefined'
        ? window.outerHeight : (document.body.clientHeight - 22);
  // XXX what is the 22?

  // Use `outerWidth - width` and `outerHeight - height` for help in
  // positioning the popup centered relative to the current window
  var left = screenX + (outerWidth - width) / 2;
  var top = screenY + (outerHeight - height) / 2;
  var features = ('width=' + width + ',height=' + height +
                  ',left=' + left + ',top=' + top + ',scrollbars=yes');

  var newwindow = window.open(url, 'Login', features);
  if (newwindow.focus)
    newwindow.focus();
  return newwindow;
};

Meteor.loginWithSaml = function(options, callback) {
  options = options || {};
  var credentialToken = Random.id();
  options.credentialToken = credentialToken;

  Accounts.saml.initiateLogin(options, function(error, result){
     Accounts.callLoginMethod({
      methodArguments: [{saml:true,credentialToken:credentialToken}],
      userCallback: callback
    });
  });
};

Meteor.logoutWithSaml = function(options, callback) {
  options = options || {};
  Accounts.saml.idpInitiatedSLO(options, callback); 
    
  
};