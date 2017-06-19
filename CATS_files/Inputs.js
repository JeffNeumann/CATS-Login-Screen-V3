var Inputs;
(function (Inputs) {
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "Inputs";
    var TEMPLATE_LIST = "template_inputsTemplate";
    // Controller
    var InputsController = (function () {
        function InputsController() {
            this.fieldsOnLoad = null;
            var me = this;
            this.InputsVm = {
                ID: ko.observable(),
                TaskID: ko.observable(),
                ContractCode: ko.observable(),
                PropertyCode: ko.observable(),
                PropertyName: ko.observable(),
                Status: ko.observable(),
                TaskTypeName: ko.observable(),
                DisplayKeyDate: ko.observable(),
                ContractRenewalCode: ko.observable(),
                ContractRenewalType: ko.observable(),
                ContractEffectiveDate: ko.observable(),
                RSCEffectiveDate: ko.observable(),
                KeyDate: ko.observable(),
                StatusID: ko.observable(),
                IsManual: ko.observable(),
                DefaultUARequired: ko.observable(),
                PreviousDebtServiceValue: ko.observable(),
                PreviousHudInsuredValue: ko.observable(),
                PreviousARExists: ko.observable(),
                NewRentEffectiveDate: ko.observable(),
                RentRequiredID: ko.observable(0),
                RentRequestSecondOptID: ko.observable(),
                RCSRequiredID: ko.observable(),
                UtilityRequiredID: ko.observable(),
                DebtServiceID: ko.observable(),
                HudInsuredID: ko.observable(),
                HudYesNoID: ko.observable(),
                FirstAppealYesNoID: ko.observable(0),
                SecondAppealYesNoID: ko.observable(0),
                InputConcurrencyHash: ko.observable(),
                RentRequest: ko.observableArray(),
                RentRequestSecondOpt: ko.observableArray(),
                RCSRequired: ko.observableArray(),
                UARequired: ko.observableArray(),
                DebtService: ko.observableArray(),
                HUDInsured: ko.observableArray(),
                YesNo: ko.observableArray(),
                HasSavePermissions: ko.observable(),
                HasEditDatePermissions: ko.observable(),
                DisableDebtService: ko.observable(),
                DisableRentRequest: ko.observable(),
                IsLoadRecord: ko.observable(),
                ShowSecondRentRequest: ko.observable(),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                close: function (e) {
                    me.confirmChange(function () {
                        me.close();
                    });
                },
                saveandclose: function (e) {
                    me.saveandclose();
                },
                save: function (e) {
                    me.save(false);
                },
                openCalendar: function () {
                    if ((me.InputsVm.StatusID() != 4 && me.InputsVm.StatusID() != 7) && me.InputsVm.HasEditDatePermissions()) {
                        //open calendar on button click event...was not working for some reason with bootstrap js
                        var input = me.container.find("[data-id='rentDatepicker']");
                        input.datepicker();
                        input.datepicker('hide');
                        input.datepicker('show');
                    }
                }
            };
            this.InputsVm.RentRequiredID.subscribe(function (newValue) {
                if (newValue == 3) {
                    me.InputsVm.ShowSecondRentRequest(true);
                }
                else {
                    me.InputsVm.ShowSecondRentRequest(false);
                }
            });
            this.InputsVm.HudInsuredID.subscribe(function (newValue) {
                if (newValue == 1) {
                    me.InputsVm.DebtServiceID(2);
                }
            });
            this.InputsVm.FirstAppealYesNoID.subscribe(function (newValue) {
                if ((newValue == 2 || newValue == null) && me.InputsVm.SecondAppealYesNoID() == 1) {
                    if (me.InputsVm.IsLoadRecord()) {
                        UI.showNotificationMessage('First Appeal must be Yes for Second Appeal to be set to Yes', UI.messageTypeValues.info);
                        me.InputsVm.SecondAppealYesNoID(2);
                    }
                }
            });
            this.InputsVm.SecondAppealYesNoID.subscribe(function (newValue) {
                if (newValue == 1 && me.InputsVm.FirstAppealYesNoID() != 1) {
                    if (me.InputsVm.IsLoadRecord()) {
                        UI.showNotificationMessage('First Appeal must be Yes for Second Appeal to be set to Yes', UI.messageTypeValues.info);
                        me.InputsVm.SecondAppealYesNoID(2);
                    }
                }
            });
        }
        InputsController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                ko.cleanNode(me.container[0]);
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                me.RentDatePicker = me.container.find("[data-id='RentDatepicker']");
                me.RentDatePicker.datepicker();
                ko.applyBindings(me.InputsVm, me.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        InputsController.prototype.load = function (loadParams) {
            var me = this;
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            var deferred = $.Deferred();
            me.InputsVm.TaskID(loadParams.taskID);
            me.InputsVm.ContractCode(loadParams.ContractCode);
            me.InputsVm.PropertyName(loadParams.PropertyName);
            me.InputsVm.Status(loadParams.Status);
            me.InputsVm.TaskTypeName(loadParams.TaskTypeName);
            me.InputsVm.PropertyCode(loadParams.PropertyCode);
            me.InputsVm.DisplayKeyDate(loadParams.KeyDate);
            //Need to check if viewmodel will be loaded again because of the dropdown subscribes
            me.InputsVm.IsLoadRecord(false);
            me.loadRecord(loadParams.taskID);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        InputsController.prototype.loadRecord = function (id) {
            var me = this, deferred = $.Deferred(), waitContainer = UI.showWaitIndicator(this.container);
            TaskManagerData.GetInputMaster(id)
                .done(function (response) {
                if (response.Success) {
                    var permissions = response.Permissions;
                    me.InputsVm.HasSavePermissions(permissions && permissions["SaveInput"] != undefined);
                    me.InputsVm.HasEditDatePermissions(permissions && permissions["SaveDate"] != undefined);
                    me.updateViewModel(response.Payload);
                }
                else {
                    UI.showErrorMessage(response.Messages);
                }
            })
                .always(function () {
                UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        InputsController.prototype.haveFieldsChanged = function () {
            var me = this;
            if (this.fieldsOnLoad == null) {
                //No data is loaded
                return false;
            }
            //Remove focus from the current control which will force
            //the view model to update with the most current values.
            UI.blurActiveElement();
            //Get the current values of the fields
            // var fieldsCurrent = JSON.stringify(this.viewModel.toJSON());
            var fieldsCurrent = ko.toJSON(this.getFields());
            //
            return this.fieldsOnLoad != fieldsCurrent;
        };
        //Resizes the control-Old not used
        InputsController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        InputsController.prototype.appRouterID = function (id) {
            return "InputsTemplate";
        };
        //Returns a title for the page
        InputsController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - Inputs";
        };
        InputsController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        //Call the web service to update the database in the DB
        InputsController.prototype.save = function (isExit) {
            var me = this, app = Global.App(), waitContainer = UI.showWaitIndicator(this.container), deferred = $.Deferred();
            var saveParams = me.getFields();
            if (me.haveFieldsChanged()) {
                TaskManagerData.SaveInputs(ko.toJS(saveParams))
                    .done(function (response) {
                    if (response.Success) {
                        UI.showNotificationMessage(UI.PHRASE_RECORDSAVED, UI.messageTypeValues.success);
                        me.InputsVm.InputConcurrencyHash(response.Payload);
                        me.fieldsOnLoad = ko.toJSON(me.getFields());
                        if (!isExit) {
                            UI.hideWaitIndicator(me.container, waitContainer);
                        }
                        else
                            me.close();
                        deferred.resolve();
                    }
                    else {
                        UI.showErrorMessage(response.Messages, response.ErrorMessages);
                        deferred.reject();
                    }
                })
                    .fail(function () {
                    deferred.reject();
                })
                    .always(function () {
                    UI.hideWaitIndicator(me.container, waitContainer);
                });
            }
            else {
                var errmessage = "No Input fields have changed.";
                UI.showErrorMessage([errmessage]);
                UI.hideWaitIndicator(me.container, waitContainer);
            }
            return deferred.promise();
        };
        InputsController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        InputsController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        InputsController.prototype.height = function (height) {
            //   if (height > 0) {
            $('#listWrap').height(height - 30);
            $('#rightformwrap').height(height - 115);
            this.listViewContainer.height(height - 30);
            this.rightFormContainer.height(height - 120);
            //  }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        InputsController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        //////////////////////////////
        //Private Functions//
        //////////////////////////////
        InputsController.prototype.saveandclose = function () {
            var me = this;
            me.save(true);
        };
        InputsController.prototype.confirmChange = function (onConfirmed) {
            var me = this;
            var fieldsChanged = me.haveFieldsChanged();
            if (fieldsChanged) {
                UI.showConfirmDialog(UI.PHRASE_UNSAVEDCHANGESONCLOSE, function () { onConfirmed(); }, function () { });
            }
            else
                onConfirmed();
        };
        InputsController.prototype.close = function () {
            var app = Global.App(), me = this;
            var id = me.InputsVm.TaskID();
            if (id > 0) {
                app.router().closeTab("TaskManager/Main" + "/" + id);
            }
            else {
                app.router().closeTab("TaskManager/Main");
            }
        };
        InputsController.prototype.RemoveAllDropdowns = function () {
            var me = this;
            me.InputsVm.RentRequest.removeAll();
            me.InputsVm.RCSRequired.removeAll();
            me.InputsVm.RentRequestSecondOpt.removeAll();
            me.InputsVm.DebtService.removeAll();
            me.InputsVm.UARequired.removeAll();
            me.InputsVm.HUDInsured.removeAll();
            me.InputsVm.YesNo.removeAll();
        };
        InputsController.prototype.updateViewModel = function (master) {
            var me = this;
            me.RemoveAllDropdowns();
            _.forEach(master.RentRequest, function (rentRequest) {
                me.InputsVm.RentRequest.push(me.createLookupObservable(rentRequest));
            });
            _.forEach(master.RCSRequired, function (rscRequired) {
                me.InputsVm.RCSRequired.push(me.createLookupObservable(rscRequired));
            });
            _.forEach(master.RentRequestSecondOpt, function (rentsecond) {
                me.InputsVm.RentRequestSecondOpt.push(me.createLookupObservable(rentsecond));
            });
            _.forEach(master.DebtService, function (debt) {
                me.InputsVm.DebtService.push(me.createLookupObservable(debt));
            });
            _.forEach(master.UARequired, function (uareq) {
                me.InputsVm.UARequired.push(me.createLookupObservable(uareq));
            });
            _.forEach(master.HUDInsured, function (hudinsured) {
                me.InputsVm.HUDInsured.push(me.createLookupObservable(hudinsured));
            });
            _.forEach(master.YesNo, function (yesNo) {
                me.InputsVm.YesNo.push(me.createLookupObservable(yesNo));
            });
            me.InputsVm.ContractRenewalCode(master.ContractRenewalCode);
            me.InputsVm.ContractRenewalType(master.ContractRenewalType);
            me.InputsVm.ContractEffectiveDate(master.ContractEffectiveDate);
            me.InputsVm.RSCEffectiveDate(master.RSCEffectiveDate);
            me.InputsVm.KeyDate(master.KeyDate);
            me.InputsVm.StatusID(master.StatusID);
            me.InputsVm.IsManual(master.IsManual);
            me.InputsVm.DefaultUARequired(master.DefaultUARequired);
            me.InputsVm.PreviousDebtServiceValue(master.PreviousDebtServiceValue);
            me.InputsVm.PreviousHudInsuredValue(master.PreviousHudInsuredValue);
            me.InputsVm.PreviousARExists(master.PreviousARExists);
            me.InputsVm.InputConcurrencyHash(master.InputConcurrencyHash);
            if (master.Input != null) {
                me.InputsVm.ID(master.Input.ID);
                me.InputsVm.NewRentEffectiveDate(moment(master.Input.NewRentEffectiveDate).format(Util.MOMENT_FORMAT_DATE));
                me.InputsVm.RentRequiredID(master.Input.RentRequiredID);
                me.InputsVm.RentRequestSecondOptID(master.Input.RentRequestSecondOptID);
                me.InputsVm.RCSRequiredID(master.Input.RCSRequiredID);
                me.InputsVm.UtilityRequiredID(master.Input.UtilityRequiredID);
                me.InputsVm.DebtServiceID(master.Input.DebtServiceID);
                me.InputsVm.HudInsuredID(master.Input.HudInsuredID);
                me.InputsVm.HudYesNoID(master.Input.HudYesNoID);
                me.InputsVm.FirstAppealYesNoID(master.Input.FirstAppealYesNoID);
                me.InputsVm.SecondAppealYesNoID(master.Input.SecondAppealYesNoID);
            }
            else {
                me.InputsVm.ID(0);
                if (!master.IsManual) {
                    me.SetDefaults(master);
                }
                else {
                    me.InputsVm.NewRentEffectiveDate(moment(master.KeyDate).format(Util.MOMENT_FORMAT_DATE));
                }
            }
            if (me.InputsVm.RentRequiredID() == 3) {
                me.InputsVm.ShowSecondRentRequest(true);
            }
            else {
                me.InputsVm.ShowSecondRentRequest(false);
            }
            if (me.InputsVm.HudInsuredID() == 1) {
                me.InputsVm.DebtServiceID(2);
            }
            //DISABLE ACCORDING TO RULES FOR CONTRACT RENEWAL CODE
            if (!master.IsManual) {
                if (master.ContractRenewalCode == '3a' || master.ContractRenewalCode == '3b' || master.ContractRenewalCode == '4') {
                    me.InputsVm.DisableRentRequest(true);
                }
                else if (master.ContractRenewalCode == '1a' || master.ContractRenewalCode == '1b' || master.ContractRenewalCode == '2') {
                    var today = new Date();
                    var contractDate = new Date(master.ContractEffectiveDate);
                    var keyDate = new Date(master.KeyDate);
                    var numYears = keyDate.getFullYear() - contractDate.getFullYear();
                    var m = keyDate.getMonth() - contractDate.getMonth();
                    if (m < 0 || (m === 0 && keyDate.getDate() < contractDate.getDate())) {
                        numYears--;
                    }
                    if (numYears % 5 == 0) {
                        //IS A MULTIPLE OF 5
                        me.InputsVm.DisableRentRequest(true);
                    }
                    else {
                        //IS NOT A MULTIPLE OF 5
                        me.InputsVm.DisableRentRequest(true);
                    }
                }
                else {
                    me.InputsVm.DisableRentRequest(false);
                }
            }
            else {
                me.InputsVm.DisableRentRequest(false);
            }
            me.InputsVm.IsLoadRecord(true);
            me.fieldsOnLoad = ko.toJSON(me.getFields());
        };
        InputsController.prototype.SetDefaults = function (master) {
            var me = this;
            me.InputsVm.NewRentEffectiveDate(moment(master.KeyDate).format(Util.MOMENT_FORMAT_DATE));
            //SET RENT REQUEST
            if (master.ContractRenewalCode == '3a' || master.ContractRenewalCode == '3b' || master.ContractRenewalCode == '4') {
                me.InputsVm.RentRequiredID(1);
                me.InputsVm.DisableRentRequest(true);
            }
            else if (master.ContractRenewalCode == '1a' || master.ContractRenewalCode == '1b' || master.ContractRenewalCode == '2') {
                var today = new Date();
                var contractDate = new Date(master.ContractEffectiveDate);
                var keyDate = new Date(master.KeyDate);
                var numYears = keyDate.getFullYear() - contractDate.getFullYear();
                var m = keyDate.getMonth() - contractDate.getMonth();
                if (m < 0 || (m === 0 && keyDate.getDate() < contractDate.getDate())) {
                    numYears--;
                }
                if (numYears % 5 == 0) {
                    //IS A MULTIPLE OF 5
                    me.InputsVm.RentRequiredID(4);
                    me.InputsVm.DisableRentRequest(true);
                }
                else {
                    //IS NOT A MULTIPLE OF 5
                    me.InputsVm.RentRequiredID(1);
                    me.InputsVm.DisableRentRequest(true);
                }
            }
            else {
                me.InputsVm.DisableRentRequest(false);
            }
            //SET RCS REQUIRED
            if (master.ContractRenewalCode == '3b') {
                me.InputsVm.RCSRequiredID(1);
            }
            else if (master.ContractRenewalCode == '5a' || master.ContractRenewalCode == '5b') {
                me.InputsVm.RCSRequiredID(0);
            }
            else if (me.InputsVm.RentRequiredID() == 4) {
                me.InputsVm.RCSRequiredID(2);
            }
            else if (me.InputsVm.RentRequiredID() == 1) {
                if (master.RSCEffectiveDate == null) {
                    me.InputsVm.RCSRequiredID(1);
                }
                else {
                    var rscDate = new Date(master.RSCEffectiveDate);
                    var add5years = rscDate.getFullYear() + 5;
                    rscDate.setFullYear(add5years);
                    if (me.InputsVm.KeyDate() < rscDate) {
                        me.InputsVm.RCSRequiredID(3);
                    }
                }
            }
            //SET UA REQUIRED
            if (master.DefaultUARequired > 0) {
                me.InputsVm.UtilityRequiredID(master.DefaultUARequired);
            }
            //SET HUD RCS
            me.InputsVm.HudYesNoID(2);
            //SET DEBT SERVICE
            if (master.PreviousDebtServiceValue > 0) {
                me.InputsVm.DebtServiceID(master.PreviousDebtServiceValue);
            }
            //SET HUD INSURED
            if (master.PreviousHudInsuredValue > 0) {
                me.InputsVm.HudInsuredID(master.PreviousHudInsuredValue);
            }
            //SET FIRST APPEAL
            me.InputsVm.FirstAppealYesNoID(2);
            //SET SECOND APPEAL
            me.InputsVm.SecondAppealYesNoID(2);
        };
        InputsController.prototype.getFields = function () {
            var me = this;
            var saveParams = {
                ID: me.InputsVm.ID(),
                TaskID: me.InputsVm.TaskID(),
                StatusID: me.InputsVm.StatusID(),
                NewRentEffectiveDate: me.InputsVm.NewRentEffectiveDate(),
                RentRequiredID: me.InputsVm.RentRequiredID(),
                RCSRequiredID: me.InputsVm.RCSRequiredID(),
                RentRequestSecondOptID: me.InputsVm.RentRequestSecondOptID(),
                UtilityRequiredID: me.InputsVm.UtilityRequiredID(),
                DebtServiceID: me.InputsVm.DebtServiceID(),
                HudInsuredID: me.InputsVm.HudInsuredID(),
                FirstAppealYesNoID: me.InputsVm.FirstAppealYesNoID,
                HudYesNoID: me.InputsVm.HudYesNoID(),
                SecondAppealYesNoID: me.InputsVm.SecondAppealYesNoID(),
                InputConcurrencyHash: me.InputsVm.InputConcurrencyHash()
            };
            return saveParams;
        };
        InputsController.prototype.createLookupObservable = function (lookup) {
            var me = this;
            var vmLookup = {
                ID: ko.observable(lookup ? lookup.ID : 0),
                Name: ko.observable(lookup ? lookup.Name : "")
            };
            return vmLookup;
        };
        return InputsController;
    }());
    Inputs.InputsController = InputsController;
})(Inputs || (Inputs = {}));
//# sourceMappingURL=Inputs.js.map