/// <reference path="../../../../scripts/typings/bootstrap.v3.datetimepicker/bootstrap.v3.datetimepicker.d.ts" />
var Main;
(function (Main) {
    var configOptions = new Configuration.CSC_Config(), LEFT_CONTAINER = "left-form-container", LOADING_AREA = "loading-area";
    //-------------------------------------------------------------------------------
    //Constants
    //The template file and the name of any template blocks in that file
    var TEMPLATE_FILE_NAME = "Main";
    var TEMPLATE_NAME = "template_main";
    //==================================================================
    // LeftNav Controller
    //==================================================================
    var MainController = (function () {
        function MainController() {
            this.taskID = 0;
            this.fieldsOnLoad = null;
            this.test = null;
            this.contacts = new Contacts.ContactsController;
            this.inputs = new Inputs.InputsController;
            this.processingdetails = new ProcessingDetails.ProcessingDetailsController;
            this.contractDetails = new ContractDetails.ContractDetailsController;
            this.history = new ARHistory.ARHistoryController;
            this.emailCorrespondence = new EmailCorrespondence.EmailCorrespondenceController;
            this.milestoneNotes = new MilestoneNotes.MilestoneNotesController;
            this.documents = new ARDocuments.ARDocumentsController;
            this.debtservice = new DebtService.DebtServiceController;
            this.utilityanalysis = new UtilityAnalysis.UtilityAnalysisController;
            this.budget = new Budget.BudgetController;
            this.rcs = new RCS.RCSController;
            this.ocaf = new OCAF.OCAFController;
            this.rentschedule = new RentSchedule.RentScheduleController;
            var me = this;
            this.leftNavVm = {
                PageID: ko.observable(1),
                currentPage: ko.observable(1),
                KeyDate: ko.observable(),
                ContractCode: ko.observable(''),
                PropertyName: ko.observable(''),
                PropertyCode: ko.observable(''),
                TaskTypeName: ko.observable(''),
                loadPage: function (pageID, pageName) {
                    me.leftNavVm.PageID(pageID);
                    me.confirmChange(function () {
                        me.loadbyPageID(pageID, me.leftNavVm.currentPage());
                    });
                }
            };
            this.arrowVm = {
                currentPage: ko.observable(1),
                previousPage: function () {
                    if (me.leftNavVm.currentPage() >= 2) {
                        me.confirmChange(function () {
                            var calcPage = (me.leftNavVm.currentPage() - 1);
                            me.loadbyPageID(calcPage, me.leftNavVm.currentPage());
                        });
                    }
                },
                nextPage: function () {
                    if (me.leftNavVm.currentPage() <= 14) {
                        me.confirmChange(function () {
                            var calcPage = me.leftNavVm.currentPage() + 1;
                            me.loadbyPageID(calcPage, me.leftNavVm.currentPage());
                        });
                    }
                }
            };
            this.contacts = new Contacts.ContactsController();
            this.inputs = new Inputs.InputsController();
            this.processingdetails = new ProcessingDetails.ProcessingDetailsController();
            this.contractDetails = new ContractDetails.ContractDetailsController();
            this.history = new ARHistory.ARHistoryController();
            this.emailCorrespondence = new EmailCorrespondence.EmailCorrespondenceController();
            this.milestoneNotes = new MilestoneNotes.MilestoneNotesController();
            this.documents = new ARDocuments.ARDocumentsController();
            this.debtservice = new DebtService.DebtServiceController();
            this.utilityanalysis = new UtilityAnalysis.UtilityAnalysisController();
            this.budget = new Budget.BudgetController();
            this.rcs = new RCS.RCSController();
            this.ocaf = new OCAF.OCAFController();
            this.rentschedule = new RentSchedule.RentScheduleController();
        }
        //-------------------------------------------------------------------------
        // IController implementation
        //-------------------------------------------------------------------------
        MainController.prototype.save = function (isExit) {
            var me = this, app = Global.App(), waitContainer = UI.showWaitIndicator(this.container), deferred = $.Deferred();
            UI.hideWaitIndicator(me.container, waitContainer);
            return deferred.promise();
        };
        MainController.prototype.render = function (container, moduleName, moduleArea, options) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            me.container = container;
            app.templates().render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_NAME, container)
                .done(function () {
                var container2 = container.find("div[data-id='rightPane']").find("div[data-id='rightFormContainer']");
                me.leftContainer = container.find("div[data-id='leftContainer']");
                ko.applyBindings(me.leftNavVm, container.find("div[data-id='leftContainer']")[0]);
                ko.applyBindings(me.arrowVm, container.find("div[data-id='arrowContainer']")[0]);
                me.listViewContainer = container.find("div[data-id='listView']");
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                deferred.resolve();
            });
            me.leftNavVm.currentPage(1);
            return deferred.promise();
        };
        MainController.prototype.load = function () {
            //Do nothing, this page can only be loaded
            //for a single record (an ID must be specified)
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        MainController.prototype.loadRecord = function (id) {
            var me = this, deferred = $.Deferred(), waitContainer = UI.showWaitIndicator(this.container);
            me.taskID = id;
            TaskManagerData.GetContractInfoForTask(id)
                .done(function (response) {
                if (response.Success) {
                    me.leftNavVm.ContractCode(response.Payload.ContractCode);
                    me.leftNavVm.PropertyCode(response.Payload.PropertyCode);
                    me.leftNavVm.PropertyName(response.Payload.PropertyName);
                    me.leftNavVm.TaskTypeName(response.Payload.TaskTypeName);
                    me.leftNavVm.KeyDate(moment(response.Payload.KeyDate).format(Util.MOMENT_FORMAT_DATE));
                    Main.TaskStatus = response.Payload.Status;
                    me.arrowVm.currentPage(1);
                    me.loadbyPageID(1, 1);
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
        MainController.prototype.haveFieldsChanged = function () {
            var me = this;
            //  var formItemsChanged = me.formControl.haveFieldsChanged();
            //  var fieldValues = ko.toJSON(this.getAppointment());
            //  return (fieldValues != this.fieldsOnLoad) || formItemsChanged;
            return false;
        };
        //Called when browser re-sizes, adjust the height of the
        //scrollable fields area.
        //resizes the left nav list
        MainController.prototype.height = function (height) {
            if (height > 0) {
                $('#listWrap').height(height - 30);
                $('#rightformwrap').height(height - 55);
                this.rightFormContainer.height(height - 110);
            }
            if (height > 0) {
                $('#DocGrid').height(height - 210);
            }
        };
        MainController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftPaneContainer']").toggleClass('closed', 250);
            $("[data-id='rightPaneContainer']").toggleClass('full', 250);
        };
        //Returns a unique ID for this controller
        MainController.prototype.appRouterID = function (id) {
            var me = this;
            me.taskID = id;
            if (id > 0) {
                return "TaskManager/Main" + '/' + id;
            }
            else
                return "TaskManager/Main";
        };
        //Returns a title for the page
        MainController.prototype.title = function () {
            var me = this;
            return "Amend Rent - " + me.taskID;
        };
        MainController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        MainController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        //called when page is already loaded, but is being redisplayed
        MainController.prototype.reload = function (params) {
            var app = Global.App(), me = this, deferred = $.Deferred();
            me.loadbyPageID(me.leftNavVm.currentPage(), me.leftNavVm.currentPage());
            deferred.resolve();
            return deferred.promise();
        };
        //////////////////////////////
        //Private Functions//
        //////////////////////////////
        MainController.prototype.confirmChange = function (onConfirmed) {
            var me = this;
            var fieldsChanged;
            if (me.leftNavVm.currentPage() == 1) {
                fieldsChanged = me.inputs.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 2) {
                fieldsChanged = me.processingdetails.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 5) {
                fieldsChanged = me.milestoneNotes.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 6) {
                fieldsChanged = me.emailCorrespondence.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 7) {
                fieldsChanged = me.documents.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 8) {
                fieldsChanged = me.history.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 9) {
                fieldsChanged = me.debtservice.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 10) {
                fieldsChanged = me.utilityanalysis.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 11) {
                fieldsChanged = me.budget.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 12) {
                fieldsChanged = me.rcs.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 13) {
                fieldsChanged = me.ocaf.haveFieldsChanged();
            }
            else if (me.leftNavVm.currentPage() == 14) {
                fieldsChanged = me.rentschedule.haveFieldsChanged();
            }
            if (fieldsChanged) {
                UI.showConfirmDialog(UI.PHRASE_UNSAVEDCHANGESONCLOSE, function () { onConfirmed(); }, function () { });
            }
            else
                onConfirmed();
        };
        MainController.prototype.loadbyPageID = function (pageID, currentPage) {
            var me = this;
            var container2 = me.container.find("div[data-id='rightPane']").find("div[data-id='rightFormContainer']");
            me.leftNavVm.PageID(pageID);
            //if page id does not = 7 add the scrolling class back 
            if (pageID == 7) {
                container2.removeClass("scrolling");
            }
            else {
                container2.addClass("scrolling");
            }
            me.leftNavVm.currentPage(pageID);
            me.arrowVm.currentPage(pageID);
            if (pageID == 1) {
                me.inputs.render(container2, 'TaskManager', 'Inputs');
                var loadParams = {
                    taskID: me.taskID,
                    ContractCode: me.leftNavVm.ContractCode(),
                    PropertyCode: me.leftNavVm.PropertyCode(),
                    Status: Main.TaskStatus,
                    TaskTypeName: me.leftNavVm.TaskTypeName(),
                    PropertyName: me.leftNavVm.PropertyName(),
                    KeyDate: me.leftNavVm.KeyDate()
                };
                me.inputs.load(loadParams);
            }
            else if (pageID == 2) {
                me.processingdetails.render(container2, 'TaskManager', 'ProcessingDetails');
                var loadParams = {
                    taskID: me.taskID,
                    ContractCode: me.leftNavVm.ContractCode(),
                    Status: Main.TaskStatus,
                    TaskTypeName: me.leftNavVm.TaskTypeName(),
                    PropertyCode: me.leftNavVm.PropertyCode(),
                    PropertyName: me.leftNavVm.PropertyName(),
                    KeyDate: me.leftNavVm.KeyDate()
                };
                me.processingdetails.load(loadParams);
            }
            else if (pageID == 3) {
                me.contractDetails.render(container2, 'TaskManager', 'ContractDetails');
                var loadParams = {
                    taskID: me.taskID,
                    ContractCode: me.leftNavVm.ContractCode(),
                    PropertyCode: me.leftNavVm.PropertyCode(),
                    TaskTypeName: me.leftNavVm.TaskTypeName(),
                    PropertyName: me.leftNavVm.PropertyName(),
                    Status: Main.TaskStatus,
                    KeyDate: me.leftNavVm.KeyDate()
                };
                me.contractDetails.load(loadParams);
            }
            else if (pageID == 4) {
                me.contacts.render(container2, 'TaskManager', 'Contacts');
                var loadParams = {
                    taskID: me.taskID,
                    ContractCode: me.leftNavVm.ContractCode(),
                    Status: Main.TaskStatus,
                    TaskTypeName: me.leftNavVm.TaskTypeName(),
                    PropertyCode: me.leftNavVm.PropertyCode(),
                    PropertyName: me.leftNavVm.PropertyName(),
                    KeyDate: me.leftNavVm.KeyDate()
                };
                me.contacts.load(loadParams);
            }
            else if (pageID == 5) {
                //me.milestoneNotes.render(container2, 'TaskManager', 'MilestoneNotes');
                var loadParams = {
                    taskID: me.taskID,
                    ContractCode: me.leftNavVm.ContractCode(),
                    Status: Main.TaskStatus,
                    TaskTypeName: me.leftNavVm.TaskTypeName(),
                    PropertyCode: me.leftNavVm.PropertyCode(),
                    PropertyName: me.leftNavVm.PropertyName(),
                    KeyDate: me.leftNavVm.KeyDate()
                };
                //me.milestoneNotes.load(loadParams);
                me.milestoneNotes.renderAndLoad(container2, 'TaskManager', 'MilestoneNotes', loadParams);
            }
            else if (pageID == 6) {
            }
            else if (pageID == 7) {
            }
            else if (pageID == 8) {
                //me.history.render(container2, 'TaskManager', 'ARHistory');
                var loadParams = {
                    taskID: me.taskID,
                    ContractCode: me.leftNavVm.ContractCode(),
                    Status: Main.TaskStatus,
                    TaskTypeName: me.leftNavVm.TaskTypeName(),
                    PropertyCode: me.leftNavVm.PropertyCode(),
                    PropertyName: me.leftNavVm.PropertyName(),
                    KeyDate: me.leftNavVm.KeyDate()
                };
                //me.history.load(loadParams);
                me.history.renderAndLoad(container2, 'TaskManager', 'ARHistory', loadParams);
            }
            else if (pageID == 9) {
                me.debtservice.render(container2, 'TaskManager', 'DebtService');
                var loadParams = {
                    taskID: me.taskID,
                    ContractCode: me.leftNavVm.ContractCode(),
                    TaskTypeName: me.leftNavVm.TaskTypeName(),
                    PropertyCode: me.leftNavVm.PropertyCode(),
                    Status: Main.TaskStatus,
                    PropertyName: me.leftNavVm.PropertyName(),
                    KeyDate: me.leftNavVm.KeyDate()
                };
                me.debtservice.load(loadParams);
            }
            else if (pageID == 10) {
            }
            else if (pageID == 11) {
            }
            else if (pageID == 12) {
            }
            else if (pageID == 13) {
            }
            else if (pageID == 14) {
            }
        };
        return MainController;
    }());
    Main.MainController = MainController;
})(Main || (Main = {}));
ko.bindingHandlers.SetSelectCSS = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $elem = $(element);
        $(element).mouseup(function (e) {
            //cat-ud-pointer
            //reset all background-color
            $elem.parent().children().css("background-color", "#ffffff");
            $elem.parent().children().css("border-left", "4px solid transparent");
            $elem.parent().children().find(".cat-ud-pointer").css("color", "#ccc");
            $elem.parent().children().removeClass("cat-ud-custom-row");
            //set select background-color for current element 
            $elem.css("background-color", "#e3e8eb");
            $elem.find(".cat-ud-pointer").css("color", "#e31937");
            $elem.css("border-left", "4px solid #e31937");
            $elem.addClass("cat-ud-custom-row");
        });
        $(element).hover(function () {
            var $self = $(this);
            $self.find(".cat-ud-pointer").css("color", "#e31937");
            $self.css("border-left", "4px solid #e31937");
            $self.css("background-color", "#e3e8eb");
        }, function () {
            var $self = $(this);
            var hasCatUserDefinedClass = $self.hasClass("cat-ud-custom-row");
            if (hasCatUserDefinedClass) {
                $self.find(".cat-ud-pointer ").css("color", "#e31937");
                $self.css("border-left", "4px solid #e31937");
            }
            else {
                $self.find(".cat-ud-pointer ").css("color", "#ccc");
                $self.css("border-left", "4px solid transparent");
                $self.css("background-color", "white");
            }
        });
    }
};
//# sourceMappingURL=Main.js.map