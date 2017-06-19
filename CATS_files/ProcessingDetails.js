var ProcessingDetails;
(function (ProcessingDetails) {
    var ConfigOptions = new Configuration.TaskManager_Config();
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "ProcessingDetails";
    var TEMPLATE_LIST = "template_processingdetailsTemplate";
    // Controller
    var ProcessingDetailsController = (function () {
        function ProcessingDetailsController() {
            //private rightFormContainer: JQuery;
            this.fieldsOnLoad = null;
            this.lookupAdmStepsInitialPackages = [];
            this.lookupAdmStepsRequestAdditionalInfo = [];
            this.lookupAdmStepsCompletePackages = [];
            this.lookupAdmStepsProcessing = [];
            this.lookupAdmStepsFinalizing = [];
            this.newStepID = -1;
            var me = this;
            this.processingDetailsVm = {
                ID: ko.observable(),
                TaskID: ko.observable(),
                ClientID: ko.observable(),
                ContractCode: ko.observable(),
                PropertyCode: ko.observable(),
                PropertyName: ko.observable(),
                StatusID: ko.observable(),
                Status: ko.observable(),
                TaskTypeName: ko.observable(),
                DisplayKeyDate: ko.observable(),
                IsLoadRecord: ko.observable(),
                HasSavePermission: ko.observable(false),
                HasSaveClosedTasksPermission: ko.observable(false),
                HasCloseTaskPermission: ko.observable(false),
                HasChangeResetActionStepsPermission: ko.observable(false),
                AdminStepID1Selected: ko.observable(),
                AdminStepID2Selected: ko.observable(),
                AdminStepID3Selected: ko.observable(),
                AdminStepID4Selected: ko.observable(),
                AdminStepID5Selected: ko.observable(),
                Categories: ko.observableArray(),
                Links: ko.observableArray(),
                TaskClosed: ko.observable(false),
                Notes: ko.observable(),
                TimeZoneAbbr: ko.observable(),
                //lookups
                AdmStepsInitialPackage: ko.observableArray(),
                AdmStepsRequestAdditionalInfo: ko.observableArray(),
                AdmStepsCompletePackage: ko.observableArray(),
                AdmStepsProcessing: ko.observableArray(),
                AdmStepsFinalizing: ko.observableArray(),
                //events
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                addStep: function (e) {
                    me.dataChanged = true;
                    me.addStep(e);
                },
                closeTask: function (e) {
                    me.onCloseTask();
                },
                removeStep: function (e) {
                    me.dataChanged = true;
                    me.removeStep(e);
                },
                linkClicked: function (e) {
                    me.openLinkURL(e);
                },
                openStartDateCalendar: function (e) {
                    me.openCalendar(e, true);
                },
                openEndDateCalendar: function (e) {
                    me.openCalendar(e, false);
                },
                addNotesReset: function (e) {
                    me.resetNotes();
                },
                addNotes: function (e) {
                    me.dataChanged = true;
                    me.addNotes();
                },
                save: function (e) {
                    me.save(false);
                },
                saveandclose: function (e) {
                    me.save(true);
                },
                close: function (e) {
                    me.confirmChange(function () {
                        me.close();
                    });
                },
            };
        }
        ProcessingDetailsController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.processingDetailsVm, me.container[0]);
                me.initLists();
                deferred.resolve();
            });
            return deferred.promise();
        };
        ProcessingDetailsController.prototype.load = function (loadParams) {
            var me = this, deferred = $.Deferred();
            me.processingDetailsVm.TaskID(loadParams.taskID);
            me.processingDetailsVm.ContractCode(loadParams.ContractCode);
            me.processingDetailsVm.PropertyName(loadParams.PropertyName);
            me.processingDetailsVm.Status(loadParams.Status);
            me.processingDetailsVm.TaskTypeName(loadParams.TaskTypeName);
            me.processingDetailsVm.PropertyCode(loadParams.PropertyCode);
            me.processingDetailsVm.DisplayKeyDate(loadParams.KeyDate);
            //Need to check if viewmodel will be loaded again because of the dropdown subscribes
            me.processingDetailsVm.IsLoadRecord(false);
            me.loadRecord(loadParams.taskID);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        ProcessingDetailsController.prototype.loadRecord = function (id) {
            var me = this, app = Global.App(), deferred = $.Deferred(), waitContainer;
            deferred.resolve();
            waitContainer = UI.showWaitIndicator(me.container);
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "TaskProcessingStep", "GetTaskProcessingDetails", id]), "GET")
                .done(function (response) {
                if (response.Success) {
                    me.setPermissions(response);
                    me.updateViewModel(response.Payload);
                    me.fieldsOnLoad = ko.toJSON(me.createSteps());
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_LOADING_TASK_DETAILS_DATA]);
                deferred.resolve();
            })
                .always(function () {
                UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        ProcessingDetailsController.prototype.haveFieldsChanged = function () {
            var me = this;
            if (this.fieldsOnLoad == null) {
                //No data is loaded
                return false;
            }
            UI.blurActiveElement();
            var currentFields = ko.toJSON(me.createSteps());
            if (currentFields != me.fieldsOnLoad) {
                return true;
            }
            else {
                return false;
            }
        };
        //Resizes the control-Old not used
        ProcessingDetailsController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        ProcessingDetailsController.prototype.appRouterID = function (id) {
            return "ProcessingDetails";
        };
        //Returns a title for the page
        ProcessingDetailsController.prototype.title = function () {
            return "Task Manager - Processing Details";
        };
        ProcessingDetailsController.prototype.subTitle = function () {
            return "";
        };
        ProcessingDetailsController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        ProcessingDetailsController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        ProcessingDetailsController.prototype.height = function (height) {
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        ProcessingDetailsController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        //========private methods
        ProcessingDetailsController.prototype.initLists = function () {
            this.initListsExceptLinks();
            this.processingDetailsVm.Links([]);
        };
        ProcessingDetailsController.prototype.initListsExceptLinks = function () {
            this.processingDetailsVm.Categories([]);
            this.processingDetailsVm.AdmStepsCompletePackage([]);
            this.processingDetailsVm.AdmStepsFinalizing([]);
            this.processingDetailsVm.AdmStepsInitialPackage([]);
            this.processingDetailsVm.AdmStepsProcessing([]);
            this.processingDetailsVm.AdmStepsRequestAdditionalInfo([]);
        };
        ProcessingDetailsController.prototype.createCategoryObservable = function (localIndex, category) {
            var app = Global.App(), me = this;
            var categoryObservable = {
                CategoryID: ko.observable(category.ID > 0 ? category.ID : category.CategoryID),
                CategoryName: ko.observable(category.ID > 0 ? category.Name : category.CategoryName),
                Steps: ko.observableArray(),
            };
            return categoryObservable;
        };
        ProcessingDetailsController.prototype.createStepObservable = function (localIndex, step) {
            var app = Global.App(), me = this;
            var stepObservable = {
                LocalIndex: ko.observable(localIndex),
                ID: ko.observable(step.ID),
                TaskID: ko.observable(step.TaskID),
                ConcurrencyHash: ko.observable(step.ConcurrencyHash),
                ProcessingStepCategoryID: ko.observable(step.ProcessingStepCategoryID),
                AdmProcessingStepID: ko.observable(step.AdmProcessingStepID),
                ProcessingStepName: ko.observable(step.ProcessingStepName),
                StartOnInvoice: ko.observable(step.StartOnInvoice),
                StartReadyToInvoice: ko.observable(step.StartReadyToInvoice),
                StartStartTaskTimer: ko.observable(step.StartStartTaskTimer),
                StartEndTaskTimer: ko.observable(step.StartEndTaskTimer),
                EndingName: ko.observable(step.EndingName),
                EndOnInvoice: ko.observable(step.EndOnInvoice),
                EndReadyToInvoice: ko.observable(step.EndReadyToInvoice),
                EndStartTaskTimer: ko.observable(step.EndStartTaskTimer),
                EndEndTaskTimer: ko.observable(step.EndEndTaskTimer),
                Required: ko.observable(step.Required),
                IsActive: ko.observable(step.IsActive),
                StartDate: ko.observable(step.StartDate ? moment(step.StartDate).format("MM/DD/YYYY HH:mm A") : ''),
                EndDate: ko.observable(step.EndDate ? moment(step.EndDate).format("MM/DD/YYYY HH:mm A") : ''),
                UserInStartRole: ko.observable(step.UserInStartRole),
                UserInEndRole: ko.observable(step.UserInEndRole),
                StartLocked: ko.observable(step.StartLocked),
                EndLocked: ko.observable(step.EndLocked),
            };
            return stepObservable;
        };
        ProcessingDetailsController.prototype.createLinkObservable = function (stepID, link) {
            var linkObservable = {
                StepID: ko.observable(stepID),
                LinkName: ko.observable(link.LinkName),
                LinkURL: ko.observable(link.LinkURL),
            };
            return linkObservable;
        };
        ProcessingDetailsController.prototype.createOptionObservable = function (option) {
            var optionObservable = {
                ID: ko.observable(option.ID),
                Name: ko.observable(option.Name),
            };
            return optionObservable;
        };
        ProcessingDetailsController.prototype.setPermissions = function (response) {
            var me = this;
            var permissions = response.Permissions;
            me.processingDetailsVm.HasSaveClosedTasksPermission(permissions && permissions["SaveClosedTaskDetails"] != undefined);
            me.processingDetailsVm.HasCloseTaskPermission(permissions && permissions["CloseTask"] != undefined);
            me.processingDetailsVm.HasChangeResetActionStepsPermission(permissions && permissions["ChangeResetActionSteps"] != undefined);
        };
        ProcessingDetailsController.prototype.updateViewModel = function (records) {
            var app = Global.App(), me = this;
            var counter = 0;
            me.initLists();
            me.processingDetailsVm.ClientID(records.ClientID);
            me.processingDetailsVm.StatusID(records.StatusID);
            me.processingDetailsVm.TimeZoneAbbr(records.TimeZoneAbbr);
            me.processingDetailsVm.HasSavePermission(false);
            if (me.processingDetailsVm.HasSaveClosedTasksPermission() &&
                (records.StatusID != 7)) {
                me.processingDetailsVm.HasSaveClosedTasksPermission(false);
            }
            if (me.processingDetailsVm.HasCloseTaskPermission() &&
                records.StatusID != 6) {
                me.processingDetailsVm.HasCloseTaskPermission(false);
            }
            if (me.processingDetailsVm.HasChangeResetActionStepsPermission() &&
                (records.StatusID == 4 || records.StatusID == 7)) {
                me.processingDetailsVm.HasChangeResetActionStepsPermission(false);
            }
            if (me.processingDetailsVm.Status() != records.Status) {
                me.processingDetailsVm.Status(records.Status);
                me.processingDetailsVm.StatusID(records.StatusID);
                Main.TaskStatus = records.Status;
            }
            me.processingDetailsVm.TaskClosed(records.StatusID == 7);
            for (var i = 0; i < records.Categories.length; i++) {
                me.processingDetailsVm.Categories.push(me.createCategoryObservable(counter, records.Categories[i]));
                me.processingDetailsVm.Categories()[i].Steps([]);
                for (var j = 0; j < records.Categories[i].Steps.length; j++) {
                    if (!records.Categories[i].Steps[j].StartLocked && records.Categories[i].Steps[j].UserInStartRole) {
                        me.processingDetailsVm.HasSavePermission(true);
                    }
                    else if (records.Categories[i].Steps[j].StartLocked && me.processingDetailsVm.HasChangeResetActionStepsPermission()) {
                        me.processingDetailsVm.HasSavePermission(true);
                    }
                    if (!records.Categories[i].Steps[j].EndLocked && records.Categories[i].Steps[j].UserInEndRole) {
                        me.processingDetailsVm.HasSavePermission(true);
                    }
                    else if (records.Categories[i].Steps[j].EndLocked && me.processingDetailsVm.HasChangeResetActionStepsPermission()) {
                        me.processingDetailsVm.HasSavePermission(true);
                    }
                    me.processingDetailsVm.Categories()[i].Steps.push(me.createStepObservable(counter, records.Categories[i].Steps[j]));
                    counter++;
                    for (var k = 0; k < records.Categories[i].Steps[j].Links.length; k++) {
                        me.processingDetailsVm.Links.push(me.createLinkObservable(records.Categories[i].Steps[j].ID, records.Categories[i].Steps[j].Links[k]));
                    }
                }
            }
            for (var i = 0; i < records.AdmStepsInitialPackage.length; i++) {
                me.lookupAdmStepsInitialPackages.push(records.AdmStepsInitialPackage[i]);
            }
            for (var i = 0; i < records.AdmStepsRequestAdditionalInfo.length; i++) {
                me.lookupAdmStepsRequestAdditionalInfo.push(records.AdmStepsRequestAdditionalInfo[i]);
            }
            for (var i = 0; i < records.AdmStepsCompletePackage.length; i++) {
                me.lookupAdmStepsCompletePackages.push(records.AdmStepsCompletePackage[i]);
            }
            for (var i = 0; i < records.AdmStepsProcessing.length; i++) {
                me.lookupAdmStepsProcessing.push(records.AdmStepsProcessing[i]);
            }
            for (var i = 0; i < records.AdmStepsFinalizing.length; i++) {
                me.lookupAdmStepsFinalizing.push(records.AdmStepsFinalizing[i]);
            }
            me.processingDetailsVm.AdmStepsCompletePackage(records.AdmStepsCompletePackage);
            me.processingDetailsVm.AdmStepsFinalizing(records.AdmStepsFinalizing);
            me.processingDetailsVm.AdmStepsInitialPackage(records.AdmStepsInitialPackage);
            me.processingDetailsVm.AdmStepsProcessing(records.AdmStepsProcessing);
            me.processingDetailsVm.AdmStepsRequestAdditionalInfo(records.AdmStepsRequestAdditionalInfo);
            if (me.processingDetailsVm.HasSavePermission() &&
                (records.StatusID == 4 || records.StatusID == 7)) {
                me.processingDetailsVm.HasSavePermission(false);
            }
            me.fieldsOnLoad = ko.toJSON(me.createSteps());
            me.container.find(".step-date-picker").datetimepicker({ maxDate: new Date(), useCurrent: false });
        };
        ProcessingDetailsController.prototype.openCalendar = function (step, isStart) {
            var app = Global.App(), me = this;
            //default to current timestamp if null
            if (isStart && !step.StartDate()) {
                step.StartDate(moment((new Date())).format("MM/DD/YYYY HH:mm A"));
            }
            else if (!step.EndDate()) {
                step.EndDate(moment((new Date())).format("MM/DD/YYYY HH:mm A"));
            }
            //var datePickerID = (isStart ? 'startDatePicker' : 'endDatePicker') + step.LocalIndex();
            //var input = me.container.find("[data-id='" + datePickerID + "']");
            //input.datetimepicker({maxDate: new Date()});
            //input.datetimepicker('show');
        };
        ProcessingDetailsController.prototype.addStep = function (categoryID) {
            var me = this, app = Global.App(), deferred = $.Deferred(), waitContainer, invalid = false, admStepID;
            deferred.resolve();
            me.processingDetailsVm.HasSavePermission(true);
            switch (categoryID) {
                case 1:
                    if (!me.processingDetailsVm.AdminStepID1Selected()) {
                        invalid = true;
                    }
                    else {
                        admStepID = me.processingDetailsVm.AdminStepID1Selected();
                    }
                    break;
                case 2:
                    if (!me.processingDetailsVm.AdminStepID2Selected()) {
                        invalid = true;
                    }
                    else {
                        admStepID = me.processingDetailsVm.AdminStepID2Selected();
                    }
                    break;
                case 3:
                    if (!me.processingDetailsVm.AdminStepID3Selected()) {
                        invalid = true;
                    }
                    else {
                        admStepID = me.processingDetailsVm.AdminStepID3Selected();
                    }
                    break;
                case 4:
                    if (!me.processingDetailsVm.AdminStepID4Selected()) {
                        invalid = true;
                    }
                    else {
                        admStepID = me.processingDetailsVm.AdminStepID4Selected();
                    }
                    break;
                case 5:
                    if (!me.processingDetailsVm.AdminStepID5Selected()) {
                        invalid = true;
                    }
                    else {
                        admStepID = me.processingDetailsVm.AdminStepID5Selected();
                    }
                    break;
            }
            if (invalid) {
                me.showError();
                return;
            }
            waitContainer = UI.showWaitIndicator(me.container);
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "TaskProcessingStep", "GetNewProcessingStep", admStepID]), "GET")
                .done(function (response) {
                if (response.Success) {
                    me.newStep = response.Payload;
                    me.newStep.TaskID = me.processingDetailsVm.TaskID();
                    me.newStepID--;
                    me.newStep.ID = me.newStepID; //links need unique step ID
                    var categories = me.createCategoriesAndSteps();
                    _.forEach(categories, function (category) {
                        if (categoryID == category.CategoryID) {
                            category.Steps.splice(0, 0, me.newStep);
                        }
                    });
                    me.initListsExceptLinks();
                    var counter = 0;
                    for (var i = 0; i < categories.length; i++) {
                        me.processingDetailsVm.Categories.push(me.createCategoryObservable(counter, categories[i]));
                        me.processingDetailsVm.Categories()[i].Steps([]);
                        for (var j = 0; j < categories[i].Steps.length; j++) {
                            me.processingDetailsVm.Categories()[i].Steps.push(me.createStepObservable(counter, categories[i].Steps[j]));
                            counter++;
                        }
                    }
                    me.processingDetailsVm.AdmStepsCompletePackage(me.lookupAdmStepsCompletePackages);
                    me.processingDetailsVm.AdmStepsFinalizing(me.lookupAdmStepsFinalizing);
                    me.processingDetailsVm.AdmStepsInitialPackage(me.lookupAdmStepsInitialPackages);
                    me.processingDetailsVm.AdmStepsProcessing(me.lookupAdmStepsProcessing);
                    me.processingDetailsVm.AdmStepsRequestAdditionalInfo(me.lookupAdmStepsRequestAdditionalInfo);
                    me.processingDetailsVm.AdminStepID1Selected();
                    me.processingDetailsVm.AdminStepID2Selected();
                    me.processingDetailsVm.AdminStepID3Selected();
                    me.processingDetailsVm.AdminStepID4Selected();
                    me.processingDetailsVm.AdminStepID5Selected();
                    for (var i = 0; i < me.newStep.Links.length; i++) {
                        me.processingDetailsVm.Links.push(me.createLinkObservable(me.newStepID, me.newStep.Links[i]));
                    }
                    me.fieldsOnLoad = ko.toJSON(me.createSteps());
                    me.container.find(".step-date-picker").datetimepicker({ maxDate: new Date(), useCurrent: false });
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_LOADING_TASK_DETAILS_DATA]);
                deferred.resolve();
            })
                .always(function () {
                UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        ProcessingDetailsController.prototype.onCloseTask = function () {
            var me = this, message, SessionWindow;
            message = me.haveFieldsChanged()
                ? "If you continue, any unsaved changes for the current record will be lost. Do you wish to continue?"
                : "Are you sure you wish to close the task?";
            SessionWindow = $("#notificationWindow").dialog({
                dialogClass: "no-close",
                title: "Confirmation",
                autoOpen: false,
                modal: true,
                buttons: {
                    "Yes": function () {
                        //refresh token
                        var self = $(this);
                        SessionWindow.dialog("close");
                        me.closeTask();
                    },
                    "No": function () {
                        SessionWindow.dialog("close");
                    }
                }
            });
            SessionWindow.html(message);
            SessionWindow.dialog("open");
        };
        ProcessingDetailsController.prototype.closeTask = function () {
            var me = this, app = Global.App(), deferred = $.Deferred(), waitContainer = UI.showWaitIndicator(me.container);
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "TaskProcessingStep", "CloseTask"]), "POST", me.processingDetailsVm.TaskID())
                .done(function (response) {
                if (response.Success) {
                    UI.showNotificationMessage("The task has been closed.", UI.messageTypeValues.success);
                    me.updateViewModel(response.Payload);
                }
                else {
                    me.updateViewModel(response.Payload);
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    deferred.reject(response.Messages);
                }
            })
                .fail(function () {
                UI.showErrorMessage(["An error has occurred while closing the task."]);
                deferred.reject();
            })
                .always(function () {
                UI.hideWaitIndicator(me.container, waitContainer);
            });
        };
        ProcessingDetailsController.prototype.removeStep = function (data) {
            var me = this, i;
            _.forEach(me.processingDetailsVm.Categories(), function (category) {
                _.forEach(category.Steps(), function (step) {
                    if (step.ID() == data.ID()) {
                        step.IsActive(false);
                    }
                });
            });
        };
        ProcessingDetailsController.prototype.showError = function () {
            var SessionWindow = $("#notificationWindow").dialog({
                dialogClass: "no-close",
                title: "Error",
                autoOpen: false,
                modal: true,
                buttons: {
                    "OK": function () {
                        SessionWindow.dialog("close");
                    }
                }
            });
            SessionWindow.html('Please select a step from dropdown and try again.');
            SessionWindow.dialog("open");
        };
        ProcessingDetailsController.prototype.createCategoriesAndSteps = function () {
            var app = Global.App(), me = this, i;
            var categories = [];
            var index = 0;
            _.forEach(me.processingDetailsVm.Categories(), function (category) {
                categories.push({
                    CategoryID: category.CategoryID(),
                    CategoryName: category.CategoryName(),
                    Steps: []
                });
                _.forEach(category.Steps(), function (step) {
                    var stepEdited = {
                        ID: step.ID(),
                        TaskID: me.processingDetailsVm.TaskID(),
                        ConcurrencyHash: step.ConcurrencyHash(),
                        ProcessingStepCategoryID: step.ProcessingStepCategoryID(),
                        AdmProcessingStepID: step.AdmProcessingStepID(),
                        ProcessingStepName: step.ProcessingStepName(),
                        StartOnInvoice: step.StartOnInvoice(),
                        StartReadyToInvoice: step.StartReadyToInvoice(),
                        StartStartTaskTimer: step.StartStartTaskTimer(),
                        StartEndTaskTimer: step.StartEndTaskTimer(),
                        EndingName: step.EndingName(),
                        EndOnInvoice: step.EndOnInvoice(),
                        EndReadyToInvoice: step.EndReadyToInvoice(),
                        EndStartTaskTimer: step.EndStartTaskTimer(),
                        EndEndTaskTimer: step.EndEndTaskTimer(),
                        Required: step.Required(),
                        IsActive: step.IsActive(),
                        StartDate: step.StartDate(),
                        EndDate: step.EndDate(),
                        UserInStartRole: step.UserInStartRole(),
                        UserInEndRole: step.UserInEndRole(),
                        StartLocked: step.StartLocked(),
                        EndLocked: step.EndLocked(),
                    };
                    categories[index].Steps.push(stepEdited);
                });
                index++;
            });
            return categories;
        };
        ProcessingDetailsController.prototype.createSteps = function () {
            var app = Global.App(), me = this, i;
            var steps = [];
            _.forEach(me.processingDetailsVm.Categories(), function (category) {
                _.forEach(category.Steps(), function (step) {
                    var stepEdited = {
                        ID: step.ID(),
                        TaskID: me.processingDetailsVm.TaskID(),
                        ConcurrencyHash: step.ConcurrencyHash(),
                        ProcessingStepCategoryID: step.ProcessingStepCategoryID(),
                        AdmProcessingStepID: step.AdmProcessingStepID(),
                        ProcessingStepName: step.ProcessingStepName(),
                        StartOnInvoice: step.StartOnInvoice(),
                        StartReadyToInvoice: step.StartReadyToInvoice(),
                        StartStartTaskTimer: step.StartStartTaskTimer(),
                        StartEndTaskTimer: step.StartEndTaskTimer(),
                        EndingName: step.EndingName(),
                        EndOnInvoice: step.EndOnInvoice(),
                        EndReadyToInvoice: step.EndReadyToInvoice(),
                        EndStartTaskTimer: step.EndStartTaskTimer(),
                        EndEndTaskTimer: step.EndEndTaskTimer(),
                        Required: step.Required(),
                        IsActive: step.IsActive(),
                        StartDate: step.StartDate(),
                        EndDate: step.EndDate(),
                        UserInStartRole: step.UserInStartRole(),
                        UserInEndRole: step.UserInEndRole(),
                        StartLocked: step.StartLocked(),
                        EndLocked: step.EndLocked(),
                    };
                    steps.push(stepEdited);
                });
            });
            return steps;
        };
        ProcessingDetailsController.prototype.save = function (isExit) {
            var app = Global.App(), me = this, deferred = $.Deferred();
            if (!me.haveFieldsChanged() && !me.dataChanged) {
                var errmessage = "No Processing Details have changed.";
                UI.showErrorMessage([errmessage]);
                return;
            }
            if (me.processingDetailsVm.StatusID() == 7 && !me.processingDetailsVm.Notes()) {
                //If the task status is currently "Closed", pop-up a window requiring the user to enter a Note.
                me.container.find("div[data-id='ui_taskNotesDialog']").modal("show");
                me.isExit = isExit;
                return;
            }
            var steps = me.createSteps();
            var request = {
                TaskID: me.processingDetailsVm.TaskID(),
                Notes: me.processingDetailsVm.Notes(),
                Steps: steps,
            };
            var waitContainer = UI.showWaitIndicator(me.container);
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "TaskProcessingStep", "SaveTaskProcessingDetails"]), "POST", request)
                .done(function (response) {
                if (response.Success) {
                    UI.showNotificationMessage("The processing details have been saved.", UI.messageTypeValues.success);
                    if (!isExit) {
                        me.updateViewModel(response.Payload);
                    }
                    else {
                        me.close();
                    }
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_SAVING_TASK_STEP_DATA]);
                deferred.resolve();
            })
                .always(function () {
                UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        ProcessingDetailsController.prototype.resetNotes = function () {
            this.processingDetailsVm.Notes('');
        };
        ProcessingDetailsController.prototype.addNotes = function () {
            var me = this;
            me.container.find("div[data-id='ui_taskNotesDialog']").modal("hide");
            me.save(me.isExit);
        };
        ProcessingDetailsController.prototype.openLinkURL = function (data) {
            window.open(data.LinkURL(), '_blank', 'location=yes');
        };
        ProcessingDetailsController.prototype.confirmChange = function (onConfirmed) {
            var me = this;
            var fieldsChanged = me.haveFieldsChanged();
            if (fieldsChanged) {
                UI.showConfirmDialog(UI.PHRASE_UNSAVEDCHANGESONCLOSE, function () { onConfirmed(); }, function () { });
            }
            else {
                onConfirmed();
            }
        };
        ProcessingDetailsController.prototype.getTaskClientCurrentTime = function () {
            var me = this, app = Global.App();
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "TaskProcessingStep", "GetTaskClientCurrentTime", me.processingDetailsVm.ClientID()]), "GET")
                .done(function (response) {
                if (response.Success) {
                    return response.Payload;
                }
                else {
                    return new Date();
                }
            })
                .fail(function () {
                return new Date();
            });
        };
        ProcessingDetailsController.prototype.close = function () {
            var app = Global.App(), me = this;
            var id = me.processingDetailsVm.TaskID();
            if (id > 0) {
                app.router().closeTab("TaskManager/Main" + "/" + id);
            }
            else {
                app.router().closeTab("TaskManager/Main");
            }
        };
        return ProcessingDetailsController;
    }());
    ProcessingDetails.ProcessingDetailsController = ProcessingDetailsController;
})(ProcessingDetails || (ProcessingDetails = {}));
//# sourceMappingURL=ProcessingDetails.js.map