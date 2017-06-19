/// <reference path="../../../../scripts/typings/bootstrap.v3.datetimepicker/bootstrap.v3.datetimepicker.d.ts" />
var InquiryForm;
(function (InquiryForm) {
    var configOptions = new Configuration.CSC_Config(), LEFT_CONTAINER = "left-form-container", LOADING_AREA = "loading-area";
    //-------------------------------------------------------------------------------
    //Constants
    //The template file and the name of any template blocks in that file
    var TEMPLATE_FILE_NAME = "InquiryForm";
    var TEMPLATE_NAME = "template_inquiryForm";
    var TEMPLATE_NOTES_FILE_NAME = "InquiryNotes";
    var TEMPLATE_NOTES_NAME = "template_inquiryNotes";
    ;
    ;
    //==================================================================
    // InquiryForm Controller
    //==================================================================
    var InquiryFormController = (function () {
        function InquiryFormController() {
            this.inquiryID = 0;
            this.clientID = 0;
            this.fieldsOnLoad = null;
            this.test = null;
            this.inquiryNotes = InquiryNotes.InquiryNotesController;
            var me = this;
            InquiryForm.InquiryFormController.inquiryFormMasterVm = this.createViewModel();
            this.inquiryNotes = new InquiryNotes.InquiryNotesController();
            this.searchFormDialog = new SearchFormDialog();
        }
        //-------------------------------------------------------------------------
        // IController implementation
        //-------------------------------------------------------------------------
        InquiryFormController.prototype.save = function (isExit) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            //var myNoteItems = me.inquiryNotes.getNoteItems();
            var formFildes = InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.FormFields();
            var inquiry = {
                ID: this.inquiryID,
                StatusID: InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusID(),
                InquiryTypeID: InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryTypeID(),
                DateTimeCreated: InquiryForm.InquiryFormController.inquiryFormMasterVm.DateTimeCreated(),
                StatusDateTime: InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusDateTime()
            };
            //if (myNoteItems.errors().length > 0) {
            //    UI.hideWaitIndicator(me.container, waitContainer);
            //    myNoteItems.errors.showAllMessages();
            //    UI.showErrorMessage([UI.PHRASE_INVALIDFIELDSONSAVE]);
            //}
            if (me.IsInquiryFromValid()) {
                debugger;
                var waitContainer = UI.showWaitIndicator(this.container);
                // me.addClientIDToContractCode(InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm);
                InquiryData.SaveInquiryForm(ko.toJS(formFildes), inquiry)
                    .done(function (response) {
                    if (response.Success) {
                        UI.showNotificationMessage(UI.PHRASE_RECORDSAVED, UI.messageTypeValues.success);
                        //reload form
                        if (!isExit) {
                            UI.hideWaitIndicator(me.container, waitContainer);
                            me.loadRecord(this.inquiryID);
                            var status = ko.utils.arrayFirst(InquiryForm.InquiryFormController.inquiryFormMasterVm.Statuses(), function (status) {
                                return status.ID() === InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().StatusID();
                            });
                            var statusEditForm = ko.pureComputed(function () {
                                return status.EditForm();
                            });
                            var statusEditStatusHistory = ko.pureComputed(function () {
                                return status.EditStatusHistory();
                            });
                            var loadParams = {
                                InquiryNotes: InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryNotes(),
                                Statuses: InquiryForm.InquiryFormController.inquiryFormMasterVm.Statuses(),
                                NoteTypes: InquiryForm.InquiryFormController.inquiryFormMasterVm.NoteTypes(),
                                StatusID: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().StatusID(),
                                EditForm: statusEditForm(),
                                StatusName: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().StatusName(),
                                StatusDate: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().StatusDateTime(),
                                Responses: InquiryForm.InquiryFormController.inquiryFormMasterVm.Responses(),
                                ContactList: InquiryForm.InquiryFormController.inquiryFormMasterVm.ContactList(),
                                InquiryID: me.inquiryID,
                                HasBeenInvoiced: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().HasBeenInvoiced(),
                                IsOwnerNotified: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().IsOwnerNotified(),
                                ModifiedByName: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().ModifiedByName(),
                                Emails: InquiryForm.InquiryFormController.inquiryFormMasterVm.Emails(),
                                EmailResponse: InquiryForm.InquiryFormController.inquiryFormMasterVm.EmailResponses()
                            };
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
            return deferred.promise();
        };
        InquiryFormController.prototype.IsInquiryFromValid = function () {
            // Reset validation
            // Plain require 
            // MinLength            
            // Option require 
            // Legacy drop down require  
            this.ResetValidation();
            var isvalid = true;
            isvalid = this.PlainRquireValidation();
            isvalid = this.PlainRquireValidation();
            isvalid = this.MinLength();
            isvalid = this.OptionRequire();
            isvalid = this.GeneralValidation();
            return isvalid;
        };
        InquiryFormController.prototype.ResetValidation = function () {
            _.forEach(InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                //reset the all validation 
                if (x.IsRequired()) {
                    x.IsValid(true);
                    x.IsLengthValid(true);
                    x.IsOptionRequireValid(true);
                }
            });
            InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusIDIsRequired(false);
            InquiryForm.InquiryFormController.inquiryFormMasterVm.CreateDateIsGreater(false);
        };
        InquiryFormController.prototype.GeneralValidation = function () {
            if (Util.isNothing(InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusID())) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusIDIsRequired(true);
                return false;
            }
            //Status Date Field - user can't select a date that is prior to the date of the Open status 
            if (InquiryForm.InquiryFormController.inquiryFormMasterVm.DateTimeCreated() <
                InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusDateTime()) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.CreateDateIsGreater(true);
                return false;
            }
            return true;
        };
        InquiryFormController.prototype.PlainRquireValidation = function () {
            var isValid = true;
            _.forEach(InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if ((x.HTMLTypeID() == configOptions.DynamicFieldHTMLType.Text ||
                    x.HTMLTypeID() == configOptions.DynamicFieldHTMLType.ParagraphText ||
                    x.HTMLTypeID() == configOptions.DynamicFieldHTMLType.DataFromLegacy ||
                    x.HTMLTypeID() == configOptions.DynamicFieldHTMLType.Date ||
                    x.HTMLTypeID() == configOptions.DynamicFieldHTMLType.Yes_No) &&
                    x.IsRequired()) {
                    if ((Util.isNumber(x.StringValue()) && parseInt(x.StringValue()) <= 0) ||
                        (!Util.isNumber(x.StringValue()) && Util.isNullOrEmpty(x.StringValue()))) {
                        x.IsValid(false);
                        isValid = false;
                    }
                }
            });
            return isValid;
        };
        InquiryFormController.prototype.MinLength = function () {
            var isValid = true;
            _.forEach(InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if (x.MinimumValue() > 0 && !Util.isNullOrEmpty(x.StringValue())) {
                    if (x.StringValue().length < x.MinimumValue()) {
                        x.IsLengthValid(false);
                        isValid = false;
                    }
                }
            });
            return isValid;
        };
        InquiryFormController.prototype.OptionRequire = function () {
            var isValid = true;
            _.forEach(InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if (x.IsRequired() && x.Options().length > 0) {
                    var hasIsSelectedTrue = _.any(x.Options(), function (y) {
                        if (y.IsSelected())
                            return y;
                    });
                    if (!hasIsSelectedTrue) {
                        x.IsOptionRequireValid(false);
                        isValid = false;
                    }
                }
            });
            return isValid;
        };
        //public getFormFields(): InquiryData.ISaveFormField[]{
        //    var me = this,
        //        saveFormFiled = [],
        //        saveFormOption = [];
        //    _.forEach(me.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x: IFormFieldObservable) {
        //        var obj: InquiryData.ISaveFormField = {
        //            FieldID: x.FieldID(),
        //            HTMLTypeID: x.HTMLTypeID(),
        //            StringValue: x.StringValue(),
        //            Options: getFormFildOption(x.Option)
        //        };
        //        saveform.push(obj);
        //    });
        //}
        //public getFormFildOption(): InquiryData.ISaveFormOption[] {
        //}
        InquiryFormController.prototype.render = function (container, moduleName, moduleArea, options) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            me.container = container;
            //  console.log("In render...");
            app.templates().render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_NAME, container)
                .done(function () {
                var container2 = container.find("div[data-id='formContainer']").find(".right-notes-container");
                me.inquiryNotes.render(container2, moduleName, 'InquiryNotes');
                me.leftContainer = container.find("div[data-id='leftContainer']");
                ko.applyBindings(InquiryForm.InquiryFormController.inquiryFormMasterVm, container.find("div[data-id='leftContainer']")[0]);
                me.searchFormDialog.render(container);
                me.doGrid(this.gridContainer, $(window).height());
                deferred.resolve();
            });
            me.inquiryID = options[0];
            me.dynamicFormID = options[1];
            me.clientID = options[2];
            //    console.log("Client ID: " + me.clientID + " DynamicFormID: " + me.dynamicFormID + " inquiryID: " + me.inquiryID);
            return deferred.promise();
        };
        InquiryFormController.prototype.load = function () {
            //Do nothing, this page can only be loaded
            //for a single record (an ID must be specified)
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        InquiryFormController.prototype.loadRecord = function (id) {
            var me = this, deferred = $.Deferred(), waitContainer = UI.showWaitIndicator(this.container);
            // UI.hideWaitIndicator(me.container, waitContainer);
            InquiryData.GetInquiryMaster(me.inquiryID, me.dynamicFormID, me.clientID)
                .done(function (response) {
                if (response.Success) {
                    me.updateViewModel(response.Payload);
                    me.setPermissions(response);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .always(function () {
                UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        InquiryFormController.prototype.haveFieldsChanged = function () {
            var me = this;
            //  var formItemsChanged = me.formControl.haveFieldsChanged();
            //  var fieldValues = ko.toJSON(this.getAppointment());
            //  return (fieldValues != this.fieldsOnLoad) || formItemsChanged;
            return false;
        };
        //Called when browser re-sizes, adjust the height of the
        //scrollable fields area. ****NOT USED*****
        InquiryFormController.prototype.heightXXX = function (height) {
            var fieldHeight = height - 50;
            if (fieldHeight > 0) {
            }
        };
        //resizes the left nav list
        InquiryFormController.prototype.height = function (height) {
            if (height > 0) {
                $('#inquiryLeft').height(height - 30);
                $('#rightformwrap').height(height - 115);
                // for dynamic resizing of left nav list;
                //    $("div[data-id='inquiryLeft']").height(height - 30);;
                $("div[data-id='inquiryRightformContainer']").height(height - 40);
            }
            if (height > 150) {
                $("div[data-id='grid']").height(180);
            }
        };
        //resizes left right containers on page load
        InquiryFormController.prototype.doGrid = function (gridContainer, height) {
            if (height > 0) {
                $('#inquiryLeft').height(height - 30);
                $('#rightformwrap').height(height - 115);
                // for dynamic resizing of left nav list;
                //   $("div[data-id='inquiryLeft']").height(height - 30);;
                $("div[data-id='inquiryRightformContainer']").height(height - 40);
            }
        };
        //Returns a unique ID for this controller
        InquiryFormController.prototype.appRouterID = function (id, options) {
            if (options[0] == null ||
                options[0] <= 0) {
                return "InquiryForm";
            }
            else {
                return "CSC/InquiryForm/" + options[0] + "/" + options[1] + "/" + options[2];
            }
        };
        //Returns a title for the page
        InquiryFormController.prototype.title = function () {
            return "Inquiry - ";
        };
        InquiryFormController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return this.inquiryID;
        };
        InquiryFormController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        //////////////////////////////
        //Private Functions//
        //////////////////////////////
        InquiryFormController.prototype.updateViewModel = function (master) {
            //this.updateViewModelInquiry(master.Inquiry, master.Statuses);
            this.updateViewModelNotes(master.InquiryNotes, master.Inquiry, master.Statuses, master.AvailableStatuses, master.NoteTypes, master.Responses, master.StatusHistoryList, master.InquiryTypes, master.ContactList, master.Emails, master.EmailResponses, master.IsInquiryForm);
            InquiryForm.InquiryFormController.updateInquiryFormVm(master, InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm, this.container);
        };
        InquiryFormController.prototype.setPermissions = function (response) {
            debugger;
            if (response.Permissions["SaveInquiryForm"])
                InquiryForm.InquiryFormController.inquiryFormMasterVm.ShowUpdateInquiry(true);
        };
        InquiryFormController.prototype.updateViewModelNotes = function (inquiryNote, inquiry, statuses, availablestatuses, notetypes, respones, statushistory, inquirytypes, contactList, emailList, emailResponseList, isInquiryForm) {
            var me = this;
            InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry(me.createInquiryObservable(inquiry, statuses));
            InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryNotes.removeAll();
            _.forEach(inquiryNote, function (inquiryNote) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryNotes.push(me.createInquiryNotesObservable(inquiryNote, inquiry));
            });
            //Also push status history in notes observable and flag IsStatusHistory.  This is for sorting and allows viewmodel to work as one.
            _.forEach(statushistory, function (statusHistory) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryNotes.push(me.createStatusHistoryObservable(statusHistory, inquiry, statuses));
            });
            //all statuses needed for text descriptions
            InquiryForm.InquiryFormController.inquiryFormMasterVm.Statuses.removeAll();
            _.forEach(statuses, function (status) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.Statuses.push(me.createStatusObservable(status));
            });
            //available statuses based on logic for current status
            InquiryForm.InquiryFormController.inquiryFormMasterVm.AvailableStatuses.removeAll();
            _.forEach(availablestatuses, function (availablestatus) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.AvailableStatuses.push(me.createStatusObservable(availablestatus));
            });
            InquiryForm.InquiryFormController.inquiryFormMasterVm.IsInquiryForm(isInquiryForm);
            InquiryForm.InquiryFormController.inquiryFormMasterVm.NoteTypes.removeAll();
            _.forEach(notetypes, function (notetype) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.NoteTypes.push(me.createNoteTypeObservable(notetype));
            });
            InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryTypes.removeAll();
            _.forEach(inquirytypes, function (inquirytype) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryTypes.push(me.createInquiryTypeObservable(inquirytype));
            });
            InquiryForm.InquiryFormController.inquiryFormMasterVm.Responses.removeAll();
            _.forEach(respones, function (response) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.Responses.push(response);
            });
            InquiryForm.InquiryFormController.inquiryFormMasterVm.ContactList.removeAll();
            _.forEach(contactList, function (contact) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.ContactList.push(contact);
            });
            InquiryForm.InquiryFormController.inquiryFormMasterVm.Emails.removeAll();
            _.forEach(emailList, function (email) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.Emails.push(email);
            });
            InquiryForm.InquiryFormController.inquiryFormMasterVm.EmailResponses.removeAll();
            _.forEach(emailResponseList, function (response) {
                InquiryForm.InquiryFormController.inquiryFormMasterVm.EmailResponses.push(response);
            });
            var status = ko.utils.arrayFirst(InquiryForm.InquiryFormController.inquiryFormMasterVm.Statuses(), function (status) {
                return status.ID() === InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().StatusID();
            });
            var statusEditForm = ko.pureComputed(function () {
                return status.EditForm();
            });
            var statusEditStatusHistory = ko.pureComputed(function () {
                return status.EditStatusHistory();
            });
            InquiryForm.InquiryFormController.inquiryFormMasterVm.EditForm(statusEditForm());
            var loadParams = {
                InquiryNotes: InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryNotes(),
                Statuses: InquiryForm.InquiryFormController.inquiryFormMasterVm.Statuses(),
                NoteTypes: InquiryForm.InquiryFormController.inquiryFormMasterVm.NoteTypes(),
                Emails: InquiryForm.InquiryFormController.inquiryFormMasterVm.Emails(),
                EmailResponse: InquiryForm.InquiryFormController.inquiryFormMasterVm.EmailResponses(),
                StatusID: inquiry.StatusID,
                EditForm: statusEditForm(),
                StatusDate: inquiry.StatusDateTime,
                StatusName: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().StatusName(),
                Responses: InquiryForm.InquiryFormController.inquiryFormMasterVm.Responses(),
                ContactList: InquiryForm.InquiryFormController.inquiryFormMasterVm.ContactList(),
                InquiryID: inquiry.ID,
                ModifiedByName: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().ModifiedByName(),
                HasBeenInvoiced: inquiry.HasBeenInvoiced,
                IsOwnerNotified: inquiry.IsOwnerNotified
            };
            me.inquiryNotes.load(loadParams);
            //-------------------------------------------- new inquiry form Items -  position is important
            InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusID(inquiry.StatusID);
            InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryTypeID(inquiry.InquiryTypeID);
            InquiryForm.InquiryFormController.inquiryFormMasterVm.DateTimeCreated(moment(inquiry.DateTimeCreated).format('MM/DD/YYYY  hh:mm A'));
            if (Util.isNullOrEmpty(inquiry.DateTimeCreated))
                InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusDateTime(moment(Date.now()).format(Util.MOMENT_FORMAT_DATETIME));
            else
                InquiryForm.InquiryFormController.inquiryFormMasterVm.StatusDateTime(moment(inquiry.StatusDateTime).format('MM/DD/YYYY  hh:mm A'));
            //--------------------------------------------
        };
        InquiryFormController.prototype.close = function () {
            var app = Global.App(), self = this;
            var paramId1 = Util.getUrlParam(3);
            var paramId2 = Util.getUrlParam(4);
            var paramId3 = Util.getUrlParam(5);
            if (Util.isNumber(paramId1) && paramId1 > 0) {
                app.router().closeTab("CSC/InquiryForm" + "/" + paramId1 + "/" + paramId2 + "/" + paramId3);
            }
            else {
                app.router().closeTab("CSC/InquiryForm");
            }
        };
        InquiryFormController.prototype.saveandclose = function () {
            var me = this;
            me.save(true);
        };
        InquiryFormController.prototype.updateViewModelInquiry = function (inquiry, statuses) {
            var me = this;
            me.createInquiryObservable(inquiry, statuses);
        };
        // Create Main View model------------------------------------------
        InquiryFormController.prototype.createViewModel = function () {
            var me = this, inquiryFormMasterVm = {
                Inquiry: ko.observable(),
                InquiryNotes: ko.observableArray(),
                Statuses: ko.observableArray(),
                AvailableStatuses: ko.observableArray(),
                ShowUpdateInquiry: ko.observable(false),
                IsInquiryForm: ko.observable(false),
                IsInitialLoad: ko.observable(false),
                StatusID: ko.observable(0),
                StatusIDIsRequired: ko.observable(false),
                CreateDateIsGreater: ko.observable(false),
                InquiryTypeID: ko.observable(0),
                DateTimeCreated: ko.observable(),
                // StatusDateTime: ko.observable(moment(Date.now()).format(Util.MOMENT_FORMAT_DATETIME)),
                StatusDateTime: ko.observable(),
                EditForm: ko.observable(true),
                InquiryTypes: ko.observableArray(),
                NoteTypes: ko.observableArray(),
                Responses: ko.observableArray(),
                ContactList: ko.observableArray(),
                Emails: ko.observableArray(),
                EmailResponses: ko.observableArray(),
                InquiryFormVm: {
                    ContractCodes: ko.observableArray(),
                    Contacts: ko.observableArray(),
                    Tenants: ko.observableArray(),
                    Units: ko.observableArray(),
                    UnitComboValues: ko.observableArray(),
                    FormFields: ko.observableArray(),
                    InquiryDynamicForm: ko.observable(),
                    //IsLegacyForm: ko.observable(false),
                    IsContractCodeFieldExist: ko.observable(false)
                },
                save: function (e) {
                    me.save(false);
                },
                close: function (e) {
                    me.close();
                },
                saveandclose: function (e) {
                    me.saveandclose();
                },
                openStatusCalendar: function () {
                    var input = me.container.find("[data-id='statusDatepicker']");
                    input.datepicker();
                    input.data('datepicker').hide = function () { };
                    input.datepicker('show');
                },
                openCreateCalendar: function () {
                    var input = me.container.find("[data-id='createdDatepicker']");
                    input.datepicker();
                    // input.data('datepicker').hide = function () { };
                    input.datepicker('show');
                },
                openCalendar: function () {
                    //open calendar on button click event...was not working for some reason with bootstrap js
                    var input = me.container.find("[data-id='sscreatedDatepicker']");
                    input.datepicker();
                    input.datepicker('show');
                },
            };
            return inquiryFormMasterVm;
        };
        //==================================================================
        // Create Inquiry Notes Observables
        //==================================================================
        InquiryFormController.prototype.createInquiryNotesObservable = function (inquiryNotes, inquiry) {
            var me = this, notesObservable = {
                ID: ko.observable(inquiryNotes.ID),
                InquiryID: ko.observable(inquiryNotes.InquiryID),
                NoteTypeID: ko.observable(inquiryNotes.NoteTypeID),
                NoteDateTime: ko.observable(inquiryNotes.NoteDateTime),
                DateTimeCreated: ko.observable(inquiryNotes.DateTimeCreated),
                Note: ko.observable(inquiryNotes.Note),
                IsActive: ko.observable(inquiryNotes.IsActive),
                CreatedByName: ko.observable(inquiryNotes.CreatedByName),
                ModifiedByName: ko.observable(inquiryNotes.ModifiedByName),
                AttachmentList: ko.observableArray(),
                StatusID: ko.observable(inquiry.StatusID),
                IsStatusHistory: ko.observable(false),
                EditStatusHistory: ko.observable(true),
            };
            _.forEach(inquiryNotes.AttachmentList, function (attachment) {
                notesObservable.AttachmentList.push(me.createDocumentEntityObservable(attachment));
            });
            return notesObservable;
        };
        InquiryFormController.prototype.createStatusHistoryObservable = function (statusHistory, inquiry, statuses) {
            var me = this, notesObservable = {
                ID: ko.observable(statusHistory.ID),
                InquiryID: ko.observable(statusHistory.InquiryID),
                NoteTypeID: ko.observable(statusHistory.StatusID),
                NoteDateTime: ko.observable(statusHistory.DateTime),
                DateTimeCreated: ko.observable(statusHistory.DateTimeCreated),
                Note: ko.observable(""),
                IsActive: ko.observable(statusHistory.IsActive),
                CreatedByName: ko.observable(statusHistory.CreatedByName),
                ModifiedByName: ko.observable(statusHistory.ModifiedByName),
                AttachmentList: ko.observableArray(),
                StatusID: ko.observable(inquiry.StatusID),
                IsStatusHistory: ko.observable(true),
                EditStatusHistory: ko.observable(true)
            };
            var status = ko.utils.arrayFirst(statuses, function (status) {
                return status.ID === statusHistory.StatusID;
            });
            var statusEditForm = ko.pureComputed(function () {
                return status.EditForm;
            });
            var statusEditStatusHistory = ko.pureComputed(function () {
                return status.EditStatusHistory;
            });
            notesObservable.EditStatusHistory(statusEditStatusHistory);
            return notesObservable;
        };
        InquiryFormController.prototype.createDocumentEntityObservable = function (attachment) {
            var me = this, vmdocument = {
                ID: ko.observable(attachment.ID),
                FileName: ko.observable(attachment.FileName),
                FilePrefix: ko.observable(attachment.FilePrefix),
                LastModified: ko.observable(attachment.LastModified),
                UniqueID: ko.observable(attachment.UniqueID)
            };
            return vmdocument;
        };
        InquiryFormController.prototype.createInquiryObservable = function (inquiry, statuses) {
            var me = this, inquiryObservable = {
                ID: ko.observable(inquiry.ID),
                ClientID: ko.observable(inquiry.ClientID),
                DynamicFormID: ko.observable(inquiry.DynamicFormID),
                InquiryTypeID: ko.observable(inquiry.InquiryTypeID),
                StatusID: ko.observable(inquiry.StatusID),
                StatusName: ko.observable(""),
                IsActive: ko.observable(inquiry.IsActive),
                HasBeenInvoiced: ko.observable(inquiry.HasBeenInvoiced),
                IsOwnerNotified: ko.observable(inquiry.IsOwnerNotified),
                StatusDateTime: ko.observable(inquiry.StatusDateTime),
                ModifiedByName: ko.observable(inquiry.ModifiedByName),
                DateTimeCreated: ko.observable(inquiry.DateTimeCreated)
            };
            var statustext = ko.utils.arrayFirst(statuses, function (status) {
                return status.ID === inquiry.StatusID;
            });
            inquiryObservable.StatusName = ko.pureComputed(function () {
                return statustext.Name;
            });
            return inquiryObservable;
        };
        InquiryFormController.prototype.createStatusObservable = function (statuses) {
            var me = this, vmStatus = {
                ID: ko.observable(statuses.ID),
                Name: ko.observable(statuses.Name),
                ShowAfterInvoice: ko.observable(statuses.ShowAfterInvoice),
                EditForm: ko.observable(statuses.EditForm),
                EditStatusHistory: ko.observable(statuses.EditStatusHistory),
            };
            return vmStatus;
        };
        InquiryFormController.prototype.createNoteTypeObservable = function (noteType) {
            var me = this, vmNoteType = {
                ID: ko.observable(noteType.ID),
                Description: ko.observable(noteType.Description)
            };
            return vmNoteType;
        };
        InquiryFormController.prototype.createInquiryTypeObservable = function (inquiryType) {
            var me = this, vmInquiryType = {
                ID: ko.observable(inquiryType.ID),
                Name: ko.observable(inquiryType.Name),
                IsActive: ko.observable(inquiryType.IsActive),
                CanBeInvoiced: ko.observable(inquiryType.CanBeInvoiced)
            };
            return vmInquiryType;
        };
        //==================================================================
        // InquiryForm Private Methods - Left Side of the page
        //==================================================================
        //RELOAD LEGACY DATA
        InquiryFormController.reLoadLegacyData = function (contractCode, inquiryFormVm) {
            var $formContainer = $("[data-id='" + LEFT_CONTAINER + "']"), waitContainer = UI.showWaitIndicator($formContainer), me = this, $loadingArea = $("." + LOADING_AREA);
            //
            // UI.showWaitIndicator($formContainer);
            if (Util.isNothing(contractCode)) {
                //reset the all legacy from. this clear the contact list , unit list, tenant list    
                InquiryForm.InquiryFormController.clearAllLegacyData(me.inquiryFormMasterVm.InquiryFormVm);
                me.clearContractAndContact();
                me.clearUnitObservable();
                //
                UI.hideWaitIndicator($formContainer, $loadingArea);
            }
            else {
                var splitContractCode = contractCode.split("|");
                InquiryData.reLoadLegacyData(splitContractCode[0], splitContractCode[1]).done(function (response) {
                    if (response.Success) {
                        InquiryForm.InquiryFormController.updateLegacy(response.Payload, me.inquiryFormMasterVm.InquiryFormVm);
                        InquiryForm.InquiryFormController.resetAllFormFieldsLegacyData(me.inquiryFormMasterVm.InquiryFormVm);
                        me.updateContractAndContact(splitContractCode[0]);
                        //
                        UI.hideWaitIndicator($formContainer, $loadingArea);
                    }
                    else {
                        UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    }
                });
            }
        };
        InquiryFormController.clearUnitObservable = function () {
            var me = this;
            _.forEach(me.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if ((x.IntegratedServiceFieldID() == configOptions.Unit_UnitAddress_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Unit_UnitAddress_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Unit_UnitSize_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Unit_UnitSize_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Unit_UnitType_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Unit_UnitType_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Unit_UtilityAllowance_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Unit_UtilityAllowance_IntegratedServiceID) ||
                    //(x.IntegratedServiceFieldID() == configOptions.Unit_ContractRent_IntegratedServiceFieldID &&
                    //    x.IntegratedServiceID() == configOptions.Unit_ContractRent_IntegratedServiceID) ||
                    //(x.IntegratedServiceFieldID() == configOptions.Unit_GrossRent_IntegratedServiceFieldID &&
                    //    x.IntegratedServiceID() == configOptions.Unit_GrossRent_IntegratedServiceID) ||
                    //(x.IntegratedServiceFieldID() == configOptions.Unit_UnitAddress2_IntegratedServiceFieldID &&
                    //    x.IntegratedServiceID() == configOptions.Unit_UnitAddress2_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Unit_UnitState_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Unit_UnitState_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Unit_UnitCity_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Unit_UnitCity_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Unit_UnitZip_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Unit_UnitZip_IntegratedServiceID))
                    x.StringValue('');
            });
        };
        InquiryFormController.updateContractAndContact = function (contrcateCode) {
            var me = this;
            if (Util.isNothing(contrcateCode)) {
                //clear all  contract sub object and contact
                me.clearContractAndContact();
            }
            else {
                //find the contract that is selected                   
                var contract = _.findWhere(me.inquiryFormMasterVm.InquiryFormVm.ContractCodes(), function (x) {
                    if (x.ContractCode() == contrcateCode) {
                        debugger;
                        me.clearContractAndContact();
                        return x;
                    }
                });
                if (!Util.isNothing(contract))
                    //find all existing sub object that we have in the FromField and update their the value. like "UnitAddress" ...
                    me.updatContractObservable(contract);
                // contact section is contract subsection
                me.findAndUpdateContact(contract);
            }
        };
        InquiryFormController.updatContractObservable = function (contract) {
            var me = this;
            _.forEach(me.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                //contract code
                if (x.IntegratedServiceFieldID() == configOptions.Contract_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_IntegratedServiceID)
                    x.StringValue(contract.ContractCode());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_ElderlyType_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_ElderlyType_IntegratedServiceID)
                    x.StringValue(contract.ElderlyType());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_GroupHome_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_GroupHome_IntegratedServiceID)
                    x.StringValue(contract.GroupHome());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_Notes_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_Notes_IntegratedServiceID)
                    x.StringValue(contract.Notes());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_ProgramName_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_ProgramName_IntegratedServiceID)
                    x.StringValue(contract.ProgramName());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyCode_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_PropertyCode_IntegratedServiceID) {
                    x.StringValue(contract.PropertyCode());
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyName_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_PropertyName_IntegratedServiceID)
                    x.StringValue(contract.PropertyName());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyAddress1_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_PropertyAddress1_IntegratedServiceID)
                    x.StringValue(contract.PropertyAddress1());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyAddress2_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_PropertyAddress2_IntegratedServiceID)
                    x.StringValue(contract.PropertyAddress2());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyCity_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_PropertyCity_IntegratedServiceID)
                    x.StringValue(contract.PropertyCity());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyState_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_PropertyState_IntegratedServiceID)
                    x.StringValue(contract.PropertyState());
                if (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyZipCode_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_PropertyZipCode_IntegratedServiceID)
                    x.StringValue(contract.PropertyZipCode());
            });
        };
        InquiryFormController.clearContractAndContact = function () {
            var me = this;
            _.forEach(me.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                //contract code
                if ((x.IntegratedServiceFieldID() == configOptions.Contract_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_ElderlyType_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_ElderlyType_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_GroupHome_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_GroupHome_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_Notes_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_Notes_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_ProgramName_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_ProgramName_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyCode_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_PropertyCode_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyName_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_PropertyName_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyAddress1_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_PropertyAddress1_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyAddress2_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_PropertyAddress2_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyCity_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_PropertyCity_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyState_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_PropertyState_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contract_PropertyZipCode_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contract_PropertyZipCode_IntegratedServiceID))
                    x.StringValue("");
            });
            me.findAndClearContact();
        };
        // contact section is contract subsection
        InquiryFormController.findAndUpdateContact = function (contract) {
            var me = this;
            _.forEach(me.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactName_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactName_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.ContactName);
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactAddress1_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactAddress1_IntegratedServiceID)
                    me.updateContactField(x, contract, configOptions.ContactType.ContactAddress1);
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactAddress2_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactAddress2_IntegratedServiceID)
                    me.updateContactField(x, contract, configOptions.ContactType.ContactAddress2);
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactCity_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactCity_IntegratedServiceID)
                    me.updateContactField(x, contract, configOptions.ContactType.ContactCity);
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactState_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactState_IntegratedServiceID)
                    me.updateContactField(x, contract, configOptions.ContactType.ContactState);
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactZipCode_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactZipCode_IntegratedServiceID)
                    me.updateContactField(x, contract, configOptions.ContactType.ContactZipCode);
                if (x.IntegratedServiceFieldID() == configOptions.Contact_Address_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_Address_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.Address);
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contact_Phone_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_Phone_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.Phone);
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contact_Fax_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_Fax_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.Fax);
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contact_Email_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_Email_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.Email);
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactPersonName_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactPersonName_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.ContactPersonName);
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactType_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactType_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.ContactType);
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactPersonPhone_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactPersonPhone_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.ContactPersonPhone);
                }
                if (x.IntegratedServiceFieldID() == configOptions.Contact_ContactPersonEmail_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactPersonEmail_IntegratedServiceID) {
                    me.updateContactField(x, contract, configOptions.ContactType.ContactPersonEmail);
                }
            });
        };
        InquiryFormController.updateContactField = function (formfiled, contact, contactType) {
            var me = this;
            _.forEach(me.inquiryFormMasterVm.InquiryFormVm.Contacts(), function (x) {
                if (x.ContactTypeCode() == formfiled.ContactTypeID().toString())
                    formfiled.StringValue(x[contactType]());
            });
        };
        InquiryFormController.findAndClearContact = function () {
            var me = this;
            _.forEach(me.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if ((x.IntegratedServiceFieldID() == configOptions.Contact_ContactName_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contact_ContactName_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contact_Address_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contact_Address_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contact_Phone_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contact_Phone_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contact_Fax_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contact_Fax_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contact_Email_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contact_Email_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contact_ContactPersonName_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contact_ContactPersonName_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contact_ContactType_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contact_ContactType_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contact_ContactPersonPhone_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contact_ContactPersonPhone_IntegratedServiceID) ||
                    (x.IntegratedServiceFieldID() == configOptions.Contact_ContactPersonEmail_IntegratedServiceFieldID &&
                        x.IntegratedServiceID() == configOptions.Contact_ContactPersonEmail_IntegratedServiceID))
                    x.StringValue("");
            });
        };
        InquiryFormController.updateInquiryFormVm = function (masterData, vm, container) {
            var me = this;
            var inquiryFormVm = {
                FormFields: ko.observableArray(me.createFormFieldsObservable(masterData.FormFields)),
                ContractCodes: ko.observableArray(me.createContractCodesObservable(masterData.ContractCodes)),
                Contacts: ko.observableArray(me.createContactsObservable(masterData.Contacts)),
                Tenants: ko.observableArray(me.createTenantsObservable(masterData.Tenants)),
                Units: ko.observableArray(me.createUnitsObservable(masterData.Units)),
                UnitComboValues: ko.observableArray(me.createUnitsObservable(masterData.Units)),
                //InquiryDynamicForm: ko.observable<InquiryDynamicFormObservable>()
                InquiryDynamicForm: me.createInquiryDynamicFormObservable(masterData.DynamicForm)
            };
            //inquiryFormVm.IsLegacyForm( me.formIsLegacy(inquiryFormVm) );
            vm.search = function (test) {
                container.find("div[data-id='searchDialog']").modal("show");
            };
            //vm.inquiryFormMasterVm.InquiryFormVm.IsContractCodeFieldExist(me.isContractCodeFieldExist(inquiryFormVm));            
            vm.FormFields(inquiryFormVm.FormFields());
            vm.ContractCodes(inquiryFormVm.ContractCodes());
            vm.Tenants(inquiryFormVm.Tenants());
            vm.Units(inquiryFormVm.Units());
            vm.Contacts(inquiryFormVm.Contacts());
            //
            vm.InquiryDynamicForm(inquiryFormVm.InquiryDynamicForm);
            return inquiryFormVm;
        };
        InquiryFormController.updateLegacy = function (masterData, vm) {
            var me = InquiryForm.InquiryFormController, inquiryFormVm = {
                Contacts: ko.observableArray(me.createContactsObservable(masterData.Contacts)),
                Tenants: ko.observableArray(me.createTenantsObservable(masterData.Tenants)),
                Units: ko.observableArray(me.createUnitsObservable(masterData.Units))
            };
            vm.Tenants(inquiryFormVm.Tenants());
            vm.Units(inquiryFormVm.Units());
            vm.Contacts(inquiryFormVm.Contacts());
            //me.resetAllLegacyData(vm);
        };
        InquiryFormController.resetAllFormFieldsLegacyData = function (vm) {
            var me = this;
            _.forEach(vm.FormFields, function (x) {
                if (x.HTMLTypeID() == configOptions.DynamicFieldHTMLType.DataFromLegacy &&
                    // we shouldn't reset the  contract code - user changed it manually, that's why we need the reset
                    x.IntegratedServiceFieldID() != configOptions.Contract_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() != configOptions.Contract_IntegratedServiceID) {
                    x.StringValue("");
                }
            });
        };
        InquiryFormController.clearAllLegacyData = function (inquiryFormVm) {
            var me = this;
            me.resetAllFormFieldsLegacyData(inquiryFormVm);
            inquiryFormVm.Contacts([]);
            inquiryFormVm.Tenants([]);
            inquiryFormVm.Units([]);
        };
        InquiryFormController.createContractCodesObservable = function (contractCodes) {
            var me = this, contractCodeList = [];
            _.forEach(contractCodes, function (x) {
                contractCodeList.push({
                    ClientID: ko.observable(x.ClientID),
                    ID: ko.observable(x.ID),
                    ContractCode: ko.observable(x.ContractCode),
                    PropertyCode: ko.observable(x.PropertyCode),
                    PropertyName: ko.observable(x.PropertyName),
                    ClientAbbreviationCode: ko.observable(x.ClientAbbreviationCode),
                });
            });
            return contractCodeList;
        };
        InquiryFormController.createTenantsObservable = function (tenants) {
            var me = this, tenantList = [];
            _.forEach(tenants, function (x) {
                tenantList.push({
                    FirstName: ko.observable(x.FirstName),
                    FullName: ko.observable(x.FirstName + " " + x.LastName),
                    ID: ko.observable(x.ID),
                    LastName: ko.observable(x.LastName),
                    MiddleInitial: ko.observable(x.MiddleInitial),
                });
            });
            return tenantList;
        };
        InquiryFormController.createUnitsObservable = function (units) {
            var me = this, unitList = [];
            _.forEach(units, function (x) {
                unitList.push({
                    BuildingID: ko.observable(x.BuildingID),
                    Zip4: ko.observable(x.Zip4),
                    Zip5: ko.observable(x.Zip5),
                    ZipCode: ko.observable(x.ZipCode),
                    Address: ko.observable(x.Address),
                    Address1: ko.observable(x.Address1),
                    Address2: ko.observable(x.Address2),
                    Address3: ko.observable(x.Address3),
                    City: ko.observable(x.City),
                    State: ko.observable(x.State),
                    VisualAccessibilityCode: ko.observable(x.VisualAccessibilityCode),
                    MobilityAccessibilityCode: ko.observable(x.MobilityAccessibilityCode),
                    HearingAccessibilityCode: ko.observable(x.HearingAccessibilityCode),
                    ID: ko.observable(x.ID),
                    UnitNumber: ko.observable(x.UnitNumber),
                    UnitCategoryID: ko.observable(x.UnitCategoryID),
                    UnitTypeID: ko.observable(x.UnitTypeID),
                    UtilityAllowance: ko.observable(x.UtilityAllowance),
                    CurrentHOH: ko.observable(x.CurrentHOH),
                });
            });
            return unitList;
        };
        InquiryFormController.createInquiryDynamicFormObservable = function (dynamicForm) {
            var inquiryDynamicFormName = {
                Name: ko.observable(dynamicForm.Name)
            };
            return inquiryDynamicFormName;
        };
        InquiryFormController.createContactsObservable = function (contacts) {
            var me = this, contactList = [];
            _.forEach(contacts, function (x) {
                contactList.push({
                    Address: ko.observable(x.Address),
                    ContactName: ko.observable(x.ContactName),
                    ContactPersonEmail: ko.observable(x.ContactPersonEmail),
                    ContactPersonName: ko.observable(x.ContactPersonName),
                    ContactPersonPhone: ko.observable(x.ContactPersonPhone),
                    ContactType: ko.observable(x.ContactType),
                    ContactTypeCode: ko.observable(x.ContactTypeCode),
                    //ElderlyType: ko.observable<string>(x.ElderlyType),
                    Email: ko.observable(x.Email),
                    Fax: ko.observable(x.Fax),
                    //GroupHome: ko.observable<string>(x.GroupHome),
                    //Notes: ko.observable<string>(x.Notes),
                    Phone: ko.observable(x.Phone),
                    ContactAddress1: ko.observable(x.ContactAddress1),
                    ContactAddress2: ko.observable(x.ContactAddress2),
                    ContactCity: ko.observable(x.ContactCity),
                    ContactState: ko.observable(x.ContactState),
                    ContactZipCode: ko.observable(x.ContactZipCode)
                });
            });
            return contactList;
        };
        InquiryFormController.createFormFieldsObservable = function (formFields) {
            var me = this, formFieldList = [];
            _.forEach(formFields, function (x) {
                //var obj: IFormFieldObservable = {
                var obj = {
                    AllowManualTextEntry: ko.observable(x.AllowManualTextEntry),
                    Color: ko.observable(x.Color),
                    ContactTypeID: ko.observable(x.ContactTypeID),
                    CreatedByID: ko.observable(x.CreatedByID),
                    CreatedForID: ko.observable(x.CreatedForID),
                    DataTypeID: ko.observable(x.DataTypeID),
                    //DateTimeCreated: ko.observable<any>(x.DateTimeCreated),
                    //DateTimeModified: ko.observable<any>(x.DateTimeModified),
                    FieldDataID: ko.observable(x.FieldDataID),
                    FieldDisplayName: ko.observable(x.FieldDisplayName),
                    FieldID: ko.observable(x.FieldID),
                    FieldName: ko.observable(x.FieldName),
                    HTMLTypeID: ko.observable(x.HTMLTypeID),
                    ID: ko.observable(x.ID),
                    InquiryID: ko.observable(x.InquiryID),
                    IntegratedServiceFieldID: ko.observable(x.IntegratedServiceFieldID),
                    IntegratedServiceID: ko.observable(x.IntegratedServiceID),
                    IsActive: ko.observable(x.IsActive),
                    IsDeleted: ko.observable(x.IsDeleted),
                    IsRequired: ko.observable(x.IsRequired),
                    //LastUpdateSource: ko.observable<string>(x.LastUpdateSource),
                    //ModifiedByID: ko.observable<number>(x.ModifiedByID),
                    //ModifiedForID: ko.observable<number>(x.ModifiedForID),
                    Options: ko.observableArray(me.getFormFildOptions(x)),
                    SortOrder: ko.observable(x.SortOrder),
                    StringValue: ko.observable(x.StringValue),
                    //StringValue: ko.observable<string>(x.StringValue).extend({
                    //    DynamicRequire: true, //IsRequired
                    //    MinLength: x.MinimumValue
                    //}),
                    //////StringValue: ko.observable<string>(x.StringValue).extend({
                    //////    DynamicRequire: {
                    //////        HTMLTypeID: x.HTMLTypeID,
                    //////        Options: x.Options,
                    //////        //IsRequired: x.IsRequired
                    //////        IsRequired: true
                    //////        //function () {
                    //////        //    return {
                    //////        //        HTMLTypeID: this.HTMLTypeID,
                    //////        //        Options: this.Options,
                    //////        //        //IsRequired: this.IsRequired
                    //////        //        IsRequired: true
                    //////        //    }
                    //////        //}
                    //////    }
                    //////}),
                    SubFieldID: ko.observable(x.SubFieldID),
                    SubFieldName: ko.observable(x.SubFieldName),
                    SubFormID: ko.observable(x.SubFormID),
                    MaximumValue: ko.observable(x.MaximumValue),
                    MinimumValue: ko.observable(x.MinimumValue),
                    // internal properties
                    IsValid: ko.observable(true),
                    IsLengthValid: ko.observable(true),
                    IsOptionRequireValid: ko.observable(true),
                    errors: ko.observable(),
                    selectedContractValue: ko.observable(""),
                    IsIDExist: ko.observable(x.IsIDExist),
                    //IsIDExist: ko.observable<boolean>(false), ??????????????????????????????? 
                    IsNewEntry: ko.observable(false)
                };
                obj.errors = ko.validation.group(obj, { deep: true });
                formFieldList.push(obj);
            });
            //this.inquiryFormMasterVm.InquiryFormVm.FormFields. = ko.validation.group(this.inquiryFormMasterVm.InquiryFormVm.FormFields, { deep: true });
            return formFieldList;
        };
        InquiryFormController.getFormFildOptions = function (formFileld) {
            var me = this, optionList = [];
            _.forEach(formFileld.Options, function (x) {
                optionList.push({
                    FieldDataText: ko.observable(x.FieldDataText),
                    FieldDataID: ko.observable(x.FieldDataID),
                    IsSelected: ko.observable(x.IsSelected),
                    //IsSelected: ko.observable<boolean>(x.IsSelected).extend({
                    //    DynamicRequireOption: {
                    //        //HTMLTypeID: x.HTMLTypeID,
                    //        IsRequired: true,//x.IsRequired
                    //        Options: formFileld.Options
                    //    }
                    //}),
                    Color: ko.observable(x.Color),
                });
            });
            return optionList;
        };
        InquiryFormController.prototype.createDynamicFormObservable = function (dynamicForm) {
            var me = this;
        };
        InquiryFormController.prototype.updateSelectedContract = function (contractCode) {
            var me = this;
            _.forEach(InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if ((x.IntegratedServiceFieldID() == configOptions.Contract_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_IntegratedServiceID)) {
                    //
                    x.selectedContractValue(contractCode);
                }
            });
        };
        InquiryFormController.prototype.addClientIDToContractCode = function (inquiryFormVm) {
            _.forEach(inquiryFormVm.FormFields(), function (x) {
                if (x.IntegratedServiceFieldID() == configOptions.Contract_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_IntegratedServiceID) {
                    var clientId = InquiryForm.InquiryFormController.getClientId(inquiryFormVm.ContractCodes(), x.StringValue());
                    x.StringValue(x.StringValue() + "|" + clientId);
                }
            });
        };
        InquiryFormController.getClientId = function (contractCodes, contractCode) {
            var clientId;
            _.forEach(contractCodes, function (x) {
                if (x.ContractCode() == contractCode) {
                    //  First two letters specify the client.
                    clientId = Util.isNullOrEmpty(x.ClientID()) ? x.ContractCode().substring(0, 2) : x.ClientID();
                }
            });
            return clientId;
        };
        ;
        return InquiryFormController;
    }());
    InquiryForm.InquiryFormController = InquiryFormController;
    $.get("/App/Views/CSC/InquiryForm/HtmlBuilder.html", function (response) {
        if (!ko.components.isRegistered('htmlbuilder')) {
            ko.components.register('htmlbuilder', {
                viewModel: function (params) {
                    var self = this;
                    self.FormFieldVm = params.formFieldVm;
                    self.InquiryFormVm = params.inquiryFormVm;
                    self.SelectedContractValue = params.selectedContractValue;
                    self.IsUnitUpdated = params.IsUnitUpdated;
                    // Legacy properties - when dynamicFieldHTMLType is DataFromLegacy  
                    //=========================================================================                         
                    self.TemplateName = ko.observable("no_template");
                    self.IsPropertyCodeField = ko.observable(false);
                    self.ContractCodeChanged = function (obj, event) {
                        if (event.originalEvent) {
                            var ContractCode_ClieniId = obj.SelectedContractValue() + "|" +
                                InquiryForm.InquiryFormController.getClientId(self.InquiryFormVm.ContractCodes(), obj.SelectedContractValue());
                            self.FormFieldVm.StringValue(obj.SelectedContractValue());
                            // reLoadLegacyData(ContractCode_ClieniId, self.InquiryFormVm);
                            InquiryForm.InquiryFormController.reLoadLegacyData(ContractCode_ClieniId, self.InquiryFormVm);
                        }
                    };
                    self.IsTenantField = ko.observable(false);
                    self.SelectedTenantValue = ko.observable(0);
                    self.TenantChanged = function (obj, event) {
                        if (event.originalEvent) {
                            self.FormFieldVm.StringValue(obj.SelectedTenantValue());
                            self.FormFieldVm.IsIDExist(obj.SelectedTenantValue() > 0 ? true : false);
                        }
                    };
                    self.IsUnitField = ko.observable(false);
                    self.SelectedUnitValue = ko.observable(0);
                    self.UnitChanged = function (obj, event) {
                        if (event.originalEvent) {
                            self.FormFieldVm.StringValue(obj.SelectedUnitValue());
                            self.FormFieldVm.IsIDExist(obj.SelectedUnitValue() > 0 ? true : false);
                            reLoadUnitData(obj.SelectedUnitValue());
                        }
                    };
                    self.IsContactField = ko.observable(false); //??
                    self.SelectedContactValue = ko.observable(0); //??
                    self.Yes_NoValue = ko.observable(false);
                    self.Yes_NoValue.subscribe(function (value) {
                        //self.FormFieldVm.StringValue(stringToBoolean(value));
                        self.FormFieldVm.StringValue(value);
                    });
                    self.SelectedChooseFromListValue = ko.observable(0);
                    self.ChooseFromListChanged = function (obj, event) {
                        if (event.originalEvent) {
                            self.FormFieldVm.StringValue(obj.SelectedChooseFromListValue());
                            updateChooseFromList(self.FormFieldVm.Options(), obj.SelectedChooseFromListValue());
                        }
                    };
                    self.UpdateComboOption = function (existingVal, newValID, newValText, vm, isUnitCombo, textBoxVal) {
                        if (Util.isNothing(newValID)) {
                            vm.FormFieldVm.StringValue(textBoxVal);
                            vm.FormFieldVm.IsNewEntry(true);
                            vm.FormFieldVm.IsIDExist(false);
                        }
                        else {
                            vm.FormFieldVm.StringValue(newValID);
                        }
                        if (newValID != 0)
                            vm.FormFieldVm.IsIDExist(true);
                        // we call this function on "autocompleteselect" and "autocompletechange"
                        // we don't need reLoadUnitData on "autocompletechange"
                        //so we checked existingVal != newVal
                        if (isUnitCombo && newValID != 0 && existingVal != newValText) {
                            reLoadUnitData(newValID);
                        }
                        if (!isUnitCombo && newValID != 0 && existingVal != newValText) {
                            UpdateUnitComboValues(newValID);
                        }
                    };
                    self.GetComboValue = function (selectedValue, isUnitCombo, vm) {
                        if (InquiryForm.InquiryFormController.inquiryFormMasterVm.IsInitialLoad()) {
                            var arrObj = isUnitCombo ? vm.InquiryFormVm.Units() : vm.InquiryFormVm.Tenants();
                            var filterdArrObj = _.where(arrObj, function (x) {
                                if (x.ID() == selectedValue)
                                    return x;
                            });
                            if (!Util.isNothing(filterdArrObj[0]) && isUnitCombo) {
                                if (filterdArrObj[0].ID() == 0) {
                                    var units = InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.Units();
                                    InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.UnitComboValues(units);
                                    return filterdArrObj[0].UnitNumber();
                                }
                                else {
                                    UpdateUnitComboValues(filterdArrObj[0].ID());
                                }
                            }
                            if (!Util.isNothing(filterdArrObj[0]) && !isUnitCombo) {
                                return filterdArrObj[0].FullName();
                            }
                        }
                    };
                    function UpdateUnitComboValues(tenantId) {
                        var units = _.where(self.InquiryFormVm.Units(), function (x) {
                            //CurrentHOH() in unit is tenanID
                            // when the item is new there is no x.CurrentHOH()
                            if (x.ID() != 0 && x.CurrentHOH() == tenantId)
                                return x;
                        });
                        InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.UnitComboValues(units);
                    }
                    //========================================================================= 
                    switch (self.FormFieldVm.HTMLTypeID()) {
                        case configOptions.DynamicFieldHTMLType.Text:
                            self.TemplateName("Text");
                            break;
                        case configOptions.DynamicFieldHTMLType.ParagraphText:
                            self.TemplateName("ParagraphText");
                            break;
                        case configOptions.DynamicFieldHTMLType.DataFromLegacy:
                            self.TemplateName("DataFromLegacy");
                            buildLegacyForm(self);
                            break;
                        case configOptions.DynamicFieldHTMLType.Yes_No:
                            self.TemplateName("Yes_No");
                            if (!Util.isNullOrEmpty(self.FormFieldVm.StringValue()))
                                self.Yes_NoValue(self.FormFieldVm.StringValue().toLowerCase());
                            break;
                        case configOptions.DynamicFieldHTMLType.Checkboxes:
                            self.TemplateName("Checkboxes");
                            break;
                        case configOptions.DynamicFieldHTMLType.MultipleChoice:
                            self.TemplateName("MultipleChoice");
                            break;
                        case configOptions.DynamicFieldHTMLType.ChooseFromList:
                            self.TemplateName("ChooseFromList");
                            _.forEach(self.FormFieldVm.Options(), function (x) {
                                if (x.IsSelected())
                                    self.SelectedChooseFromListValue(x.FieldDataID());
                            });
                            break;
                        case configOptions.DynamicFieldHTMLType.Date:
                            self.TemplateName("Date");
                            self.DataPickerId = ko.observable("cscdynm-date-picker-" + self.FormFieldVm.FieldID());
                            if (!Util.isNullOrEmpty(self.FormFieldVm.StringValue())) {
                                self.FormFieldVm.StringValue(moment(self.FormFieldVm.StringValue()).format('MM/DD/YYYY  hh:mm A'));
                            }
                            break;
                    }
                    function buildLegacyForm(data) {
                        // contract code section
                        if ((self.FormFieldVm.IntegratedServiceFieldID() == configOptions.Contract_PropertyCode_IntegratedServiceFieldID &&
                            self.FormFieldVm.IntegratedServiceID() == configOptions.Contract_PropertyCode_IntegratedServiceID)) {
                            self.IsPropertyCodeField(true);
                        }
                        // Tenant section
                        if ((self.FormFieldVm.IntegratedServiceFieldID() == configOptions.Tenant_IntegratedServiceFieldID &&
                            self.FormFieldVm.IntegratedServiceID() == configOptions.Tenant_IntegratedServiceID)) {
                            self.IsTenantField(true);
                            updateTenant(self.FormFieldVm.StringValue());
                        }
                        // unit section
                        if ((self.FormFieldVm.IntegratedServiceFieldID() == configOptions.Unit_IntegratedServiceFieldID &&
                            self.FormFieldVm.IntegratedServiceID() == configOptions.Unit_IntegratedServiceID)) {
                            self.IsUnitField(true);
                            // update Unit Drop down
                            updateUnit(self.FormFieldVm.StringValue());
                        }
                    }
                    function updateTenant(selectedTenantId) {
                        InquiryForm.InquiryFormController.inquiryFormMasterVm.IsInitialLoad(true);
                        if (self.FormFieldVm.IsIDExist()) {
                            self.SelectedTenantValue(self.FormFieldVm.StringValue());
                        }
                        else {
                            var tanent = {
                                FullName: ko.observable(self.FormFieldVm.StringValue()),
                                ID: ko.observable(0)
                            };
                            self.InquiryFormVm.Tenants().push(tanent);
                            self.SelectedTenantValue(0);
                        }
                    }
                    function updateUnit(selectedUnitId) {
                        if (self.FormFieldVm.IsIDExist()) {
                            self.SelectedUnitValue(self.FormFieldVm.StringValue());
                            reLoadUnitData(selectedUnitId);
                        }
                        else {
                            var unit = {
                                UnitNumber: ko.observable(self.FormFieldVm.StringValue()),
                                ID: ko.observable(0)
                            };
                            self.InquiryFormVm.Units().push(unit);
                            self.SelectedUnitValue(0);
                        }
                    }
                    function updateChooseFromList(options, selectedChooseFromListValue) {
                        if (Util.isNothing(selectedChooseFromListValue)) {
                            _.forEach(options, function (x) {
                                //reset all selected to the false
                                x.IsSelected(false);
                            });
                        }
                        else {
                            _.where(options, function (x) {
                                if (x.FieldDataID() == selectedChooseFromListValue) {
                                    x.IsSelected(true);
                                }
                            });
                        }
                    }
                    //------------------------------------
                    //Contract section 
                    // kind of we reset all legacy data
                    //function clearContactField(formfiled: IFormFieldObservable, contact: IContactObservable) {
                    //    
                    //    _.forEach(self.InquiryFormVm.Contacts(), function (x: IContactObservable) {
                    //        if (x.ContactType() == formfiled.ContactTypeID().toString())
                    //            formfiled.StringValue(); //?????
                    //    });
                    //}    
                    //------------------------------------
                    // Unit section
                    function reLoadUnitData(unitId) {
                        if (Util.isNothing(unitId)) {
                            //clear all Unit sub object
                            clearUnitObservable();
                        }
                        else {
                            //find the unit that is selected
                            var unit = _.findWhere(self.InquiryFormVm.Units(), function (x) {
                                if (x.ID() == unitId)
                                    return x;
                            });
                            if (!Util.isNothing(unit))
                                //find all existing sub object that we have in the FromField and update their the value. like "UnitAddress" ...
                                updateUnitObservable(unit);
                        }
                    }
                    function clearUnitObservable() {
                        _.forEach(self.InquiryFormVm.FormFields(), function (x) {
                            if ((x.IntegratedServiceFieldID() == configOptions.Unit_UnitAddress_IntegratedServiceFieldID &&
                                x.IntegratedServiceID() == configOptions.Unit_UnitAddress_IntegratedServiceID) ||
                                //(x.IntegratedServiceFieldID() == configOptions.Unit_UnitAddress_IntegratedServiceFieldID &&
                                //    x.IntegratedServiceID() == configOptions.Unit_UnitAddress2_IntegratedServiceID) ||
                                (x.IntegratedServiceFieldID() == configOptions.Unit_UnitState_IntegratedServiceFieldID &&
                                    x.IntegratedServiceID() == configOptions.Unit_UnitState_IntegratedServiceID) ||
                                (x.IntegratedServiceFieldID() == configOptions.Unit_UnitCity_IntegratedServiceFieldID &&
                                    x.IntegratedServiceID() == configOptions.Unit_UnitCity_IntegratedServiceID) ||
                                (x.IntegratedServiceFieldID() == configOptions.Unit_UnitZip_IntegratedServiceFieldID &&
                                    x.IntegratedServiceID() == configOptions.Unit_UnitZip_IntegratedServiceID) ||
                                (x.IntegratedServiceFieldID() == configOptions.Unit_UnitSize_IntegratedServiceFieldID &&
                                    x.IntegratedServiceID() == configOptions.Unit_UnitSize_IntegratedServiceID) ||
                                (x.IntegratedServiceFieldID() == configOptions.Unit_UnitType_IntegratedServiceFieldID &&
                                    x.IntegratedServiceID() == configOptions.Unit_UnitType_IntegratedServiceID) ||
                                (x.IntegratedServiceFieldID() == configOptions.Unit_UtilityAllowance_IntegratedServiceFieldID &&
                                    x.IntegratedServiceID() == configOptions.Unit_UtilityAllowance_IntegratedServiceID))
                                //(x.IntegratedServiceFieldID() == configOptions.Unit_ContractRent_IntegratedServiceFieldID &&
                                //    x.IntegratedServiceID() == configOptions.Unit_ContractRent_IntegratedServiceID) ||
                                //(x.IntegratedServiceFieldID() == configOptions.Unit_GrossRent_IntegratedServiceFieldID &&
                                //    x.IntegratedServiceID() == configOptions.Unit_GrossRent_IntegratedServiceID))
                                x.StringValue('');
                        });
                    }
                    function updateUnitObservable(unit) {
                        _.forEach(self.InquiryFormVm.FormFields(), function (x) {
                            if (x.IntegratedServiceFieldID() == configOptions.Unit_UnitAddress_IntegratedServiceFieldID &&
                                x.IntegratedServiceID() == configOptions.Unit_UnitAddress_IntegratedServiceID) {
                                x.StringValue(unit.Address());
                            }
                            //if (x.IntegratedServiceFieldID() == configOptions.Unit_UnitAddress2_IntegratedServiceFieldID &&
                            //    x.IntegratedServiceID() == configOptions.Unit_UnitAddress2_IntegratedServiceID)
                            //    x.StringValue(unit.Address2());
                            if (x.IntegratedServiceFieldID() == configOptions.Unit_UnitState_IntegratedServiceFieldID &&
                                x.IntegratedServiceID() == configOptions.Unit_UnitState_IntegratedServiceID)
                                x.StringValue(unit.State());
                            if (x.IntegratedServiceFieldID() == configOptions.Unit_UnitCity_IntegratedServiceFieldID &&
                                x.IntegratedServiceID() == configOptions.Unit_UnitCity_IntegratedServiceID)
                                x.StringValue(unit.City());
                            if (x.IntegratedServiceFieldID() == configOptions.Unit_UnitZip_IntegratedServiceFieldID &&
                                x.IntegratedServiceID() == configOptions.Unit_UnitZip_IntegratedServiceID) {
                                x.StringValue(unit.ZipCode());
                            }
                            if (x.IntegratedServiceFieldID() == configOptions.Unit_UnitSize_IntegratedServiceFieldID &&
                                x.IntegratedServiceID() == configOptions.Unit_UnitSize_IntegratedServiceID)
                                x.StringValue(unit.UnitSize().toString());
                            if (x.IntegratedServiceFieldID() == configOptions.Unit_UnitType_IntegratedServiceFieldID &&
                                x.IntegratedServiceID() == configOptions.Unit_UnitType_IntegratedServiceID)
                                x.StringValue(unit.UnitType());
                            if (x.IntegratedServiceFieldID() == configOptions.Unit_UtilityAllowance_IntegratedServiceFieldID &&
                                x.IntegratedServiceID() == configOptions.Unit_UtilityAllowance_IntegratedServiceID)
                                x.StringValue(unit.UtilityAllowance().toString());
                            //if (x.IntegratedServiceFieldID() == configOptions.Unit_ContractRent_IntegratedServiceFieldID &&
                            //    x.IntegratedServiceID() == configOptions.Unit_ContractRent_IntegratedServiceID)
                            //    x.StringValue(unit.ContractRent().toString());
                            //if (x.IntegratedServiceFieldID() == configOptions.Unit_GrossRent_IntegratedServiceFieldID &&
                            //    x.IntegratedServiceID() == configOptions.Unit_GrossRent_IntegratedServiceID)
                            //    x.StringValue(unit.GrossRent().toString());
                            //if (x.IntegratedServiceFieldID() == configOptions.Unit_UnitAddress_IntegratedServiceFieldID &&
                            //    x.IntegratedServiceID() == configOptions.Unit_UnitAddress_IntegratedServiceID)
                            //    x.StringValue(unit.ID().toString());
                        });
                    }
                    //------------------------------------
                    function stringToBoolean(str) {
                        return (Util.isNothing(str) || str.toLowerCase() == "false") ? false : true;
                    }
                    $(".date-picker").datetimepicker();
                },
                template: response
            });
        }
    });
    ko.bindingHandlers.radioCheck = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            //initalize checked value of element
            element.checked = valueAccessor()();
            //attach event to handle changes
            $(element).change(function (e) {
                var item = ko.dataFor(element);
                var items = ko.contextFor(element).$parent.Options();
                for (var i = 0; i < items.length; i++) {
                    //set selected() for all items
                    //true for the checked element, false for the rest
                    items[i].IsSelected(items[i].FieldDataID() == item.FieldDataID());
                }
            });
        }
    };
    ko.bindingHandlers.customChange = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var elem = element;
            element.addEventListener('mousedown', function (event) {
                if (!Util.isNullOrEmpty(elem.value)) {
                    if (!confirm('Are you sure you want to change this, if you change it Unit, Tenant and Contact will be changed?')) {
                        event.preventDefault();
                    }
                }
                //UI.showConfirmDialog(
                //    "test",
                //    function () {
                //    },
                //    function () {
                //        obj.preventDefault();
                //    });
            });
        }
    };
    ko.bindingHandlers.combobox = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var observable = valueAccessor();
            var bindings = ko.utils.unwrapObservable(allBindings());
            var vm = viewModel;
            SetupCombobox(element, bindings, observable, vm);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            //update the element's value, when the model changes
            var value = ko.utils.unwrapObservable(valueAccessor()), bindings = ko.utils.unwrapObservable(allBindings()), $elem = $(element);
            //var selected = $(element).children(":selected");
            //var p = selected.context.selectedOptions[0].value;
            var selectedValue = bindings.value();
            var elemName = $elem.attr("data-id");
            var isUnitCombo = $elem.attr("data-id") == "unit-combo" ? true : false;
            var val = viewModel.GetComboValue(selectedValue, isUnitCombo, viewModel);
            $(element).parent().find('input').val(val);
        }
    };
    function SetupCombobox(element, bindings, observable, viewModel) {
        var $elem = $(element), bindings = bindings, observable = observable, vm = viewModel;
        //initialize combobox 
        $elem.combobox();
        //when newly create input changes, then update model
        $elem.parent().find('input').bind("autocompleteselect autocompletechange", function (event, ui) {
            var elemName = $elem.attr("data-id");
            var isUnitCombo = $elem.attr("data-id") == "unit-combo" ? true : false;
            var newValText = ui.item ? ui.item.value : null;
            var newValID = ui.item && ui.item.option.value ? ui.item.option.value : null;
            var existingVal = $(this).val();
            var textBoxVal = Util.isNothing(newValID) ? $elem.next().next().val() : "";
            //if (Util.isNullOrEmpty(existingVal) || existingVal == 0)
            // vm.AddComboOption(newVal, vm, isUnitCombo);
            // else
            vm.UpdateComboOption(existingVal, newValID, newValText, vm, isUnitCombo, textBoxVal);
        });
    }
    ko.validation.init({
        errorElementClass: 'alert alert-warning'
    });
    ko.validation.rules['DynamicRequire'] = {
        validator: function (val, isRequired) {
            //
            if (isRequired) {
                return !Util.isNullOrEmpty(val);
            }
            else {
                return false; //is valid
            }
        },
        message: 'This field is required'
    };
    ko.validation.rules['DynamicRequireOption'] = {
        validator: function (val, validaionObj) {
            if (validaionObj.IsRequired) {
                //if (validaionObj.HTMLTypeID == configOptions.DynamicFieldHTMLType.Checkboxes ||
                //    validaionObj.HTMLTypeID == configOptions.DynamicFieldHTMLType.MultipleChoice ||
                //    validaionObj.HTMLTypeID == configOptions.DynamicFieldHTMLType.ChooseFromList) {
                var hasIsSelectedTrue = _.any(validaionObj.Options, function (x) {
                    return x.IsSelected == true;
                });
                if (hasIsSelectedTrue) {
                    return true; //is valid
                }
                else {
                    return false; //is not valid
                }
            }
            else {
                return true; //is valid
            }
        },
        message: 'This field is required'
    };
    ko.validation.rules['MinLength'] = {
        validator: function (val, minimumValue) {
            if (minimumValue > 0) {
                if (val.length <= minimumValue) {
                    return false; //is valid
                }
                else {
                    return true; //is not valid
                }
            }
            else {
                return false; //is valid
            }
        },
        message: 'The Minimum is '
    };
    var SearchFormDialog = (function () {
        // Constructor
        function SearchFormDialog() {
            // private onSearchForm: (listName: string, templateFormID: number, ID: number) => void;
            this.inquiryForm = InquiryForm.InquiryFormController;
            var me = this;
            this.searchViewModel = {
                ContractCode: ko.observable(""),
                PropertyName: ko.observable(""),
                PropertyCode: ko.observable(""),
                ContactType: ko.observable(""),
                Name: ko.observable(""),
                Address: ko.observable(""),
                City: ko.observable(""),
                State: ko.observable(""),
                Zip: ko.observable(""),
                Phone: ko.observable(""),
                Results: ko.observableArray(),
                NewContractCode: ko.observable(""),
                NewClientID: ko.observable(""),
                onSearchForm: function () {
                    //Search Form
                    me.gridContainer = me.container.find("div[data-id='grid']");
                    var searchButton = me.container.find("[data-id='searchButton']");
                    me.loadGrid(me.container).done(function (dataSource) {
                        me.grid.setDataSource(dataSource);
                        searchButton.prop("disabled", false);
                        searchButton.text("Search");
                    });
                    ;
                },
                onSelect: function () {
                    //SelectedContractValue
                    //_.forEach(me.inquiryForm.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                    //    if ((x.IntegratedServiceFieldID() == configOptions.Contract_IntegratedServiceFieldID &&
                    //        x.IntegratedServiceID() == configOptions.Contract_IntegratedServiceID)) {
                    //        x.selectedContractValue('FL29E000013'); // we have to pass contract code 
                    //    }
                    //});
                },
                onClearForm: function () {
                    //Clear Fields
                    me.searchViewModel.ContractCode("");
                    me.searchViewModel.PropertyName("");
                    me.searchViewModel.PropertyCode("");
                    me.searchViewModel.ContactType("");
                    me.searchViewModel.Name("");
                    me.searchViewModel.Address("");
                    me.searchViewModel.Name("");
                    me.searchViewModel.Address("");
                    me.searchViewModel.City("");
                    me.searchViewModel.State("");
                    me.searchViewModel.Zip("");
                    me.searchViewModel.Phone("");
                }
            };
        }
        SearchFormDialog.prototype.updateContractCode = function (ID) {
            var me = this;
            var contractCode = $.trim(ID);
            _.forEach(me.inquiryForm.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if ((x.IntegratedServiceFieldID() == configOptions.Contract_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_IntegratedServiceID)) {
                    x.StringValue(contractCode);
                    //
                    x.selectedContractValue(contractCode); // we have to pass contract code                      
                }
            });
            //call reload legacy data
            var ClientID = contractCode + "|" +
                InquiryForm.InquiryFormController.getClientId(me.inquiryForm.inquiryFormMasterVm.InquiryFormVm.ContractCodes(), contractCode);
            InquiryForm.InquiryFormController.inquiryFormMasterVm.IsInitialLoad(false);
            me.inquiryForm.reLoadLegacyData(ClientID, me.inquiryForm.inquiryFormMasterVm.InquiryFormVm);
        };
        SearchFormDialog.prototype.loadGrid = function (container) {
            var app = Global.App(), me = this, waitContainer, dataSource, deferred = $.Deferred();
            var gridContainer = container.find("div[data-id='grid']");
            var searchButton = container.find("[data-id='searchButton']");
            searchButton.prop("disabled", true);
            searchButton.text("Searching...");
            dataSource = Data.createWebServiceKendoDataSource(Util.BuildURL([configOptions.baseURL, "Inquiry", "SearchContractsForGrid"]), {
                id: "ContractCode",
                fields: {
                    "ProviderPrefix": { "type": "string" },
                    "PropertyCode": { "type": "string" },
                    "PropertyName": { "type": "string" },
                    "ContactType": { "type": "string" },
                    "ContactName": { "type": "string" },
                    "ContactAddress": { "type": "string" },
                    "ContactCity": { "type": "string" },
                    "ContactState": { "type": "string" },
                    "ContactZip": { "type": "string" },
                    "ContactPhone": { "type": "string" }
                }
            }, function (data) {
                data.ContractCode = me.searchViewModel.ContractCode();
                data.PropertyCode = me.searchViewModel.PropertyCode();
                data.PropertyName = me.searchViewModel.PropertyName();
                data.ContactType = me.searchViewModel.ContactType();
                data.ReturnContactInfo = true;
                data.ContactName = me.searchViewModel.Name();
                data.ContactAddress = me.searchViewModel.Address();
                data.ContactCity = me.searchViewModel.City();
                data.ContactState = me.searchViewModel.State();
                data.ContactZip = me.searchViewModel.Zip();
                data.ContactPhone = me.searchViewModel.Phone();
            });
            deferred.resolve(dataSource);
            return deferred.promise();
        };
        //Called when loaded page is redisplayed
        SearchFormDialog.prototype.refresh = function () {
            this.grid.dataSource.read();
        };
        SearchFormDialog.prototype.render = function (container) {
            var me = this;
            this.container = container.find("div[data-id='searchDialog']");
            this.gridContainer = container.find("div[data-id='grid']");
            //Create the grid
            me.dataSource = new kendo.data.DataSource({
                pageSize: 10
            });
            //Bind to ContractCode link in the grid
            me.gridContainer.on("click", "a[data-id='copyContractCode']", function (e) {
                var ID = $(this).attr('href');
                me.updateContractCode(ID);
                //_.forEach(me.inquiryForm.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                //     if ((x.IntegratedServiceFieldID() == configOptions.Contract_IntegratedServiceFieldID &&
                //         x.IntegratedServiceID() == configOptions.Contract_IntegratedServiceID)) {
                //         x.StringValue(ID);
                //         x.selectedContractValue(ID); // we have to pass contract code                      
                //     }
                // });
                e.preventDefault();
                me.container.modal("hide");
                return false;
            });
            me.grid = me.gridContainer.kendoGrid({
                dataSource: me.dataSource,
                selectable: false,
                sortable: true,
                filterable: false,
                pageable: //      // true
                {
                    pageSize: 10,
                    numeric: false,
                },
                columns: [
                    { title: "ClientID", field: "ProviderPrefix", hidden: true },
                    { title: "Contract Code", field: "ContractCode", template: '<a href="#: ContractCode #"  data-id="copyContractCode">#: ContractCode #</a>' },
                    { title: "Property Code", field: "PropertyCode" },
                    { title: "Property Name", field: "PropertyName" }
                ],
                excel: {
                    fileName: "SearchResults.xlsx",
                    filterable: true,
                    allPages: true
                }
            }).data("kendoGrid");
            ko.applyBindings(this.searchViewModel, this.container[0]);
        };
        return SearchFormDialog;
    }());
})(InquiryForm || (InquiryForm = {}));
//# sourceMappingURL=inquiryform.js.map