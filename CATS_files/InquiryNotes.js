var InquiryNotes;
(function (InquiryNotes) {
    var ConfigOptions = new Configuration.CSC_Config();
    var ConfigOptionsDoc = new Configuration.DM_Config();
    //var ConfigOptionsDoc = new Configuration.CSC_Config();
    function getCSRFToken() {
        var csrfToken = $('#forgeryToken').val();
        return csrfToken;
    }
    InquiryNotes.getCSRFToken = getCSRFToken;
    ;
    ;
    //-------------------------------------------------------------------------------
    //Constants
    //The template file and the name of any template blocks in that file
    var TEMPLATE_FILE_NAME = "InquiryNotes", TEMPLATENAME = "template_inquiryNotes";
    //-------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------
    //Class
    var InquiryNotesController = (function () {
        function InquiryNotesController() {
            var _this = this;
            this.fieldsOnLoad = null;
            var me = this;
            this.inquiryNotesVm = {
                ShowDeleted: ko.observable(),
                UnfilteredInquiryNotes: ko.observableArray(),
                ShowStatusOnly: ko.observable(),
                selectedResponse: ko.observable(),
                InquiryNotes: ko.observableArray(),
                InquiryNotesWithNewAttachments: ko.observableArray(),
                Statuses: ko.observableArray(),
                Sort: ko.observableArray(),
                NoteTypes: ko.observableArray(),
                ContactList: ko.observableArray(),
                Emails: ko.observableArray(),
                EmailResponses: ko.observableArray(),
                StatusID: ko.observable(),
                StatusDate: ko.observable(),
                StatusName: ko.observable(),
                EditForm: ko.observable(),
                EditStatusHistory: ko.observable(),
                ModifiedByName: ko.observable(),
                SortID: ko.observable(),
                InquiryID: ko.observable(),
                NoteID: ko.observable(),
                newNoteText: ko.observable(),
                newNoteType: ko.observable(),
                newNoteDate: ko.observable(),
                newStatusDate: ko.observable(),
                AttachmentList: ko.observableArray(),
                NewAttachments: ko.observableArray(),
                uploadedGuid: ko.observable(),
                uploadedIndex: ko.observable(),
                URL: ko.observable(),
                FileName: ko.observable(),
                FileLocation: ko.observable(),
                sendEmailBtnText: ko.observable("Send Email"),
                SelectedContactID: ko.observable(0),
                SelectedContact: ko.observable(),
                errors: ko.observable(),
                FileNameDecoded: ko.observable(),
                openCalendar: function () {
                    //open calendar on button click event...was not working for some reason with bootstrap js
                    var input = me.container.find("[data-id='noteDatepicker']");
                    input.datepicker();
                    input.datepicker('show');
                },
                openEditCalendar: function (obj) {
                    //open calendar on button click event...was not working for some reason with bootstrap js
                    var input = me.container.find("[data-id='" + obj.ID() + "']");
                    input.datepicker();
                    input.data('datepicker').hide = function () { };
                    input.datepicker('show');
                },
                SortOrder: function (data) {
                    me.SortNotes(data);
                },
                SortByType: function (a, b) {
                    return a.NoteTypeText().toLowerCase() > b.NoteTypeText().toLowerCase() ? 1 : -1;
                },
                SortByUser: function (a, b) {
                    if (a.ModifiedByName() == null)
                        a.ModifiedByName("");
                    if (b.ModifiedByName() == null)
                        b.ModifiedByName("");
                    return a.ModifiedByName().toLowerCase() > b.ModifiedByName().toLowerCase() ? 1 : -1;
                },
                SortByDate: function (a, b) {
                    return (Date.parse(a.NoteDateTime()) == Date.parse(b.NoteDateTime()) ? 0 : (Date.parse(a.NoteDateTime()) > Date.parse(b.NoteDateTime()) ? -1 : 1));
                },
                contactLinkClicked: function (item) {
                    var panelLinkItem = $('#InquiryNoteContactInfoPanelLink' + me.templateID);
                    if (panelLinkItem.attr('class') == 'panel-toggle-link panel-on') {
                        panelLinkItem.removeClass('panel-on');
                        panelLinkItem.addClass('panel-off');
                    }
                    else {
                        panelLinkItem.removeClass('panel-off');
                        panelLinkItem.addClass('panel-on');
                    }
                },
                SaveUpload: function (note) {
                    var app = Global.App(), deferred = $.Deferred();
                    me.inquiryNotesVm.FileName("");
                    // 
                    var saveParams = {
                        InquiryID: me.inquiryNotesVm.InquiryID(),
                        NoteID: me.inquiryNotesVm.NoteID(),
                        NewAttachments: me.inquiryNotesVm.AttachmentList()
                    };
                    InquiryData.SaveNewAttachedDocuments(ko.toJS(saveParams))
                        .done(function (response) {
                        if (response.Success) {
                            UI.showNotificationMessage(UI.PHRASE_RECORDSAVED, UI.messageTypeValues.success);
                            $(".k-upload-files.k-reset").find("li").remove();
                            me.container.find("div[data-id='uploadDialog']").modal("hide");
                            //_.forEach(note.AttachmentList(), function (attachment: InquiryData.IDocumentEntity) {
                            //    me.inquiryNotesVm.InquiryNotes()[me.inquiryNotesVm.NoteID()].AttachmentList.push(me.createDocumentEntityObservableOnLoad(attachment, me.inquiryNotesVm.InquiryID()))
                            //});
                            deferred.resolve();
                        }
                        else {
                            UI.showErrorMessage(response.ErrorMessages);
                            deferred.reject();
                        }
                    })
                        .fail(function () {
                        deferred.reject();
                    });
                },
                CancelUpload: function (e) {
                    $(".k-upload-files.k-reset").find("li").remove();
                    me.container.find("div[data-id='uploadDialog']").modal("hide");
                },
                Responses: ko.observableArray(),
                emailFormDialog: new EmailFormDialog(),
                isInitialLoad: ko.observable(true),
                showEmailDialog: function () {
                    // we load the data base on the contract code. Is possible the user change the contract code. 
                    var emailContanier = me.container.find("div[data-id='EmailDialog']");
                    emailContanier.modal("show");
                    me.inquiryNotesVm.emailFormDialog.render(emailContanier, me.inquiryNotesVm.InquiryID(), me.inquiryNotesVm.isInitialLoad());
                    me.inquiryNotesVm.isInitialLoad() ? me.inquiryNotesVm.isInitialLoad(false) : false;
                },
            };
            this.inquiryNotesVm.SelectedContactID.subscribe(function (newValue) {
                if (newValue != undefined) {
                    var contact = ko.utils.arrayFirst(me.inquiryNotesVm.ContactList(), function (contact) { return (contact.ID() === newValue); });
                    _this.inquiryNotesVm.SelectedContact(contact);
                }
            });
            this.inquiryNotesVm.ShowStatusOnly.subscribe(function (newValue) {
                if (newValue === true) {
                    if (_this.inquiryNotesVm.ShowDeleted() != true) {
                        _this.inquiryNotesVm.InquiryNotes(ko.utils.arrayFilter(_this.inquiryNotesVm.UnfilteredInquiryNotes(), function (note) {
                            return note.IsStatusHistory() == true && note.IsActive() == true;
                        }));
                    }
                    else {
                        _this.inquiryNotesVm.InquiryNotes(ko.utils.arrayFilter(_this.inquiryNotesVm.UnfilteredInquiryNotes(), function (note) {
                            return note.IsStatusHistory() == true && (note.IsActive() == true || note.IsActive() == false);
                        }));
                    }
                }
                else {
                    _this.inquiryNotesVm.InquiryNotes(_this.inquiryNotesVm.UnfilteredInquiryNotes());
                }
            });
            this.inquiryNotesVm.ShowDeleted.subscribe(function (newValue) {
                if (newValue == true) {
                    if (_this.inquiryNotesVm.ShowStatusOnly() != true) {
                        _this.inquiryNotesVm.InquiryNotes(ko.utils.arrayFilter(_this.inquiryNotesVm.UnfilteredInquiryNotes(), function (note) {
                            return note.IsActive() == true || note.IsActive() == false;
                        }));
                    }
                    else {
                        _this.inquiryNotesVm.InquiryNotes(ko.utils.arrayFilter(_this.inquiryNotesVm.UnfilteredInquiryNotes(), function (note) {
                            return note.IsStatusHistory() == true && (note.IsActive() == true || note.IsActive() == false);
                        }));
                    }
                }
                else {
                    if (_this.inquiryNotesVm.ShowStatusOnly() != true) {
                        _this.inquiryNotesVm.InquiryNotes(ko.utils.arrayFilter(_this.inquiryNotesVm.UnfilteredInquiryNotes(), function (note) {
                            return note.IsActive() == true;
                        }));
                    }
                    else {
                        _this.inquiryNotesVm.InquiryNotes(ko.utils.arrayFilter(_this.inquiryNotesVm.UnfilteredInquiryNotes(), function (note) {
                            return note.IsStatusHistory() == true && note.IsActive() == true;
                        }));
                    }
                }
            });
            this.inquiryNotesVm.selectedResponse.subscribe(function (newValue) {
                var selected = newValue;
                _.forEach(me.inquiryNotesVm.Responses(), function (response) {
                    if (response.ID() == newValue) {
                        var value = me.inquiryNotesVm.newNoteText();
                        if (typeof value == 'undefined')
                            me.inquiryNotesVm.newNoteText("");
                        me.inquiryNotesVm.newNoteText(me.inquiryNotesVm.newNoteText() + " " + response.Text());
                    }
                });
            }, this.inquiryNotesVm.selectedResponse);
            this.inquiryNotesVm.newNoteDate = ko.observable().extend({
                required: {
                    message: "Note Date is required",
                    params: true,
                    onlyIf: function () {
                        return me.inquiryNotesVm.newNoteType() > 0 || me.inquiryNotesVm.newNoteType() != undefined;
                    }
                }
            }),
                this.inquiryNotesVm.newNoteType = ko.observable().extend({
                    required: {
                        message: "Note Type is required",
                        params: true,
                        onlyIf: function () {
                            return me.inquiryNotesVm.newNoteText() != "" || me.inquiryNotesVm.AttachmentList().length != 0;
                        }
                    }
                }),
                this.inquiryNotesVm.newStatusDate = ko.observable().extend({
                    required: {
                        message: "Status Date is required",
                        params: true,
                        onlyIf: function () {
                            return me.inquiryNotesVm.StatusID() > 0;
                        }
                    }
                }),
                this.inquiryNotesVm.newNoteText = ko.observable().extend({
                    required: {
                        message: "Note Text is required",
                        params: true,
                        onlyIf: function () {
                            return me.inquiryNotesVm.newNoteType() > 0 || me.inquiryNotesVm.newNoteType() != undefined;
                        }
                    }
                }),
                this.inquiryNotesVm.errors = ko.validation.group(this.inquiryNotesVm, { deep: true });
        }
        //Output the HTML to the browser
        InquiryNotesController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            this.templateID = Date.now();
            //this.container = container.find("div[data-id='formContainer']").find(".right-notes-container");
            //Load the template file
            app.templates().render(TEMPLATE_FILE_NAME, moduleName, "InquiryNotes", TEMPLATENAME, this.container, {
                TemplateID: this.templateID
            })
                .done(function () {
                //initialize kendo upload control
                //upload control for new note
                me.container.find(".uploadFiles").kendoUpload({
                    async: {
                        saveUrl: "save",
                        removeUrl: "remove",
                        autoUpload: true
                    },
                    upload: _.bind(me.onUpload, me),
                    select: _.bind(me.onSelect, me),
                    complete: _.bind(me.onComplete, me),
                    remove: _.bind(me.onRemove, me),
                    multiple: true
                });
                //upload control on modal for editing notes...TODO combine new kendo control also to be modal
                me.container.find(".uploadFilesEdit").kendoUpload({
                    async: {
                        saveUrl: "save",
                        removeUrl: "remove",
                        autoUpload: true
                    },
                    upload: _.bind(me.onUpload, me),
                    select: _.bind(me.onSelect, me),
                    complete: _.bind(me.onComplete, me),
                    remove: _.bind(me.onRemoveEdit, me),
                    multiple: true
                });
                me.inquiryNotesVm.InquiryNotes.sort(me.inquiryNotesVm.SortByDate);
                ko.applyBindings(me.inquiryNotesVm, me.container[0]);
                me.container.find(".note-date-picker").datetimepicker();
                deferred.resolve();
            });
            return deferred.promise();
        };
        InquiryNotesController.prototype.load = function (loadParams) {
            var me = this, waitContainer, app = Global.App(), deferred = $.Deferred();
            //reset kendo control
            $(".k-upload-files.k-reset").find("li").remove();
            $(".k-upload-status").remove();
            $(".k-upload.k-header").addClass("k-upload-empty");
            $(".k-upload-button").removeClass("k-state-focused");
            this.inquiryNotesVm.InquiryNotes.removeAll();
            this.inquiryNotesVm.Statuses.removeAll();
            this.inquiryNotesVm.AttachmentList.removeAll();
            this.inquiryNotesVm.Responses.removeAll();
            this.inquiryNotesVm.Sort.removeAll();
            this.inquiryNotesVm.ContactList.removeAll();
            this.inquiryNotesVm.EmailResponses.removeAll();
            this.inquiryNotesVm.Emails.removeAll();
            _.forEach(loadParams.Statuses, function (status) {
                me.inquiryNotesVm.Statuses.push(me.createStatusObservable(status));
            });
            this.inquiryNotesVm.NoteTypes.removeAll();
            _.forEach(loadParams.NoteTypes, function (note) {
                me.inquiryNotesVm.NoteTypes.push(me.createNoteTypeObservable(note));
            });
            _.forEach(loadParams.InquiryNotes, function (notes) {
                me.inquiryNotesVm.InquiryNotes.push(me.createInquiryNotesObservable(notes));
            });
            _.forEach(loadParams.Emails, function (email) {
                me.inquiryNotesVm.InquiryNotes.push(me.createInquiryNoteFromEmail(email));
            });
            _.forEach(loadParams.EmailResponse, function (email) {
                me.inquiryNotesVm.InquiryNotes.push(me.createInquiryNoteFromEmailResponse(email));
            });
            _.forEach(loadParams.Responses, function (response) {
                me.inquiryNotesVm.Responses.push(me.createResponseObservable(response));
            });
            _.forEach(loadParams.ContactList, function (contact) {
                me.inquiryNotesVm.ContactList.push(me.createContactObservable(contact));
            });
            if (loadParams.ContactList.length > 0) {
                me.inquiryNotesVm.SelectedContactID(loadParams.ContactList[0].ID);
            }
            me.inquiryNotesVm.Sort.push(me.createSortObservable({ ID: 1, SortName: "Sort by Date" }));
            me.inquiryNotesVm.Sort.push(me.createSortObservable({ ID: 2, SortName: "Sort by Type" }));
            me.inquiryNotesVm.Sort.push(me.createSortObservable({ ID: 3, SortName: "Sort by User" }));
            this.inquiryNotesVm.errors.showAllMessages(false);
            me.inquiryNotesVm.StatusID(loadParams.StatusID);
            me.inquiryNotesVm.StatusDate(loadParams.StatusDate);
            me.inquiryNotesVm.StatusName(loadParams.StatusName);
            me.inquiryNotesVm.EditForm(loadParams.EditForm);
            me.inquiryNotesVm.ModifiedByName(loadParams.ModifiedByName);
            me.inquiryNotesVm.InquiryID(loadParams.InquiryID);
            me.inquiryNotesVm.newNoteDate(moment(Date.now()).format(Util.MOMENT_FORMAT_DATETIME));
            me.inquiryNotesVm.newStatusDate(moment(Date.now()).format(Util.MOMENT_FORMAT_DATETIME));
            UI.hideWaitIndicator(me.container, waitContainer);
            me.inquiryNotesVm.UnfilteredInquiryNotes(me.inquiryNotesVm.InquiryNotes().slice(0));
            me.inquiryNotesVm.InquiryNotes(ko.utils.arrayFilter(me.inquiryNotesVm.UnfilteredInquiryNotes(), function (note) {
                return note.IsActive() == true;
            }));
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        InquiryNotesController.prototype.loadRecord = function (loadParams) {
            var app = Global.App(), me = this, waitContainer, deferred = $.Deferred(), now = new Date(), displayTime;
            //waitContainer = UI.showWaitIndicator(me.container);
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        InquiryNotesController.prototype.haveFieldsChanged = function () {
            if (this.fieldsOnLoad == null) {
                //No data is loaded
                return false;
            }
            //Remove focus from the current control which will force
            //the view model to update with the most current values.
            UI.blurActiveElement();
            //Get the current values of the fields
            var fieldsCurrent = ko.toJS(this.getEditableNoteItems());
            //Compare to the values when the page was first loaded
            return this.fieldsOnLoad != JSON.stringify(fieldsCurrent);
        };
        //Use for individual note editing to compare to fieldsOnLoad
        InquiryNotesController.prototype.hasExistingNoteChanged = function (noteID, fieldsOnLoad, existingNote) {
            var me = this;
            var editnote;
            _.forEach(fieldsOnLoad, function (note) {
                if (note.ID == noteID) {
                    editnote = {
                        ID: note.ID,
                        Note: note.Note,
                        NoteDateTime: note.NoteDateTime,
                        AttachmentList: note.AttachmentList
                    };
                }
            });
            return JSON.stringify(editnote) != JSON.stringify(existingNote);
        };
        //Called when browser re-sizes, adjust the height of the
        //scrollable fields area.
        InquiryNotesController.prototype.height = function (height) {
            var fieldHeight = height - 50;
            if (fieldHeight > 0) {
                this.fieldsContainer.height(fieldHeight);
            }
        };
        //Returns a unique ID for this controller
        InquiryNotesController.prototype.appRouterID = function (id) {
            if (id == null ||
                id <= 0) {
                return "InquiryNew";
            }
            else {
                return "Inquiry" + id;
            }
        };
        //Returns a title for the page
        InquiryNotesController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Inquiry";
        };
        InquiryNotesController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        InquiryNotesController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        //Call the web service to update the database in the DB
        InquiryNotesController.prototype.save = function () {
            var app = Global.App(), me = this, waitContainer;
        };
        InquiryNotesController.prototype.SortNotes = function (data) {
            var me = this;
            if (data.SortID() == 1) {
                return me.inquiryNotesVm.InquiryNotes.sort(me.inquiryNotesVm.SortByDate);
            }
            else if (data.SortID() == 2) {
                return me.inquiryNotesVm.InquiryNotes.sort(me.inquiryNotesVm.SortByType);
            }
            else if (data.SortID() == 3) {
                return me.inquiryNotesVm.InquiryNotes.sort(me.inquiryNotesVm.SortByUser);
            }
        };
        InquiryNotesController.prototype.createSortObservable = function (sort) {
            var me = this, vmSort = {
                ID: ko.observable(sort.ID),
                SortName: ko.observable(sort.SortName)
            };
            return vmSort;
        };
        InquiryNotesController.prototype.createResponseObservable = function (response) {
            var me = this, vmResponse = {
                Title: ko.observable(response.Template.Title),
                ID: ko.observable(response.Template.ID),
                Text: ko.observable(response.ItemList[0] == undefined ? "" : response.ItemList[0].Text)
            };
            return vmResponse;
        };
        InquiryNotesController.prototype.createContactObservable = function (contact) {
            var me = this, vmContact = {
                ID: ko.observable(contact.ID),
                ContactType: ko.observable(contact.ContactType),
                CompanyName: ko.observable(contact.CompanyName),
                CompanyAddress: ko.observable(contact.CompanyAddress),
                CompanyCity: ko.observable(contact.CompanyCity),
                CompanyState: ko.observable(contact.CompanyState),
                CompanyZip: ko.observable(contact.CompanyZip),
                CompanyPhone: ko.observable(FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.CompanyPhone)),
                CompanyFax: ko.observable(FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.CompanyFax)),
                CompanyEmail: ko.observable(contact.CompanyEmail),
                ContactName: ko.observable(contact.ContactName),
                ContactPhone: ko.observable(FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.ContactPhone)),
                ContactPhoneExtension: ko.observable(contact.ContactPhoneExtension),
                ContactFax: ko.observable(FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.ContactFax)),
                ContactEmail: ko.observable(contact.ContactEmail),
                ContactTitle: ko.observable(contact.ContactTitle),
                GetCityStateZip: function () {
                    return FormatUtil.AddressHelp.formatCityStateZip(this.CompanyCity(), this.CompanyState(), this.CompanyZip());
                },
                GetContactPhoneWithExtension: function () {
                    return this.ContactPhone() +
                        (this.ContactPhoneExtension() != null && this.ContactPhoneExtension().length > 0 ? ' Ext: ' + this.ContactPhoneExtension() : '');
                }
            };
            return vmContact;
        };
        InquiryNotesController.prototype.createInquiryNoteFromEmail = function (email) {
            var me = this, inqID = me.inquiryNotesVm.InquiryID(), vmInquiryNotes, ToAddresses = "", CCAddresses = "";
            _.forEach(email.To, function (ToAddress) {
                ToAddresses += ToAddress.Email + ";";
            });
            _.forEach(email.CC, function (CCAddress) {
                CCAddresses += CCAddress.Email + ";";
            });
            vmInquiryNotes = {
                ID: ko.observable(email.ID),
                //InquiryID: ko.observable<number>(inquiryNotes.InquiryID()),
                NoteTypeID: ko.observable(email.NoteTypeID),
                NoteDateTime: ko.observable(email.DateTimeCreated),
                DateTimeCreated: ko.observable(email.DateTimeCreated),
                InquiryID: ko.observable(email.InquiryID),
                Note: ko.observable(email.Body),
                IsActive: ko.observable(email.IsActive),
                CreatedByName: ko.observable(email.CreatedByName),
                ModifiedByName: ko.observable(""),
                AttachmentList: ko.observableArray(),
                IsStatusHistory: ko.observable(false),
                IsEdit: ko.observable(false),
                EditStatusHistory: ko.observable(false),
                To: ko.observable(ToAddresses),
                CC: ko.observable(CCAddresses),
                IsEmail: ko.observable(true),
                From: ko.observable(""),
                IsResponse: ko.observable(false),
                Subject: ko.observable(email.Subject),
                TimeZoneAbbr: ko.observable(email.TimeZoneAbbr),
                IsVisible: ko.observable(email.IsActive)
            };
            vmInquiryNotes.NoteTypeText = ko.pureComputed(function () {
                return email.NoteTypeDescription + " - " + email.NoteSubTypeDescription;
            });
            // _.forEach(email.Attachments, function (attachment: InquiryData.IInquiryEmailAttachment) {
            //    vmInquiryNotes.AttachmentList.push(me.createDocumentEntityObservableFromEmailAttachment(attachment));
            //});
            _.forEach(email.Attachments, function (attachment) {
                vmInquiryNotes.AttachmentList.push(me.createDocumentEntityObservableFromEmailAttachmentOnLoad(attachment, inqID));
            });
            vmInquiryNotes.Edit = function (obj, parent) {
            };
            vmInquiryNotes.Cancel = function (obj, parent) {
            };
            vmInquiryNotes.Save = function (obj, parent) {
            };
            vmInquiryNotes.Delete = function (note) {
            };
            vmInquiryNotes.openUploadModal = function (note, index) {
            };
            vmInquiryNotes.RemoveAttachment = function (parent, param1) {
                var attachment = ko.utils.arrayFirst(parent.AttachmentList(), function (document) {
                    return document.UniqueID() === param1.UniqueID();
                });
                parent.AttachmentList.remove(attachment);
                var att = {
                    ID: param1.ID(),
                    FileName: param1.FileName(),
                    FilePrefix: "",
                    UniqueID: param1.UniqueID(),
                    LastModified: "",
                    NoteID: attachment.ID(),
                    InquiryID: attachment.ID(),
                    URL: "",
                    isEmail: true,
                    isEmailResponse: false,
                    isDocument: false
                };
                me.RemoveSingleAttachment(att);
            };
            //download single attachment
            vmInquiryNotes.DownloadAttachment = function (parent, param1) {
                var attachment = ko.utils.arrayFirst(parent.AttachmentList(), function (document) {
                    return document.UniqueID() === param1.UniqueID();
                });
                // 
                //alert("Download here!")
                var doc = {
                    ID: param1.ID(),
                    FileName: param1.FileName(),
                    FilePrefix: "",
                    UniqueID: param1.UniqueID(),
                    LastModified: "",
                    NoteID: parent.ID(),
                    InquiryID: parent.InquiryID(),
                    URL: "",
                    isEmail: true,
                    isEmailResponse: false,
                    isDocument: false
                };
                me.DownloadSingleAttachment(doc);
            };
            return vmInquiryNotes;
        };
        InquiryNotesController.prototype.createInquiryNoteFromEmailResponse = function (email) {
            var me = this, inqID = me.inquiryNotesVm.InquiryID(), ToAddresses = "", CCAddresses = "", vmInquiryNotes;
            _.forEach(email.To, function (ToAddress) {
                ToAddresses += ToAddress.Email + ";";
            });
            _.forEach(email.CC, function (CCAddress) {
                CCAddresses += CCAddress.Email + ";";
            });
            vmInquiryNotes = {
                ID: ko.observable(email.ID),
                //InquiryID: ko.observable<number>(inquiryNotes.InquiryID()),
                InquiryID: ko.observable(email.InquiryID),
                NoteTypeID: ko.observable(email.NoteTypeID),
                NoteDateTime: ko.observable(email.DateTimeCreated),
                DateTimeCreated: ko.observable(email.DateTimeCreated),
                Note: ko.observable(email.Body),
                IsActive: ko.observable(email.IsActive),
                CreatedByName: ko.observable(email.From),
                ModifiedByName: ko.observable(""),
                AttachmentList: ko.observableArray(),
                IsStatusHistory: ko.observable(false),
                IsEdit: ko.observable(false),
                EditStatusHistory: ko.observable(false),
                To: ko.observable(ToAddresses),
                CC: ko.observable(CCAddresses),
                IsEmail: ko.observable(true),
                From: ko.observable(email.From),
                IsResponse: ko.observable(true),
                Subject: ko.observable(email.Subject),
                TimeZoneAbbr: ko.observable(email.TimeZoneAbbr),
                IsVisible: ko.observable(email.IsActive)
            };
            // 
            vmInquiryNotes.NoteTypeText = ko.pureComputed(function () {
                return email.NoteTypeDescription + " - " + email.NoteSubTypeDescription;
            });
            //_.forEach(email.Attachments, function (attachment: InquiryData.IInquiryEmailAttachment) {
            //    vmInquiryNotes.AttachmentList.push(me.createDocumentEntityObservableFromEmailAttachment(attachment));
            //});
            _.forEach(email.Attachments, function (attachment) {
                vmInquiryNotes.AttachmentList.push(me.createDocumentEntityObservableFromEmailAttachmentOnLoad(attachment, inqID));
            });
            vmInquiryNotes.Edit = function (obj, parent) {
            };
            vmInquiryNotes.Cancel = function (obj, parent) {
            };
            vmInquiryNotes.Save = function (obj, parent) {
            };
            vmInquiryNotes.Delete = function (note) {
            };
            vmInquiryNotes.openUploadModal = function (note, index) {
            };
            vmInquiryNotes.RemoveAttachment = function (parent, param1) {
                var attachment = ko.utils.arrayFirst(parent.AttachmentList(), function (document) {
                    return document.UniqueID() === param1.UniqueID();
                });
                parent.AttachmentList.remove(attachment);
                var att = {
                    ID: param1.ID(),
                    FileName: param1.FileName(),
                    FilePrefix: "",
                    UniqueID: param1.UniqueID(),
                    LastModified: "",
                    NoteID: attachment.ID(),
                    InquiryID: attachment.ID(),
                    URL: "",
                    isEmail: false,
                    isEmailResponse: true,
                    isDocument: false
                };
                me.RemoveSingleAttachment(att);
            };
            //download single attachment
            vmInquiryNotes.DownloadAttachment = function (parent, param1) {
                var attachment = ko.utils.arrayFirst(parent.AttachmentList(), function (document) {
                    return document.UniqueID() === param1.UniqueID();
                });
                //
                //alert("Download here!")
                var doc = {
                    ID: param1.ID(),
                    FileName: param1.FileName(),
                    FilePrefix: "",
                    UniqueID: param1.UniqueID(),
                    LastModified: "",
                    NoteID: parent.ID(),
                    InquiryID: parent.InquiryID(),
                    URL: "",
                    isEmail: false,
                    isEmailResponse: true,
                    isDocument: false
                };
                me.DownloadSingleAttachment(doc);
            };
            return vmInquiryNotes;
        };
        InquiryNotesController.prototype.createInquiryNotesObservable = function (inquiryNotes) {
            var me = this, inqID = me.inquiryNotesVm.InquiryID(inquiryNotes.InquiryID()), vmInquiryNotes = {
                ID: ko.observable(inquiryNotes.ID()),
                InquiryID: ko.observable(inquiryNotes.InquiryID()),
                NoteTypeID: ko.observable(inquiryNotes.NoteTypeID()),
                NoteDateTime: ko.observable(moment(inquiryNotes.NoteDateTime()).format("MM/DD/YYYY HH:mm A")),
                DateTimeCreated: ko.observable(inquiryNotes.DateTimeCreated()),
                Note: ko.observable(inquiryNotes.Note()),
                IsActive: ko.observable(inquiryNotes.IsActive()),
                CreatedByName: ko.observable(inquiryNotes.CreatedByName()),
                ModifiedByName: ko.observable(inquiryNotes.ModifiedByName()),
                AttachmentList: ko.observableArray(),
                IsStatusHistory: ko.observable(inquiryNotes.IsStatusHistory()),
                IsEdit: ko.observable(false),
                EditStatusHistory: ko.observable(inquiryNotes.EditStatusHistory()),
                To: ko.observable(""),
                CC: ko.observable(""),
                IsEmail: ko.observable(false),
                From: ko.observable(""),
                IsResponse: ko.observable(false),
                Subject: ko.observable(""),
                TimeZoneAbbr: ko.observable(inquiryNotes.TimeZoneAbbr),
                IsVisible: ko.observable(inquiryNotes.IsActive())
            };
            me.inquiryNotesVm.InquiryID(inquiryNotes.InquiryID());
            me.inquiryNotesVm.StatusID(inquiryNotes.StatusID());
            me.inquiryNotesVm.newNoteText("");
            me.inquiryNotesVm.newNoteType(0);
            //_.forEach(inquiryNotes.AttachmentList(), function (attachment: InquiryData.IDocumentEntity) {
            //    vmInquiryNotes.AttachmentList.push(me.createDocumentEntityObservable(attachment));
            //});
            _.forEach(inquiryNotes.AttachmentList(), function (attachment) {
                vmInquiryNotes.AttachmentList.push(me.createDocumentEntityObservableOnLoad(attachment, inqID));
            });
            var noteText = ko.utils.arrayFirst(me.inquiryNotesVm.NoteTypes(), function (noteType) {
                return noteType.ID() === vmInquiryNotes.NoteTypeID();
            });
            var statusText = ko.utils.arrayFirst(me.inquiryNotesVm.Statuses(), function (status) {
                return status.ID() === vmInquiryNotes.NoteTypeID();
            });
            //Text is status name for status history or if note note type name
            vmInquiryNotes.NoteTypeText = ko.pureComputed(function () {
                if (vmInquiryNotes.IsStatusHistory()) {
                    return statusText.Name();
                }
                else {
                    //
                    if (!Util.isNullOrEmpty(noteText))
                        return noteText.Description();
                    return "";
                }
            }, vmInquiryNotes);
            vmInquiryNotes.Edit = function (obj, parent) {
                var i;
                //alert("Click Edit Note");
                //Is another note open
                for (i = 0; i < parent.InquiryNotes().length; i++) {
                    if (parent.InquiryNotes()[i].ID() != obj.ID() && parent.InquiryNotes()[i].IsEdit()) {
                        //If so have changes been made to it
                        if (me.hasExistingNoteChanged(parent.InquiryNotes()[i].ID(), JSON.parse(me.fieldsOnLoad), me.getNoteItemsByNoteID(parent.InquiryNotes()[i].ID()))) {
                            //alert('change made');
                            UI.showConfirmDialog("There are unsaved changes on this page. Are you sure you want to close this page and lose these unsaved changes?", function () { me.onConfirmed(obj, parent.InquiryNotes()[i], JSON.parse(me.fieldsOnLoad), false); }, function () { });
                            return;
                        }
                        else
                            parent.InquiryNotes()[i].IsEdit(false);
                    }
                }
                //first edit
                obj.IsEdit(!obj.IsEdit());
            };
            vmInquiryNotes.Cancel = function (obj, parent) {
                //cancel button   
                if (me.hasExistingNoteChanged(obj.ID(), JSON.parse(me.fieldsOnLoad), me.getNoteItemsByNoteID(obj.ID()))) {
                    UI.showConfirmDialog("There are unsaved changes on this page. Are you sure you want to close this page and lose these unsaved changes?", function () { me.onConfirmed(obj, obj, JSON.parse(me.fieldsOnLoad), true); }, function () { });
                    return;
                }
                obj.IsEdit(!obj.IsEdit());
            };
            vmInquiryNotes.Close = function (obj, parent) {
                //cancel button   
                if (me.hasExistingNoteChanged(obj.ID(), JSON.parse(me.fieldsOnLoad), me.getNoteItemsByNoteID(obj.ID()))) {
                    UI.showConfirmDialog("There are unsaved changes on this page. Are you sure you want to close this page and lose these unsaved changes?", obj.IsEdit(false), //function () { me.onConfirmed(obj, obj, JSON.parse(me.fieldsOnLoad), true); },
                    function () { });
                    return;
                }
            };
            //vmInquiryNotes.Save = function (obj, parent) {
            //    //save button   
            //    console.log('saving...')
            //};
            vmInquiryNotes.Save = function (note) {
                //
                var notes = me.getNoteItemsByNoteID(note.ID());
                //alert("the only Save on the page");
                me.SaveNote(notes, note.InquiryID(), note.ID(), note);
            };
            vmInquiryNotes.Delete = function (note) {
                UI.showConfirmDialog('Are you sure you want to delete "' + note.NoteTypeText() + '"?', function () { me.DeleteNote(note); }, function () { });
            };
            //Remove single attachment
            vmInquiryNotes.RemoveAttachment = function (parent, param1) {
                var attachment = ko.utils.arrayFirst(parent.AttachmentList(), function (document) {
                    return document.UniqueID() === param1.UniqueID();
                });
                parent.AttachmentList.remove(attachment);
                var att = {
                    ID: param1.ID(),
                    FileName: param1.FileName(),
                    FilePrefix: param1.FilePrefix(),
                    UniqueID: param1.UniqueID(),
                    LastModified: param1.LastModified(),
                    NoteID: attachment.ID(),
                    InquiryID: attachment.ID(),
                    URL: "",
                    isEmail: false,
                    isEmailResponse: false,
                    isDocument: true
                };
                me.RemoveSingleAttachment(att);
            };
            //download single attachment
            vmInquiryNotes.DownloadAttachment = function (parent, param1) {
                var attachment = ko.utils.arrayFirst(parent.AttachmentList(), function (document) {
                    return document.UniqueID() === param1.UniqueID();
                });
                // 
                //alert("Download here!")
                var doc = {
                    ID: param1.ID(),
                    FileName: param1.FileName(),
                    FilePrefix: param1.FilePrefix(),
                    UniqueID: param1.UniqueID(),
                    LastModified: param1.LastModified(),
                    NoteID: parent.ID(),
                    InquiryID: parent.InquiryID(),
                    URL: "",
                    isEmail: false,
                    isEmailResponse: false,
                    isDocument: true
                };
                me.DownloadSingleAttachment(doc);
            };
            vmInquiryNotes.openUploadModal = function (note, index) {
                me.inquiryNotesVm.NoteID(note.ID());
                me.inquiryNotesVm.uploadedIndex(index());
                me.container.find("div[data-id='uploadDialog']").modal("show");
            };
            vmInquiryNotes.DownloadDocument = function (e) {
                var me = this, app = Global.App(), extension = "", fileName = "", fileParts, fileID = "", url = ConfigOptions.baseURL, urldoc = ConfigOptionsDoc.baseURL, urldocv = ConfigOptionsDoc.documentViewerURL;
                if (e.files.length > 0) {
                    fileParts = e.files[0].name.split(".");
                    if (fileParts.length > 1) {
                        fileName = fileParts[fileParts.length - 2];
                        extension = fileParts[fileParts.length - 1];
                        fileID = e.files[0].uid;
                    }
                }
                // 
                var documentUrl = url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.NoteID() + "/" + encodeURIComponent(me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + fileID);
                window.location.assign(documentUrl);
                if (ConfigOptionsDoc.launchDocumentViewer === true) {
                    var documentUrl = ConfigOptionsDoc.documentViewerURL + "/?DocumentId=" +
                        encodeURIComponent(url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.NoteID() + "/" + fileName + "/" + extension + "/" + me.inquiryVm.UniqueID());
                    vmInquiryNotes.URL(documentUrl);
                }
                else {
                    var documentUrl = url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.NoteID() + "/" + fileName + "/" + extension + "/" + me.inquiryVm.UniqueID();
                    vmInquiryNotes.URL(documentUrl);
                }
            };
            this.fieldsOnLoad = ko.toJSON(this.getEditableNoteItems());
            return vmInquiryNotes;
        };
        InquiryNotesController.prototype.DeleteNote = function (note) {
            var me = this, deferred = $.Deferred();
            //api call to make note inactive
            InquiryData.DeleteNote(note.ID())
                .done(function (response) {
                if (response.Success) {
                    //remove note from viewmodel
                    me.inquiryNotesVm.InquiryNotes.remove(note);
                    UI.showNotificationMessage(UI.PHRASE_RECORDSAVED, UI.messageTypeValues.success);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .always(function () {
                deferred.resolve();
            });
        };
        InquiryNotesController.prototype.SaveNote = function (note, inquiryID, noteID, note1) {
            var me = this, deferred = $.Deferred();
            InquiryData.UpdateNote(inquiryID, noteID, ko.toJS(note), null)
                .done(function (response) {
                if (response.Success) {
                    note1.IsEdit(false);
                    UI.showNotificationMessage(UI.PHRASE_RECORDSAVED, UI.messageTypeValues.success);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .always(function () {
                deferred.resolve();
            });
        };
        //start remove
        InquiryNotesController.prototype.RemoveSingleAttachment = function (attachment) {
            var me = this, deferred = $.Deferred();
            InquiryData.RemoveSingleAttachment(attachment)
                .done(function (response) {
                if (response.Success) {
                    //note1.IsEdit(false);
                    UI.showNotificationMessage(UI.PHRASE_ATTACHMENTREMOVED, UI.messageTypeValues.success);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .always(function () {
                deferred.resolve();
            });
        };
        //end remove
        //start download
        InquiryNotesController.prototype.DownloadSingleAttachment = function (attachment) {
            var me = this, deferred = $.Deferred();
            InquiryData.DownloadSingleDocument(attachment);
        };
        //end download
        InquiryNotesController.prototype.Close = function (note, inquiryID, noteID, note1) {
            var me = this, deferred = $.Deferred();
            note1.IsEdit(false);
        };
        InquiryNotesController.prototype.onConfirmed = function (clickedOnNote, firstNote, originalNote, isCancel) {
            var me = this;
            if (isCancel) {
                clickedOnNote.IsEdit(false);
            }
            else {
                clickedOnNote.IsEdit(true);
                firstNote.IsEdit(false);
            }
            //roll back changes on existingNote
            var rollback;
            var rollbackNote;
            _.forEach(originalNote, function (note) {
                if (note.ID == firstNote.ID()) {
                    rollback = {
                        ID: note.ID,
                        Note: note.Note,
                        NoteDateTime: note.NoteDateTime,
                        AttachmentList: note.AttachmentList
                    };
                }
            });
            //populate current viewmodel with rollback data
            for (var i = 0; i < me.inquiryNotesVm.InquiryNotes().length; i++) {
                if (me.inquiryNotesVm.InquiryNotes()[i].ID() == firstNote.ID()) {
                    me.inquiryNotesVm.InquiryNotes()[i].Note(rollback.Note);
                    me.inquiryNotesVm.InquiryNotes()[i].NoteDateTime(rollback.NoteDateTime);
                    me.inquiryNotesVm.InquiryNotes()[i].AttachmentList.removeAll();
                    _.forEach(rollback.AttachmentList, function (attachment) {
                        me.inquiryNotesVm.InquiryNotes()[i].AttachmentList.push(me.DocumentEntity(attachment));
                    });
                }
            }
        };
        InquiryNotesController.prototype.createStatusObservable = function (statuses) {
            var me = this, vmStatus = {
                ID: ko.observable(statuses.ID()),
                Name: ko.observable(statuses.Name()),
                ShowAfterInvoice: ko.observable(statuses.ShowAfterInvoice()),
                EditForm: ko.observable(statuses.EditForm()),
                EditStatusHistory: ko.observable(statuses.EditStatusHistory())
            };
            return vmStatus;
        };
        InquiryNotesController.prototype.createNoteTypeObservable = function (noteType) {
            var me = this, vmNoteType = {
                ID: ko.observable(noteType.ID()),
                Description: ko.observable(noteType.Description())
            };
            return vmNoteType;
        };
        InquiryNotesController.prototype.createDocumentEntityObservableFromEmailAttachment = function (attachment) {
            var me = this, app = Global.App(), fileName = "", extension = "", url = ConfigOptions.baseURL, deferred = $.Deferred();
            var vmdocument = {
                ID: ko.observable(attachment.ID),
                FileName: ko.observable(attachment.FileName),
                // FilePrefix: ko.observable<string>(attachment.FilePrefix()),
                UniqueID: ko.observable(attachment.UniqueID),
                URL: ko.observable(""),
            };
            var extension = "";
            var fileParts = vmdocument.FileName().split(".");
            if (fileParts.length > 1) {
                fileName = fileParts[0];
                extension = fileParts[fileParts.length - 1];
            }
            vmdocument.URL(url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + vmdocument.UniqueID());
            vmdocument.Icon = ko.pureComputed(function () {
                var fileParts = vmdocument.FileName().split(".");
                if (fileParts.length > 1) {
                    var extension = fileParts[fileParts.length - 1];
                    if (extension == 'txt') {
                        return "../../../../Content/images/text-icon.png";
                    }
                    else if (extension == 'doc' || extension == 'docx') {
                        return "../../../../Content/images/word-icon.png";
                    }
                    else if (extension == 'xls' || extension == 'xlsx') {
                        return "../../../../Content/images/excel-icon.png";
                    }
                    else if (extension == 'ppt' || extension == 'pptx') {
                        return "../../../../Content/images/powerpoint-icon.png";
                    }
                    else if (extension == 'jpg' || extension == 'jpeg' || extension == 'png' || extension == 'gif') {
                        return "../../../../Content/images/image-icon.png";
                    }
                    else if (extension == 'pdf') {
                        return "../../../../Content/images/pdf-icon.png";
                    }
                    else if (extension == 'vsd' || extension == 'vsdx') {
                        return "../../../../Content/images/visio-icon.png";
                    }
                    else {
                        return "../../../../Content/images/text-icon.png";
                    }
                }
                else {
                    return "../../../../Content/images/text-icon.png";
                }
            }, vmdocument);
            return vmdocument;
        };
        InquiryNotesController.prototype.createDocumentEntityObservableFromEmailAttachmentOnLoad = function (attachment, inquiryid) {
            var me = this, app = Global.App(), fileName = "", extension = "", 
            // url = ConfigOptions.baseURL,
            url = ConfigOptions.baseURL, urldoc = ConfigOptionsDoc.baseURL, urldocv = ConfigOptionsDoc.documentViewerURL, deferred = $.Deferred();
            var vmdocument = {
                ID: ko.observable(attachment.ID),
                FileName: ko.observable(attachment.FileName),
                // FilePrefix: ko.observable<string>(attachment.FilePrefix()),
                UniqueID: ko.observable(attachment.UniqueID),
                URL: ko.observable(""),
            };
            var extension = "";
            var fileParts = vmdocument.FileName().split(".");
            if (fileParts.length > 1) {
                fileName = fileParts[0];
                extension = fileParts[fileParts.length - 1];
            }
            //vmdocument.URL(url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + vmdocument.UniqueID());
            vmdocument.URL(ConfigOptionsDoc.documentViewerURL + "/?DocumentId=" +
                encodeURIComponent(url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + vmdocument.UniqueID()));
            return vmdocument;
        };
        InquiryNotesController.prototype.createDocumentEntityObservableOnLoad = function (attachment, inquiryid) {
            var me = this, app = Global.App(), fileName = "", extension = "", url = ConfigOptions.baseURL, urldoc = ConfigOptionsDoc.baseURL, urldocv = ConfigOptionsDoc.documentViewerURL;
            //deferred = $.Deferred();
            //
            var vmdocument = {
                ID: ko.observable(attachment.ID()),
                FileName: ko.observable(attachment.FileName()),
                FilePrefix: ko.observable(attachment.FilePrefix()),
                UniqueID: ko.observable(attachment.UniqueID()),
                URL: ko.observable(""),
                LastModified: ko.observable(attachment.LastModified())
            };
            var fileParts = vmdocument.FileName().split(".");
            if (fileParts.length > 1) {
                fileName = fileParts[fileParts.length - 2];
                extension = fileParts[fileParts.length - 1];
            }
            vmdocument.URL(ConfigOptionsDoc.documentViewerURL + "/?DocumentId=" +
                encodeURIComponent(url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + vmdocument.UniqueID()));
            //
            return vmdocument;
        };
        //MK URL work end 1252
        InquiryNotesController.prototype.createDocumentEntityObservable = function (attachment) {
            var me = this, app = Global.App(), fileName = "", extension = "", url = ConfigOptions.baseURL, deferred = $.Deferred();
            var vmdocument = {
                ID: ko.observable(attachment.ID()),
                FileName: ko.observable(attachment.FileName()),
                FilePrefix: ko.observable(attachment.FilePrefix()),
                UniqueID: ko.observable(attachment.UniqueID()),
                URL: ko.observable(""),
                LastModified: ko.observable(attachment.LastModified())
            };
            var fileParts = vmdocument.FileName().split(".");
            if (fileParts.length > 1) {
                fileName = fileParts[fileParts.length - 2];
                extension = fileParts[fileParts.length - 1];
            }
            vmdocument.URL(url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + vmdocument.UniqueID());
            vmdocument.downloadFile = function (file) {
                //var documentEntity = {
                //    ID: file.ID,
                //    FileName: file.FileName,
                //    FilePrefix: file.FilePrefix,
                //    LastModified: file.LastModified,
                //    UniqueID: file.UniqueID
                //};
                //InquiryData.DownloadDocument(ko.toJS(documentEntity), me.inquiryNotesVm.InquiryID())
                //    .done(function (response: Data.Response<any>) {
                //        if (response.Success) {
                //            console.log('success');
                //        } else {
                //            UI.showErrorMessage(response.Messages, response.ErrorMessages);
                //        }
                //    })
                //    .always(function () {
                //        deferred.resolve();
                //    });
                //console.log('downloading...');
            };
            vmdocument.Icon = ko.pureComputed(function () {
                var fileParts = vmdocument.FileName().split(".");
                if (fileParts.length > 1) {
                    var extension = fileParts[fileParts.length - 1];
                    if (extension == 'txt') {
                        return "../../../../Content/images/text-icon.png";
                    }
                    else if (extension == 'doc' || extension == 'docx') {
                        return "../../../../Content/images/word-icon.png";
                    }
                    else if (extension == 'xls' || extension == 'xlsx') {
                        return "../../../../Content/images/excel-icon.png";
                    }
                    else if (extension == 'ppt' || extension == 'pptx') {
                        return "../../../../Content/images/powerpoint-icon.png";
                    }
                    else if (extension == 'jpg' || extension == 'jpeg' || extension == 'png' || extension == 'gif') {
                        return "../../../../Content/images/image-icon.png";
                    }
                    else if (extension == 'pdf') {
                        return "../../../../Content/images/pdf-icon.png";
                    }
                    else if (extension == 'vsd' || extension == 'vsdx') {
                        return "../../../../Content/images/visio-icon.png";
                    }
                    else {
                        return "../../../../Content/images/text-icon.png";
                    }
                }
                else {
                    return "../../../../Content/images/text-icon.png";
                }
            }, vmdocument);
            return vmdocument;
        };
        InquiryNotesController.prototype.DocumentEntity = function (attachment) {
            var me = this, app = Global.App(), fileName = "", extension = "", url = ConfigOptions.baseURL, urldoc = ConfigOptionsDoc.baseURL, urldocv = ConfigOptionsDoc.documentViewerURL, deferred = $.Deferred();
            var vmdocument = {
                ID: ko.observable(attachment.ID),
                FileName: ko.observable(attachment.FileName),
                FilePrefix: ko.observable(attachment.FilePrefix),
                URL: ko.observable(""),
                UniqueID: ko.observable(attachment.UniqueID),
                LastModified: ko.observable(attachment.LastModified)
            };
            var fileParts = vmdocument.FileName().split(".");
            if (fileParts.length > 1) {
                fileName = fileParts[fileParts.length - 2];
                extension = fileParts[fileParts.length - 1];
            }
            ////vmdocument.URL(ConfigOptionsDoc.documentViewerURL + "/?DocumentId=" + //MSK 1252
            ////    encodeURIComponent(urldoc + "/api/Document/DownloadDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + vmdocument.UniqueID()));
            vmdocument.URL(ConfigOptionsDoc.documentViewerURL + "/?DocumentId=" +
                encodeURIComponent(url + "/api/Inquiry/DownloadDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + vmdocument.UniqueID()));
            vmdocument.Icon = ko.pureComputed(function () {
                var fileParts = vmdocument.FileName().split(".");
                if (fileParts.length > 1) {
                    var extension = fileParts[fileParts.length - 1];
                    if (extension == 'txt') {
                        return "../../../../Content/images/text-icon.png";
                    }
                    else if (extension == 'doc' || extension == 'docx') {
                        return "../../../../Content/images/word-icon.png";
                    }
                    else if (extension == 'xls' || extension == 'xlsx') {
                        return "../../../../Content/images/excel-icon.png";
                    }
                    else if (extension == 'ppt' || extension == 'pptx') {
                        return "../../../../Content/images/powerpoint-icon.png";
                    }
                    else if (extension == 'jpg' || extension == 'jpeg' || extension == 'png' || extension == 'gif') {
                        return "../../../../Content/images/image-icon.png";
                    }
                    else if (extension == 'pdf') {
                        return "../../../../Content/images/pdf-icon.png";
                    }
                    else if (extension == 'vsd' || extension == 'vsdx') {
                        return "../../../../Content/images/visio-icon.png";
                    }
                    else {
                        return "../../../../Content/images/text-icon.png";
                    }
                }
                else {
                    return "../../../../Content/images/text-icon.png";
                }
            }, vmdocument);
            return vmdocument;
        };
        InquiryNotesController.prototype.onSelect = function (e) {
            if (e.files.length > 1) {
                alert("Please select one file at a time.");
                e.preventDefault();
            }
        };
        InquiryNotesController.prototype.onUpload = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", fileParts, fileID = "";
            //alert("onUpload");
            if (e.files.length > 0) {
                fileParts = e.files[0].name.split(".");
                if (fileParts.length > 1) {
                    fileName = fileParts[fileParts.length - 2];
                    extension = fileParts[fileParts.length - 1];
                    fileID = e.files[0].uid;
                }
            }
            var xhr = e.XMLHttpRequest;
            if (xhr) {
                xhr.addEventListener("readystatechange", function (e) {
                    if (xhr.readyState == 1 /* OPENED */) {
                        xhr.setRequestHeader("RequestVerificationToken", getCSRFToken());
                        xhr.setRequestHeader("Authorization", 'token ' + Util.getCookie("token"));
                        xhr.setRequestHeader("DSC", Util.getDSC());
                        $("[data-id='uploadSaveButton']").prop('disabled', true);
                        $("[data-id='cancelUpload']").prop('disabled', true);
                    }
                    if (xhr.readyState == 4) {
                        //
                        $("[data-id='uploadSaveButton']").prop('disabled', false);
                        $("[data-id='cancelUpload']").prop('disabled', false);
                    }
                });
            }
            me.inquiryNotesVm.FileName(fileName + '.' + extension);
            me.inquiryNotesVm.uploadedGuid(fileID);
            // e.sender.options.async.saveUrl = url + "/api/Inquiry/UploadDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + fileID;
            e.sender.options.async.saveUrl = url + "/api/Inquiry/UploadAttachedDocument/" + me.inquiryNotesVm.InquiryID() + "/" + fileName + "/" + extension + "/" + fileID;
        };
        InquiryNotesController.prototype.onComplete = function (e) {
            //alert("onComplete");
            var me = this;
            me.inquiryNotesVm.AttachmentList.push(me.DocumentEntity({ ID: 0, URL: me.inquiryNotesVm.URL(), FileName: me.inquiryNotesVm.FileName(), NoteID: me.inquiryNotesVm.NoteID, FilePrefix: 'cgicats-csc-dev/attachment/Customer Support Center/cscInquiryNote', UniqueID: me.inquiryNotesVm.uploadedGuid(), LastModified: Date() }));
            me.inquiryNotesVm.InquiryNotes()[me.inquiryNotesVm.uploadedIndex()].AttachmentList.push(me.DocumentEntity({ ID: 0, URL: me.inquiryNotesVm.URL(), FileName: me.inquiryNotesVm.FileName(), FilePrefix: 'cgicats-csc-dev/attachment/Customer Support Center/cscInquiryNote', UniqueID: me.inquiryNotesVm.uploadedGuid(), LastModified: Date(), NoteID: me.inquiryNotesVm.NoteID() }));
            var me = this, global = Global.App();
            Util.stopHeartBeat();
            global.sessionTimeoutDisabled = false;
        };
        InquiryNotesController.prototype.onCompleteEdit = function (e) {
            var me = this;
            me.inquiryNotesVm.InquiryNotes()[me.inquiryNotesVm.uploadedIndex()].AttachmentList.push(me.DocumentEntity({ ID: 0, FileName: me.inquiryNotesVm.FileName(), FilePrefix: 'cgicats-csc-dev/attachment/Customer Support Center/cscInquiryNote/', UniqueID: me.inquiryNotesVm.uploadedGuid(), LastModified: Date() }));
        };
        InquiryNotesController.prototype.onRemoveEdit = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", deferred = $.Deferred(), fileParts, fileID = "";
            alert("onRemoveEdit");
            if (e.files.length > 0) {
                fileParts = e.files[0].name.split(".");
                if (fileParts.length > 1) {
                    fileName = fileParts[fileParts.length - 2];
                    extension = fileParts[fileParts.length - 1];
                    fileID = e.files[0].uid;
                }
            }
            var attachment = ko.utils.arrayFirst(me.inquiryNotesVm.InquiryNotes()[me.inquiryNotesVm.uploadedIndex()].AttachmentList(), function (document) {
                return document.UniqueID() === e.files[0].uid;
            });
            me.inquiryNotesVm.InquiryNotes()[me.inquiryNotesVm.uploadedIndex()].AttachmentList.remove(attachment);
            $(".k-upload-files.k-reset").find("li[data-uid='" + e.files[0].uid + "']").remove();
            var documentEntity = {
                ID: 0,
                FileName: fileName + '.' + extension,
                FilePrefix: 'cgicats-csc-dev/attachment/Customer Support Center/cscInquiryNote/' + me.inquiryNotesVm.InquiryID() + '/',
                LastModified: new Date(),
                UniqueID: fileID
            };
            InquiryData.DeleteDocument(ko.toJS(documentEntity), me.inquiryNotesVm.InquiryID())
                .done(function (response) {
                if (response.Success) {
                    console.log('deleted...');
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .always(function () {
                deferred.resolve();
            });
        };
        InquiryNotesController.prototype.onRemove = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", deferred = $.Deferred(), fileParts, fileID = "";
            alert("onREmove");
            if (e.files.length > 0) {
                fileParts = e.files[0].name.split(".");
                if (fileParts.length > 1) {
                    fileName = fileParts[fileParts.length - 2];
                    extension = fileParts[fileParts.length - 1];
                    fileID = e.files[0].uid;
                }
            }
            var attachment = ko.utils.arrayFirst(me.inquiryNotesVm.AttachmentList(), function (document) {
                return document.UniqueID() === e.files[0].uid;
            });
            me.inquiryNotesVm.AttachmentList.remove(attachment);
            $(".k-upload-files.k-reset").find("li[data-uid='" + e.files[0].uid + "']").remove();
            var documentEntity = {
                ID: 0,
                FileName: fileName + '.' + extension,
                FilePrefix: 'cgicats-csc-dev/attachment/Customer Support Center/cscInquiryNote/' + me.inquiryNotesVm.InquiryID() + '/',
                LastModified: new Date(),
                UniqueID: fileID
            };
            InquiryData.DeleteDocument(ko.toJS(documentEntity), me.inquiryNotesVm.InquiryID())
                .done(function (response) {
                if (response.Success) {
                    console.log('deleted...');
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .always(function () {
                deferred.resolve();
            });
        };
        //Returns the values entered by the user
        InquiryNotesController.prototype.getNewNoteItems = function () {
            var me = this;
            var saveNoteItems = {
                newNoteText: me.inquiryNotesVm.newNoteText(),
                newNoteType: me.inquiryNotesVm.newNoteType(),
                NewNoteDateTime: me.inquiryNotesVm.newNoteDate(),
                //NewStatueDateTime: me.inquiryNotesVm.newStatusDate(),
                //StatusID: me.inquiryNotesVm.StatusID(),
                AttachmentList: me.inquiryNotesVm.AttachmentList(),
                errors: me.inquiryNotesVm.errors
            };
            return saveNoteItems;
        };
        InquiryNotesController.prototype.getEditableNoteItems = function () {
            var me = this;
            var me = this, editNotes = [];
            _.forEach(me.inquiryNotesVm.InquiryNotes(), function (note) {
                var editnote = {
                    ID: note.ID(),
                    Note: note.Note(),
                    NoteTypeID: note.NoteTypeID(),
                    NoteDateTime: note.NoteDateTime(),
                    AttachmentList: note.AttachmentList()
                };
                editNotes.push(editnote);
            });
            return editNotes;
        };
        InquiryNotesController.prototype.getNoteItemsByNoteID = function (noteID) {
            var me = this;
            var me = this, editNote;
            _.forEach(me.inquiryNotesVm.InquiryNotes(), function (note) {
                if (note.ID() == noteID) {
                    editNote = {
                        ID: note.ID,
                        Note: note.Note,
                        NoteTypeID: note.NoteTypeID,
                        NoteDateTime: note.NoteDateTime,
                        AttachmentList: note.AttachmentList
                    };
                }
            });
            return ko.toJS(editNote);
        };
        return InquiryNotesController;
    }());
    InquiryNotes.InquiryNotesController = InquiryNotesController;
    var EmailFormDialog = (function () {
        // Constructor
        function EmailFormDialog() {
            var me = this;
            me.emailVm = {
                toEmails: ko.observableArray([]),
                ccEmails: ko.observableArray([]),
                message: ko.observable(""),
                subject: ko.observable(""),
                noteType: ko.observable(0),
                noteSubType: ko.observable(0),
                responseClient: ko.observable(0),
                noteSubTypeList: ko.observableArray([]),
                noteSubTypeSelectedList: ko.observableArray([]),
                noteTypeList: ko.observableArray([]),
                responseClientList: ko.observableArray([]),
                selectedEmailIds: ko.observableArray([]),
                selectedEmails: ko.observableArray([]),
                selectedCcEmailIds: ko.observableArray([]),
                selectedCcEmails: ko.observableArray([]),
                inquiryToEmail: ko.observable("inquiry_to_email"),
                inquiryCcEmail: ko.observable("inquiry_cc_email"),
                uniqueDialogID: ko.observable(""),
                send: function () {
                    me.send();
                },
                cancel: function () {
                    me.clearForm(me.emailVm);
                    me.closeEmailDialog();
                },
                // validation properties 
                messageMissed: ko.observable(false),
                subjectMissed: ko.observable(false),
                toMissed: ko.observable(false),
                noteTypeMissed: ko.observable(false),
                noteSubTypeMissed: ko.observable(false),
                //Attachments
                emailAttachments: ko.observableArray([])
            };
            me.emailVm.noteType.subscribe(function () {
                me.emailVm.noteSubTypeSelectedList([]);
                var subNoteTypeSelectList = [];
                _.forEach(me.emailVm.noteSubTypeList(), function (x) {
                    if (me.emailVm.noteType() == x.InquiryNoteTypeID)
                        subNoteTypeSelectList.push(x);
                });
                me.emailVm.noteSubTypeSelectedList(subNoteTypeSelectList);
                me.selectFirstItem(subNoteTypeSelectList);
            }, me);
        }
        EmailFormDialog.prototype.closeEmailDialog = function () {
            $("div[data-id='EmailDialog']").modal("hide");
        };
        EmailFormDialog.prototype.send = function () {
            var self = this;
            if (self.validation()) {
                var SendEmailVm = self.createEmailParameterForSend(), waitContainer = UI.showWaitIndicator($("div[data-id=emailDialog_body]"));
                $(".loading-area").css("top", "30px");
                InquiryData.sendEmail(SendEmailVm).done(function (response) {
                    if (response.Success) {
                        self.closeEmailDialog();
                    }
                    else {
                        UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    }
                }).always(function () {
                    UI.hideWaitIndicator($("div[data-id=emailDialog_body]"), waitContainer);
                });
            }
        };
        EmailFormDialog.prototype.createEmailParameterForSend = function () {
            var self = this;
            var InquiryEmailAttachmentEntity = {};
            var SendEmailVm = {
                ClientId: InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().ClientID(),
                InquiryEmailEntity: self.getInquiryEmailEntity(),
                InquiryEmailContactEntities: self.getInquiryEmailContactEntities(),
                InquiryEmailAttachmentEntities: self.getInquiryEmailAttachmentEntities()
            };
            return SendEmailVm;
        };
        EmailFormDialog.prototype.getInquiryEmailEntity = function () {
            var self = this.emailVm, mainVm = this;
            var inquiryEmailEntity = {
                InquiryID: mainVm.inquiryId,
                InquiryNoteTypeID: self.noteType(),
                InquiryNoteSubTypeID: self.noteSubType(),
                Body: self.message(),
                Subject: self.subject()
            };
            return inquiryEmailEntity;
        };
        EmailFormDialog.prototype.getInquiryEmailContactEntities = function () {
            var self = this.emailVm, inquiryEmailContactEntities = [];
            _.forEach(this.emailVm.selectedEmails(), function (x) {
                inquiryEmailContactEntities.push({
                    Email: x.Email,
                    ContactID: x.Id,
                    IsCC: false
                });
            });
            _.forEach(this.emailVm.selectedCcEmails(), function (x) {
                inquiryEmailContactEntities.push({
                    Email: x.Email,
                    ID: x.Id,
                    IsCC: true
                });
            });
            return inquiryEmailContactEntities;
        };
        EmailFormDialog.prototype.getInquiryEmailAttachmentEntities = function () {
            var self = this.emailVm, inquiryEmailAttachmentEntities = [];
            _.forEach(this.emailVm.emailAttachments(), function (x) {
                inquiryEmailAttachmentEntities.push({
                    FileName: x.FileName,
                    UniqueID: x.UniqueID,
                    UniqueDialogID: self.uniqueDialogID(),
                    FileExtension: x.FileExtension
                });
            });
            return inquiryEmailAttachmentEntities;
        };
        EmailFormDialog.prototype.validation = function () {
            var self = this, isValid = true;
            if (self.emailVm.selectedEmails().length == 0) {
                self.emailVm.toMissed(true);
                isValid = false;
            }
            else {
                self.emailVm.toMissed(false);
            }
            if (Util.isNullOrEmpty(self.emailVm.subject())) {
                self.emailVm.subjectMissed(true);
                isValid = false;
            }
            else {
                self.emailVm.subjectMissed(false);
            }
            if (Util.isNullOrEmpty(self.emailVm.message())) {
                self.emailVm.messageMissed(true);
                isValid = false;
            }
            else {
                self.emailVm.messageMissed(false);
            }
            if (Util.isUndefinedOrZero(self.emailVm.noteType())) {
                self.emailVm.noteTypeMissed(true);
                isValid = false;
            }
            else {
                self.emailVm.noteTypeMissed(false);
            }
            if (Util.isUndefinedOrZero(self.emailVm.noteSubType())) {
                self.emailVm.noteSubTypeMissed(true);
                isValid = false;
            }
            else {
                self.emailVm.noteSubTypeMissed(false);
            }
            return isValid;
        };
        EmailFormDialog.prototype.clearForm = function (emailVm) {
            emailVm.toEmails([]);
            emailVm.ccEmails([]);
            emailVm.message("");
            emailVm.subject("");
            emailVm.noteType(0),
                emailVm.responseClient(0),
                emailVm.noteSubType(0),
                emailVm.selectedEmailIds([]);
            emailVm.selectedEmails([]);
            emailVm.selectedCcEmailIds([]);
            emailVm.selectedCcEmails([]);
            emailVm.noteSubTypeList([]);
            emailVm.noteSubTypeSelectedList([]);
            emailVm.noteTypeList([]);
            emailVm.responseClientList([]);
            emailVm.messageMissed(false),
                emailVm.subjectMissed(false),
                emailVm.toMissed(false),
                emailVm.noteTypeMissed(false),
                emailVm.noteSubTypeMissed(false),
                emailVm.emailAttachments([]);
        };
        EmailFormDialog.prototype.selectFirstItem = function (subNoteTypeSelectList) {
            if (!Util.isNothing(subNoteTypeSelectList) && subNoteTypeSelectList.length > 0) {
                var me = this;
                me.emailVm.noteSubType(subNoteTypeSelectList[0].ID);
            }
        };
        EmailFormDialog.prototype.loadEmilInfo = function (container) {
            var me = this, deferred = $.Deferred(), waitContainer = UI.showWaitIndicator($("div[data-id=emailDialog_body]")), dynamicFormId = InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().DynamicFormID(), clientId = InquiryForm.InquiryFormController.inquiryFormMasterVm.Inquiry().ClientID(), contractId = me.getContractId();
            me.copyOfWaitContainer = waitContainer;
            if (Util.isNothing(contractId)) {
                contractId = null;
            }
            InquiryData.GetSendEmailInfo(contractId, dynamicFormId, clientId)
                .done(function (response) {
                if (response.Success) {
                    me.toJS(me.emailVm, response.Payload);
                    me.setUpForm(contractId, me.emailVm);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .always(function () {
                me.setupSelect2();
                me.emailVm.uniqueDialogID(Util.createGUID());
                UI.hideWaitIndicator($("div[data-id=emailDialog_body]"), waitContainer);
                deferred.resolve();
            });
        };
        EmailFormDialog.prototype.setUpForm = function (contractId, emailVm) {
            var me = this;
            if (Util.isNothing(contractId)) {
                emailVm.toEmails([]);
                emailVm.ccEmails([]);
                emailVm.selectedEmailIds([]);
                emailVm.selectedEmails([]);
                emailVm.selectedCcEmailIds([]);
                emailVm.selectedCcEmails([]);
            }
        };
        EmailFormDialog.prototype.getContractId = function () {
            var me = this, configOptions = new Configuration.CSC_Config(), contractCode, contractId;
            _.forEach(InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.FormFields(), function (x) {
                if ((x.IntegratedServiceFieldID() == configOptions.Contract_IntegratedServiceFieldID &&
                    x.IntegratedServiceID() == configOptions.Contract_IntegratedServiceID)) {
                    contractCode = x.StringValue();
                }
            });
            if (!Util.isNothing(contractCode)) {
                _.forEach(InquiryForm.InquiryFormController.inquiryFormMasterVm.InquiryFormVm.ContractCodes(), function (x) {
                    if (x.ContractCode() == contractCode) {
                        contractId = x.ID();
                    }
                });
            }
            return contractId;
        };
        EmailFormDialog.prototype.toJS = function (emailVm, data) {
            var noteTypeList = [], subNoteTypeList = [], responseClientList = [], emails = [];
            _.forEach(data.InquiryNoteTypes, function (x) {
                noteTypeList.push(x);
            });
            emailVm.noteTypeList(noteTypeList);
            _.forEach(data.InquiryNoteSubTypes, function (x) {
                subNoteTypeList.push(x);
            });
            emailVm.noteSubTypeList(subNoteTypeList);
            _.forEach(data.Emails, function (x) {
                // ***  Select2 control need 'id' and 'text'
                emails.push({ id: x.ID, text: x.Email });
            });
            emailVm.toEmails(emails);
            emailVm.ccEmails(emails);
            _.forEach(data.ResponseTemplates, function (x) {
                responseClientList.push(x);
            });
            emailVm.responseClientList(responseClientList);
        };
        EmailFormDialog.prototype.refresh = function () {
        };
        EmailFormDialog.prototype.render = function (container, inquiryId, isInitialLoad) {
            var me = this;
            me.clearForm(me.emailVm);
            me.inquiryId = inquiryId;
            me.container = container;
            me.fileUploadSetting(isInitialLoad);
            me.loadEmilInfo(container);
            me.setupSelect2();
            $("div[data-id='EmailDialog']").on('hidden.bs.modal', function () {
                //
                UI.hideWaitIndicator($("div[data-id=emailDialog_body]"), me.copyOfWaitContainer);
            });
        };
        EmailFormDialog.prototype.setupSelect2 = function () {
            $('[data-id=inquiry_to_email]').select2({
                tags: true
            });
            $('[data-id=inquiry_cc_email]').select2({
                tags: true
            });
        };
        EmailFormDialog.prototype.fileUploadSetting = function (isInitialLoad) {
            if (isInitialLoad) {
                var me = this;
                me.container.find(".emailfileUpload").kendoUpload({
                    async: {
                        saveUrl: "save",
                        removeUrl: "remove",
                        autoUpload: true
                    },
                    upload: _.bind(me.onUpload, me),
                    select: _.bind(me.onSelect, me),
                    complete: _.bind(me.onComplete, me),
                    remove: _.bind(me.onRemove, me),
                    multiple: true
                });
            }
            else {
                $(".k-upload-files.k-reset").find("li").remove();
                $(".k-upload-status.k-upload-status-total").remove();
            }
        };
        EmailFormDialog.prototype.onSelect = function (e) {
            if (e.files.length > 1) {
                alert("Please select one file at a time.");
                e.preventDefault();
            }
        };
        EmailFormDialog.prototype.onUpload = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", fileParts, fileID = "";
            if (e.files.length > 0) {
                fileParts = e.files[0].name.split(".");
                if (fileParts.length > 1) {
                    fileName = fileParts[fileParts.length - 2];
                    extension = fileParts[fileParts.length - 1];
                    fileID = e.files[0].uid;
                }
            }
            var xhr = e.XMLHttpRequest;
            if (xhr) {
                xhr.addEventListener("readystatechange", function (e) {
                    if (xhr.readyState == 1 /* OPENED */) {
                        xhr.setRequestHeader("RequestVerificationToken", getCSRFToken());
                        xhr.setRequestHeader("Authorization", 'token ' + Util.getCookie("token"));
                        xhr.setRequestHeader("DSC", Util.getDSC());
                    }
                });
            }
            //me.inquiryNotesVm.FileName(fileName + '.' + extension);
            //me.inquiryNotesVm.uploadedGuid(fileID);
            // me.emailVm.emailAttachments.push({ FileName: fileName + '.' + extension, UniqueID: fileID });
            me.emailVm.emailAttachments.push({ FileName: fileName, UniqueID: fileID, FileExtension: extension });
            e.sender.options.async.saveUrl = url + "/api/Inquiry/UploadDocument/" + me.inquiryId + "/" + fileName + "/" + extension + "/" + fileID + "/" + true + "/" + me.emailVm.uniqueDialogID();
        };
        EmailFormDialog.prototype.onComplete = function (e) {
            var me = this;
            // me.inquiryNotesVm.AttachmentList.push(me.DocumentEntity({ ID: 0, FileName: me.inquiryNotesVm.FileName(), FilePrefix: 'cgicats-csc-dev/attachment/Customer Support Center/cscInquiryNote/', UniqueID: me.inquiryNotesVm.uploadedGuid(), LastModified: Date() }));
        };
        EmailFormDialog.prototype.onRemove = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", deferred = $.Deferred(), fileParts, fileID = "";
            if (e.files.length > 0) {
                fileParts = e.files[0].name.split(".");
                if (fileParts.length > 1) {
                    fileName = fileParts[fileParts.length - 2];
                    extension = fileParts[fileParts.length - 1];
                    fileID = e.files[0].uid;
                }
            }
            //var attachment = ko.utils.arrayFirst(me.inquiryNotesVm.AttachmentList(), function (document: any) {
            //    return document.UniqueID() === e.files[0].uid;
            //});
            //me.inquiryNotesVm.AttachmentList.remove(attachment);
            $(".k-upload-files.k-reset").find("li[data-uid='" + e.files[0].uid + "']").remove();
            var documentEntity = {
                ID: 0,
                FileName: fileName + '.' + extension,
                FilePrefix: 'cgicats-csc-dev/attachment/Customer Support Center/cscInquiryNote/' + me.inquiryId + '/',
                LastModified: new Date(),
                UniqueID: fileID
            };
            InquiryData.DeleteDocument(ko.toJS(documentEntity), me.inquiryId)
                .done(function (response) {
                if (response.Success) {
                    console.log('deleted...');
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .always(function () {
                deferred.resolve();
            });
        };
        return EmailFormDialog;
    }());
    ko.bindingHandlers.select2 = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = ko.unwrap(valueAccessor()), viewModel = viewModel;
            setupSelect2($(element), viewModel, options);
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = ko.unwrap(valueAccessor());
            $(element).select2(options);
        }
    };
    function setupSelect2($elem, viewModel, options) {
        var options = options;
        $elem.on('select2:select', function (e) {
            var vm = viewModel;
            if (options.uniqueName() == 'inquiry_to_email') {
                vm.selectedEmails.push({ Id: e.params.data.id, Email: e.params.data.text });
            }
            if (options.uniqueName() == 'inquiry_cc_email') {
                vm.selectedCcEmails.push({ Id: e.params.data.id, Email: e.params.data.text });
            }
        });
        $elem.on('select2:unselect', function (e) {
            var vm = viewModel;
            if (options.uniqueName() == 'inquiry_to_email') {
                var index = vm.selectedEmails.indexOf(e.params.data.text);
                vm.selectedEmails.splice(index);
            }
            if (options.uniqueName() == 'inquiry_cc_email') {
                var index = vm.selectedCcEmails.indexOf(e.params.data.text);
                vm.selectedCcEmails.splice(index);
            }
        });
    }
})(InquiryNotes || (InquiryNotes = {}));
//# sourceMappingURL=InquiryNotes.js.map