var EmailCorrespondence;
(function (EmailCorrespondence) {
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "EmailCorrespondence";
    var TEMPLATE_LIST = "template_emailcorrespondenceTemplate";
    // Controller
    var EmailCorrespondenceController = (function () {
        function EmailCorrespondenceController() {
            var me = this;
            this.emailCorrespondenceVm = {
                ID: ko.observable(),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                }
            };
        }
        EmailCorrespondenceController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.emailCorrespondenceVm, me.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        EmailCorrespondenceController.prototype.load = function (loadParams) {
            var me = this;
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            var deferred = $.Deferred();
            me.emailCorrespondenceVm.ID(loadParams.taskID);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        EmailCorrespondenceController.prototype.loadRecord = function (id) {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        EmailCorrespondenceController.prototype.haveFieldsChanged = function () {
            return false;
        };
        //Resizes the control-Old not used
        EmailCorrespondenceController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        EmailCorrespondenceController.prototype.appRouterID = function (id) {
            return "EmailCorrespondence";
        };
        //Returns a title for the page
        EmailCorrespondenceController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - Email Correspondence";
        };
        EmailCorrespondenceController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        EmailCorrespondenceController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        EmailCorrespondenceController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        EmailCorrespondenceController.prototype.height = function (height) {
            //   if (height > 0) {
            $('#listWrap').height(height - 30);
            $('#rightformwrap').height(height - 115);
            this.listViewContainer.height(height - 30);
            this.rightFormContainer.height(height - 120);
            //  }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        EmailCorrespondenceController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        return EmailCorrespondenceController;
    }());
    EmailCorrespondence.EmailCorrespondenceController = EmailCorrespondenceController;
})(EmailCorrespondence || (EmailCorrespondence = {}));
//# sourceMappingURL=EmailCorrespondence.js.map