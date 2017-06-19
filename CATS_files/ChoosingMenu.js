var ChoosingMenu;
(function (ChoosingMenu) {
    //-------------------------------------------------------------------------------
    //Constants
    var ConfigOptions = new Configuration.Config_Config(), MainConfig = new Configuration.Main_Config();
    //-------------------------------------------------------------------------------
    // Classes
    var ProxyModel = (function () {
        function ProxyModel(name, userProxyID, isInUse) {
            if (name === void 0) { name = ""; }
            if (userProxyID === void 0) { userProxyID = 0; }
            if (isInUse === void 0) { isInUse = false; }
            this.Name = ko.observable("");
            this.UserProxyID = ko.observable(0);
            this.IsInUse = ko.observable(false);
            this.Name = ko.observable((isInUse ? "<b style='color:#e31937'>STOP</b> " : "") + name);
            this.UserProxyID = ko.observable(userProxyID);
            this.IsInUse = ko.observable(isInUse);
        }
        ProxyModel.prototype.ToggleProxy = function () {
            var app = Global.App(), self = this;
            Util.callWebService(Util.BuildURL([MainConfig.AdminbaseURL, "ToggleUserProxy", self.UserProxyID()]), "PUT").done(function (response) {
                if (response.Success) {
                    app.updateUIForLoggedInUser();
                    window.location.href = MainConfig.StartUpPage;
                }
            });
        };
        return ProxyModel;
    }());
    ChoosingMenu.ProxyModel = ProxyModel;
    var AccountModel = (function () {
        function AccountModel(name, id) {
            if (name === void 0) { name = ""; }
            if (id === void 0) { id = 0; }
            this.Name = ko.observable("");
            this.ID = ko.observable(0);
            this.Name = ko.observable(name);
            this.ID = ko.observable(id);
        }
        AccountModel.prototype.ChooseAccount = function (proxyList) {
            var self = this;
            var isProxyActive = _.find(proxyList(), function (x) {
                return x.IsInUse() === true;
            });
            if (isProxyActive) {
                UI.showConfirmDialog(UI.PHRASE_CHANGEACCOUNT, function () {
                    self.ChangeAccount(self);
                }, function () { });
            }
            else {
                self.ChangeAccount(self);
            }
        };
        AccountModel.prototype.ChangeAccount = function (self) {
            var app = Global.App();
            Util.callWebService(Util.BuildURL([MainConfig.AdminbaseURL, "ChooseAccount", self.ID()]), "POST").done(function () {
                app.userSession.AccountName = self.Name();
                app.updateUIForLoggedInUser();
                window.location.href = MainConfig.StartUpPage;
            });
        };
        return AccountModel;
    }());
    ChoosingMenu.AccountModel = AccountModel;
    var ProxyAccountMenuVm = (function () {
        function ProxyAccountMenuVm() {
            this.ProxyList = ko.observableArray();
            this.AccountList = ko.observableArray();
            this.UserName = ko.observable();
            this.IsChoosingMenuLoad = ko.observable(false);
            this.HasMultiAccount = ko.observable(false);
            this.HasMultiProxy = ko.computed(function () {
                return this.ProxyList().length > 0;
            }, this);
            this.CanShowChoosingMenu = ko.computed(function () {
                return (this.IsChoosingMenuLoad());
            }, this);
            this.IsParentVisible = ko.observable(false);
            this.IsManageProxyVisible = ko.observable(false);
            this.IsAccountVisible = ko.observable(false);
            this.IsProxyVisible = ko.observable(false);
            this.CanShowProxyIcon = ko.computed(function () {
                var isInUse = false;
                _.forIn(this.ProxyList(), function (x) {
                    if (x.IsInUse()) {
                        isInUse = true;
                    }
                });
                return isInUse;
            }, this);
        }
        ProxyAccountMenuVm.prototype.NavigateToProxy = function () {
            var app = Global.App();
            app.router().navigate("/Config/Proxy", true);
        };
        ProxyAccountMenuVm.prototype.ShowParent = function () {
            this.IsParentVisible(true);
        };
        ProxyAccountMenuVm.prototype.HideParent = function () {
            this.IsParentVisible(false);
        };
        ProxyAccountMenuVm.prototype.ShowAccountChild = function () {
            this.IsAccountVisible(true);
        };
        ProxyAccountMenuVm.prototype.HideAccountChild = function () {
            this.IsAccountVisible(false);
        };
        ProxyAccountMenuVm.prototype.ShowProxyChild = function () {
            this.IsProxyVisible(true);
        };
        ProxyAccountMenuVm.prototype.HideProxyChild = function () {
            this.IsProxyVisible(false);
        };
        return ProxyAccountMenuVm;
    }());
    ChoosingMenu.ProxyAccountMenuVm = ProxyAccountMenuVm;
    var ProxyAccountMenu = (function () {
        //------------------------------------------------------
        // Constructor
        function ProxyAccountMenu() {
            var self = ChoosingMenu.ProxyAccountMenu;
            //var self = this;
            var bound = false;
            var promises = [
                ProxyAccountMenu.loadAccounts(self.choosingMenuVm),
                ProxyAccountMenu.loadProxies(self.choosingMenuVm),
                ProxyAccountMenu.isManageProxyVisible(self.choosingMenuVm)
            ];
            $.when.apply($, promises).done(function () {
                ChoosingMenu.ProxyAccountMenu.choosingMenuVm.IsChoosingMenuLoad(true);
                //self.choosingMenuVm.IsChoosingMenuLoad(true);
                //clean node to stop duplicate binding
                var element = $("[data-id=choosing-menu]")[0];
                ko.cleanNode(element);
                var vm = { choosingMenuVm: ChoosingMenu.ProxyAccountMenu.choosingMenuVm };
                ko.applyBindings(vm, $("[data-id=choosing-menu]")[0]);
            });
        }
        ProxyAccountMenu.isManageProxyVisible = function (choosingMenuVM) {
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "IsProxyMenuVisible"]), "GET")
                .done(function (response) {
                if (response.Success) {
                    choosingMenuVM.IsManageProxyVisible = response.Payload;
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            });
        };
        ProxyAccountMenu.loadProxies = function (choosingMenuVm) {
            var self = this, app = Global.App();
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "GetUserProxies"]), "GET")
                .done(function (response) {
                var proxies = [];
                if (response.Success) {
                    response.Payload.forEach(function (x) {
                        proxies.push(new ProxyModel(x.Name, x.UserProxyID, x.IsInUse));
                    });
                    choosingMenuVm.ProxyList(proxies);
                    //choosingMenuVm.HasMultiProxy(proxies.length > 0);
                    //ChoosingMenu.ProxyAccountMenuVm.HasMultiProxy(proxies.length > 0);
                    choosingMenuVm.UserName(app.userSession.EMail + " (" + app.userSession.AccountName + ")");
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            });
        };
        ProxyAccountMenu.loadAccounts = function (choosingMenuVm) {
            var self = this;
            return Util.callWebService(Util.BuildURL([MainConfig.AdminbaseURL, "UserAccounts"]), "GET")
                .done(function (response) {
                if (response.Success) {
                    var accounts = [];
                    response.Payload.forEach(function (x) {
                        accounts.push(new AccountModel(x.Name, x.ID));
                    });
                    choosingMenuVm.AccountList(accounts);
                    choosingMenuVm.HasMultiAccount(accounts.length > 1);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            });
        };
        // this method is used form outside of this module (manage proxy)
        ProxyAccountMenu.ProxyModelFactory = function (Name, UserProxyID) {
            return new ProxyModel(Name, UserProxyID, false);
        };
        // Private Properties
        //------------------------------------------------------ 
        //public choosingMenuVm: any = new ProxyAccountMenuVm();
        ProxyAccountMenu.choosingMenuVm = new ProxyAccountMenuVm();
        return ProxyAccountMenu;
    }());
    ChoosingMenu.ProxyAccountMenu = ProxyAccountMenu;
})(ChoosingMenu || (ChoosingMenu = {}));
//# sourceMappingURL=ChoosingMenu.js.map