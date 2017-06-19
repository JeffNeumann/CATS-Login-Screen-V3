var UI;
(function (UI) {
    //Display error messages in a module window
    function showErrorMessage(messages, errorMessages) {
        var message = "", i, max, totalMessages, bottomLeftContent = null;
        totalMessages = (errorMessages) ? messages.concat(errorMessages) : messages;
        max = totalMessages.length;
        for (i = 0; i < max; i++) {
            var startIndex;
            if ((startIndex = totalMessages[i].indexOf("<timestamp>")) !== -1) {
                var endIndex;
                if ((endIndex = totalMessages[i].indexOf("</timestamp>")) === -1) {
                    endIndex = totalMessages[i].length - 1;
                }
                bottomLeftContent = totalMessages[i].slice(startIndex + "<timestamp>".length, endIndex - startIndex);
            }
            else {
                message += totalMessages[i] + "<br />";
            }
        }
        var app = Global.App();
        var nManager = app.notificationManager();
        nManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#e31937;'></i>&nbsp;&nbsp;Oops!", message, function () { return ""; }, bottomLeftContent);
        //   notificationManager.createNotification("<i class='fa fa-exclamation-circle' style='color:#F06C1A;'></i>&nbsp;&nbsp;Oops!", "An error occurred while processing your request. We try hard to avoid these, but sometimes they still happen.  If you continue receiving this error please contact a system administrator.", () => "");
        //   $("#ui_errorMessageDialog_Message").html(message);
        //   $("#ui_errorMessageDialog").modal("show");
    }
    UI.showErrorMessage = showErrorMessage;
    //Singleton instance of the kendo confirmation dialog control
    var confirmDialogIsCreated = false;
    var confirmDialogOnYes = null;
    var confirmDialogOnNo = null;
    //showConfirmDialog
    //  Display a confirm dialog box wih Yes and No buttons
    //  message - text to display in the dialog
    //  onYes - function to call if user cicks on Yes button
    //  onNo - function to call if user clicks on No button
    function showConfirmDialog(message, onYes, onNo) {
        var SessionWindow = $("#notificationWindow").dialog({
            dialogClass: "no-close",
            title: "Confirmation",
            autoOpen: false,
            modal: true,
            resizable: false,
            draggable: false,
            buttons: {
                "Yes": function () {
                    //refresh token
                    var self = $(this);
                    SessionWindow.dialog("close");
                    if (confirmDialogOnYes != null) {
                        confirmDialogOnYes();
                    }
                },
                "No": function () {
                    SessionWindow.dialog("close");
                    if (confirmDialogOnNo != null) {
                        confirmDialogOnNo();
                    }
                }
            },
        });
        SessionWindow.html(message);
        SessionWindow.dialog("open");
        confirmDialogOnYes = onYes;
        confirmDialogOnNo = onNo;
        //var windowDiv = $('#ui_confirmDialog');
        //windowDiv.kendoWindow({                   
        //    modal: true,
        //    visible: false
        //});
        //var dialog = windowDiv.data("kendoWindow");
        //dialog.open();
    }
    UI.showConfirmDialog = showConfirmDialog;
    //showConfirmDialogWithMessages
    //  Display a confirm dialog box wih Yes and No buttons
    //  messages - list of messages, can be used with response.message
    //  onYes - function to call if user cicks on Yes button
    //  onNo - function to call if user clicks on No button
    function showConfirmDialogWithMessages(messages, onYes, onNo) {
        var message = "", i, max;
        max = messages.length;
        for (i = 0; i < max; i++) {
            message += messages[i] + "<br />";
        }
        if (!confirmDialogIsCreated) {
            //////
            //First time being called, bind the events
            $("#ui_confirmDialog_Yes").click(function () {
                $("#ui_confirmDialog").modal("hide");
                if (confirmDialogOnYes != null) {
                    confirmDialogOnYes();
                }
            });
            $("#ui_confirmDialog_No").click(function () {
                $("#ui_confirmDialog").modal("hide");
                if (confirmDialogOnNo != null) {
                    confirmDialogOnNo();
                }
            });
            $("#ui_confirmDialog").mouseleave(function () {
                $("#ui_confirmDialog").modal("hide");
                alert("Test");
                if (confirmDialogOnNo != null) {
                    confirmDialogOnNo();
                }
            });
            confirmDialogIsCreated = true;
        }
        confirmDialogOnYes = onYes;
        confirmDialogOnNo = onNo;
        $("#ui_confirmDialog_Message").html(message);
        $("#ui_confirmDialog").modal("show");
    }
    UI.showConfirmDialogWithMessages = showConfirmDialogWithMessages;
    function showDialogBox() {
        var SessionWindow;
        SessionWindow = $("#notificationWindow").dialog({
            dialogClass: "no-close",
            title: "User Assignment",
            autoOpen: false,
            modal: true,
            resizable: false,
            draggable: false,
            buttons: {
                //"Yes": function () {
                //    //refresh token
                //    var self = $(this);
                //    SessionWindow.dialog("close");
                //  //  app.router().navigate("Config/UserAssignment?nbr=" + user + "&type=1", true);
                //},
                "No": function () {
                    //    $("#notificationWindow").removeClass("blur");
                    //   //
                    SessionWindow.dialog("close");
                    //me2.fadeIn();
                    //$('#notificationWindow').on('hide.bs.modal', function () {
                    //    $('.container').removeClass('blur');
                    //})
                    //var self = $(this);
                    //self.dialog("close");
                    //  this.dialog("close");
                    // SessionWindow.dialog("close");
                }
            },
        });
        SessionWindow.html("There are still unassigned objects, please assign them before moving to next client/role.");
        SessionWindow.dialog("open");
    }
    UI.showDialogBox = showDialogBox;
    //Displays a wait spinner with a gray background over the entire
    //targetContainer tag.
    //Returns a reference to the wait tag that is needed when the
    //indicator is to be removed.
    function showWaitIndicator(targetContainer) {
        var position = targetContainer.offset();
        targetContainer.css({ opacity: "0" });
        //return $("<div class='wait-indicator'>Processing...</div>").css({
        //    position: "absolute",
        //    left: position.left,
        //    top: position.top,
        //    right: '0px',
        //    height: targetContainer.height() + "px",
        //    width: targetContainer.width() + "px"
        //}).appendTo("body");
        var loadingHtml = '<div class="loading-area " style="padding-top:10px; margin-top:10px;"  >' +
            '<span class="loading-text" > Loading <span> </span>...</span>' +
            '<div class="loading-animation" >' +
            '<div class="animate animate1" > </div>' +
            '<div class="animate animate2" > </div>' +
            '<div class="animate animate3" > </div>' +
            '<div class="animate animate4" > </div>' +
            '<div class="animate animate5" > </div>' +
            '</div>' +
            '</div>';
        return $(loadingHtml).css({
            position: "absolute",
            'z-index': 2000,
            left: position.left,
            top: position.top,
            right: '0px',
            height: targetContainer.height() + "px",
            width: targetContainer.width() + "px"
        }).appendTo("body");
    }
    UI.showWaitIndicator = showWaitIndicator;
    //Removes the wait spinner created with the showWaitIndicator function
    function hideWaitIndicator(targetContainer, waitContainer) {
        targetContainer.css({ opacity: "1" });
        $(waitContainer).remove();
    }
    UI.hideWaitIndicator = hideWaitIndicator;
    //Used to toggle a required error message
    //If the value is empty, sets the errorMessageName field to true
    function setRequiredStringError(value, errorMessageName, viewModel) {
        var isValid = true;
        //////
        if (value == null || value == "") {
            isValid = false;
        }
        viewModel.set(errorMessageName, !isValid);
        return isValid;
    }
    UI.setRequiredStringError = setRequiredStringError;
    //Used to toggle a required error message
    //If the value is empty, sets the errorMessageName field to true
    function setRequiredRegexHasError(value, regex, errorMessageName, viewModel) {
        var isValid = true;
        if (value != null) {
            //   var regex = /^[0,1]?\d{1}\/(([0-2]?\d{1})|([3][0,1]{1}))\/(([1]{1}[9]{1}[9]{1}\d{1})|([2-9]{1}\d{3}))$/;
            if (value.match(regex) == null) {
                isValid = false;
            }
        }
        else {
            isValid = false;
        }
        viewModel.set(errorMessageName, !isValid);
        return isValid;
    }
    UI.setRequiredRegexHasError = setRequiredRegexHasError;
    //Used to toggle a required error message
    //If the value is empty, sets the errorMessageName field to true
    function setRequiredDateHasError(value, errorMessageName, viewModel) {
        var isValid = true;
        if (value != null) {
            var regex = /^[0,1]?\d{1}\/(([0-2]?\d{1})|([3][0,1]{1}))\/(([1]{1}[9]{1}[9]{1}\d{1})|([2-9]{1}\d{3}))$/;
            if (value.match(regex) == null) {
                isValid = false;
            }
            else {
                var currentDate = moment();
                var enteredDate = moment(value);
                if (enteredDate.diff(currentDate, 'years') > 0) {
                    isValid = false;
                }
            }
        }
        viewModel.set(errorMessageName, !isValid);
        return isValid;
    }
    UI.setRequiredDateHasError = setRequiredDateHasError;
    function setRequiredDatePickerDateHasError(value, errorMessageName, viewModel) {
        var isValid = true;
        ////////debugger
        if (value == "01-01-0001" || value == "Invalid date") {
            isValid = false;
        }
        viewModel.set(errorMessageName, !isValid);
        return isValid;
    }
    UI.setRequiredDatePickerDateHasError = setRequiredDatePickerDateHasError;
    function setRequiredDateHasTimeError(value, errorMessageName, viewModel) {
        var isValid = true;
        if (value != null) {
            var regex = /^(\d{1,2}):(\d{2})(:(\d{2}))?(\s?(AM|am|PM|pm|aM|Am|pM|Pm))?$/;
            var timeArray = value.match(regex);
            if (timeArray == null) {
                isValid = false;
            }
            else {
                if (parseInt(timeArray[1]) > 12) {
                    isValid = false;
                }
                else if (parseInt(timeArray[2]) > 59) {
                    isValid = false;
                }
            }
        }
        viewModel.set(errorMessageName, !isValid);
        return isValid;
    }
    UI.setRequiredDateHasTimeError = setRequiredDateHasTimeError;
    //Used to toggle a required error message
    //If the value is empty, sets the errorMessageName field to true
    function setRequiredNumberError(value, errorMessageName, viewModel, mustBeGreaterThenZero) {
        if (mustBeGreaterThenZero === void 0) { mustBeGreaterThenZero = false; }
        var isValid = true;
        if (value == null) {
            isValid = false;
        }
        else if (mustBeGreaterThenZero && value <= 0) {
            isValid = false;
        }
        viewModel.set(errorMessageName, !isValid);
        return isValid;
    }
    UI.setRequiredNumberError = setRequiredNumberError;
    function setRequiredNumber(value, errorFlag, mustBeGreaterThenZero) {
        if (mustBeGreaterThenZero === void 0) { mustBeGreaterThenZero = false; }
        var isValid = true;
        if (value() == null) {
            isValid = false;
        }
        else if (mustBeGreaterThenZero && value() <= 0) {
            isValid = false;
        }
        //Call the knockout function to update the fields
        errorFlag(!isValid);
        return isValid;
    }
    UI.setRequiredNumber = setRequiredNumber;
    function setRequiredString(value, errorFlag) {
        var isValid = !Util.isNullOrEmpty(value());
        errorFlag(!isValid);
        return isValid;
    }
    UI.setRequiredString = setRequiredString;
    function setDateString(value, errorFlag) {
        var m = moment(value(), 'MM/DD/YYYY');
        var isValid = m.isValid();
        if (isValid) {
            //MUST be MM/DD/YYYY
            var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
            if (!(date_regex.test(value()))) {
                isValid = false;
            }
        }
        errorFlag(!isValid);
        return isValid;
    }
    UI.setDateString = setDateString;
    function setURLString(value, errorFlag) {
        var isValid = true;
        if (!value)
            return isValid;
        //Regex by Diego Perini from: http://mathiasbynens.be/demo/url-regex
        var url_regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
        if (!(url_regex.test(value()))) {
            isValid = false;
        }
        errorFlag(!isValid);
        return isValid;
    }
    UI.setURLString = setURLString;
    function setInteger(value, errorFlag) {
        var isValid = true;
        if (!value)
            return isValid;
        var integer_regex = /^-?(0|[1-9]\d*)$/;
        if (!(integer_regex.test(value()))) {
            isValid = false;
        }
        errorFlag(!isValid);
        return isValid;
    }
    UI.setInteger = setInteger;
    //Used to toggle a 'Phone Number Invalid' error message
    //If the value is not in a valid phone number format, sets the errorMessageName field to true
    function setPhoneNumberFormatError(value, errorMessageName, viewModel) {
        var isValid = true;
        if (!Util.isPhoneNumberInCorrectFormat(value)) {
            isValid = false;
        }
        viewModel.set(errorMessageName, !isValid);
        return isValid;
    }
    UI.setPhoneNumberFormatError = setPhoneNumberFormatError;
    (function (messageTypeValues) {
        messageTypeValues[messageTypeValues["success"] = 0] = "success";
        messageTypeValues[messageTypeValues["error"] = 1] = "error";
        messageTypeValues[messageTypeValues["info"] = 2] = "info";
    })(UI.messageTypeValues || (UI.messageTypeValues = {}));
    var messageTypeValues = UI.messageTypeValues;
    ;
    ////kendo notification control
    //var notificationMessage = $("#NotificationMessage").kendoNotification({
    //    width: 400,
    //    position: {
    //        top: null,
    //        bottom: 20,
    //        left: null,
    //        right: 80
    //    }
    //}).data("kendoNotification");
    //showNotificationMessage
    //  displays a temporary pop-up message 
    //  messages - a string to display in the message
    //  messageType - can be succesd, error or info
    function showNotificationMessage(message, messageType) {
        //Every master page should have a tag called NotificationMessage
        var className = "";
        switch (messageType) {
            case messageTypeValues.success:
                className = "success";
                break;
            case messageTypeValues.error:
                className = "error";
                break;
            case messageTypeValues.info:
                className = "info";
                break;
        }
        //  notificationMessage.show(message, className);
        $('#divSmallBoxes').css("position", "bottom:20, right:80");
        var notificationManager = new Notification.SmartBoxNotification();
        notificationManager.createSmallBoxNotification(messageType, message, "");
    }
    UI.showNotificationMessage = showNotificationMessage;
    function resizeGrid(gridContainer, height) {
        var dataArea = gridContainer.find(".k-grid-content"), newHeight = height - 8, diff = gridContainer.innerHeight() - dataArea.innerHeight();
        gridContainer.height(newHeight);
        dataArea.height(newHeight - diff);
    }
    UI.resizeGrid = resizeGrid;
    //Removes focus from the current control, usually done to force
    //a bound view model to update.
    function blurActiveElement() {
        if (document.activeElement != null) {
            //Note that we exlude body, span and div tags because IE has an odd
            //behaviour where the entire browser window will lose focus if one of 
            //these is the active element.
            $(document.activeElement).not("body").not("span").not("div").blur();
        }
    }
    UI.blurActiveElement = blurActiveElement;
    //Scrolls the container element to the specified control is visible
    //Uses jquery animate function to get smooth scrolling.
    function scrollToControl(container, control, scrollAdjustment) {
        if (scrollAdjustment === void 0) { scrollAdjustment = 0; }
        container.animate({
            scrollTop: control.offset().top - container.offset().top + container.scrollTop() + scrollAdjustment
        });
    }
    UI.scrollToControl = scrollToControl;
    //TemplateLoader class
    //This is a class for loading HTML templates.
    var TemplateLoader = (function () {
        //Constructors
        function TemplateLoader(templateFileName) {
            this.templateFileName = templateFileName;
            //public properties
            this.templateIsLoaded = null;
        }
        //Public Methods
        //render method
        //Takes the content of the specified template and copies
        //into the specified control.  Template may be loaded async.
        //Returns a jQuery promise object that can be used to run code
        //when the template is done loading.
        TemplateLoader.prototype.render = function (templateName, moduleName, moduleArea, container, data) {
            var deferred = $.Deferred(), onLoad;
            if (container != null) {
                onLoad = function () {
                    var template = kendo.template($("#" + templateName).html()), templateData = data == null ? {} : data;
                    container.html(template(templateData));
                    deferred.resolve();
                };
            }
            else {
                //No container, so don't render, just load
                onLoad = function () {
                    deferred.resolve();
                };
            }
            this.loadTemplate(templateName, moduleName, moduleArea, onLoad);
            return deferred.promise();
        };
        //Private Methods
        //loadTemplate method
        //If the template has not been loaded, then make an AJAX
        //call to get the template.
        TemplateLoader.prototype.loadTemplate = function (templateName, moduleName, area, onSuccess) {
            if (this.templateIsLoaded === null) {
                //First time checking, see if template is loaded
                this.templateIsLoaded = this.isTemplateLoaded(templateName);
            }
            //  alert("loadTemplate " + templateName);
            if (this.templateIsLoaded) {
                //Template already loaded
                onSuccess();
            }
            else {
                //Load the template from the file
                var templateRootPath = "/App/Views/" + moduleName + "/" + area + "/";
                var templateFileNameArray = this.templateFileName.split('_');
                if (templateFileNameArray.length > 0) {
                    if (templateFileNameArray[templateFileNameArray.length - 1].toLowerCase() == 'listutil' || templateFileNameArray[templateFileNameArray.length - 1].toLowerCase() == 'tabutil') {
                        templateRootPath = "/App/Views/Shared/Util/";
                    }
                }
                var me = this, date = new Date(), url = templateRootPath + this.templateFileName + ".html?t=" + date.getTime();
                $.get(url, function (data) {
                    // We need to get a specified page level data-id here to pass into API call
                    $("body").append(data);
                    me.templateIsLoaded = true;
                    onSuccess();
                });
            }
        };
        //isTemplateLoaded
        //checks if the template file has been loaded by looking in the DOM
        TemplateLoader.prototype.isTemplateLoaded = function (templateName) {
            return $("#" + templateName).length > 0;
        };
        return TemplateLoader;
    }());
    UI.TemplateLoader = TemplateLoader;
    ;
    //Templates class
    //Hold a collection of HTML templates
    var Templates = (function () {
        function Templates() {
            this.templates = [];
        }
        //Renders a template to the screen
        //Runs async, returns a jQuery promise
        Templates.prototype.render = function (templateFileName, moduleName, moduleArea, templateName, container, data) {
            var template = null, max, i;
            //Check if template has already been loaded
            max = this.templates.length;
            for (i = 0; i < max; i++) {
                if (this.templates[i].templateFileName === templateFileName) {
                    template = this.templates[i];
                    break;
                }
            }
            if (template === null) {
                //Adding a new template
                template = new TemplateLoader(templateFileName);
                this.templates.push(template);
            }
            //This is the async call to load template, returns a promise
            return template.render(templateName, moduleName, moduleArea, container, data);
        };
        return Templates;
    }());
    UI.Templates = Templates;
    //Standard phrases
    //There are standard phrases used in dialog boxes and other messages.  Pages should
    //uses these constants as much as possible so the entire site has a consistent interface.
    UI.PHRASE_UNSAVEDCHANGESONLEAVE = "There are unsaved changes on this record.  Are you sure you want to leave this record and lose these unsaved changes?";
    UI.PHRASE_UNSAVEDCHANGESONCLOSE = "There are unsaved changes on this page.  Are you sure you want to close this page and lose these unsaved changes?";
    UI.PHRASE_PAGELOADERROR = "An error has occurred while loading this page. You may not have permissions to access this page. Please contact your account administrator for access.";
    UI.PHRASE_RECORDLOADERROR = "An error has occurred while loading the record.  Please try again.";
    UI.PHRASE_SAVEERROR = "An error has occurred saving the record.";
    UI.PHRASE_INVALIDFIELDSONSAVE = "One or more fields have incorrect values.  Please review all warning messages.";
    UI.PHRASE_DUPLICATEONSAVE = "Duplicate record found.  Please enter a unique value";
    UI.PHRASE_RECORDSAVED = "Record was saved successfully";
    UI.PHRASE_GENERALACTIONFAILURE = "An unexpected error has occured while processing your request.  Please try again.";
    UI.PHRASE_NORESPONSE = "Due to inactivity, you have been automatically logged out.";
    UI.PHRASE_CHANGEACCOUNT = "If you change the current account, your proxy will be reset.";
    UI.PHRASE_ATTACHMENTREMOVED = "Attachment removed.";
    //Labels to display when a date range does not have a start date or end date
    //for example: 'always to 4/1/2015' or '1/1/2013 to present'
    UI.LABEL_DATERANGE_NOSTARTDATE = "always";
    UI.LABEL_DATERANGE_NOENDDATE = "present";
    UI.PHRASE_FAILED_LOADING_GRID_SETUP_DATA = "An error has occurred while loading grid setup data.";
    UI.PHRASE_FAILED_LOADING_GRID_DATA = "An error has occurred while loading grid data.";
    UI.PHRASE_FAILED_LOADING_GRID_LOOKUP_DATA = "An error has occurred while loading grid lookup data.";
    UI.PHRASE_FAILED_LOADING_USRE_ASSIGNMENT_DATA = "An error has occurred while loading user assignment data.";
    UI.PHRASE_FAILED_LOADING_DOC_GROUP_DATA = "An error has occurred while loading document group data.";
    UI.PHRASE_FAILED_SAVING_DOC_GROUP_DATA = "An error has occurred while saving document group data.";
    UI.PHRASE_FAILED_SAVING_HISTORY_NOTES_DATA = "An error has occurred while saving history notes data.";
    UI.PHRASE_FAILED_LOADING_UAF_CLIENT_DATA = "An error has occurred while loading user assignment data.";
    UI.PHRASE_FAILED_SAVING_UAF_DATA = "An error has occurred while saving uaf data.";
    UI.PHRASE_FAILED_LOADING_ADMIN_STEP_DATA = "An error has occurred while loading admin step data.";
    UI.PHRASE_FAILED_SAVING_ADMIN_STEP_DATA = "An error has occurred while saving admin step data.";
    UI.PHRASE_FAILED_LOADING_TASK_DETAILS_DATA = "An error has occurred while loading task details data.";
    UI.PHRASE_FAILED_SAVING_TASK_STEP_DATA = "An error has occurred while saving processing details.";
    UI.PHRASE_FAILED_LOADING_MILESTONE_NOTELEVEL_DATA = "An error has occurred while loading milestone note levels.";
    UI.PHRASE_FAILED_LOADING_MILESTONE_NOTETYPE_DATA = "An error has occurred while loading milestone note types.";
    UI.PHRASE_FAILED_LOADING_MILESTONE_NOTE_DATA = "An error has occurred while loading milestone note.";
    UI.PHRASE_FAILED_SAVING_MILESTONE_NOTE_DATA = "An error has occurred while saving milestone note data.";
})(UI || (UI = {}));
//# sourceMappingURL=ui.js.map