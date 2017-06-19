var Data;
(function (Data) {
    var LAST_ACCOUNT_ID, LAST_ACCOUNT_NAME;
    //All web services return data wrapped
    //in this class,
    var Response = (function () {
        function Response() {
        }
        return Response;
    }());
    Data.Response = Response;
    ;
    var Responses = (function () {
        function Responses() {
        }
        return Responses;
    }());
    Data.Responses = Responses;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    //Returns a Kendo DataSource that pulls data from a web service
    //Assumes that all paging, filtering and sorting will occur on the server
    //readURL - the URL of the web service to call
    //model - describes the data being returned, contains a list of all fields and their types
    //customParameters - a function to call before the web service is called.  Can be used to
    //      modify the request, such as adding filter parameters.
    function createWebServiceKendoDataSource(readURL, model, customParameters) {
        if (customParameters === void 0) { customParameters = null; }
        var me = Global.App().global();
        var self = this;
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: readURL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    type: "GET",
                    beforeSend: function (req) {
                        self.setGridHeader(req);
                    },
                    complete: function (jqXHR, textStatus) {
                        // update the token (RefreshToken)
                        if (jqXHR.responseJSON.RefreshToken != null && jqXHR.responseJSON.RefreshToken != '') {
                            Util.deleteCookie(Util.COOKIE_AUTHENTICATIONTOKEN);
                            Util.setCookie(Util.COOKIE_AUTHENTICATIONTOKEN, jqXHR.responseJSON.RefreshToken);
                            Util.deleteCookie(Util.COOKIE_DSC);
                            Util.setCookie(Util.COOKIE_DSC, jqXHR.responseJSON.DSC);
                        }
                    },
                },
                parameterMap: function (data, operation) {
                    if (customParameters != null) {
                        //The customParameters function should add any data it
                        //needs to the data object.
                        customParameters(data);
                    }
                    // return JSON.stringify(data);
                    return data;
                }
            },
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            pageSize: 100,
            schema: {
                data: "Payload.Data",
                total: "Payload.Total",
                model: model
            },
            error: function (e) {
                UI.showErrorMessage(["An error has occurred while loading the data."]);
            },
            requestEnd: function (e) {
                if (e == null || e.response == null) {
                }
                else if (!e.response.Success) {
                }
            }
        });
        return dataSource;
    }
    Data.createWebServiceKendoDataSource = createWebServiceKendoDataSource;
    //Returns a Kendo DataSource that pulls data from a web service
    //Assumes that all paging, filtering and sorting will occur on the server
    //readURL - the URL of the web service to call
    //model - describes the data being returned, contains a list of all fields and their types
    //customParameters - a function to call before the web service is called.  Can be used to
    //      modify the request, such as adding filter parameters.
    function createWebServiceDataSource(readURL, model, customParameters) {
        if (customParameters === void 0) { customParameters = null; }
        var me = Global.App().global();
        var GridDataSource = { DataSource: new kendo.data.DataSource, Permissions: [] };
        var self = this;
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: readURL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    type: "GET",
                    beforeSend: function (req) {
                        self.setGridHeader(req);
                    },
                    complete: function (jqXHR, textStatus) {
                        // update the token (RefreshToken)
                        if (jqXHR.responseJSON.RefreshToken != null && jqXHR.responseJSON.RefreshToken != '') {
                            Util.deleteCookie(Util.COOKIE_AUTHENTICATIONTOKEN);
                            Util.setCookie(Util.COOKIE_AUTHENTICATIONTOKEN, jqXHR.responseJSON.RefreshToken);
                            Util.deleteCookie(Util.COOKIE_DSC);
                            Util.setCookie(Util.COOKIE_DSC, jqXHR.responseJSON.DSC);
                        }
                    },
                },
                parameterMap: function (data, operation) {
                    if (customParameters != null) {
                        //The customParameters function should add any data it
                        //needs to the data object.
                        customParameters(data);
                    }
                    // return JSON.stringify(data);
                    return data;
                }
            },
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            pageSize: 100,
            schema: {
                data: "Payload.Data",
                total: "Payload.Total",
                model: model
            },
            error: function (e) {
                //"1"
                UI.showErrorMessage(["An error has occurred while loading the data."]);
            },
            requestEnd: function (e) {
                GridDataSource.Permissions = e.response.Permissions;
                if (e == null || e.response == null) {
                }
                else if (!e.response.Success) {
                }
            }
        });
        GridDataSource.DataSource = dataSource;
        return GridDataSource;
    }
    Data.createWebServiceDataSource = createWebServiceDataSource;
    function createWebServiceDataSourcePost(readURL, model, customParameters) {
        if (customParameters === void 0) { customParameters = null; }
        var me = Global.App().global();
        var GridDataSource = { DataSource: new kendo.data.DataSource, Permissions: [] };
        var self = this;
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: readURL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    type: "POST",
                    beforeSend: function (req) {
                        //debugger;
                        self.setGridHeader(req);
                    },
                    complete: function (jqXHR, textStatus) {
                        // update the token (RefreshToken)
                        if (jqXHR.responseJSON.RefreshToken != null && jqXHR.responseJSON.RefreshToken != '') {
                            Util.deleteCookie(Util.COOKIE_AUTHENTICATIONTOKEN);
                            Util.setCookie(Util.COOKIE_AUTHENTICATIONTOKEN, jqXHR.responseJSON.RefreshToken);
                            Util.deleteCookie(Util.COOKIE_DSC);
                            Util.setCookie(Util.COOKIE_DSC, jqXHR.responseJSON.DSC);
                        }
                    },
                },
                parameterMap: function (data, operation) {
                    if (customParameters != null) {
                        //The customParameters function should add any data it
                        //needs to the data object.
                        customParameters(data);
                    }
                    return JSON.stringify(data);
                    //return data;
                }
            },
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
            pageSize: 100,
            schema: {
                data: "Payload.Data",
                total: "Payload.Total",
                model: model
            },
            error: function (e) {
                //The following code block will occur if a 440 response is received - 
                // (login timeout) The client's session has expired and must log in again
                if (e.xhr.status == 440) {
                    var global = Global.App();
                    global.haveAuthError = true;
                    var dialog = new LoginDialog.Dialog();
                    dialog.show(e.xhr["responseJSON"].AccountId, e.xhr["responseJSON"].AccountName);
                }
                //The following code block will occur if a 401 response is received
                if (e.xhr.status == 401) {
                    var app = Global.App();
                    var nManager = app.notificationManager();
                    nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Not Authorized", "You are not authorized to access the application. If you continue receiving this message please contact a system administrator. You will now be logged out of the application.", function () { return app.logoutUser(true); });
                    var global = Global.App();
                    global.logoutUser(true);
                }
                //The following block of code will execute if a 403 response is received
                if (e.xhr.status == 403) {
                    var app = Global.App();
                    var nManager = app.notificationManager();
                    nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Access not granted.", "An authorization error has occurred.  If you continue receiving this error please contact a system administrator.", "");
                }
                //The following block of code will execute if a 428(concurrency error) response is received
                if (e.xhr.status == 428) {
                    var app = Global.App();
                    var nManager = app.notificationManager();
                    nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Concurrency Occurred.", e.xhr.statusText, "");
                }
                //the following block of code will execute if a 500 response is received.
                if (e.xhr.status == 500) {
                    var app = Global.App();
                    var nManager = app.notificationManager();
                    nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Error occurred", "An unexpected application error has occurred.  If you continue experiencing this error please contact a system administrator.", "");
                }
                // UI.showErrorMessage(["An error has occured while loading the data."]);
            },
            requestEnd: function (e) {
                //GridDataSource.Permissions = e.response.Permissions;
                if (e == null || e.response == null) {
                }
                else if (!e.response.Success) {
                }
            }
        });
        GridDataSource.DataSource = dataSource;
        return GridDataSource;
    }
    Data.createWebServiceDataSourcePost = createWebServiceDataSourcePost;
    //Returns a Kendo DataSource that pulls data from a web service
    //for use by an Autocomplete control
    //Assumes that all filtering and sorting will occur on the server
    //readURL - the URL of the web service to call
    //customParameters - a function to call before the web service is called.  Can be used to
    //      modify the request, such as adding filter parameters.
    function createAutocompleteDataSource(readURL, customParameters) {
        if (customParameters === void 0) { customParameters = null; }
        var csrf = Util.getCSRFToken();
        var token = Util.getAuthenticationToken(), dsc = decodeURIComponent(Util.getDSC()), rdc = decodeURIComponent(Util.getRDC()), rdcTemp = decodeURIComponent(Util.getRDCTemp());
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: {
                    url: readURL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    type: "POST",
                    beforeSend: function (req) {
                        req.setRequestHeader('Authorization', "token " + token);
                    },
                    headers: {
                        // "Authorization": "token " + token,
                        'RequestVerificationToken': csrf,
                        "DSC": dsc,
                        "RDC": rdc,
                        "RDCTemp": rdcTemp
                    }
                },
                parameterMap: function (data, operation) {
                    var parameters = {
                        SearchText: "",
                        MaxRecords: 50
                    };
                    if (operation === "read") {
                        //kendo creates this big filter object.  We just want to pull
                        //out the value that the user typed and let the web service
                        //determine how to filter.
                        parameters.SearchText = data.filter.filters[0].value;
                    }
                    if (customParameters != null) {
                        //The customParameters function should add any data it
                        //needs to the data object.
                        customParameters(parameters);
                    }
                    return JSON.stringify(parameters);
                }
            },
            serverFiltering: true,
            schema: {
                data: "Payload"
            },
            error: function (e) {
                UI.showErrorMessage(["An error has occurred while loading the data."]);
            },
            requestEnd: function (e) {
                if (e == null || e.response == null) {
                }
                else if (!e.response.Success) {
                }
            }
        });
        return dataSource;
    }
    Data.createAutocompleteDataSource = createAutocompleteDataSource;
    function setGridHeader(req) {
        req.setRequestHeader('Authorization', "token " + Util.getAuthenticationToken());
        req.setRequestHeader('RequestVerificationToken', Util.getCSRFToken());
        req.setRequestHeader('DSC', decodeURIComponent(Util.getDSC()));
        req.setRequestHeader('RDC', decodeURIComponent(Util.getRDC()));
        req.setRequestHeader('RDCTemp', decodeURIComponent(Util.getRDCTemp()));
    }
    Data.setGridHeader = setGridHeader;
    //From the ApplicationRole table
    Data.APPLICATIONROLE_PHAADMIN = 1;
    Data.APPLICATIONROLE_ADMIN = 2;
    Data.APPLICATIONROLE_SCHEDULER = 3;
    Data.APPLICATIONROLE_INSPECTOR = 4;
    Data.APPLICATIONROLE_READONLY = 5;
    Data.APPLICATIONROLE_CMSPAGEADMIN = 6;
})(Data || (Data = {}));
//# sourceMappingURL=data.js.map