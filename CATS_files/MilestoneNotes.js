/// <reference path="../../../../scripts/typings/bootstrap.v3.datetimepicker/bootstrap.v3.datetimepicker.d.ts" />
var MilestoneNotes;
(function (MilestoneNotes) {
    var ConfigOptions = new Configuration.TaskManager_Config();
    function getCSRFToken() {
        var csrfToken = $('#forgeryToken').val();
        return csrfToken;
    }
    MilestoneNotes.getCSRFToken = getCSRFToken;
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "MilestoneNotes";
    var TEMPLATE_LIST = "template_milestonesnotesTemplate";
    var MilestoneGridColumnsDataSource = (function () {
        function MilestoneGridColumnsDataSource() {
        }
        MilestoneGridColumnsDataSource.prototype.getColumns = function (id) {
            var data = { "taskID": id };
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "GetGridColums"]), "GET", data);
        };
        MilestoneGridColumnsDataSource.prototype.getClientID = function (id) {
            var data = { "taskID": id };
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "GetClientID"]), "GET", data);
        };
        return MilestoneGridColumnsDataSource;
    }());
    MilestoneNotes.MilestoneGridColumnsDataSource = MilestoneGridColumnsDataSource;
    ;
    var NoteDataSource = (function () {
        function NoteDataSource() {
        }
        NoteDataSource.prototype.getNoteLevels = function () {
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "GetNoteLevels"]), "GET");
        };
        NoteDataSource.prototype.getNoteTypes = function () {
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "GetNoteTypes"]), "GET");
        };
        NoteDataSource.prototype.getNotes = function (id) {
            var data = { "taskID": id };
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "GetNotes"]), "GET", data);
        };
        NoteDataSource.prototype.addNote = function (data) {
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "AddNote"]), "POST", data);
        };
        NoteDataSource.prototype.editNote = function (data) {
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "EditNote"]), "POST", data);
        };
        NoteDataSource.prototype.deleteRestoreNote = function (data) {
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "DeleteRestoreNote"]), "POST", data);
        };
        NoteDataSource.prototype.removeDocument = function (data) {
            return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "MilestoneNote", "DeleteDocument_TM"]), "POST", data);
        };
        return NoteDataSource;
    }());
    MilestoneNotes.NoteDataSource = NoteDataSource;
    // Controller
    var MilestoneNotesController = (function () {
        function MilestoneNotesController() {
            this.fieldsOnLoad = null;
            this.gridModel = { DataSource: new kendo.data.DataSource, Permissions: [] };
            this.PAGE_SIZE = 100;
            this.savedCode = { saved: 0, unSavedInAdd: 1, unSavedInEdit: 2, };
            var me = this;
            this.milestoneNotesVm = {
                ID: ko.observable(),
                TaskID: ko.observable(),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                close: function (e) {
                    me.exit();
                },
                //openCalendar: function () {
                //    var input = me.container.find("[data-id='noteDateTimePicker']");
                //    input.datepicker();
                //    input.datepicker('show');
                //},
                ContractCode: ko.observable(),
                PropertyCode: ko.observable(),
                PropertyName: ko.observable(),
                Status: ko.observable(),
                TaskTypeName: ko.observable(),
                DisplayKeyDate: ko.observable(),
                gridColumns: ko.observableArray(),
                noteLevels: ko.observableArray().extend({ required: true }),
                noteTypes: ko.observableArray().extend({ required: true }),
                selectedNoteLevelID: ko.observable().extend({ required: true }),
                selectedNoteTypeID: ko.observable().extend({ required: true }),
                //selectedSortByID: ko.observable<number>(),
                newNoteDate: ko.observable().extend({ required: true, date: true }),
                newNoteText: ko.observable().extend({ required: true }),
                addNote: function (e) {
                    me.addNote();
                },
                timeZone: ko.observable(),
                sortByList: ko.observableArray(),
                selectedSortByValue: ko.observable(),
                showDeletedNotes: ko.observable(),
                allNotes: ko.observableArray(),
                notes: ko.observableArray(),
                sortNotes: function (data) {
                    me.sortNotes(data.selectedSortByValue());
                },
                showDeleteNotesChange: function () {
                    me.setShowNotes();
                    return true;
                },
                editNote: function (data) {
                    me.editNote(data);
                },
                deleteNote: function (data) {
                    me.deleteRestoreNote(data);
                },
                restoreNote: function (data) {
                    me.deleteRestoreNote(data);
                },
                editNoteLevelID: ko.observable(1).extend({ required: true }),
                editNoteTypeID: ko.observable(1).extend({ required: true }),
                editNoteDate: ko.observable().extend({ required: true }),
                editNoteText: ko.observable("").extend({ required: true }),
                currentNoteID: ko.observable(0),
                displayUpload: ko.observable(false),
                saveNote: function (data) {
                    me.saveNote();
                },
                saveDocument: function (data) {
                    me.saveDocument(data);
                },
                cancelDocument: function (data) {
                    me.cancelDocument(data);
                },
                cancelEdit: function (data) {
                    //resume original value (data.DocumentList may be changed)
                    data.DocumentList = new Array();
                    for (var i = 0; i < me.originalDocumentList.length; i++) {
                        data.DocumentList.push(me.originalDocumentList[i]);
                    }
                    ;
                    me.showSlider(data, false);
                    //me.clearEditPanl();  //cause validation
                    me.fieldsOnLoad = null; //avoid to check unsaved
                },
                //editOpenCalendar: function (data) {
                //    var input = me.container.find("[data-id='" + data.NoteID + "']");
                //    input.datepicker();
                //    input.datepicker('show');
                //},
                FileName: ko.observable(),
                FileNameDecoded: ko.observable(),
                FileGuid: ko.observable(),
                NewDocuments: ko.observableArray(),
                clientID: ko.observable(0),
                downloadDocument: function (data) {
                    me.downloadDocument(data);
                },
                editFileName: ko.observable(),
                editFileNameDecoded: ko.observable(),
                editFileGuid: ko.observable(),
                currentDocumentList: ko.observableArray(null),
                deleteDocument: function (data) {
                    me.deleteDocument(data);
                },
                addDocument: function (data) {
                    me.addDocument();
                },
                hasEditNotePermission: ko.observable(),
                hasAddNotePermission: ko.observable(),
                hasDeleteNotePermission: ko.observable(),
                hasShowDeletedNotesPermission: ko.observable(),
                hasAccessOnlyExternalNotesPermission: ko.observable(),
                hasAccessAllNotesPermission: ko.observable(),
                errorsInAddNote: null,
                errorsInSaveNote: null,
            };
            //validation
            ko.validation.init({
                registerExtenders: true,
                insertMessages: true
            });
            this.milestoneNotesVm.errorsInAddNote = ko.validation.group([this.milestoneNotesVm.selectedNoteLevelID, this.milestoneNotesVm.selectedNoteTypeID, this.milestoneNotesVm.newNoteDate, this.milestoneNotesVm.newNoteText]);
            this.milestoneNotesVm.errorsInSaveNote = ko.validation.group([this.milestoneNotesVm.editNoteLevelID, this.milestoneNotesVm.editNoteTypeID, this.milestoneNotesVm.editNoteDate, this.milestoneNotesVm.editNoteText]);
            //datetimepicker handler
            ko.bindingHandlers.dtp = {
                init: function (element, valueAccessor, allBindingsAccessor) {
                    //initialize datepicker with some optional options
                    var options = allBindingsAccessor().dtpOptions || {};
                    $(element).datetimepicker(options);
                    //handle the field changing
                    //ko.utils.registerEventHandler(element, "change", function () {
                    //    var observable = valueAccessor();
                    //    observable($(element).datetimepicker("getDate"));
                    //});
                    ////handle disposal (if KO removes by the template binding)
                    //ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    //    $(element).datetimepicker("destroy");
                    //});
                },
            };
        }
        MilestoneNotesController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.milestoneNotesVm, me.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        MilestoneNotesController.prototype.load = function (loadParams) {
            var me = this;
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            var deferred = $.Deferred();
            me.milestoneNotesVm.ID(loadParams.taskID);
            var waitContainer = UI.showWaitIndicator(this.rightFormContainer);
            //get permissions
            new MilestoneGridColumnsDataSource().getColumns(me.milestoneNotesVm.TaskID())
                .done(function (response) {
                if (response.Success) {
                    //set permissions
                    var permissions = response.Permissions;
                    me.milestoneNotesVm.hasAddNotePermission(permissions && permissions["AddNote"] != undefined);
                    me.milestoneNotesVm.hasEditNotePermission(permissions && permissions["EditNote"] != undefined);
                    me.milestoneNotesVm.hasDeleteNotePermission(permissions && permissions["DeleteRestoreNote"] != undefined);
                    me.milestoneNotesVm.hasShowDeletedNotesPermission(permissions && permissions["ShowDeletedNotes"] != undefined);
                    me.milestoneNotesVm.hasAccessOnlyExternalNotesPermission(permissions && permissions["AccessOnlyToExternalNotes"] != undefined);
                    me.milestoneNotesVm.hasAccessAllNotesPermission(permissions && permissions["AccessToAllNotes"] != undefined);
                    me.milestoneNotesVm.gridColumns(response.Payload);
                    me.buildGrid();
                    me.loadClientID();
                    me.setUploadWidget();
                    me.loadNoteLevels();
                    me.loadNoteTypes();
                    me.CreateSortByList();
                    me.milestoneNotesVm.showDeletedNotes(false); //default
                    me.milestoneNotesVm.selectedSortByValue(1); //default by date
                    me.loadNotes()
                        .always(function () {
                        UI.hideWaitIndicator(me.rightFormContainer, waitContainer);
                    });
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_LOADING_MILESTONE_NOTE_DATA]);
                deferred.reject();
            })
                .always(function () {
                //UI.hideWaitIndicator(me.rightFormContainer, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        //invoked by Main
        MilestoneNotesController.prototype.renderAndLoad = function (container, moduleName, moduleArea, loadParams) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            me.milestoneNotesVm.ID(loadParams.taskID);
            me.milestoneNotesVm.TaskID(loadParams.taskID);
            me.milestoneNotesVm.ContractCode(loadParams.ContractCode);
            me.milestoneNotesVm.PropertyName(loadParams.PropertyName);
            me.milestoneNotesVm.Status(loadParams.Status);
            me.milestoneNotesVm.TaskTypeName(loadParams.TaskTypeName);
            me.milestoneNotesVm.PropertyCode(loadParams.PropertyCode);
            me.milestoneNotesVm.DisplayKeyDate(loadParams.KeyDate);
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                ko.cleanNode(document.getElementById("rightFormContainer"));
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.milestoneNotesVm, me.container[0]);
                //me.container.find(".ms-note-date-picker").datetimepicker();
                me.container.find("[data-id='addDateTimePicker']").datetimepicker();
                me.milestoneNotesVm.newNoteDate(moment(Date.now()).format(Util.MOMENT_FORMAT_DATETIME));
                //me.container.find(".editDateTimePicker").datetimepicker();
                me.gridContainer = me.container.find("div[data-id='grid']");
                me.editorBoxContainer = me.container.find("div[data-id='editorModal']");
                me.load(loadParams);
                deferred.resolve();
            });
            return deferred.promise();
        };
        //Load the data for the specified record
        MilestoneNotesController.prototype.loadRecord = function (id) {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        MilestoneNotesController.prototype.haveFieldsChanged = function () {
            var me = this;
            return ((me.haveFieldsChanged_1() & 3) != me.savedCode.saved);
        };
        MilestoneNotesController.prototype.haveFieldsChanged_1 = function () {
            var me = this, returnCode = null;
            //add panel
            var addBits = me.savedCode.saved;
            if ((me.milestoneNotesVm.newNoteText() != undefined || me.milestoneNotesVm.newNoteText() != null) && me.milestoneNotesVm.newNoteText().length > 0 ||
                (me.milestoneNotesVm.NewDocuments() != undefined || me.milestoneNotesVm.NewDocuments() != null) && me.milestoneNotesVm.NewDocuments().length > 0 ||
                me.milestoneNotesVm.selectedNoteLevelID() > 0 || me.milestoneNotesVm.selectedNoteTypeID() > 0) {
                addBits = me.savedCode.unSavedInAdd;
            }
            //edit panel
            var editBits = me.savedCode.saved;
            if (this.fieldsOnLoad != null) {
                //Remove focus from the current control which will force
                //the view model to update with the most current values.
                UI.blurActiveElement();
                //Get the current values of the fields
                var fieldsCurrent = me.getFieldData(false);
                if (this.fieldsOnLoad != fieldsCurrent) {
                    editBits = me.savedCode.unSavedInEdit;
                }
            }
            return returnCode = addBits | editBits;
        };
        //Resizes the control-Old not used
        MilestoneNotesController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        MilestoneNotesController.prototype.appRouterID = function (id) {
            return "MilestoneNotes";
        };
        //Returns a title for the page
        MilestoneNotesController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - Milestone Notes";
        };
        MilestoneNotesController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        MilestoneNotesController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        MilestoneNotesController.prototype.resize = function (height) {
        };
        //resizes the left nav list
        MilestoneNotesController.prototype.height = function (height) {
            //   if (height > 0) {
            $('#listWrap').height(height - 30);
            $('#rightformwrap').height(height - 115);
            this.listViewContainer.height(height - 30);
            this.rightFormContainer.height(height - 190);
            //  }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        MilestoneNotesController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        //======Private Functions=======================
        MilestoneNotesController.prototype.exit = function () {
            var app = Global.App(), me = this;
            me.confirmClose();
            //var id = me.milestoneNotesVm.TaskID();
            //if (id > 0) {
            //    app.router().closeTab("TaskManager/Main" + "/" + id);
            //} else {
            //    app.router().closeTab("TaskManager/Main");
            //}
        };
        MilestoneNotesController.prototype.closeTab = function () {
            var me = this, app = Global.App();
            var id = me.milestoneNotesVm.TaskID();
            if (id > 0) {
                app.router().closeTab("TaskManager/Main" + "/" + id);
            }
            else {
                app.router().closeTab("TaskManager/Main");
            }
        };
        MilestoneNotesController.prototype.buildGrid = function () {
            var me = this, app = Global.App();
            // me.gridDataSource = new kendo.data.DataSource();
            var gridColumnList = me.milestoneNotesVm.gridColumns();
            var configColumns = [];
            var rowData = '';
            for (var i = 0; i < gridColumnList.length; i++) {
                var newColumn = {};
                newColumn = {
                    title: gridColumnList[i].Name,
                    field: 'column' + i,
                    width: 100
                };
                if (i < gridColumnList.length - 1) {
                    rowData += '"' + 'column' + i + '": "' + gridColumnList[i].Value + '", ';
                }
                else {
                    rowData += '"' + 'column' + i + '": "' + gridColumnList[i].Value + '"';
                }
                configColumns.push(newColumn);
            }
            rowData = "{" + rowData + "}";
            // me.gridDataSource = new kendo.data.DataSource({ data: rowData });
            me.gridDataSource = new kendo.data.DataSource({ data: JSON.parse(rowData) });
            me.grid = me.gridContainer.kendoGrid({
                dataSource: {
                    data: [JSON.parse(rowData)]
                },
                selectable: false,
                sortable: true,
                filterable: false,
                resizable: true,
                scrollable: true,
                reorderable: true,
                //pageable:
                //{
                //    pageSize: me.PAGE_SIZE,
                //    numeric: false,
                //},
                columns: configColumns,
            }).data("kendoGrid");
            //var jasonData = JSON.parse(rowData);
            //me.grid.setDataSource(jasonData);
        };
        MilestoneNotesController.prototype.loadNoteLevels = function () {
            var me = this, deferred = $.Deferred();
            new NoteDataSource().getNoteLevels()
                .done(function (response) {
                if (response.Success) {
                    me.milestoneNotesVm.noteLevels(response.Payload);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    deferred.reject(response.Messages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_LOADING_MILESTONE_NOTELEVEL_DATA]);
                deferred.reject();
            });
        };
        MilestoneNotesController.prototype.loadNoteTypes = function () {
            var me = this, deferred = $.Deferred();
            new NoteDataSource().getNoteTypes()
                .done(function (response) {
                if (response.Success) {
                    me.milestoneNotesVm.noteTypes(response.Payload);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    deferred.reject(response.Messages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_LOADING_MILESTONE_NOTETYPE_DATA]);
                deferred.reject();
            });
        };
        MilestoneNotesController.prototype.addNote = function () {
            var me = this, deferred = $.Deferred();
            me.container.find("[data-id='addNoteButton']").prop('disabled', true);
            var currentValue = me.getFieldData(true);
            if (me.doValidation(true) && me.fieldsOnLoad != currentValue) {
                var data = me.createSaveParam(true);
                new NoteDataSource().addNote(data)
                    .done(function (response) {
                    if (response.Success) {
                        UI.showNotificationMessage("The note has been saved.", UI.messageTypeValues.success);
                        //refresh note list, enable button
                        //me.loadNotes();
                        me.refreshNotes();
                        //clean
                        me.milestoneNotesVm.selectedNoteLevelID(null);
                        me.milestoneNotesVm.selectedNoteTypeID(null);
                        me.milestoneNotesVm.newNoteDate(null);
                        me.milestoneNotesVm.newNoteText(null);
                        me.fieldsOnLoad = null; //currentValue;
                        //clear upload file list on kendo 
                        me.resetUploadFile(null);
                        me.milestoneNotesVm.NewDocuments.removeAll();
                        me.milestoneNotesVm.errorsInAddNote.showAllMessages(false);
                    }
                    else {
                        UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    }
                })
                    .fail(function () {
                    UI.showErrorMessage([UI.PHRASE_FAILED_SAVING_MILESTONE_NOTE_DATA]);
                    deferred.resolve();
                })
                    .always(function () {
                    // UI.hideWaitIndicator(me.container, waitContainer);
                    me.container.find("[data-id='addNoteButton']").prop('disabled', false);
                    deferred.resolve();
                });
            }
            else {
                me.container.find("[data-id='addNoteButton']").prop('disabled', false);
            }
            return deferred.promise();
        };
        MilestoneNotesController.prototype.CreateSortByList = function () {
            var me = this, sortList = new Array();
            sortList.push({ Name: "Sort By Date", Value: 1 });
            sortList.push({ Name: "Sort By NoteType", Value: 2 });
            sortList.push({ Name: "Sort By User", Value: 3 });
            me.milestoneNotesVm.sortByList(sortList);
        };
        MilestoneNotesController.prototype.loadNotes = function () {
            var me = this, deferred = $.Deferred();
            //var waitContainer = UI.showWaitIndicator(this.rightFormContainer);
            new NoteDataSource().getNotes(me.milestoneNotesVm.TaskID())
                .done(function (response) {
                if (response.Success) {
                    me.milestoneNotesVm.allNotes(response.Payload); //server side default sort
                    //filter per permission
                    var dataAfterFilter; // = new Array<INoteItem>();
                    if (me.milestoneNotesVm.hasAccessAllNotesPermission()) {
                        dataAfterFilter = me.milestoneNotesVm.allNotes();
                    }
                    else if (me.milestoneNotesVm.hasAccessOnlyExternalNotesPermission()) {
                        dataAfterFilter = ko.utils.arrayFilter(me.milestoneNotesVm.allNotes(), function (x) { return x.NoteTypeID == 2; });
                    }
                    //else { //internal
                    //    dataAfterFilter = ko.utils.arrayFilter(me.milestoneNotesVm.notes(), function (x: any) { return x.NoteTypeID == 1; });
                    //}
                    me.milestoneNotesVm.allNotes(dataAfterFilter);
                    ko.utils.arrayForEach(me.milestoneNotesVm.allNotes(), function (x, idx) { x.IsEdit = false; });
                    me.setShowNotes();
                    //_.forEach(me.milestoneNotesVm.notes, function (x: INoteItem) {
                    //    x.NoteDateTimeOnString = moment(x.NoteDateTimeOn()).format('MM/DD/YYYY HH:MM A');
                    //});
                    for (var i = 0; i < me.milestoneNotesVm.notes().length; i++) {
                        var note = me.milestoneNotesVm.notes()[i];
                        for (var j = 0; j < note.DocumentList.length; j++) {
                            var document = note.DocumentList[j];
                            document.URL = "";
                            document.Icon = "";
                        }
                    }
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    deferred.reject(response.Messages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_LOADING_MILESTONE_NOTE_DATA]);
                deferred.reject();
            })
                .always(function () {
                //UI.hideWaitIndicator(me.rightFormContainer, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        MilestoneNotesController.prototype.refreshNotes = function () {
            var me = this, deferred = $.Deferred();
            var waitContainer = UI.showWaitIndicator(me.rightFormContainer);
            me.loadNotes()
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_LOADING_MILESTONE_NOTE_DATA]);
                deferred.reject();
            })
                .always(function () {
                UI.hideWaitIndicator(me.rightFormContainer, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        MilestoneNotesController.prototype.sortNotes = function (sortByValue) {
            var me = this;
            //filter by deleted and sort 
            if (sortByValue == 1) {
                return me.milestoneNotesVm.notes.sort(me.sortByDate);
            }
            else if (sortByValue == 2) {
                return me.milestoneNotesVm.notes.sort(me.sortByNoteType);
            }
            else if (sortByValue == 3) {
                return me.milestoneNotesVm.notes.sort(me.sortByUser);
            }
        };
        MilestoneNotesController.prototype.sortByDate = function (x, y) {
            return (Date.parse(x.NoteDateTimeOn) == Date.parse(y.NoteDateTimeOn) ? 0 : (Date.parse(x.NoteDateTimeOn) > Date.parse(y.NoteDateTimeOn) ? 1 : -1));
        };
        MilestoneNotesController.prototype.sortByNoteType = function (x, y) {
            return (x.NoteType.toLowerCase() == y.NoteType.toLowerCase()) ? 0 : (x.NoteType.toLowerCase() > y.NoteType.toLowerCase() ? 1 : -1);
        };
        MilestoneNotesController.prototype.sortByUser = function (x, y) {
            return (x.ModifiedBy.toLowerCase() == y.ModifiedBy.toLowerCase()) ? 0 : (x.ModifiedBy.toLowerCase() > y.ModifiedBy.toLowerCase() ? 1 : -1);
        };
        MilestoneNotesController.prototype.setShowNotes = function () {
            var me = this, includeDeletedNotes;
            includeDeletedNotes = me.milestoneNotesVm.showDeletedNotes();
            if (!includeDeletedNotes) {
                var notes = me.milestoneNotesVm.allNotes().filter(me.isNotDeletedNote);
                me.milestoneNotesVm.notes(notes);
            }
            else {
                me.milestoneNotesVm.notes(me.milestoneNotesVm.allNotes());
            }
            me.sortNotes(me.milestoneNotesVm.selectedSortByValue());
        };
        MilestoneNotesController.prototype.isNotDeletedNote = function (value, index, thisArg) {
            return value.IsActive == true;
        };
        MilestoneNotesController.prototype.editNote = function (data) {
            var me = this, deferred = $.Deferred();
            if (!me.milestoneNotesVm.hasEditNotePermission())
                return;
            //check unsaved
            if ((me.haveFieldsChanged_1() & 2) == me.savedCode.unSavedInEdit) {
                UI.showConfirmDialog("There is unsaved note in editing. If you continue, any unsaved changes will be lost.  Do you wish to continue?", function () {
                    me.onNoteEdit(data);
                }, function () { }); //no
            }
            else {
                me.onNoteEdit(data);
            }
        };
        MilestoneNotesController.prototype.onNoteEdit = function (data) {
            var me = this;
            me.showSlider(data, true);
            //remove following to INoteItem
            // me.container.find(".uploadFilesEdit").prop('visible', false);
            me.milestoneNotesVm.displayUpload(false);
            //      me.editorBoxContainer.modal('show');
            me.milestoneNotesVm.editNoteLevelID(data.NoteLevelTypeID);
            me.milestoneNotesVm.editNoteTypeID(data.NoteTypeID);
            me.milestoneNotesVm.editNoteText(data.NoteText);
            me.milestoneNotesVm.editNoteDate(data.NoteDateTimeOnString);
            me.milestoneNotesVm.currentNoteID(data.NoteID);
            me.milestoneNotesVm.currentDocumentList(data.DocumentList);
            me.originalDocumentList = new Array();
            for (var i = 0; i < data.DocumentList.length; i++) {
                me.originalDocumentList.push(data.DocumentList[i]);
            }
            me.fieldsOnLoad = me.getFieldData(false);
        };
        MilestoneNotesController.prototype.deleteRestoreNote = function (data) {
            var me = this;
            if (!me.milestoneNotesVm.hasDeleteNotePermission())
                return;
            //check unsaved
            if ((me.haveFieldsChanged_1() & 2) == me.savedCode.unSavedInEdit) {
                UI.showConfirmDialog("There is unsaved note in editing. If you continue, any unsaved changes will be lost.  Do you wish to continue?", function () {
                    me.onNoteDeleteRestore(data);
                }, function () { }); //no
            }
            else {
                me.onNoteDeleteRestore(data);
            }
        };
        MilestoneNotesController.prototype.onNoteDeleteRestore = function (data) {
            var me = this;
            if (data.IsActive == true) {
                UI.showConfirmDialog('Are you sure you want to delete the note :"' + data.NoteText + '"?', function () { me.onDeleteOrRestoreNote(data, true); }, function () { return; });
            }
            else {
                me.onDeleteOrRestoreNote(data, false);
            }
        };
        MilestoneNotesController.prototype.onDeleteOrRestoreNote = function (data, isDeleteNote) {
            var me = this, deferred = $.Deferred();
            //affect note only instead of documents
            new NoteDataSource().deleteRestoreNote(data)
                .done(function (response) {
                if (response.Success) {
                    if (isDeleteNote == true) {
                        UI.showNotificationMessage("The note has been deleted.", UI.messageTypeValues.success);
                    }
                    else {
                        UI.showNotificationMessage("The note has been restored.", UI.messageTypeValues.success);
                    }
                    //me.loadNotes();
                    me.refreshNotes();
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_SAVING_MILESTONE_NOTE_DATA]);
                deferred.resolve();
            })
                .always(function () {
                // UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        MilestoneNotesController.prototype.saveNote = function () {
            var me = this, deferred = $.Deferred(), note;
            //var waitContainer = UI.showWaitIndicator(this.rightFormContainer);
            me.container.find("[data-id='saveButton']").prop('disabled', true);
            var currentValue = me.getFieldData(false);
            if (me.doValidation(false) && me.fieldsOnLoad != currentValue) {
                var data = me.createSaveParam(false);
                new NoteDataSource().editNote(data)
                    .done(function (response) {
                    if (response.Success) {
                        UI.showNotificationMessage("The note has been saved.", UI.messageTypeValues.success);
                        //me.loadNotes();
                        me.refreshNotes();
                        //     me.milestoneNotesVm.NewDocuments.removeAll();
                        //     me.resetUploadFileOnEdit();
                        //     me.editorBoxContainer.modal('hide');
                        me.showSlider(data, false);
                        //me.fieldsOnLoad = currentValue;
                        me.clearEditPanl();
                        me.milestoneNotesVm.errorsInSaveNote.showAllMessages(false);
                    }
                    else {
                        UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    }
                })
                    .fail(function () {
                    UI.showErrorMessage([UI.PHRASE_FAILED_SAVING_MILESTONE_NOTE_DATA]);
                    deferred.resolve();
                })
                    .always(function () {
                    // UI.hideWaitIndicator(me.container, waitContainer);
                    me.container.find("[data-id='saveButton']").prop('disabled', false);
                    deferred.resolve();
                });
            }
            else {
                me.container.find("[data-id='saveButton']").prop('disabled', false);
            }
            return deferred.promise();
        };
        MilestoneNotesController.prototype.saveDocument = function (data) {
            var me = this;
            //add to currentDocumentList
            for (var i = 0; i < me.milestoneNotesVm.NewDocuments().length; i++) {
                var document = {
                    TaskID: me.milestoneNotesVm.TaskID(),
                    ContractID: 0,
                    NoteID: me.milestoneNotesVm.currentNoteID(),
                    FileLocation: me.milestoneNotesVm.NewDocuments()[i].FileLocation,
                    FileName: me.milestoneNotesVm.NewDocuments()[i].FileName,
                    UniqueID: me.milestoneNotesVm.NewDocuments()[i].UniqueID,
                    ConcurrencyHash: "",
                    URL: "",
                    Icon: ""
                };
                me.milestoneNotesVm.currentDocumentList.push(document);
            }
            me.milestoneNotesVm.NewDocuments.removeAll();
            me.resetUploadFileOnEdit(null);
            me.editorBoxContainer.modal('hide');
            me.milestoneNotesVm.displayUpload(false);
        };
        MilestoneNotesController.prototype.cancelDocument = function (data) {
            var me = this;
            debugger;
            me.RemoveDocumentFromUploading(true, null);
            for (var i = 0; i < me.milestoneNotesVm.NewDocuments().length; i++) {
                var fileName = me.milestoneNotesVm.NewDocuments()[i].FileName;
                var fileID = me.milestoneNotesVm.NewDocuments()[i].UniqueID;
                me.deleteDocumentFromS3(fileName, fileID);
            }
            me.milestoneNotesVm.displayUpload(false);
        };
        MilestoneNotesController.prototype.showSlider = function (data, enable) {
            var me = this, index, updataNote;
            //close others
            var openedEdit = me.milestoneNotesVm.notes().filter(function (x) { return x.IsEdit == true; });
            for (var i = 0; i < openedEdit.length; i++) {
                index = me.milestoneNotesVm.notes.indexOf(openedEdit[i]);
                updataNote = me.milestoneNotesVm.notes.splice(index, 1)[0];
                updataNote.IsEdit = false;
                me.milestoneNotesVm.notes.splice(index, 0, updataNote);
            }
            //enable
            index = me.milestoneNotesVm.notes.indexOf(data);
            updataNote = me.milestoneNotesVm.notes.splice(index, 1)[0];
            updataNote.IsEdit = enable;
            me.milestoneNotesVm.notes.splice(index, 0, updataNote);
        };
        MilestoneNotesController.prototype.clearEditPanl = function () {
            var me = this;
            me.milestoneNotesVm.displayUpload(false);
            me.milestoneNotesVm.editNoteLevelID(-1);
            me.milestoneNotesVm.editNoteTypeID(-1);
            me.milestoneNotesVm.editNoteText("");
            me.milestoneNotesVm.editNoteDate("");
            me.milestoneNotesVm.currentNoteID();
            me.milestoneNotesVm.currentDocumentList();
            me.fieldsOnLoad = null;
        };
        MilestoneNotesController.prototype.doValidation = function (isNew) {
            var me = this, isValid = true;
            UI.blurActiveElement();
            if (isNew) {
                if (isValid && me.milestoneNotesVm.errorsInAddNote().length > 0) {
                    me.milestoneNotesVm.errorsInAddNote.showAllMessages();
                    isValid = false;
                }
                ;
            }
            else {
                if (isValid && me.milestoneNotesVm.errorsInSaveNote().length > 0) {
                    me.milestoneNotesVm.errorsInSaveNote.showAllMessages();
                    isValid = false;
                }
                ;
            }
            return isValid;
        };
        MilestoneNotesController.prototype.getFieldData = function (isNew) {
            var me = this, inputData = null;
            if (isNew) {
                var fileList = me.milestoneNotesVm.NewDocuments().map(me.getFileUniqueID);
                inputData = {
                    selectedLevelID: me.milestoneNotesVm.selectedNoteLevelID(),
                    selectedTypeID: me.milestoneNotesVm.selectedNoteTypeID(),
                    noteDate: me.milestoneNotesVm.newNoteDate(),
                    noteText: me.milestoneNotesVm.newNoteText(),
                    files: fileList,
                };
            }
            else {
                var fileList = me.milestoneNotesVm.currentDocumentList().map(me.getFileUniqueID);
                inputData = {
                    selectedLevelID: me.milestoneNotesVm.editNoteLevelID(),
                    selectedTypeID: me.milestoneNotesVm.editNoteTypeID(),
                    noteDate: me.milestoneNotesVm.editNoteDate(),
                    noteText: me.milestoneNotesVm.editNoteText(),
                    files: fileList,
                };
            }
            return ko.toJSON(inputData);
        };
        MilestoneNotesController.prototype.getFileUniqueID = function (x) {
            return x.UniqueID;
        };
        MilestoneNotesController.prototype.confirmClose = function () {
            var app = Global.App(), me = this;
            if (((me.haveFieldsChanged_1() & 3) != me.savedCode.saved)) {
                var message = "If you continue, any unsaved change in adding or editing will be lost.  Do you wish to close?";
                var SessionWindow = $("#notificationWindow")
                    .dialog({
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
                            me.closeTab();
                        },
                        "No": function () {
                            SessionWindow.dialog("close");
                        }
                    }
                });
                SessionWindow.html(message);
                SessionWindow.dialog("open");
            }
            else {
                me.closeTab();
            }
        };
        //========document related
        MilestoneNotesController.prototype.loadClientID = function () {
            var me = this, deferred = $.Deferred();
            ;
            new MilestoneGridColumnsDataSource().getClientID(me.milestoneNotesVm.TaskID())
                .done(function (response) {
                if (response.Success) {
                    var clientID = response.Payload;
                    me.milestoneNotesVm.clientID(clientID);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    deferred.reject(response.Messages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_LOADING_MILESTONE_NOTETYPE_DATA]);
                deferred.reject();
            });
        };
        MilestoneNotesController.prototype.setUploadWidget = function () {
            var me = this;
            //add panel
            me.container.find(".uploadFiles").kendoUpload({
                async: {
                    saveUrl: "save",
                    removeUrl: "remove",
                    autoUpload: true,
                    batch: false
                },
                upload: _.bind(me.onUpload, me),
                select: _.bind(me.onSelect, me),
                complete: _.bind(me.onComplete, me),
                remove: _.bind(me.onRemove, me),
                ////error: _.bind(me.onError, me),
                cancel: _.bind(me.onRemove, me),
                multiple: true,
                enabled: me.milestoneNotesVm.hasAddNotePermission()
            });
            //edit panel
            me.container.find(".uploadFilesEdit").kendoUpload({
                async: {
                    saveUrl: "save",
                    removeUrl: "remove",
                    autoUpload: true,
                    batch: false
                },
                upload: _.bind(me.onUpload, me),
                select: _.bind(me.onSelect, me),
                complete: _.bind(me.onComplete, me),
                remove: _.bind(me.onRemove, me),
                ////error: _.bind(me.onError, me),
                cancel: _.bind(me.onRemove, me),
                multiple: true,
                enabled: me.milestoneNotesVm.hasEditNotePermission()
            });
        };
        MilestoneNotesController.prototype.onSelect = function (e) {
            var me = this;
            if (e.files.length > 0) {
                for (var i = 0; i < e.files.length; i++) {
                }
            }
        };
        MilestoneNotesController.prototype.onUpload = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", fileParts, fileID = "";
            //k - icon k- i - close k- cancel
            //Disable the client timeout and start a heart beat to keep server session alive... AR
            var timer = Util.startHeartBeat(30000);
            app.sessionTimeoutDisabled = true;
            //for model ?
            //me.container.find("[data-id='uploadSaveButton']").prop('disabled', true);
            //me.container.find(".uploadFiles").prop('disabled', true);
            if (e.files.length > 0) {
                var lastIndex = e.files[0].name.lastIndexOf('.');
                fileName = e.files[0].name.substr(0, lastIndex);
                extension = e.files[0].name.substr(lastIndex + 1);
                // fileName = fileParts[fileParts.length - 2];
                //extension = fileParts[fileParts.length - 1];
                fileID = e.files[0].uid;
            }
            var xhr = e.XMLHttpRequest;
            if (xhr) {
                xhr.addEventListener("readystatechange", function (e) {
                    if (xhr.readyState == XMLHttpRequest.OPENED /* OPENED */) {
                        xhr.setRequestHeader("RequestVerificationToken", getCSRFToken());
                        xhr.setRequestHeader("Authorization", 'token ' + Util.getAuthenticationToken());
                        xhr.setRequestHeader("DSC", Util.getDSC());
                    }
                    //debugger;
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        //Check if a refresh token exists within the response
                        //If so, update our refresh token cookie and DSC
                        var jsonObj = JSON.parse(xhr.response);
                        var refreshToken = jsonObj.RefreshToken;
                    }
                });
            }
            me.milestoneNotesVm.FileName(fileName + '.' + extension);
            me.milestoneNotesVm.FileNameDecoded(fileName.split("&amp;").join("&") + '.' + extension);
            me.milestoneNotesVm.FileNameDecoded(fileName.split("&#39;").join("'") + '.' + extension);
            me.milestoneNotesVm.FileGuid(fileID);
            var clientID = me.milestoneNotesVm.clientID();
            e.sender.options.async.saveUrl = url + "/api/MilestoneNote/UploadDocument/" + clientID + "/" + extension + "/" + fileID;
            //console.log(me.milestoneNotesVm.FileName());
            var document = {
                FileName: me.milestoneNotesVm.FileName(),
                FileNameDecoded: me.milestoneNotesVm.FileNameDecoded(),
                FileLocation: 'attachment/Task Manager/admClient/' + clientID,
                UniqueID: me.milestoneNotesVm.FileGuid(),
            };
            me.milestoneNotesVm.NewDocuments.push(me.createDocument(document));
        };
        MilestoneNotesController.prototype.onRemove = function (e) {
            var me = this, app = Global.App(), deferred = $.Deferred(), fileName = "", fileID = "";
            //debugger;
            if (e.files.length > 0) {
                fileName = e.files[0].name;
                fileID = e.files[0].uid;
                me.RemoveDocumentFromUploading(me.milestoneNotesVm.displayUpload(), fileID);
                me.deleteDocumentFromS3(fileName, fileID);
            }
        };
        MilestoneNotesController.prototype.onCancel = function (e) {
            var me = this, fileName = "", fileID = "";
            if (e.files.length > 0) {
                fileName = e.files[0].name;
                fileID = e.files[0].uid;
                me.RemoveDocumentFromUploading(true, null);
                me.deleteDocumentFromS3(fileName, fileID);
            }
        };
        MilestoneNotesController.prototype.onComplete = function (e) {
            var me = this, global = Global.App();
            Util.stopHeartBeat();
            global.sessionTimeoutDisabled = false;
            //console.log("onComplete");
        };
        MilestoneNotesController.prototype.onError = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", deferred = $.Deferred(), fileParts, fileID = "";
            if (e.files.length > 0) {
                // 
                var lastIndex = e.files[0].name.lastIndexOf('.');
                fileName = e.files[0].name.substr(0, lastIndex);
                extension = e.files[0].name.substr(lastIndex + 1);
                fileID = e.files[0].uid;
                var errmessage = "Error uploading one or more files. ";
                UI.showErrorMessage([errmessage]);
                UI.showNotificationMessage(errmessage, UI.messageTypeValues.error);
                //me.container.find(".k-upload-files.k-reset").find("li[data-uid='" + e.files[0].uid + "']").remove();
                //var attachment = ko.utils.arrayFirst(me.milestoneNotesVm.NewDocuments(), function (document: any) {
                //    return document.UniqueID() === e.files[0].uid;
                //});
                me.removeDocumentFromDocumentList(e.files[0].uid);
            }
        };
        MilestoneNotesController.prototype.createDocument = function (document) {
            var me = this;
            var vmDocument = {
                TaskID: me.milestoneNotesVm.TaskID(),
                ContractID: 0,
                NoteID: 0,
                FileLocation: document.FileLocation,
                FileName: document.FileName,
                UniqueID: document.UniqueID,
            };
            //console.log(vmDocument.FileName() + "," + vmDocument.UniqueID());
            return vmDocument;
        };
        MilestoneNotesController.prototype.createSaveParam = function (isNew) {
            var me = this;
            var documentLsit = new Array();
            //NewDocuments for upload widget share by new and edit
            for (var i = 0; i < me.milestoneNotesVm.NewDocuments().length; i++) {
                var documentParam = {
                    TaskID: me.milestoneNotesVm.TaskID(),
                    ContractID: 0,
                    NoteID: 0,
                    FileLocation: me.milestoneNotesVm.NewDocuments()[i].FileLocation,
                    FileName: me.milestoneNotesVm.NewDocuments()[i].FileName,
                    UniqueID: me.milestoneNotesVm.NewDocuments()[i].UniqueID,
                };
                documentLsit.push(documentParam); //me.createDocument(document)
            }
            if (!isNew) {
                for (var i = 0; i < me.milestoneNotesVm.currentDocumentList().length; i++) {
                    var documentParam = {
                        TaskID: me.milestoneNotesVm.TaskID(),
                        ContractID: 0,
                        NoteID: 0,
                        FileLocation: me.milestoneNotesVm.currentDocumentList()[i].FileLocation,
                        FileName: me.milestoneNotesVm.currentDocumentList()[i].FileName,
                        UniqueID: me.milestoneNotesVm.currentDocumentList()[i].UniqueID,
                    };
                    documentLsit.push(documentParam); //me.createDocument(document)
                }
            }
            //get note's concurrencyHash
            var currentNote;
            if (!isNew) {
                currentNote = ko.utils.arrayFilter(me.milestoneNotesVm.notes(), function (x) { return x.NoteID == me.milestoneNotesVm.currentNoteID(); })[0];
            }
            ;
            var saveParam = {
                NoteID: isNew ? 0 : me.milestoneNotesVm.currentNoteID(),
                NoteLevelTypeID: isNew ? me.milestoneNotesVm.selectedNoteLevelID() : me.milestoneNotesVm.editNoteLevelID(),
                NoteTypeID: isNew ? me.milestoneNotesVm.selectedNoteTypeID() : me.milestoneNotesVm.editNoteTypeID(),
                NoteDateTimeOn: isNew ? me.milestoneNotesVm.newNoteDate() : me.milestoneNotesVm.editNoteDate(),
                NoteText: isNew ? me.milestoneNotesVm.newNoteText() : me.milestoneNotesVm.editNoteText(),
                IsActive: true,
                ContractID: 0,
                TaskID: me.milestoneNotesVm.TaskID(),
                ConcurrencyHash: isNew ? "" : currentNote.ConcurrencyHash,
                DocumentList: documentLsit
            };
            return saveParam;
        };
        //private Remove() {
        //    var me = this;
        //    //clear upload file list on kendo
        //    me.resetUploadFile();
        //    me.resetUploadFileOnEdit();
        //    me.milestoneNotesVm.NewDocuments.removeAll();
        //}
        MilestoneNotesController.prototype.resetUploadFile = function (fileUID) {
            var me = this;
            //debugger;
            if (fileUID != undefined || fileUID != null) {
                //me.container.find(".uploadFiles").parents(".t-upload").find(".t-upload-files").remove(); //doesn't work
                me.container.find(".k-upload-files.k-reset").find("li[data-uid='" + fileUID + "']").remove(); //work but there is line left
                me.removeDocumentFromDocumentList(fileUID);
            }
            else {
                var up = me.container.find(".uploadFiles").data().kendoUpload;
                var allLiElementsToBeRemoved = up.wrapper.find('.k-file');
                up._removeFileEntry(allLiElementsToBeRemoved);
                me.milestoneNotesVm.NewDocuments.removeAll();
            }
        };
        MilestoneNotesController.prototype.resetUploadFileOnEdit = function (fileUID) {
            var me = this;
            debugger;
            if (fileUID != undefined || fileUID != null) {
                var up = me.container.find(".uploadFilesEdit").data().kendoUploa;
                me.container.find(".k-upload-files.k-reset").find("li[data-uid='" + fileUID + "']").remove(); //work but there is line left
                me.removeDocumentFromDocumentList(fileUID);
            }
            else {
                var up = me.container.find(".uploadFilesEdit").data().kendoUpload;
                var allLiElementsToBeRemoved = up.wrapper.find('.k-file');
                up._removeFileEntry(allLiElementsToBeRemoved);
            }
        };
        MilestoneNotesController.prototype.removeDocumentFromDocumentList = function (fileUID) {
            var me = this;
            var attachment = null;
            for (var i = 0; i < me.milestoneNotesVm.NewDocuments().length; i++) {
                if (me.milestoneNotesVm.NewDocuments()[i].UniqueID == fileUID) {
                    attachment = me.milestoneNotesVm.NewDocuments()[i];
                    break;
                }
            }
            if (attachment != null) {
                me.milestoneNotesVm.NewDocuments.remove(attachment);
            }
        };
        MilestoneNotesController.prototype.RemoveDocumentFromUploading = function (inEdit, fileUniqueID) {
            var me = this;
            //clear upload file list on kendo
            if (inEdit) {
                me.resetUploadFileOnEdit(fileUniqueID);
            }
            else {
                me.resetUploadFile(fileUniqueID);
            }
        };
        MilestoneNotesController.prototype.downloadDocument = function (data) {
            var me = this, url = ConfigOptions.baseURL;
            //    deferred = $.Deferred();
            debugger;
            var documentUrl = url + "/api/MilestoneNote/DownloadDocument/" + me.milestoneNotesVm.clientID() + "/" + data.UniqueID + "/" + me.milestoneNotesVm.TaskID() + "/" + data.NoteID;
            window.location.assign(documentUrl);
        };
        MilestoneNotesController.prototype.deleteDocument = function (data) {
            var me = this;
            //ko.utils.arrayRemoveItem(me.milestoneNotesVm.currentDocumentList(), data);// doesn't affect UI
            me.milestoneNotesVm.currentDocumentList.remove(data); //do not delete in S3 yet
            //var currentNote = me.milestoneNotesVm.notes()[me.milestoneNotesVm.currentNoteID()];
            //currentNote.currentDocumentList.remove(data);//do not delete in S3 yet
        };
        MilestoneNotesController.prototype.deleteDocumentFromS3 = function (fileName, fileID) {
            var me = this, deferred = $.Deferred();
            var clientID = me.milestoneNotesVm.clientID();
            var documentParam = {
                TaskID: me.milestoneNotesVm.TaskID(),
                ContractID: 0,
                NoteID: 0,
                FileLocation: 'attachment/Task Manager/admClient/' + clientID,
                FileName: fileName,
                UniqueID: fileID
            };
            new NoteDataSource().removeDocument({
                ClientID: clientID,
                Document: documentParam
            })
                .done(function (response) {
                if (response.Success) {
                }
                else {
                    UI.showErrorMessage(response.ErrorMessages);
                }
            })
                .always(function () {
                deferred.resolve();
            });
            return deferred.promise();
        };
        MilestoneNotesController.prototype.addDocument = function () {
            var me = this;
            //me.container.find(".uploadFilesEdit").prop('visible', true);
            me.milestoneNotesVm.displayUpload(true);
            if (me.milestoneNotesVm.NewDocuments().length > 0) {
                var warningMessage = "You left uploading file in adding note. Please remove or save it with adding note.";
                var SessionWindow = $("#notificationWindow")
                    .dialog({
                    dialogClass: "no-close",
                    title: "Warning",
                    autoOpen: false,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    buttons: {
                        "OK": function () {
                            SessionWindow.dialog("close");
                        }
                    }
                });
                SessionWindow.html(warningMessage);
                SessionWindow.dialog("open");
                return;
            }
            me.milestoneNotesVm.NewDocuments.removeAll();
            me.editorBoxContainer.modal('show');
        };
        return MilestoneNotesController;
    }());
    MilestoneNotes.MilestoneNotesController = MilestoneNotesController; //end class
})(MilestoneNotes || (MilestoneNotes = {}));
//# sourceMappingURL=MilestoneNotes.js.map