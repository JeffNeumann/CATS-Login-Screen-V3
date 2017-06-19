var DebtService;
(function (DebtService) {
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "DebtService";
    var TEMPLATE_LIST = "template_debtserviceTemplate";
    // Controller
    var DebtServiceController = (function () {
        function DebtServiceController() {
            var me = this;
            this.debtServiceVm = {
                ID: ko.observable(),
                TaskID: ko.observable(),
                ActivePanel: ko.observable(),
                DebtServiceID: ko.observable(),
                NumberLoans: ko.observable(),
                NumberOfLoans: ko.observableArray(),
                CalculationMethod: ko.observableArray(),
                DebtService: ko.observable(),
                DebtServiceLoans: ko.observableArray(),
                DebtServiceAmortization: ko.observableArray(),
                ContractCode: ko.observable(),
                PropertyName: ko.observable(),
                PropertyCode: ko.observable(),
                Status: ko.observable(),
                TaskTypeName: ko.observable(),
                DisplayKeyDate: ko.observable(),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                //get id of accordion clicked and open or close it
                accordionLinkClicked: function (data, event) {
                    if (me.debtServiceVm.ActivePanel() == data.LoanNumber()) {
                        me.debtServiceVm.ActivePanel(0);
                    }
                    else
                        me.debtServiceVm.ActivePanel(data.LoanNumber());
                }
            };
            this.debtServiceVm.NumberLoans.subscribe(function (newValue) {
                if (newValue > 0) {
                    me.debtServiceVm.ActivePanel(0);
                    me.debtServiceVm.DebtServiceLoans.removeAll();
                    for (var i = 1; i <= newValue; i++) {
                        me.debtServiceVm.DebtServiceLoans.push(me.createLoanObservable({
                            ID: 0,
                            TaskID: me.debtServiceVm.TaskID(),
                            LoanNumber: i,
                            CalculationID: 1,
                            PBCACalc: 0,
                            PrimaryDocument: 0,
                            OACalculation: 0,
                            OAVariance: 0,
                            ValidatingDocument: 0,
                            ValidatingCalc: 0,
                            ValidatingVar: 0,
                            iREMSInsPremium: 0,
                            IsActive: true
                        }));
                        me.debtServiceVm.DebtServiceAmortization.push(me.createAmoritizationObservable({
                            ID: 0,
                            TaskID: me.debtServiceVm.TaskID(),
                            DebtServiceLoanID: i,
                            MonthYear: 5 + i,
                            Principal: 7 + 1,
                            Interest: 8 + i,
                            MIP: 10 * i,
                            IRP: 11 + 1,
                            DebtService: 1000
                        }));
                    }
                }
            });
        }
        DebtServiceController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.debtServiceVm, me.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        DebtServiceController.prototype.load = function (loadParams) {
            var me = this;
            var deferred = $.Deferred();
            me.debtServiceVm.TaskID(loadParams.taskID);
            me.debtServiceVm.ContractCode(loadParams.ContractCode);
            me.debtServiceVm.PropertyName(loadParams.PropertyName);
            me.debtServiceVm.Status(loadParams.Status);
            me.debtServiceVm.TaskTypeName(loadParams.TaskTypeName);
            me.debtServiceVm.PropertyCode(loadParams.PropertyCode);
            me.debtServiceVm.DisplayKeyDate(loadParams.KeyDate);
            me.debtServiceVm.DebtServiceID(1);
            for (var i = 1; i <= 10; i++) {
                me.debtServiceVm.NumberOfLoans.push({ ID: i, Name: i });
            }
            me.debtServiceVm.CalculationMethod.push({ ID: 1, Name: 'Amoritization' });
            me.debtServiceVm.CalculationMethod.push({ ID: 2, Name: 'Billing Coupon' });
            me.debtServiceVm.NumberLoans(null);
            me.debtServiceVm.ActivePanel(0);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        DebtServiceController.prototype.loadRecord = function (id) {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        DebtServiceController.prototype.haveFieldsChanged = function () {
            return false;
        };
        //Resizes the control-Old not used
        DebtServiceController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        DebtServiceController.prototype.appRouterID = function (id) {
            return "DebtService";
        };
        //Returns a title for the page
        DebtServiceController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - Debt Service";
        };
        DebtServiceController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        DebtServiceController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        DebtServiceController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        DebtServiceController.prototype.height = function (height) {
            //   if (height > 0) {
            $('#listWrap').height(height - 30);
            $('#rightformwrap').height(height - 115);
            this.listViewContainer.height(height - 30);
            this.rightFormContainer.height(height - 120);
            //  }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        DebtServiceController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        ///PRIVATE FUNCTIONS/////////////////////
        DebtServiceController.prototype.createLoanObservable = function (loan) {
            var me = this;
            var loanVm = {
                ID: ko.observable(loan ? loan.ID : 0),
                TaskID: ko.observable(loan ? loan.TaskID : 0),
                DebtServiceID: ko.observable(loan ? loan.DebtServiceID : 0),
                LoanNumber: ko.observable(loan ? loan.LoanNumber : 0),
                CalculationID: ko.observable(loan ? loan.CalculationID : 0),
                PBCACalc: ko.observable(loan ? loan.PBCACalc : 0),
                PrimaryDocument: ko.observable(loan ? loan.PrimaryDocument : 0),
                OACalculation: ko.observable(loan ? loan.OACalculation : 0),
                OAVariance: ko.observable(loan ? loan.OAVariance : 0),
                ValidatingDocument: ko.observable(loan ? loan.ValidatingDocument : 0),
                ValidatingCalc: ko.observable(loan ? loan.ValidatingCalc : 0),
                ValidatingVar: ko.observable(loan ? loan.ValidatingVar : 0),
                iREMSInsPremium: ko.observable(loan ? loan.iREMSInsPremium : 0),
                IsActive: ko.observable(loan ? loan.IsActive : true)
            };
            return loanVm;
        };
        DebtServiceController.prototype.createAmoritizationObservable = function (amort) {
            var me = this;
            var amortVm = {
                ID: ko.observable(amort ? amort.ID : 0),
                TaskID: ko.observable(amort ? amort.TaskID : 0),
                DebtServiceLoanID: ko.observable(amort ? amort.DebtServiceLoanID : 0),
                MonthYear: ko.observable(amort ? amort.MonthYear : 0),
                Principal: ko.observable(amort ? amort.Principal : 0),
                Interest: ko.observable(amort ? amort.Interest : 0),
                MIP: ko.observable(amort ? amort.MIP : 0),
                IRP: ko.observable(amort ? amort.MIP : 0),
                DebtService: ko.observable(amort ? amort.MIP : 0),
            };
            return amortVm;
        };
        return DebtServiceController;
    }());
    DebtService.DebtServiceController = DebtServiceController;
    ko.bindingHandlers.bootstrapAccordion = {
        init: function (elem, value, allBindings) {
            var options = ko.utils.unwrapObservable(value()), handleClass = '[data-toggle]', contentClass = '.collapse', openItem = ko.utils.unwrapObservable(options.openItem) || false, itemClass = '.' + (ko.utils.unwrapObservable(options.item) || 'accordion-group'), items = $(elem).find(contentClass);
            // toggle: false required to hide items on load
            items.collapse({ parent: elem, toggle: false });
            if (openItem > -1)
                items.eq(openItem).collapse('show');
            // if the array is dynamic, the collapse should be re-initiated to work properly
            var list = allBindings.get('foreach');
            if (ko.isObservable(list)) {
                list.subscribe(function () {
                    $(elem).find(contentClass).collapse({ parent: elem, toggle: false });
                });
            }
            $(elem).on('click', handleClass, function () {
                $(elem).find(contentClass).collapse('hide');
                $(this).closest(itemClass).find(contentClass).collapse('show');
            });
        }
    };
})(DebtService || (DebtService = {}));
//# sourceMappingURL=DebtService.js.map