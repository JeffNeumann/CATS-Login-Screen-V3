var ContractDetails;
(function (ContractDetails) {
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "ContractDetails";
    var TEMPLATE_LIST = "template_contractdetailsTemplate";
    // Controller
    var ContractDetailsController = (function () {
        function ContractDetailsController() {
            var me = this;
            this.contractDetailsVm = {
                ID: ko.observable(),
                TaskID: ko.observable(),
                ContractCode: ko.observable(),
                PropertyName: ko.observable(),
                PropertyCode: ko.observable(),
                Status: ko.observable(),
                TaskTypeName: ko.observable(),
                KeyDate: ko.observable(),
                SelectedContract: ko.observable(),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                close: function (e) {
                    me.close();
                }
            };
        }
        ContractDetailsController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.contractDetailsVm, me.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        ContractDetailsController.prototype.load = function (loadParams) {
            var _this = this;
            var me = this, waitContainer = UI.showWaitIndicator(this.container), deferred = $.Deferred();
            me.contractDetailsVm.TaskID(loadParams.taskID);
            me.contractDetailsVm.ContractCode(loadParams.ContractCode);
            me.contractDetailsVm.PropertyName(loadParams.PropertyName);
            me.contractDetailsVm.PropertyCode(loadParams.PropertyCode);
            me.contractDetailsVm.Status(loadParams.Status);
            me.contractDetailsVm.TaskTypeName(loadParams.TaskTypeName);
            me.contractDetailsVm.KeyDate(loadParams.KeyDate);
            TaskManagerData.GetContractDetails(loadParams.taskID)
                .done(function (response) {
                if (response.Success) {
                    _this.updateViewModel(response.Payload);
                }
                else {
                    UI.showErrorMessage(response.Messages);
                }
            }).always(function () {
                UI.hideWaitIndicator(_this.container, waitContainer);
                deferred.resolve();
            });
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            //var deferred = $.Deferred();
            //me.contractDetailsVm.ID(loadParams.taskID);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        ContractDetailsController.prototype.loadRecord = function (id) {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        ContractDetailsController.prototype.haveFieldsChanged = function () {
            return false;
        };
        //Resizes the control-Old not used
        ContractDetailsController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        ContractDetailsController.prototype.appRouterID = function (id) {
            return "ProcessingDetails";
        };
        //Returns a title for the page
        ContractDetailsController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - Contract Details";
        };
        ContractDetailsController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        ContractDetailsController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        ContractDetailsController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        ContractDetailsController.prototype.height = function (height) {
            //   if (height > 0) {
            $('#listWrap').height(height - 30);
            $('#rightformwrap').height(height - 115);
            this.listViewContainer.height(height - 30);
            this.rightFormContainer.height(height - 120);
            //  }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        ContractDetailsController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        ContractDetailsController.prototype.updateViewModel = function (contractMaster) {
            var me = this;
            me.contractDetailsVm.SelectedContract(this.createContractObservables(contractMaster));
        };
        ContractDetailsController.prototype.createContractObservables = function (contract) {
            var vmContractDetails = {
                ContractEffectiveDate: ko.observable(contract ? contract.ContractEffectiveDate ? moment(contract.ContractEffectiveDate).format("MM/DD/YYYY") : "" : ""),
                ContractExpDate: ko.observable(contract ? contract.ContractExpDate ? moment(contract.ContractExpDate).format("MM/DD/YYYY") : "" : ""),
                ContractCode: ko.observable(contract ? contract.ContractCode ? contract.ContractCode : "" : ""),
                CountyName: ko.observable(contract ? contract.CountyName ? contract.CountyName : "" : ""),
                AKADBAName: ko.observable(contract ? contract.AKADBAName ? contract.AKADBAName : "" : ""),
                FHANumber: ko.observable(contract ? contract.FHANumber ? contract.FHANumber : "" : ""),
                RCSEffectiveDate: ko.observable(contract ? contract.RCSEffectiveDate ? moment(contract.RCSEffectiveDate).format("MM/DD/YYYY") : "" : ""),
                RCSExpDate: ko.observable(contract ? contract.RCSExpDate ? moment(contract.RCSExpDate).format("MM/DD/YYYY") : "" : ""),
                UABaselineDate: ko.observable(contract ? contract.UABaselineDate ? moment(contract.UABaselineDate).format("MM/DD/YYYY") : "" : ""),
                UABaselineExpDate: ko.observable(contract ? contract.UABaselineExpDate ? moment(contract.UABaselineExpDate).format("MM/DD/YYYY") : "" : ""),
                HudManagerTitle: ko.observable(contract ? contract.HudManagerTitle ? contract.HudManagerTitle : "" : ""),
                HudManagerFirstName: ko.observable(contract ? contract.HudManagerFirstName ? contract.HudManagerFirstName : "" : ""),
                HudManagerMiddleName: ko.observable(contract ? contract.HudManagerMiddleName ? contract.HudManagerMiddleName : "" : ""),
                HudManagerLastName: ko.observable(contract ? contract.HudManagerLastName ? contract.HudManagerLastName : "" : ""),
                HUDOfficeName: ko.observable(contract ? contract.HUDOfficeName ? contract.HUDOfficeName : "" : ""),
                PropertyCode: ko.observable(contract ? contract.PropertyCode ? contract.PropertyCode : "" : ""),
                PropertyName: ko.observable(contract ? contract.PropertyName ? contract.PropertyName : "" : "")
            };
            return vmContractDetails;
        };
        ContractDetailsController.prototype.close = function () {
            var app = Global.App(), me = this;
            var id = me.contractDetailsVm.TaskID();
            if (id > 0) {
                app.router().closeTab("TaskManager/Main" + "/" + id);
            }
            else {
                app.router().closeTab("TaskManager/Main");
            }
        };
        return ContractDetailsController;
    }());
    ContractDetails.ContractDetailsController = ContractDetailsController;
})(ContractDetails || (ContractDetails = {}));
//# sourceMappingURL=ContractDetails.js.map