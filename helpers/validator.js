var validator = require('validator');
var xssFilters = require('xss-filters');

validator.extend('isLogin', function(str){
    "use strict";
    var regExp = /[\w\.@]{4,100}$/;

    return regExp.test(str);
});

validator.extend('isPass', function(str){
    "use strict";
    var regExp = /^[\w\.@]{3,100}$/;

    return regExp.test(str);
});

validator.extend('isProfile', function(str){
    "use strict";
    var regExp = /^\d+$/;

    return regExp.test(str);
});

function getValidUserBody(body) {
    "use strict";
    var hasLogin = body.hasOwnProperty('login');
    var hasEmail = body.hasOwnProperty('email');
    var hasPass = body.hasOwnProperty('pass');
    var hasProfile = body.hasOwnProperty('profile');

    hasEmail = hasEmail ? validator.isEmail(body.email) : false;
    hasLogin = hasLogin ? validator.isLogin(body.login) : false;
    hasPass = hasPass ? validator.isPass(body.pass) : false;
    hasProfile = hasProfile ? validator.isProfile(body.profile) : false;

    return hasEmail && hasLogin && hasPass && hasProfile;
}

function getValidProfileBody(body) {
    "use strict";
    var hasName = body.hasOwnProperty('profileName');

    //not sure about regexp
    // why not && ?
    hasName = hasName ? validator.isProfile(body.profileName) : false;

    return hasName;
}

function parseUserBody(body) {
    "use strict";
    var email = body.email;

    if (body.login) {
        body.login = validator.escape(body.login);
        body.login = xssFilters.inHTMLData(body.login);
    }
    if (email) {
        email = validator.escape(email);
        email = validator.normalizeEmail(email);

        body.email = xssFilters.inHTMLData(email);
    }
    if (body.pass) {
        body.pass = validator.escape(body.pass);
        body.pass = xssFilters.inHTMLData(body.pass);
    }

    return body;
}

function parseProfileBody(body) {
    "use strict";

    if (body.profileName) {
        body.profileName = validator.escape(body.profileName);
        body.profileName = xssFilters.inHTMLData(body.profileName);
    }


    if (body.profileDescription) {
        body.profileDescription = validator.escape(body.profileDescription);
        body.profileDescription = xssFilters.inHTMLData(body.profileDescription);
    }

    body._id = Date.parse(new Date());

    body.profileAccess = body.profileAccess.map(function (item) {
        item.module = item.module._id;
        return item;
    });

    return body;
}

module.exports = {
    validUserBody: getValidUserBody,
    parseUserBody: parseUserBody,
    validProfileBody: getValidProfileBody,
    parseProfileBody: parseProfileBody,
};
