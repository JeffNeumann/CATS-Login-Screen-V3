var EventUtil;
(function (EventUtil) {
    //Raised by Controllers to indicate that something has changed that
    //required a description or URL change.  Such as clicking on
    //an item from a list or adding a new record
    EventUtil.EVENT_ROUTECHANGE = "routeChange";
    //Raised by Controllers to indicate that the controller is closing
    EventUtil.EVENT_ROUTECLOSE = "routeClose";
    //Raised by scheduler related controlers to indicate that an ad-hoc or
    //scheduled scheduler request has been modified
    EventUtil.EVENT_SCHEDULERSCHEDULECHANGE = "schedulerScheduleChange";
    //Raised when a tenant record is added or updated
    EventUtil.EVENT_TENANTCHANGE = "tenantChange";
    //Raised when a calllog record is added or updated
    EventUtil.EVENT_CALLLOGCHANGE = "callLogChange";
    //Raised when a unit/owner relationship changes
    //Note that a change event can effect multiple units and
    //owners and the same time, which is why those fields are arrays
    EventUtil.EVENT_CALLLOGCHANGE = "callLogChange";
    //Raised when inspection results have been changed.
    //Returns a list of inspection ID's that might have
    //been changed because the results changed.
    EventUtil.EVENT_INSPECTIONRESULTCHANGE = "inspectionResultChange";
    //Raised when CustomerOrganization data is changed 
    EventUtil.EVENT_INQUIRY_GRID_SETUP_CHANGE = "inquiryGridSetupChange";
})(EventUtil || (EventUtil = {}));
//# sourceMappingURL=events.js.map