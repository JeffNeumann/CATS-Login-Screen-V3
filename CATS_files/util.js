var Util;
(function (Util) {
    var ConfigOptions = new Configuration.Config_Config(), AccountId = 0, AccountName = "", timer;
    //callWebService
    //does an async call to a web service
    //Returns the promise object from the $.ajax call
    //url : the url of the web service to call
    //request : the data in JSON format to pass into the parameters of the web service
    function callWebService(url, type, request, showMessageOnError) {
        var isGetNoParameterCall;
        var data = null, app = Global.App(), requestHeaders = null, deferred, csrf = getCSRFToken();
        if (type.toLowerCase() === "get") {
            //when the request is get and parameter is null 
            isGetNoParameterCall = request == null;
            if (request != null) {
                //data = JSON.stringify(request);
                data = request;
            }
        }
        else {
            if (request != null) {
                data = JSON.stringify(request);
            }
        }
        var token = getAuthenticationToken(), pageId = app.global() == null ? 'Main_Menu' : app.global().PageRequestParameters.PageAccess.HtmlDataID, dsc = getDSC();
        // pageId = "Main_Menu";
        if (token.length > 0) {
            requestHeaders = {
                "Authorization": "token " + token,
                "PageID": pageId,
                'RequestVerificationToken': csrf,
                "DSC": dsc
            };
        }
        else {
            requestHeaders = {
                'RequestVerificationToken': csrf
            };
        }
        deferred = $.ajax({
            type: type,
            url: url,
            data: data,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            headers: requestHeaders,
            xhrFields: {
                withCredentials: true
            },
        });
        if (showMessageOnError == null ||
            showMessageOnError == true) {
            //Add a default handler for fails thar shows an error message dialog
            deferred.fail(function () {
                //  UI.showErrorMessage(["An unexpected error has occured. Please try again."]);
            });
        }
        deferred.done(function (data) {
            // update the token (RefreshToken)
            ////if (data.RefreshToken != null && data.RefreshToken != '') {
            ////    Util.deleteCookie(Util.COOKIE_AUTHENTICATIONTOKEN);
            ////    Util.setCookie(Util.COOKIE_AUTHENTICATIONTOKEN, data.RefreshToken);
            if (isGetNoParameterCall) {
                Util.LastGetNoParameterUrl = url;
            }
        });
        deferred.fail(function (httpObj, textStatus) {
            //The following code block will occur if a 440 response is received - 
            // (login timeout) The client's session has expired and must log in again
            if (httpObj.status == 440) {
                var app = Global.App();
                //if (sessionStorage.getItem("IsRDCPermanent") == "true") {
                if (isNullOrEmpty(getRDCTemp()) && !isNullOrEmpty(getRDC())) {
                    app.haveAuthError = true;
                    var dialog = new LoginDialog.Dialog();
                    dialog.show(httpObj.responseJSON.AccountId, httpObj.responseJSON.AccountName);
                }
                else {
                    var nManager = app.notificationManager();
                    nManager.createNotificationAndWait("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Not Authorized", "You are not authorized to access the application. If you continue receiving this message please contact a system administrator. You will now be logged out of the application.", function () { return app.logoutUser(true); });
                    app.logoutUser(true);
                }
            }
            //The following code block will occur if a 401 response is received
            if (httpObj.status == 401) {
                var app = Global.App();
                var nManager = app.notificationManager();
                nManager.createNotificationAndWait("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Not Authorized", "You are not authorized to access the application. If you continue receiving this message please contact a system administrator. You will now be logged out of the application.", function () { return app.logoutUser(true); });
                var global = Global.App();
                global.logoutUser(true);
            }
            //The following block of code will execute if a 403 response is received
            if (httpObj.status == 403) {
                var app = Global.App();
                var nManager = app.notificationManager();
                nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Access not granted.", "An authorization error has occurred.  If you continue receiving this error please contact a system administrator.", "");
            }
            // Multiple Assignments Error
            if (httpObj.status == 429) {
                var app = Global.App();
                var nManager = app.notificationManager();
                nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Multiple Assignment Error.", "This role currently has active assignments.  Please remove the assignments and try again.", "");
            }
            //The following block of code will execute if a 428(concurrency error) response is received
            if (httpObj.status == 428) {
                httpObj.responseText;
                var app = Global.App();
                var nManager = app.notificationManager();
                nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Concurrency Occurred.", httpObj.responseText, "");
            }
            //the following block of code will execute if a 500 response is received.
            if (httpObj.status == 500) {
                var app = Global.App();
                var nManager = app.notificationManager();
                nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Error occurred", "An unexpected application error has occurred.  If you continue experiencing this error please contact a system administrator.", "");
            }
        });
        return deferred;
    }
    Util.callWebService = callWebService;
    ;
    function getCSRFToken() {
        var csrfToken = $('#forgeryToken').val();
        return csrfToken;
    }
    Util.getCSRFToken = getCSRFToken;
    function BuildURL(arguments) {
        var url = '';
        for (var i = 1; i < arguments.length; i++) {
            url = url + '/' + arguments[i];
        }
        // //
        return arguments[0] + '/API' + url;
    }
    Util.BuildURL = BuildURL;
    function getURLIDParam() {
        var fullPathArray = Backbone.history.getFragment().split('/');
        return fullPathArray.length >= 1 ? fullPathArray[1] : "0";
    }
    Util.getURLIDParam = getURLIDParam;
    ;
    function getURLParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split("&");
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split("=");
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
        return "";
    }
    Util.getURLParameter = getURLParameter;
    ;
    function isIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return true;
        }
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return true;
        }
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return true;
        }
        // other browser
        return false;
    }
    Util.isIE = isIE;
    function startHeartBeat(timeBetweenHeartbeats) {
        timer = setInterval(callHeartBeat, timeBetweenHeartbeats);
    }
    Util.startHeartBeat = startHeartBeat;
    function callHeartBeat() {
        callWebService(ConfigOptions.baseURL + "/api/Heartbeat", "GET");
    }
    function stopHeartBeat() {
        clearInterval(timer);
        console.log("Heartbeat stopped...");
    }
    Util.stopHeartBeat = stopHeartBeat;
    function getURLNumberParameter(sParam) {
        var value = this.getURLParameter(sParam);
        if (isNaN(value)) {
            return null;
        }
        else {
            return Number(value);
        }
    }
    Util.getURLNumberParameter = getURLNumberParameter;
    //Returns true if the value is undefined, null or and empty string
    function isNullOrEmpty(value) {
        return _.isUndefined(value) || _.isNull(value) || _.isEmpty(value);
    }
    Util.isNullOrEmpty = isNullOrEmpty;
    function isUndefinedOrZero(value) {
        return _.isUndefined(value) || value == 0;
    }
    Util.isUndefinedOrZero = isUndefinedOrZero;
    function isNothing(obj) {
        return obj === null || typeof obj === 'undefined';
    }
    Util.isNothing = isNothing;
    ;
    function inputFieldSecurity(container, permissions, ID) {
        var disable = true, enable = false;
        //if user has update privileges or the record ID = 0, then set boolean values to enable 
        if (permissions["Update"] != null || ID == 0) {
            disable = false;
            enable = true;
        }
        //set disable property for all input fields (text, dates, check boxes) to true/false
        //since a drop down list is not an 'input' control, these are done separately
        $(container).find(':input').prop('disabled', disable);
        //temp fix to stop the disabling of the red ribbon buttons since those
        //are rendered as input type button.
        $(container).find(':input[type="button"]').prop('disabled', false);
        // find all drop down lists and set enable property to true/false
        $(container).find("select").each(function () {
            if ($(this).data('kendoDropDownList') != undefined)
                $(this).data('kendoDropDownList').enable(enable);
            ;
        });
    }
    Util.inputFieldSecurity = inputFieldSecurity;
    /// This function will calculate the number of months, days, years, hours or minutes between two dates
    /// Parameters: Start and End dates, what you want to compare (months, days, years, hours, minutes), and if you want
    ///             to round up the difference. 
    /// Examples: getDateDiff('9/2/2016', '11/5/2016', 'months', true) returns 2
    ///           getDateDiff('9/2/2016', '11/15/2016', 'months', false) returns 1.5333
    ///           getDateDiff('9/2/2016', '1/1/2017', 'years', true) returns 1
    ///           getDateDiff('9/2/2016', '1/1/2017', 'years', false) returns 0.29444
    ///           getDateDiff('9/16/2016', '9/18/2016', 'days', true) returns 3
    ///           getDateDiff('9/16/2016', '9/18/2016', 'days', false) returns 3
    function getDateDiff(fromDate, toDate, diffType, round) {
        var fromDt = moment(fromDate), toDt = moment(toDate);
        if (round) {
            return Math.ceil(toDt.diff(fromDate, diffType, true));
        }
        else {
            return toDt.diff(fromDate, diffType, true);
        }
    }
    Util.getDateDiff = getDateDiff;
    function compareDates(fromDate, toDate) {
        var fromdt = moment(fromDate), toDt = moment(toDate);
        return toDt.isBefore(fromDate);
    }
    Util.compareDates = compareDates;
    function parseDate(str) {
        var mdy = str.split('/');
        var year = parseInt(mdy[2]);
        var month = parseInt(mdy[0]);
        var day = parseInt(mdy[1]);
        return new Date(year, month, day);
    }
    Util.parseDate = parseDate;
    function daydiff(first, second) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }
    Util.daydiff = daydiff;
    function isDate(input) {
        var regex_date = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        if (!regex_date.test(input)) {
            return false;
        }
        var date = new Date(input);
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        var day = date.getDate().toString();
        month = month.length > 1 ? month : "0" + month;
        day = day.length > 1 ? day : "0" + day;
        var date2 = month + "/" + day + "/" + year;
        return moment(date2, 'MM/DD/YYYY', true).isValid();
    }
    Util.isDate = isDate;
    //Create a RegExp object for validating phone numbers
    var phoneNumberRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    //Returns true if the phone number is seven digits and contains groups
    //with 3, 3 and 4 digits.  For example, these would all be valid
    //1112223333
    //111.222.3333
    //(111)222-3333
    function isPhoneNumberInCorrectFormat(phoneNumber) {
        var isValid = false;
        if (Util.isNullOrEmpty(phoneNumber)) {
            //Empty, nothing to validate
            isValid = true;
        }
        else {
            isValid = phoneNumberRegExp.test(phoneNumber);
        }
        return isValid;
    }
    Util.isPhoneNumberInCorrectFormat = isPhoneNumberInCorrectFormat;
    function getAuthenticationToken() {
        return getCookie(Util.COOKIE_AUTHENTICATIONTOKEN);
    }
    Util.getAuthenticationToken = getAuthenticationToken;
    function getDSC() {
        return decodeURIComponent(getCookie(Util.COOKIE_DSC));
    }
    Util.getDSC = getDSC;
    function getRDC() {
        return decodeURIComponent(getCookie(Util.COOKIE_RDC));
    }
    Util.getRDC = getRDC;
    function getRDCTemp() {
        return decodeURIComponent(getCookie(Util.COOKIE_RDCTemp));
    }
    Util.getRDCTemp = getRDCTemp;
    function setCookie(cname, cvalue) {
        var today = new Date();
        today.setTime(today.getTime());
        var expires = 1;
        // if the expires variable is set, make the correct expires time, the 
        // current script below will set it for x number of days, to make it 
        // for hours, delete * 24, for minutes, delete * 60 * 24 
        if (expires) {
            expires = expires * 1000 * 60 * 60 * 24;
        }
        //alert( 'today ' + today.toGMTString() );// this is for testing purpose only 
        var expires_date = new Date(today.getTime() + (expires));
        //alert('expires ' + expires_date.toGMTString());// this is for testing purposes only 
        document.cookie = cname + "=" + cvalue + ";path=/;domain=" + GetDomain() + ";";
    }
    Util.setCookie = setCookie;
    function GetDomain() {
        var baseUrl = extractDomain();
        var domainArry = baseUrl.split(".");
        return domainArry[domainArry.length - 2] + "." + domainArry[domainArry.length - 1];
    }
    Util.GetDomain = GetDomain;
    function setPermanentCookie(cname, cvalue) {
        // Build the expiration date string:
        var expiration_date = new Date();
        var cookie_string = '';
        expiration_date.setFullYear(expiration_date.getFullYear() + 1);
        // Build the set-cookie string:
        cookie_string = cname + "=" + cvalue + "; path=/; expires=" + expiration_date.toUTCString();
        // Create or update the cookie:
        document.cookie = cookie_string;
    }
    Util.setPermanentCookie = setPermanentCookie;
    function deleteCookie(cname) {
        document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    Util.deleteCookie = deleteCookie;
    function clearCookie(name) {
        var domain = 'cat.com' || document.domain;
        //var path = path || "/";
        var path = "/";
        document.cookie = name + "=; expires=" + +new Date + "; domain=" + domain + "; path=" + path;
    }
    Util.clearCookie = clearCookie;
    ;
    //export function clearListCookies() {
    //    var cookies = document.cookie.split(";");
    //    for (var i = 0; i < cookies.length; i++) {
    //        var spcook = cookies[i].split("=");
    //        deleteEachCookie(spcook[0]);
    //    }
    //    function deleteEachCookie(cookiename) {
    //        var d = new Date();
    //        d.setDate(d.getDate() - 1);
    //        var expires = ";expires=" + d;
    //        var name = cookiename;
    //        //alert(name);
    //        var value = "";
    //        document.cookie = name + "=" + value + expires + "; path=/ ;domain = cat.com;";
    //    }
    //}
    function clearListCookies() {
        var cookies = document.cookie.split("; ");
        for (var c = 0; c < cookies.length; c++) {
            var d = window.location.hostname.split(".");
            while (d.length > 0) {
                if (!IsPermanentRDCCooki(cookies[c].split(";")[0].split("=")[0])) {
                    var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
                    var p = location.pathname.split('/');
                    document.cookie = cookieBase + '/';
                    while (p.length > 0) {
                        document.cookie = cookieBase + p.join('/');
                        p.pop();
                    }
                    ;
                }
                d.shift();
            }
        }
        //var baseUrl = extractDomain();
        //var cookies = document.cookie.split(";");
        //for (var i = 0; i < cookies.length; i++) {
        //    var spcook = cookies[i].split("=");
        //    if (!IsPermanentRDCCooki(spcook[0]))
        //        deleteEachCookie(spcook[0], baseUrl);
        //}
    }
    Util.clearListCookies = clearListCookies;
    function deleteEachCookie(cookiename, baseUrl) {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        var expires = ";expires=" + d;
        var name = cookiename;
        var value = "";
        document.cookie = name + "=''" + expires + "; path=/ ;";
        var domainArry = baseUrl.split(".");
        var domain = domainArry[domainArry.length - 2] + "." + domainArry[domainArry.length - 1];
        document.cookie = name + "=''" + expires + ";";
        document.cookie = name + "=''" + expires + ";path=/ ;domain=" + domain + ";";
        document.cookie = name + "=''" + expires + ";domain=" + domain + ";";
    }
    Util.deleteEachCookie = deleteEachCookie;
    function IsPermanentRDCCooki(name) {
        // return name.trim() == Util.COOKIE_RDC && sessionStorage.getItem("IsRDCPermanent") == "true";
        return name.trim() == Util.COOKIE_RDC;
    }
    Util.IsPermanentRDCCooki = IsPermanentRDCCooki;
    function extractDomain() {
        var url = window.location.href;
        var domain;
        //find & remove protocol (http, ftp, etc.) and get domain
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        }
        else {
            domain = url.split('/')[0];
        }
        //find & remove port number
        domain = domain.split(':')[0];
        return domain;
    }
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return "";
    }
    Util.getCookie = getCookie;
    function isNumber(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    }
    Util.isNumber = isNumber;
    function getUrlParam(index) {
        return location.pathname.split('/')[index];
    }
    Util.getUrlParam = getUrlParam;
    function toDate(date) {
        return isNullOrEmpty(date) ? "" : moment(date.substring(0, 10)).format('MM/DD/YYYY');
    }
    Util.toDate = toDate;
    function createGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    Util.createGUID = createGUID;
    ////export function SetIsRDCExist(isRDCExist: boolean) {
    ////    Util.setCookie("IsRDCExist", isRDCExist.toString());
    ////}
    ////export function IsRDCExist() {
    ////    //return sessionStorage.getItem("IsRDCExist") == "true";
    ////    return Util.getCookie("IsRDCExist");
    ////}
    // these cookies are set in the server
    Util.COOKIE_AUTHENTICATIONTOKEN = "token";
    Util.COOKIE_DSC = "DSC";
    Util.COOKIE_RDC = "RDC";
    Util.COOKIE_RDCTemp = "RDCTemp";
    //moment.js format strings
    Util.MOMENT_FORMAT_DATE = "MM/DD/YYYY";
    Util.MOMENT_FORMAT_TIME = "hh:mm A";
    Util.MOMENT_FORMAT_DATETIME = "MM/DD/YYYY hh:mm A";
    Util.LastGetNoParameterUrl = "";
})(Util || (Util = {}));
//# sourceMappingURL=util.js.map