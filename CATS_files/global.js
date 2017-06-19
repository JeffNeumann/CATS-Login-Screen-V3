/// <reference path="../Typings/kendo2015Q1/kendo.all.d.ts" />
/// <reference path="../Typings/jquery-1.9.1/jquery.d.ts" />
/// <reference path="../Typings/lodash-2.4.1/lodash.d.ts" />
//site.ts
//This file contains modules that are globally in the site.
//Data Module
//Contains classes and interfaces used to communicate with web services.
//Interfaces are used so we can build classes that return mock data for
//testing UI components.
var Global;
(function (Global) {
    //App class
    //The 'real' app object used in production
    var AppProduction = (function () {
        function AppProduction() {
            this.sessionTimeoutDisabled = false;
            this.SessionValidated = false;
            this.userSession = null;
            this.gridFiltersLoaded = [];
        }
        AppProduction.prototype.setUserSession = function (userSession) {
            this.userSession = userSession;
        };
        AppProduction.prototype.templates = function () {
            if (this.templatesSingleton == null) {
                this.templatesSingleton = new UI.Templates();
            }
            return this.templatesSingleton;
        };
        AppProduction.prototype.notificationManager = function () {
            if (this._notificationManager == null) {
                this._notificationManager = new Notification.SmartBoxNotification();
            }
            return this._notificationManager;
        };
        AppProduction.prototype.events = function () {
            if (this.eventsSigleton == null) {
                //Use the Bakcbone Events class to handle event aggregation
                this.eventsSigleton = _.clone(Backbone.Events);
            }
            return this.eventsSigleton;
        };
        AppProduction.prototype.router = function () {
            //Object must be created by calling statrRouter
            return this.routerSingleton;
        };
        AppProduction.prototype.startRouter = function () {
            //Start the routing, used to start the one-page app
            //feature.  Some pages may not call this method while they
            //are being transitioned to the one-page app.
            this.routerSingleton = new AppHost.AppRouter();
        };
        AppProduction.prototype.loadGlobal = function () {
            //Load global data when the one-page-app first starts.
            //This is data used accross multiple pages.
            var mainOptions = new Configuration.Main_Config();
            var deferred = $.Deferred(), me = this;
            me.haveAuthError = false;
            me.SessionValidated = false;
            me.userSession = {
                AuthenticationToken: '',
                DSC: '',
                AuthenticationForUserToken: '',
                Name: '',
                LoginUserID: '',
                HomePage: '',
                IsResetPasswordRequired: false,
                UserID: '',
                EMail: '',
                HasMultipleAccount: false,
                AccountName: "",
                IsSysAdmin: false,
                IsRDCExist: false,
                IsRDCPermanent: false,
                IsLegacy: false
            };
            me.globalSigleton = {
                States: [],
                PagesWithoutNavigationRibbon: {},
                PageRequestParameters: {
                    PageAccess: {
                        ID: null,
                        HtmlDataID: '',
                        PageIsEnabled: true,
                        PagePermissions: '',
                        UserSession: {
                            AuthenticationToken: '',
                            DSC: '',
                            AuthenticationForUserToken: '',
                            Name: '',
                            LoginUserID: '',
                            HomePage: '',
                            IsResetPasswordRequired: false,
                            UserID: '',
                            EMail: '',
                            HasMultipleAccount: false,
                            AccountName: '',
                            IsSysAdmin: false,
                            IsRDCExist: false,
                            IsRDCPermanent: false,
                            IsLegacy: false
                        }
                    }
                }
            };
            Util.callWebService(Util.BuildURL([mainOptions.AdminbaseURL, "appsettings", "global"]), "POST")
                .done(function (response) {
                if (response.Success) {
                    me.globalSigleton = response.Payload;
                    me.globalSigleton.PagesWithoutNavigationRibbon = {
                        Login: '/shared/login',
                        ResetPassword: '/shared/resetpassword',
                        AccountRegistration: '/accountregistration'
                    };
                    me.globalSigleton.PageRequestParameters = {
                        PageAccess: {
                            ID: null,
                            HtmlDataID: '',
                            PageIsEnabled: true,
                            PagePermissions: '',
                            UserSession: {
                                AuthenticationToken: '',
                                AuthenticationForUserToken: '',
                                Name: '',
                                DSC: '',
                                LoginUserID: '',
                                HomePage: '',
                                IsResetPasswordRequired: false,
                                EMail: '',
                                HasMultipleAccount: false,
                                AccountName: '',
                                IsSysAdmin: false,
                                IsRDCExist: false,
                                IsRDCPermanent: false,
                                IsLegacy: false
                            }
                        }
                    },
                        deferred.resolve();
                }
                else {
                    deferred.reject();
                }
            })
                .fail(function () {
                deferred.reject();
            });
            //var loadChoosingMenu = new ChoosingMenu.ProxyMenu();
            return deferred.promise();
        };
        AppProduction.prototype.logoutUser = function (withServerSide) {
            var config = new Configuration.Main_Config();
            if (withServerSide) {
                Util.callWebService(Util.BuildURL([config.AdminbaseURL, "Logout"]), "GET")
                    .done(function (response) {
                }).always(function () {
                    var global = Global.App();
                    //  global.logoutUser(true);
                    global.deleteAppCookies();
                    window.location.href = "/Shared/Login";
                });
            }
            var global = Global.App();
            global.deleteAppCookies();
        };
        AppProduction.prototype.deleteAppCookies = function () {
            //Util.SetIsRDCExist(false);
            Util.clearListCookies();
        };
        AppProduction.prototype.choosingMenuLoad = function () {
            var loadChoosingMenu = new ChoosingMenu.ProxyAccountMenu();
        };
        AppProduction.prototype.loadMenu = function () {
            var mainOptions = new Configuration.Main_Config();
            $("[data-id='App_Menu']").addClass("hidden");
            var deferred = $.Deferred(), me = this;
            var viewModel = kendo.observable({
                Menu: [],
            });
            var global = Global.App();
            global.router().isLoggedIn().done(function (data) {
                if (data === true) {
                    Util.callWebService(Util.BuildURL([mainOptions.AdminbaseURL, "menu", "loadmenu"]), "GET", null, false)
                        .done(function (response) {
                        if (response.Success) {
                            me.globalSigletonMenu = response.Payload;
                            viewModel.set("Menu", response.Payload.NavMenu);
                            var menuItems = response.Payload.NavMenu;
                            var menuHTML = '';
                            var ParentID = 0;
                            for (var i = 1; i < menuItems.length; i++) {
                                //var ParentExists = false;
                                //for (var m = 1; m < menuItems.length; m++) {
                                //    if (menuItems[m].ID === menuItems[i].ParentID) {
                                //        ParentExists = true;
                                //    }
                                //}
                                if (menuItems[i].Level > 1) {
                                    if (menuItems[i].Tag == "Begin") {
                                        if (menuItems[i].PageUrl != null) {
                                            //begin Multi Level Child Parent Menu SS----------------------------------------------------------------------
                                            //Check if it is a Parent or Children
                                            if (menuItems[i].NumberOfChildren == 0 && menuItems[i].Level == 3) {
                                                //not a parent or a child 
                                                menuHTML += '<li style="border:solid 0px pink;"><a data-clientside="y" href="../CGI CATS_files/' + menuItems[i].PageUrl + '" title="' + menuItems[i].DisplayName + '">' + menuItems[i].DisplayName.trim() + '</a></li>';
                                            }
                                            else {
                                                if (menuItems[i].NumberOfChildren >= 1) {
                                                    //Is a Parent and Has Children
                                                    menuHTML += '<li class="dropdown-submenu" style="border:solid 0px green" ><a data-clientside="y" href="../CGI CATS_files/' + menuItems[i].PageUrl + '" title="' + menuItems[i].DisplayName + '">' + menuItems[i].DisplayName.trim() + '</a>';
                                                    menuHTML += ' <ul class="dropdown-menu cats-dropdown-menu" style="margin-top:6px;margin-left:1px;"> ';
                                                    ParentID = menuItems[i].ID;
                                                    //get all children
                                                    var children = menuItems.filter(function (x) { return x.ParentID == ParentID && x.Tag != "End"; });
                                                    for (var n = 0; n < children.length; n++) {
                                                        menuHTML += '<li style="border:solid 0px purple;" ><a data-clientside="y" href="../CGI CATS_files/' + children[n].PageUrl + '" title="' + children[n].DisplayName + '">' + children[n].DisplayName.trim() + '</a></li>';
                                                    }
                                                    menuHTML += '</ul>';
                                                    menuHTML += '</li>';
                                                }
                                            } //end
                                        }
                                        else {
                                            //Top Level Menu Items with Icons
                                            menuHTML += '<li class="dropdown">';
                                            menuHTML += '<a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="' + menuItems[i].DisplayName + '"><span style="vertical-align:middle"><i  class="fa fa-lg fa-fw ' + menuItems[i].MenuIcon + '"></i></span> <span class="menu-item-parent" style="vertical-align:middle">' + menuItems[i].DisplayName.trim() + '</span></a>';
                                            menuHTML += '<ul class="dropdown-menu" data-role="listview">';
                                        }
                                    }
                                    else {
                                        if (menuItems[i].Tag == "End") {
                                            if (menuItems[i].PageUrl == null) {
                                                menuHTML += '</ul>';
                                            }
                                            menuHTML += '</li>';
                                        }
                                    }
                                }
                            }
                            $("[data-id='App_Menu']").prepend(menuHTML);
                            //Unhide our logout button and setup notification
                            $("div[data-id='logoutContainer']").removeClass("hidden");
                            $('body').removeClass('logged-out-body');
                            var notificationManager = new Notification.SmartBoxNotification();
                            notificationManager.createNotificationEvent("<i class='fa fa-sign-out' style='color:#e31937'></i>  Log out", "Are you sure you would like to log out?", "logout", "[No][Yes]", function () { return app.logoutUser(true); });
                            //////var ready = Util.getCookie(Util.COOKIE_CHOOSEACCOUNT);
                            //if (ready == "true")
                            //if (!Global.session.HasMultipleAccount)
                            //    me.updateUIForLoggedInUser();
                            //if (!global.userSession.HasMultipleAccount)
                            me.updateUIForLoggedInUser();
                            me.createKOBindingHandlers();
                        }
                        else {
                            deferred.reject(response.Messages);
                        }
                    })
                        .fail(function () {
                    }).always(function () {
                        deferred.resolve();
                    });
                }
            });
            return deferred.promise();
        };
        AppProduction.prototype.loadSession = function () {
            var mainOptions = new Configuration.Main_Config();
            var deferred = $.Deferred(), me = this, global = Global.App();
            var input = {
                token: Util.getAuthenticationToken(),
                rdc: Util.isNullOrEmpty(Util.getRDCTemp()) ? Util.getRDC() : Util.getRDCTemp()
            };
            return Util.callWebService(Util.BuildURL([mainOptions.AdminbaseURL, "appsettings", "session"]), "GET", input, false)
                .done(function (response) {
                if (response.Success) {
                    global.setUserSession(response.Payload);
                }
                else {
                    UI.showErrorMessage(response.Messages);
                    deferred.reject(response.Messages);
                }
            })
                .fail(function () {
            }).always(function () {
                deferred.resolve();
            });
        };
        AppProduction.prototype.afterLoginSetting = function (response, startUpPageUrl, isRDCPermanent) {
            var app = Global.App();
            // we can not set it in SetUserSession because we don't have access to this value when we login for first time, we don't know what is the type of the device activation (Permanent/Temporary)
            //app.userSession.IsRDCPermanent = isRDCPermanent;
            if (response.Payload.HasMultipleAccount) {
                app.userSession.HasMultipleAccount = true;
                app.router().navigate("/Shared/ChooseAccount", true);
            }
            else {
                //Util.setCookie(Util.COOKIE_CHOOSEACCOUNT, "true");
                app.userSession.HasMultipleAccount = false;
                window.location.href = startUpPageUrl;
            }
        };
        AppProduction.prototype.updateUIForLoggedInUser = function () {
            this.userSession.EMail = app.userSession.EMail;
            this.userSession.AccountName = app.userSession.AccountName;
            kendo.bind($("div[data-id='loggedInUser']"), this.userSession);
            var isMulti = app.userSession.HasMultipleAccount;
            app.choosingMenuLoad();
            if (isMulti) {
                $("div[data-id='AccountListingView']").removeClass("hidden");
            }
            else {
                $("div[data-id='AccountListingView']").addClass("Remove");
                $("div[data-id='Email']").removeClass("EmailWithDropdown");
                $("div[data-id='Email']").addClass("EmailWithoutDropDown");
            }
            $("[data-id='App_Menu']").removeClass("hidden");
            $("li[data-id='AppRouter_History']").removeClass("hidden");
        };
        AppProduction.prototype.global = function () {
            return this.globalSigleton;
        };
        AppProduction.prototype.addGridFiltersLoaded = function (pageNmae, filterCount) {
            var filter = { pageName: pageNmae, filterCount: filterCount };
            this.gridFiltersLoaded.push(filter);
        };
        AppProduction.prototype.deleteGridFiltersLoaded = function (pageNmae) {
            var i, index;
            for (i = 0; i < this.gridFiltersLoaded.length; i++) {
                if (this.gridFiltersLoaded[i].pageName == pageNmae) {
                    index = i;
                    break;
                }
            }
            this.gridFiltersLoaded.splice(index, 1);
        };
        AppProduction.prototype.getGridFiltersStartIndex = function (pageNmae) {
            var i, startIndex = 0;
            for (i = 0; i < this.gridFiltersLoaded.length; i++) {
                if (this.gridFiltersLoaded[i].pageName == pageNmae) {
                    break;
                }
                startIndex += this.gridFiltersLoaded[i].filterCount;
            }
            return startIndex;
        };
        AppProduction.prototype.bindMenuClickEvents = function (menucontrol) {
            var me = this;
            //bind to top level menu, so any single page app pages get
            //handled in javascript, rather then a browser redirect
            $("a[data-clientside='y']").click(function (event) {
                var path = $(this).attr('href');
                event.preventDefault();
                //Update the URL and allow the trigger to fire, which will run
                //the code needed to update the display
                me.router().navigate(path, true);
                return false;
            });
        };
        //Add any validation rules to knockout
        AppProduction.prototype.createKOBindingHandlers = function () {
            ko.bindingHandlers.slideVisible = {
                update: function (element, valueAccessor, allBindingsAccessor) {
                    // First get the latest data that we're bound to
                    var value = valueAccessor(), allBindings = allBindingsAccessor();
                    // Next, whether or not the supplied model property is observable, get its current value
                    var valueUnwrapped = ko.utils.unwrapObservable(value);
                    // Grab some more data from another binding property
                    var duration = allBindings.slideDuration || 300; // 400ms is default duration unless otherwise specified
                    // Now manipulate the DOM element
                    if (valueUnwrapped == true)
                        $(element).slideDown(duration); // Make the element visible
                    else
                        $(element).slideUp(duration); // Make the element invisible
                }
            };
        };
        return AppProduction;
    }());
    //app property, private
    //singleton instance of the App object.  All objects should be using
    //the same instance of the app object
    var app = null;
    //App function
    //Returns the singleton instance of the App object
    function App() {
        if (app == null) {
            app = new AppProduction();
            app.loadGlobal();
        }
        return app;
    }
    Global.App = App;
})(Global || (Global = {}));
//# sourceMappingURL=global.js.map