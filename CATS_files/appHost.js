/// <reference path="../Typings/kendo2015Q1/kendo.all.d.ts" />
/// <reference path="../Typings/jquery-1.9.1/jquery.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../Typings/bootstrap-3.0.3/bootstrap.d.ts" />
/// <reference path="../Typings/backbone/backbone.d.ts" />
// This is the code that first gets executed when the one-page app start.
// Its handles creating URL routes, opening new tabs, switching between tabs
// closing tabs and other application level communication.
var AppHost;
(function (AppHost) {
    var AppRouter = (function (_super) {
        __extends(AppRouter, _super);
        //Constructors
        function AppRouter(options) {
            _super.call(this, options);
            this.tabContent = [];
            this.routes = {
                "Shared/ResetPassword(/:code)(/:username)(/:steptwo)": "passwordReset",
                "Shared/AccountRegistration(/:code)(/:username)(/:steptwo)": "accountRegistration",
                "CSC/InquiryForm(/:InquiryID)(/:DynamicFormID)(/:ClientID)": "loadInquiry",
                ":mod/:area(/:id)": "loadControllerWithID",
                "": "defaultRoute",
                "*path": "unknownPage",
            };
            this._bindRoutes();
            var me = this, routerExtend, app = Global.App(), events = app.events();
            //Start the URL router
            Backbone.history.start({ pushState: true });
            //This view model is used to display links to the open tabs
            //Note that the current tab should always be the first item in the
            //Tabs array.  This way the Tabs array is always sorted with most recently
            //viewed tabs first.
            this.tabViewModel = kendo.observable({
                Tabs: [],
                //select fires when the user has choosen a new tab to view
                select: function (e) {
                    //  ////
                    me.selectTab(e.data);
                    me.tabSelectorUIWidget.hide();
                    return false;
                },
                //closeTab fires when the user has choosen to close the current tab
                closeTab: function (e) {
                    var tabs = me.tabViewModel.get("Tabs");
                    var tab;
                    var tabContent;
                    e.preventDefault();
                    //////
                    if (tabs.length > 0) {
                        //The current tab is always the first tab in the list
                        tab = tabs[0];
                        //Check if the form has unsaved changes
                        tabContent = me.getTabContent(tab.ID);
                        if (tabContent.UIController.haveFieldsChanged()) {
                            //There are unsaved change, ask user if they still want to close
                            UI.showConfirmDialog(UI.PHRASE_UNSAVEDCHANGESONCLOSE, function () { me.closeTab(tab.ID); }, function () { });
                        }
                        else {
                            //Fields have not changed since last save, so
                            //OK to close this tab
                            me.closeTab(tab.ID);
                        }
                    }
                    return false;
                },
                //getTabTitle returns the tital of the current tab show is can be displayed
                getTabTitle: function () {
                    var tabs = me.tabViewModel.get("Tabs"), title = "";
                    if (tabs.length > 0 && tabs[0].Title != null) {
                        //The current tab is always the first tab in the list
                        title = tabs[0].Title;
                    }
                    return title;
                },
                getTabSubTitle: function () {
                    var tabs = me.tabViewModel.get("Tabs"), title = "";
                    if (tabs.length > 0 && tabs[0].SubTitle != null) {
                        //The current tab is always the first tab in the list
                        title = tabs[0].SubTitle;
                    }
                    return title;
                },
                getColorClass: function () {
                    var tabs = me.tabViewModel.get("Tabs"), colorClass = "";
                    //TODO - put this code back when CSS styles are fixed
                    //if (tabs.length > 0 && tabs[0].Controller != null) {
                    //    //Assume the CSS class has the same name as the controller (URL)
                    //    //If this class doesn't exist, then the default top-info
                    //    //styling should be applied.
                    //    colorClass = "top-info-" + tabs[0].Controller.toLowerCase();
                    //}
                    //colorClass = "row top-info " + colorClass;
                    colorClass = "row panel top-info"; //TODO - remove this line when code above is activated
                    return colorClass;
                }
            });
            kendo.bind($("[data-id='AppRouter_History']"), this.tabViewModel);
            //Bind events to the global top menu, that will cause
            //new tabs to open
            this.bindMenuClickEvents();
            //Bind to application events
            events.on(EventUtil.EVENT_ROUTECHANGE, this.onControllerRouteChange, this);
            events.on(EventUtil.EVENT_ROUTECLOSE, function (data) {
                me.closeTab(data.appRouterID);
            }, this);
            //Slide-out window for selecting open tabs
            this.tabSelectorUIWidget = new AppHost.TabSelectorUIWidget();
            this.tabSelectorUIWidget.render();
            this.tabSelectorUIWidget.height(this.workspaceHeight());
            //Respond to resizing
            $(window).resize(function () {
                var height = me.workspaceHeight();
                //  ////
                $.each(me.tabContent, function (index, tabContent) {
                    tabContent.UIController.height(height);
                });
                me.tabSelectorUIWidget.height(height);
            });
            //Bind to browser close event, so we can display a warning
            //if there are unsaved changes.
            //window.onbeforeunload = this.onBeforeUnload;
            $(window).bind("beforeunload", this.onBeforeUnload);
            //Save commonly used DOM elements for performance
            this.tabContentContainer = $("[data-id='AppRouter_TabContentContainer']");
            //commented calling checkSession after we implemnted close session 
            //Call web service every 10 minutes to keep session alive
            //if (window.location.pathname.toLowerCase() != '/login')
            //    window.setInterval(this.checkSession, 1000 * 60 * 10);
            var me = this;
            //Hide the wait message, Show the page
            $("div[data-id='AppRouter_LoadingMessage']").hide();
            // me.togglePageNavigationRibbon(app);
            var currentPage = Backbone.history.getFragment();
            this.isLoggedIn().done(function (loggedIn) {
                //If the user is not logged on and we are not on the password rest nor the login page, then navigate to the login page.
                if (!loggedIn && currentPage.indexOf("Shared/ResetPassword") == -1 && currentPage.indexOf("Login") == -1 &&
                    currentPage.indexOf("Shared/RegisterDevice") == -1 && currentPage.indexOf("Shared/GetSecureCode") == -1 && currentPage.indexOf("Shared/AccountRegistration") == -1) {
                    me.login();
                    return;
                }
                else {
                    //If the user is logged on and they attempt to navigate to the Login page
                    //then redirect them to the dashboard page.  No reason to go to the login page is already
                    //logged in.
                    if (loggedIn && currentPage.indexOf("Login") > -1) {
                        //var token = Util.getAuthenticationToken();
                        // if (!Util.isNullOrEmpty(token) && token.length > 0 &&currentPage.indexOf("Login") > -1) {
                        me.gotoDefaultPage();
                    }
                }
            });
        }
        AppRouter.prototype.togglePageNavigationRibbon = function (app) {
            var pagePath = window.location.pathname.toLowerCase();
            if (pagePath == app.global().PagesWithoutNavigationRibbon.Default ||
                pagePath == app.global().PagesWithoutNavigationRibbon.Home ||
                pagePath == app.global().PagesWithoutNavigationRibbon.Login ||
                pagePath == app.global().PagesWithoutNavigationRibbon.AccountRegistration ||
                pagePath == app.global().PagesWithoutNavigationRibbon.ResetPassword) {
                $("[data-id='ribbon']").addClass("hidden");
                if (pagePath == app.global().PagesWithoutNavigationRibbon.Default || pagePath == app.global().PagesWithoutNavigationRibbon.Home) {
                    $('div[data-id=home]').removeClass("hidden");
                }
            }
            else {
                //$("[data-id='AppRouter_History']").removeClass("hidden");
                $("[data-id='ribbon']").removeClass("hidden");
                $('div[data-id=home]').addClass("hidden");
            }
        };
        //loads a js file if it is not already loaded
        AppRouter.prototype.loadModule = function (moduleName, area, app) {
            var deferred = $.Deferred();
            //alert("module " + moduleName);
            if (typeof window[moduleName + "_" + area] == 'undefined' || window[moduleName + "_" + area] == null) {
                var appPage = new Page.AppPage();
                var fileName = area;
                //Load config module
                //Load our Ribbon for our action buttons
                return $.getScript("/App/Viewmodels/" + moduleName + "/" + area + "/" + fileName + ".js");
            }
            else {
                //Module already loaded
                deferred.resolve();
            }
            return deferred.promise();
        };
        AppRouter.prototype.hideAllTabContent = function () {
            $.each(this.tabContent, function (index, tab) {
                tab.ContentContainer.hide();
            });
        };
        AppRouter.prototype.selectTab = function (tab) {
            this.displayLoadedRoute(tab.ID, null);
        };
        AppRouter.prototype.loadControllerWithID = function (controller, area, id) {
            var me = this;
            //Routes in this format:
            //  /modulename/area/[id]
            //  
            this.isLoggedIn().done(function (loggedIn) {
                if (loggedIn || controller == "Shared" && area == "Login" || controller == "Shared" && area == "AccountRegistration" || controller == "Shared" && area == "ResetPassword" || controller == "shared" && area == "resetPassword" ||
                    controller == "Shared" && area == "RegisterDevice" || controller == "Shared" && area == "GetSecureCode") {
                    var app = this;
                    //Load the Javascript file for this controller, if it 
                    //is not already loaded.
                    $('.loading-area').remove();
                    me.loadModule(controller, area, app)
                        .done(function () {
                        //We are using naming conventions to dynamically create the object that will render the page content.
                        //For example, if the user goes to /Owner, we look for a module called 'Owner'
                        //and create an instance of the class called 'Onwer.OwnerController'.
                        //Note that this is case sensitive so a url of /owner is not the same as /Owner
                        var uiController = new window[area][area + "Controller"]();
                        //Show the control if its already loaded
                        if (!me.displayLoadedRoute(uiController.appRouterID(id), id)) {
                            //Control not loaded, so add it
                            me.addNewTab(uiController, controller, area, id);
                        }
                    })
                        .fail(function (jqxhr, settings, exception) {
                    });
                }
                else {
                    me.login();
                }
            });
        };
        AppRouter.prototype.loadControllerWithParams = function (controller, area, options) {
            var me = this;
            //Routes in this format:
            //  /modulename/area/[param1...]
            this.isLoggedIn().done(function (loggedIn) {
                if (loggedIn || controller == "Shared" && area == "Login" || controller == "Shared" && area == "AccountRegistration" || controller == "Shared" && area == "ResetPassword" ||
                    controller == "shared" && area == "resetPassword" || controller == "shared" && area == "RegisterDevice" ||
                    controller == "shared" && area == "GetSecureCode") {
                    var app = this;
                    //Load the Javascript file for this controller, if it 
                    //is not already loaded.
                    $('.loading-area').remove();
                    me.loadModule(controller, area, app)
                        .done(function () {
                        //We are using naming conventions to dynamically create the object that will render the page content.
                        //For example, if the user goes to /Owner, we look for a module called 'Owner'
                        //and create an instance of the class called 'Onwer.OwnerController'.
                        //Note that this is case sensitive so a url of /owner is not the same as /Owner
                        var uiController = new window[area][area + "Controller"]();
                        //Show the control if its already loaded
                        ////
                        if (!me.displayLoadedRoute(uiController.appRouterID(options[0], options), uiController.appRouterID(options[0], options))) {
                            me.addNewTabWithOptions(uiController, controller, area, options);
                        }
                    });
                }
                else {
                    me.login();
                }
            });
        };
        AppRouter.prototype.defaultRoute = function () {
            this.gotoDefaultPage();
        };
        AppRouter.prototype.loadInquiry = function (InquiryID, DynamicFormID, ClientID) {
            var options = [InquiryID, DynamicFormID, ClientID];
            this.loadControllerWithParams("CSC", "InquiryForm", options);
        };
        AppRouter.prototype.passwordReset = function (code, username, steptwo) {
            var options = [code, username, steptwo];
            this.loadControllerWithParams("Shared", "ResetPassword", options);
        };
        AppRouter.prototype.accountRegistration = function (code, username, steptwo) {
            var options = [code, username, steptwo];
            this.loadControllerWithParams("Shared", "AccountRegistration", options);
        };
        AppRouter.prototype.isLoggedIn = function () {
            var deferred = $.Deferred();
            var loggedIn = false;
            var token = Util.getAuthenticationToken();
            var app = Global.App();
            //if (!Util.isNullOrEmpty(token) && Util.IsRDCExist()) {
            //if (!Util.isNullOrEmpty(token) && app.userSession.IsRDCExist) {
            if (!Util.isNullOrEmpty(token)) {
                if (token.length > 0) {
                    var validationCall = $.Deferred();
                    if (app.SessionValidated) {
                        loggedIn = true;
                        app.SessionValidated = true;
                        deferred.resolve(loggedIn);
                    }
                    else {
                        validationCall = this.ValidateSession(token);
                        validationCall.done(function (data) {
                            if (data.Payload === true) {
                                loggedIn = true;
                                app.SessionValidated = true;
                            }
                            else {
                                loggedIn = false;
                                app.SessionValidated = false;
                            }
                            deferred.resolve(loggedIn);
                        });
                    }
                }
                else {
                    loggedIn = false;
                    deferred.resolve(loggedIn);
                }
            }
            else {
                loggedIn = false;
                deferred.resolve(loggedIn);
            }
            return deferred.promise();
        };
        AppRouter.prototype.ValidateSession = function (token) {
            var app = Global.App();
            var validated = false;
            var configOptions = new Configuration.Config_Config();
            var url = configOptions.baseURL + "/api/isValidSession";
            var requestHeaders = {
                "Authorization": "token " + token,
                "PageID": '',
                'RequestVerificationToken': Util.getCSRFToken()
            };
            var deferred = $.ajax({
                type: "GET",
                url: url,
                data: "token=" + token,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                headers: requestHeaders,
            });
            return deferred;
        };
        AppRouter.prototype.login = function () {
            window.location.href = "/Shared/Login";
        };
        AppRouter.prototype.unknownPage = function () {
            this.navigate("/", true);
        };
        AppRouter.prototype.gotoDefaultPage = function () {
            //this.navigate("CSC/InquiryGrid", true);
            this.navigate("Shared/Dashboard", true);
            //  this.navigate("Shared/DesignTemplate", true);
        };
        AppRouter.prototype.bindMenuClickEvents = function () {
            var me = this;
            //bind to top level menu, so any single page app pages get
            //handled in javascript, rather then a browser redirect
            $(document).on('click', "a[data-clientside='y']", {}, function (event) {
                var path = $(this).attr('href');
                event.preventDefault();
                //Update the URL and allow the trigger to fire, which will run
                //the code needed to update the display
                me.navigate(path, true);
                //Close the bootstrap drop down menu.  It will not normally close when
                //clicked on, so we have to manually close it.
                $('[data-toggle="dropdown"]').parent().removeClass('open');
                // Provide automatic menu click to close upon item selection... menu button only shows on smaller screens
                $('[data-action="toggleMenu"]').trigger('click');
                return false;
            });
            //Page left-panel list toggle
            $(document).on('click', "[data-action='togglePageListMenu']", {}, function (event) {
                me.togglePageListMenu();
                event.preventDefault();
            });
            $(document).on('click', "[data-id='recordListContainer'] .k-listview .list-group-item", {}, function (event) {
                // Provide automatic left panel toggle closed upon item selection for smaller screens
                if ($(window).width() < 800) {
                    me.togglePageListMenu();
                }
                event.preventDefault();
            });
        };
        AppRouter.prototype.togglePageListMenu = function () {
            $("[data-id='leftPane']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
            if ($(window).width() <= 480) {
                if ($("[data-id='leftPane']").hasClass('closed')) {
                    $("[data-id='editContainer']").css("display", "none");
                }
                else {
                    if ($("[data-id='editContainer']:visible").css('display') == 'none') {
                        $("[data-id='instructionsContainer']:visible").css("display", "block");
                    }
                    else {
                        $("[data-id='editContainer']:visible").css("display", "block");
                    }
                }
            }
            else {
                if ($("[data-id='editContainer']:visible").css('display') == 'none') {
                    $("[data-id='instructionsContainer']:visible").css("display", "block");
                }
                else {
                    $("[data-id='editContainer']:visible").css("display", "block");
                }
            }
        };
        //If the tab with the specified unique ID is already loaded
        //then display it and return true.
        //Otherwise return false.
        AppRouter.prototype.displayLoadedRoute = function (appRouterID, id) {
            var isLoaded = false, max = this.tabContent.length, i, tab, tabModel;
            for (i = 0; i < max; i++) {
                tab = this.tabContent[i];
                ////
                if (tab.ID === appRouterID) {
                    //Tab already loaded, so show it
                    isLoaded = true;
                    this.hideAllTabContent();
                    tab.ContentContainer.show();
                    //Update the URL, but do not trigger the router
                    this.navigate(tab.URL, false);
                    //Move the tab to the top of the list
                    tabModel = this.moveTabToTop(appRouterID);
                    if (id != null &&
                        tab.UIController.allowRecordToChangeAfterLoad()) {
                        //Load the specified record.  Note that not all
                        //controller support doing this.  Usually only
                        //list/detail style controller can change there
                        //record ID after being loaded.
                        tab.UIController.loadRecord(id);
                    }
                    else if (tab.UIController.reload) {
                        //Page implements a reload function, to call it
                        tab.UIController.reload([id]);
                    }
                    break;
                }
            }
            return isLoaded;
        };
        //Creates a new tab and loads the specified controller control into it.
        AppRouter.prototype.addNewTab = function (uiController, controller, area, id) {
            var me = this, container;
            //Add a div container to the page that will hold the controller
            container = $("<div></div>").appendTo(this.tabContentContainer);
            //render the controller to the page
            uiController
                .render(container, controller, area)
                .done(function () {
                //Render was successfull, so show this page and
                //add it to the drawer menu
                // //
                var appRouterID = uiController.appRouterID(id);
                var tabViewModel = kendo.observable({
                    ID: appRouterID,
                    Title: uiController.title(),
                    SubTitle: uiController.subTitle(),
                    Controller: controller
                }), url, tabContent;
                uiController.height(me.workspaceHeight());
                url = controller + "/" + area;
                if (id != null) {
                    url += "/" + id;
                }
                if (area.toLowerCase() != "login") {
                    //show the new tab, put as first item in the
                    //array so its the first item displayed
                    me.tabViewModel.get("Tabs").unshift(tabViewModel);
                }
                //  area.toLowerCase() != "dashboard"
                //hide any existing tabs
                me.hideAllTabContent();
                ////
                //Save reference to container and control
                //so we can show and hide as needed and interact
                //with the control.
                tabContent = {
                    ID: appRouterID,
                    ContentContainer: container,
                    UIController: uiController,
                    URL: url
                };
                if (area.toLowerCase() != 'login') {
                    me.tabContent.push(tabContent);
                }
                ////
                //if (!(area.toLowerCase() == 'login' || area.toLowerCase() == 'manageproxy' || area.toLowerCase() == 'proxy')) {
                //    me.tabContent.push(tabContent);
                //}
                //load content into the controller
                uiController
                    .load()
                    .done(function () {
                    if (id == null) {
                        //Settingd ID to 0 tells the controller to start
                        //a new records.  Controllers can either open and let
                        //the user add a new record, or they can ignore this
                        //and do nothing.
                        id = 0;
                    }
                    //load single record or start a new record
                    uiController
                        .loadRecord(id)
                        .done(function () {
                        //Update the tab name to reflect the record that was loaded
                        tabViewModel.set("Title", uiController.title());
                        tabViewModel.set("SubTitle", uiController.subTitle());
                    });
                });
            });
        };
        //Creates a new tab and loads the specified controller control into it.
        AppRouter.prototype.addNewTabWithOptions = function (uiController, controller, area, options) {
            var me = this, container, id;
            //Add a div container to the page that will hold the controller
            container = $("<div></div>").appendTo(this.tabContentContainer);
            //render the controller to the page
            uiController
                .render(container, controller, area, options)
                .done(function () {
                //Render was successfull, so show this page and
                //add it to the drawer menu
                var appRouterID = uiController.appRouterID(options[0], options), tabViewModel = kendo.observable({
                    ID: appRouterID,
                    Title: uiController.title(),
                    SubTitle: uiController.subTitle(),
                    Controller: controller
                }), url, tabContent;
                uiController.height(me.workspaceHeight());
                ////
                url = controller + "/" + area;
                for (var i = 0; i < options.length; i++) {
                    url += "/" + options[i];
                }
                //hide any existing tabs
                me.hideAllTabContent();
                //show the new tab, put as first item in the
                //array so its the first item displayed
                me.tabViewModel.get("Tabs").unshift(tabViewModel);
                //Save reference to container and control
                //so we can show and hide as needed and interact
                //with the control.
                tabContent = {
                    ID: appRouterID,
                    ContentContainer: container,
                    UIController: uiController,
                    URL: url
                };
                me.tabContent.push(tabContent);
                //load content into the controller
                uiController
                    .load()
                    .done(function () {
                    if (id == null) {
                        //Settingd ID to 0 tells the controller to start
                        //a new records.  Controllers can either open and let
                        //the user add a new record, or they can ignore this
                        //and do nothing.
                        id = 0;
                    }
                    //load single record or start a new record
                    uiController
                        .loadRecord(id)
                        .done(function () {
                        //Update the tab name to reflect the record that was loaded
                        tabViewModel.set("Title", uiController.title());
                        tabViewModel.set("SubTitle", uiController.subTitle());
                    });
                });
            });
        };
        AppRouter.prototype.getTabModel = function (appRouterID) {
            var tabs = this.tabViewModel.get("Tabs"), max = tabs.length, i, tab;
            for (i = 0; i < max; i++) {
                tab = tabs[i];
                if (tab.get("ID") === appRouterID) {
                    return tab;
                }
            }
            return null;
        };
        //Moves the specified tab to the top of the list and
        //returns the tab object.  Used when a new tab is selected
        //and the current tab should always be first in the list.
        AppRouter.prototype.moveTabToTop = function (appRouterID) {
            var tabs = this.tabViewModel.get("Tabs"), max = tabs.length, i, tab;
            for (i = 0; i < max; i++) {
                tab = tabs[i];
                if (tab.get("ID") === appRouterID) {
                    //Remove tab from the list
                    tabs.splice(i, 1);
                    //Reinsert as first element in list
                    tabs.unshift(tab);
                    return tab;
                }
            }
            return null;
        };
        AppRouter.prototype.createRibbon = function (currentController) {
            var showAdd = false;
            var showUpdate = false;
        };
        AppRouter.prototype.getTabContent = function (appRouterID) {
            var max = this.tabContent.length, i, tab;
            for (i = 0; i < max; i++) {
                tab = this.tabContent[i];
                if (tab.ID == appRouterID) {
                    return tab;
                }
            }
            return null;
        };
        AppRouter.prototype.workspaceHeight = function () {
            var height = $(window).height() - 150;
            if (height < 0) {
                height = 0;
            }
            if ($(window).width() <= 480) {
                height = height - 45;
            }
            return height;
        };
        //Used to response to EVENT_ROUTECHANGE events thrown by controllers
        //when their state changes which requires a URL change.
        //For example, if a user is clicked in a list, update the URL to reflect
        //the ID of the item that was selected.
        AppRouter.prototype.onControllerRouteChange = function (data) {
            var tabModel = this.getTabModel(data.appRouterID), tabContent = this.getTabContent(data.appRouterID);
            if (tabModel != null && tabContent != null) {
                //Update what is displated in the tab description
                tabModel.set("Title", data.title);
                tabModel.set("SubTitle", data.subTitle);
                //Save the new URL
                tabContent.URL = data.url;
                //Update the URL displayed in the browser, but don't trigger
                //any code to run in response to the change, because the 
                //display has already been updated.
                this.navigate(data.url, false);
                if (data.newAppRouterID != null &&
                    data.newAppRouterID != "" &&
                    data.newAppRouterID != data.appRouterID) {
                    //Update the route ID
                    tabModel.set("ID", data.newAppRouterID);
                    tabContent.ID = data.newAppRouterID;
                }
            }
        };
        AppRouter.prototype.closeAllTabs = function () {
            var tabs = this.tabViewModel.get("Tabs"), max, i, tab;
            max = tabs.length;
            for (i = 0; i < max; i++) {
                tabs.splice(i, 1);
                break;
            }
            this.tabViewModel.set("Tabs", tabs);
            max = this.tabContent.length;
            for (i = 0; i < max; i++) {
                //Remove tab from the array
                tab = this.tabContent.splice(i, 1)[0];
                //Remove the tab contents from the DOM
                $(tab.ContentContainer).remove();
                //this.historyGoBack(tab.ID);
                this.gotoDefaultPage();
                break;
            }
            this.togglePageNavigationRibbon(Global.App());
        };
        //Used to close an open tab.
        AppRouter.prototype.closeTab = function (appRouterID) {
            var tabs = this.tabViewModel.get("Tabs"), max, i, tab;
            max = tabs.length;
            for (i = 0; i < max; i++) {
                if (tabs[i].get("ID") === appRouterID) {
                    //Remove item from the array, which will
                    //cause the select tab element to disappear
                    tabs.splice(i, 1);
                    break;
                }
            }
            this.tabViewModel.set("Tabs", tabs);
            max = this.tabContent.length;
            for (i = 0; i < max; i++) {
                if (this.tabContent[i].ID === appRouterID) {
                    //Remove tab from the array
                    tab = this.tabContent.splice(i, 1)[0];
                    //Remove the tab contents from the DOM
                    $(tab.ContentContainer).remove();
                    //Show the previously selected tab, which will
                    //always be the first tab in the list
                    if (tabs.length > 0) {
                        this.displayLoadedRoute(tabs[0].get("ID"), null);
                    }
                    else {
                        this.gotoDefaultPage();
                    }
                    //this.historyGoBack(tab.ID);
                    break;
                }
            }
            this.togglePageNavigationRibbon(Global.App());
        };
        AppRouter.prototype.closeDuplicateTabs = function (appRouterStartWith, appRouterID) {
            var tabs = this.tabViewModel.get("Tabs"), max, i, tab;
            max = tabs.length;
            for (i = 0; i < max; i++) {
                if (tabs[i].get("ID").match("^" + appRouterStartWith)
                    && tabs[i].get("ID") != appRouterID && tabs[i].get("ID") != "DocMan/DocumentGroupGrid") {
                    //Remove item from the array, which will
                    //cause the select tab element to disappear
                    tabs.splice(i, 1);
                    break;
                }
            }
            this.tabViewModel.set("Tabs", tabs);
            max = this.tabContent.length;
            for (i = 0; i < max; i++) {
                if (this.tabContent[i].ID.match("^" + appRouterStartWith)
                    && this.tabContent[i].ID != appRouterID) {
                    //Remove tab from the array
                    tab = this.tabContent.splice(i, 1)[0];
                    //Remove the tab contents from the DOM
                    $(tab.ContentContainer).remove();
                    //Show the previously selected tab, which will
                    //always be the first tab in the list
                    if (tabs.length > 0) {
                        this.displayLoadedRoute(tabs[0].get("ID"), null);
                    }
                    else {
                        this.gotoDefaultPage();
                    }
                    //this.historyGoBack(tab.ID);
                    break;
                }
            }
            this.togglePageNavigationRibbon(Global.App());
        };
        //Called when user tries to close the browser or navigate to another page.
        AppRouter.prototype.onBeforeUnload = function (e) {
            var global = Global.App();
            if (!global.haveAuthError) {
                var me = this, tabsWithUnsavedChanged = [];
                _.forEach(this.tabContent, function (tabContent) {
                    var tabModel;
                    if (tabContent.UIController.haveFieldsChanged()) {
                        tabModel = me.getTabModel(tabContent.ID);
                        tabsWithUnsavedChanged.push(tabModel.get("Title") + " " + tabModel.get("SubTitle"));
                    }
                });
                if (tabsWithUnsavedChanged.length > 0) {
                    //Verify user wants to leave this page
                    //This message will appear in a browser rendered dialog box.  It is not possible
                    //to dipslay our own dialog box when the user is leaving the page.
                    var confirmationMessage = "The following pages have unsaved changes:\r\r    " +
                        tabsWithUnsavedChanged.join("\r    ") +
                        "\r\rAre you sure you want to leave this page and lose any unsaved changes?";
                }
                if (!e)
                    e = window.event;
                var app = Global.App();
                e.returnValue = confirmationMessage; //Gecko + IE
                return confirmationMessage;
            }
        };
        //Call the web service to verify the user is logged in.  The method is
        //called periodically to keep the users session alive.
        AppRouter.prototype.checkSession = function () {
            var app = Global.App();
            Util.callWebService("/api/appsettings/checksession", "POST", null, false)
                .done(function (response) {
                if (!response.Success) {
                    UI.showErrorMessage(["Your session has expired.  Please refresh your page and log back in."]);
                }
            });
        };
        return AppRouter;
    }(Backbone.Router));
    AppHost.AppRouter = AppRouter;
    //This widget is used to render the slide-out menu that is
    //used to select open tabs
    var TabSelectorUIWidget = (function () {
        function TabSelectorUIWidget() {
        }
        TabSelectorUIWidget.prototype.render = function () {
            this.drawerHolder = $(".app-drawer-holder");
            this.drawerPanel = $(".app-drawer-panel");
            this.dropdown = $(".app-drawer-dropdown");
        };
        TabSelectorUIWidget.prototype.height = function (height) {
            var controlHeight = height - 30;
            if (controlHeight > 0) {
                this.drawerHolder.height(controlHeight);
                this.drawerPanel.height(controlHeight + 20);
            }
        };
        TabSelectorUIWidget.prototype.hide = function () {
            $(this.dropdown).dropdown("toggle");
        };
        return TabSelectorUIWidget;
    }());
    AppHost.TabSelectorUIWidget = TabSelectorUIWidget;
})(AppHost || (AppHost = {}));
$(function () {
    var app = Global.App();
    //Load global data used by all pages
    app.loadGlobal()
        .done(function () {
        //Start the URL router
        app.startRouter();
        app.router().isLoggedIn().done(function (data) {
            var currentPage = Backbone.history.getFragment();
            if (data === true && currentPage.toLowerCase().indexOf("shared/registerdevice") == -1) {
                // Load the session in every page refresh - the position is important 
                app.loadSession();
                app.loadMenu();
            }
        });
    })
        .fail(function () {
        UI.showErrorMessage(["An error has occurred while starting the application.  Please try to login again."]);
    });
});
//# sourceMappingURL=appHost.js.map