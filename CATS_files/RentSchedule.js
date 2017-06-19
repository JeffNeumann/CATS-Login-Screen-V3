var RentSchedule;
(function (RentSchedule) {
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "RentSchedule";
    var TEMPLATE_LIST = "template_rentscheduleTemplate";
    // Controller
    var RentScheduleController = (function () {
        function RentScheduleController() {
            var me = this;
            this.rentScheduleVm = {
                ID: ko.observable(),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                //get id of accordion clicked and open or close it
                accordionLinkClicked: function (data, event) {
                    var itemClicked = event.target.id;
                    var panelLinkItem = $('#' + itemClicked);
                    if (panelLinkItem.attr('class') == 'panel-toggle-link panel-on') {
                        panelLinkItem.removeClass('panel-on');
                        panelLinkItem.addClass('panel-off');
                    }
                    else {
                        panelLinkItem.removeClass('panel-off');
                        panelLinkItem.addClass('panel-on');
                    }
                },
            };
        }
        RentScheduleController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.rentScheduleVm, me.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        RentScheduleController.prototype.load = function (loadParams) {
            var me = this;
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            var deferred = $.Deferred();
            me.rentScheduleVm.ID(loadParams.taskID);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        RentScheduleController.prototype.loadRecord = function (id) {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        RentScheduleController.prototype.haveFieldsChanged = function () {
            return false;
        };
        //Resizes the control-Old not used
        RentScheduleController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        RentScheduleController.prototype.appRouterID = function (id) {
            return "Rent Schedule";
        };
        //Returns a title for the page
        RentScheduleController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - Rent Schedule";
        };
        RentScheduleController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        RentScheduleController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        RentScheduleController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        RentScheduleController.prototype.height = function (height) {
            if (height > 0) {
                $('#listWrap').height(height - 30);
                $('#rightformwrap').height(height - 115);
                this.listViewContainer.height(height - 30);
                this.rightFormContainer.height(height - 120);
            }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        RentScheduleController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        return RentScheduleController;
    }());
    RentSchedule.RentScheduleController = RentScheduleController;
})(RentSchedule || (RentSchedule = {}));
//# sourceMappingURL=RentSchedule.js.map