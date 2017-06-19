var Contacts;
(function (Contacts) {
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "Contacts";
    var TEMPLATE_LIST = "template_ContactsTemplate";
    // Controller
    var ContactsController = (function () {
        function ContactsController() {
            var _this = this;
            var me = this;
            this.contactsVm = {
                SelectedContactType: ko.observable(0),
                Contacts: ko.observableArray(),
                ContactTypes: ko.observableArray(),
                ContractCode: ko.observable(),
                KeyDate: ko.observable(),
                PropertyCode: ko.observable(),
                PropertyName: ko.observable(),
                Status: ko.observable(),
                TaskTypeName: ko.observable(),
                taskID: ko.observable(0),
                SelectedContact: ko.observable(),
                close: function (e) {
                    me.close();
                },
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                }
            };
            this.contactsVm.SelectedContactType.subscribe(function (newValue) {
                if (newValue != undefined) {
                    _this.loadSelectedContactInformation(newValue);
                }
            });
        }
        ContactsController.prototype.render = function (container, moduleName, moduleArea) {
            var _this = this;
            var app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                _this.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                ko.cleanNode(_this.container[0]);
                ko.applyBindings(_this.contactsVm, _this.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        ContactsController.prototype.load = function (loadParams) {
            var _this = this;
            var me = this, waitContainer = UI.showWaitIndicator(this.container), deferred = $.Deferred();
            me.contactsVm.taskID(loadParams.taskID);
            me.contactsVm.ContractCode(loadParams.ContractCode);
            me.contactsVm.KeyDate(loadParams.KeyDate);
            me.contactsVm.PropertyCode(loadParams.PropertyCode);
            me.contactsVm.PropertyName(loadParams.PropertyName);
            me.contactsVm.Status(loadParams.Status);
            me.contactsVm.TaskTypeName(loadParams.TaskTypeName);
            TaskManagerData.GetContactsMasterViewModel(loadParams.taskID)
                .done(function (response) {
                if (response.Success) {
                    me.contactsVm.ContactTypes.removeAll();
                    me.updateViewModel(response.Payload);
                }
                else {
                    UI.showErrorMessage(response.Messages);
                }
            })
                .always(function () {
                UI.hideWaitIndicator(_this.container, waitContainer);
                deferred.resolve();
            });
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            //me.contactsVm.ID(loadParams.taskID);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        ContactsController.prototype.loadRecord = function (id) {
            var me = this, deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        ContactsController.prototype.haveFieldsChanged = function () {
            return false;
        };
        //Resizes the control-Old not used
        ContactsController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        ContactsController.prototype.appRouterID = function (id) {
            return "Main";
        };
        //Returns a title for the page
        ContactsController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - Contacts";
        };
        ContactsController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        ContactsController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        ContactsController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        ContactsController.prototype.height = function (height) {
            //  if (height > 0) {
            $('#listWrap').height(height - 30);
            $('#rightformwrap').height(height - 115);
            this.listViewContainer.height(height - 30);
            this.rightFormContainer.height(height - 120);
            // }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        ContactsController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        //TODO PRIVATE UpdateViewModel
        ContactsController.prototype.updateViewModel = function (contactsMasterViewModel) {
            var _this = this;
            _.forEach(contactsMasterViewModel.Contacts, function (contact) {
                _this.contactsVm.Contacts.push(_this.createContactObservables(contact));
            });
            _.forEach(contactsMasterViewModel.ContactTypes, function (contactType) {
                _this.contactsVm.ContactTypes.push(_this.createContactTypeObservables(contactType));
            });
        };
        ContactsController.prototype.createContactObservables = function (contact) {
            var vmContact = {
                ID: ko.observable(contact ? contact.ID : 0),
                ContractID: ko.observable(contact ? contact.ContractID : 0),
                ContractCode: ko.observable(contact ? contact.ContractCode : ""),
                ClientID: ko.observable(contact ? contact.ClientID : 0),
                ContactTypeID: ko.observable(contact ? contact.ContactTypeID : 0),
                CompanyName: ko.observable(contact ? contact.CompanyName : ""),
                CompanyAddress: ko.observable(contact ? contact.CompanyAddress : ""),
                CompanyCity: ko.observable(contact ? contact.CompanyCity : ""),
                CompanyState: ko.observable(contact ? contact.CompanyState : ""),
                CompanyZip: ko.observable(contact ? FormatUtil.AddressHelp.formatZipAsZipCode(contact.CompanyZip) : ""),
                CompanyPhone: ko.observable(contact ? FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.CompanyPhone) : ""),
                CompanyFax: ko.observable(contact ? FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.CompanyFax) ? FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.CompanyFax) : "" : ""),
                CompanyEmail: ko.observable(contact ? contact.CompanyEmail : ""),
                ContactFirstName: ko.observable(contact ? contact.ContactFirstName : ""),
                ContactMiddleName: ko.observable(contact ? contact.ContactMiddleName ? contact.ContactMiddleName : "" : ""),
                ContactLastName: ko.observable(contact ? contact.ContactLastName : ""),
                ContactFullName: ko.observable(this.createFullNameFromProperties(contact.ContactFirstName, contact.ContactMiddleName, contact.ContactLastName)),
                ContactPhone: ko.observable(contact ? FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.ContactPhone) : ""),
                ContactPhoneExtension: ko.observable(contact ? contact.ContactPhoneExtension ? contact.ContactPhoneExtension : "" : ""),
                ContactFax: ko.observable(contact ? FormatUtil.PhoneHelp.formatNumericStringAsPhoneNumber(contact.ContactFax) : ""),
                ContactEmail: ko.observable(contact ? contact.ContactEmail : ""),
                ContactTitle: ko.observable(contact ? contact.ContactTitle : "")
            };
            return vmContact;
        };
        ContactsController.prototype.createFullNameFromProperties = function (firstName, middleName, lastName) {
            var fullName = "";
            if (firstName != null) {
                fullName += firstName;
            }
            if (middleName != null) {
                fullName += " " + middleName;
            }
            if (lastName != null) {
                fullName += " " + lastName;
            }
            return fullName;
        };
        ContactsController.prototype.createContactTypeObservables = function (contactTypeModel) {
            var vmContactType = {
                ID: ko.observable(contactTypeModel ? contactTypeModel.ID : 0),
                Name: ko.observable(contactTypeModel ? contactTypeModel.Name : ""),
                DateTimeCreated: ko.observable(contactTypeModel ? contactTypeModel.DateTimeCreated : ""),
                CreatedById: ko.observable(contactTypeModel ? contactTypeModel.CreatedById : 0),
                CreatedForId: ko.observable(contactTypeModel ? contactTypeModel.CreatedForId : 0),
                DateTimeModified: ko.observable(contactTypeModel ? contactTypeModel.DateTimeModified : ""),
                ModifiedById: ko.observable(contactTypeModel ? contactTypeModel.ModifiedById : 0),
                ModifiedForId: ko.observable(contactTypeModel ? contactTypeModel.ModifiedForId : 0),
                LastUpdatedSource: ko.observable(contactTypeModel ? contactTypeModel.LastUpdatedSource : "")
            };
            return vmContactType;
        };
        ContactsController.prototype.loadSelectedContactInformation = function (newValue) {
            var me = this;
            var contact = ko.utils.arrayFirst(me.contactsVm.Contacts(), function (contact) { return (contact.ContactTypeID() === newValue); });
            me.contactsVm.SelectedContact(contact);
        };
        ContactsController.prototype.close = function () {
            var app = Global.App(), me = this;
            var id = me.contactsVm.taskID();
            if (id > 0) {
                app.router().closeTab("TaskManager/Main" + "/" + id);
            }
            else {
                app.router().closeTab("TaskManager/Main");
            }
        };
        return ContactsController;
    }());
    Contacts.ContactsController = ContactsController;
})(Contacts || (Contacts = {}));
// 1- Create ViewModel
// 2- Fill that ViewModel
// 3- Binding the ViewModel
// just we can apply binding once 
// context ViewModel 
//# sourceMappingURL=Contacts.js.map