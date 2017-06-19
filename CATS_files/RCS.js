var RCS;
(function (RCS) {
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "RCS";
    var TEMPLATE_LIST = "template_rcsTemplate";
    // Controller
    var RCSController = (function () {
        function RCSController() {
            var me = this;
            this.rcsVm = {
                ID: ko.observable(),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                openInitialRCSEffectiveDate: function (e) {
                    me.OpenDatepickerInitialRCSEffective();
                },
                openRCSSignedDate: function (e) {
                    me.OpenDatepickerRCSSigned();
                },
                openRCSRecievedDate: function (e) {
                    me.OpenDatepickerRCSRecieved();
                },
                openRCSExpirationDate: function (e) {
                    me.OpenDatepickerRCSExpiration();
                },
            };
        }
        RCSController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                ko.cleanNode(me.container[0]);
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                ko.applyBindings(me.rcsVm, me.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        RCSController.prototype.load = function (loadParams) {
            var me = this;
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            var deferred = $.Deferred();
            me.rcsVm.ID(loadParams.taskID);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        RCSController.prototype.loadRecord = function (id) {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        RCSController.prototype.haveFieldsChanged = function () {
            return false;
        };
        //Resizes the control-Old not used
        RCSController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        RCSController.prototype.appRouterID = function (id) {
            return "RCS";
        };
        //Returns a title for the page
        RCSController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - RCS";
        };
        RCSController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        RCSController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        RCSController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        RCSController.prototype.height = function (height) {
            //   if (height > 0) {
            $('#listWrap').height(height - 30);
            $('#rightformwrap').height(height - 115);
            this.listViewContainer.height(height - 30);
            this.rightFormContainer.height(height - 120);
            //  }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        RCSController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        //Open Date Pickers
        RCSController.prototype.OpenDatepickerInitialRCSEffective = function () {
            var input = $("[data-id='RCSInitialEffectiveDatepicker']");
            input.datepicker();
            input.datepicker('show');
        };
        RCSController.prototype.OpenDatepickerRCSSigned = function () {
            var input = $("[data-id='RCSSignedDatepicker']");
            input.datepicker();
            input.datepicker('show');
        };
        RCSController.prototype.OpenDatepickerRCSRecieved = function () {
            var input = $("[data-id='RCSRecievedDatepicker']");
            input.datepicker();
            input.datepicker('show');
        };
        RCSController.prototype.OpenDatepickerRCSExpiration = function () {
            var input = $("[data-id='RCSExpirationDatepicker']");
            input.datepicker();
            input.datepicker('show');
        };
        return RCSController;
    }());
    RCS.RCSController = RCSController;
})(RCS || (RCS = {}));
//# sourceMappingURL=RCS.js.map