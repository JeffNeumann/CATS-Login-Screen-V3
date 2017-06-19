var ARHistory;
(function (ARHistory) {
    var ConfigOptions = new Configuration.TaskManager_Config();
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "ARHistory";
    var TEMPLATE_LIST = "template_arhistoryTemplate";
    var TEMPLATE_NOTE_TOOLTIP = "notesToolTipTemplate";
    var HistoryGridListDataSource = (function () {
        function HistoryGridListDataSource() {
        }
        HistoryGridListDataSource.prototype.getDataSource = function (id) {
            var deferred = $.Deferred(), me = this;
            var dataSource = Data.createWebServiceDataSourcePost(Util.BuildURL([ConfigOptions.baseURL, "History", "GetHistoryGridData"]), {
                id: "ID",
                fields: {
                    ID: { type: "number" },
                    TaskID: { type: "number" },
                    StatusName: { type: "string" },
                    ActionName: { type: "string" },
                    DateEntered: { type: "date" },
                    DateEnteredOn: { type: "date" },
                    MilestoneName: { type: "string" },
                    ProcessingStepName: { type: "string" },
                    Notes: { type: "string" },
                    DateTimeCreatedOn: { type: "date" },
                    DateTimeModifiedOn: { type: "date" },
                    CreatedBy: { type: "string" },
                    CreatedFor: { type: "string" },
                    ModifiedBy: { type: "string" },
                },
            }, function (data) {
                data.TaskID = id;
            });
            deferred.resolve(dataSource);
            // deferred.resolve();
            return deferred.promise();
        };
        return HistoryGridListDataSource;
    }());
    ARHistory.HistoryGridListDataSource = HistoryGridListDataSource;
    ;
    function SaveNotes(data) {
        return Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "History", "SaveHistoryNotes"]), "POST", data);
    }
    ARHistory.SaveNotes = SaveNotes;
    // Controller
    var ARHistoryController = (function () {
        function ARHistoryController() {
            this.fieldsOnLoad = null;
            this.gridModel = { DataSource: new kendo.data.DataSource, Permissions: [] };
            this.PAGE_SIZE = 100;
            var me = this;
            this.historyVm = {
                ID: ko.observable(),
                TaskID: ko.observable(),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                close: function (e) {
                    me.exit();
                },
                isEditPermission: ko.observable(),
                ContractCode: ko.observable(),
                PropertyCode: ko.observable(),
                PropertyName: ko.observable(),
                Status: ko.observable(),
                TaskTypeName: ko.observable(),
                DisplayKeyDate: ko.observable(),
                noteID: ko.observable(),
                notesText: ko.observable(),
                concurrencyHash: ko.observable(),
                saveNotes: function (e) {
                    me.saveNotes();
                },
            };
            $(window).resize(function () {
                me.resize();
            });
        }
        ARHistoryController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                //me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                //ko.cleanNode(me.rightFormContainer[0]);
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.historyVm, me.container[0]);
                me.historyVm.notesText("");
                me.editorBoxContainer = me.container.find("div[data-id='editorModal']");
                me.gridContainer = me.container.find("div[data-id='grid']");
                me.buildGrid(moduleName, moduleArea);
                deferred.resolve();
            });
            return deferred.promise();
        };
        ARHistoryController.prototype.renderAndLoad = function (container, moduleName, moduleArea, loadParams) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            me.historyVm.TaskID(loadParams.taskID);
            me.historyVm.ContractCode(loadParams.ContractCode);
            me.historyVm.PropertyName(loadParams.PropertyName);
            me.historyVm.Status(loadParams.Status);
            me.historyVm.TaskTypeName(loadParams.TaskTypeName);
            me.historyVm.PropertyCode(loadParams.PropertyCode);
            me.historyVm.DisplayKeyDate(loadParams.KeyDate);
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                //me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                //ko.cleanNode(document.getElementById("rightFormContainer"));
                ko.cleanNode(me.container[0]); //necessary for multiple pages opening
                ko.applyBindings(me.historyVm, me.container[0]);
                me.historyVm.notesText("");
                me.editorBoxContainer = me.container.find("div[data-id='editorModal']");
                me.gridContainer = me.container.find("div[data-id='grid']");
                me.saveNotesButton = me.container.find("[data-id='saveButton']");
                me.getButtonPermissions();
                me.buildGrid(moduleName, moduleArea);
                me.loadGrid(me.historyVm.TaskID());
                //me.showColumns(!me.historyVm.isEditPermission(), me.grid);
                me.resize();
                deferred.resolve();
            });
            return deferred.promise();
        };
        ARHistoryController.prototype.load = function (loadParams) {
            var app = Global.App(), me = this, dataSource = new ARHistory.HistoryGridListDataSource(), deferred = $.Deferred();
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            var deferred = $.Deferred();
            me.historyVm.TaskID(loadParams.taskID);
            me.historyVm.ContractCode(loadParams.ContractCode);
            me.historyVm.PropertyName(loadParams.PropertyName);
            me.historyVm.PropertyCode(loadParams.PropertyCode);
            me.historyVm.DisplayKeyDate(loadParams.KeyDate);
            me.loadGrid(loadParams.taskID);
            return deferred.promise();
        };
        //Load the data for the specified record
        ARHistoryController.prototype.loadRecord = function (id) {
            var deferred = $.Deferred();
            deferred.resolve();
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        ARHistoryController.prototype.haveFieldsChanged = function () {
            return false;
        };
        //Resizes the control-Old not used
        ARHistoryController.prototype.heightX = function (height) {
            var smallerScreenAdditional = -130;
            if ($(window).width() < 980) {
                smallerScreenAdditional = 50;
            }
            //this.listViewContainer.height(height + smallerScreenAdditional);
        };
        //Returns a unique ID for this controller
        ARHistoryController.prototype.appRouterID = function (id) {
            return "History";
        };
        //Returns a title for the page
        ARHistoryController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - History";
        };
        ARHistoryController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        ARHistoryController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        ARHistoryController.prototype.resize = function () {
            var me = this;
            var height = me.workspaceHeight();
            me.height(height);
        };
        //resizes the left nav list
        ARHistoryController.prototype.height = function (height) {
            var me = this;
            var gridHeight = height;
            if (height > 150) {
                gridHeight = height - 150;
            }
            if (me.gridContainer != undefined) {
                UI.resizeGrid(me.gridContainer, gridHeight);
            }
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        ARHistoryController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        //called when page is already loaded, but is being redisplayed
        ARHistoryController.prototype.reload = function (params) {
            var deferred = $.Deferred();
            //this.load();
            this.grid.dataSource.read();
            deferred.resolve();
            return deferred.promise();
        };
        ARHistoryController.prototype.refresh = function () {
            var deferred = $.Deferred();
            this.grid.dataSource.read();
            deferred.resolve();
            return deferred.promise();
        };
        ARHistoryController.prototype.exit = function () {
            var app = Global.App(), me = this;
            var id = me.historyVm.TaskID();
            if (id > 0) {
                app.router().closeTab("TaskManager/Main" + "/" + id);
            }
            else {
                app.router().closeTab("TaskManager/Main");
            }
        };
        ARHistoryController.prototype.buildGrid = function (moduleName, moduleArea) {
            var me = this, app = Global.App();
            //Create the grid
            var columns = [
                { field: "StatusName", title: "Status" },
                { field: "ActionName", title: "Action" },
                {
                    field: "DateEnteredOn", title: "Date Entered",
                    template: "#= (kendo.toString(DateEnteredOn, 'MM/dd/yyyy') == '01/01/0001') ? ' ' : kendo.toString(DateEnteredOn, 'MM/dd/yyyy hh:mm:ss tt') #",
                    exportFormat: "MM/dd/yyyy hh:mm tt"
                },
                { field: "CreatedBy", title: "Completed By" },
                {
                    field: "DateTimeCreatedOn", title: "Completion Date",
                    template: "#= kendo.toString(DateTimeCreatedOn, 'MM/dd/yyyy hh:mm:ss tt') #",
                    exportFormat: "MM/dd/yyyy hh:mm tt"
                },
                { field: "ModifiedBy", title: "Modified By" },
                { field: "CreatedFor", title: "On Behalf Of" },
                {
                    field: "DateTimeModifiedOn", title: "Modified Date",
                    template: "#= kendo.toString(DateTimeModifiedOn, 'MM/dd/yyyy hh:mm:ss tt') #",
                    exportFormat: "MM/dd/yyyy hh:mm tt"
                },
                {
                    field: "Notes", title: "Notes",
                    attributes: {
                        "class": "notes-overflow"
                    }
                },
                { field: "MilestoneName", title: "Milestone" },
                { field: "TimeZoneAbbr", title: "Zone", width: "80px" },
                //{ command: [{ name: "Editor", text: "", imageClass: "fa fa-pencil-square-o", title: "Edit", click: goToEditor }], title: "Edit Notes" }
                {
                    field: "", title: "Action", width: "60px",
                    template: kendo.template($("#template_grid_actions").html()),
                }
            ];
            me.dataSource = new kendo.data.DataSource();
            function integerFilter(element) {
                element.kendoNumericTextBox({
                    format: "n0"
                });
            }
            ;
            function goToEditor(e) {
                e.preventDefault();
                var tr = $(e.target).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = me.grid.dataItem(tr);
                me.historyVm.notesText(data.Notes);
                me.historyVm.noteID(data.ID);
                me.historyVm.concurrencyHash(data.ConcurrencyHash);
                me.fieldsOnLoad = data.Notes;
                me.saveNotesButton.prop('disabled', !me.historyVm.isEditPermission());
                me.editorBoxContainer.modal('show');
            }
            ;
            me.grid = me.gridContainer.kendoGrid({
                //to do: security
                //dataBound: function (e) {
                //    }
                //},
                dataSource: {
                    schema: {
                        model: {
                            id: "ID",
                            fields: {
                                ID: { type: "number" },
                                TaskID: { type: "number" },
                                StatusName: { type: "string" },
                                ActionName: { type: "string" },
                                DateEnteredOn: { type: "date" },
                                CreatedBy: { type: "string" },
                                CreatedOn: { type: "date" },
                                ModifiedBy: { type: "string" },
                                CreatedFor: { type: "string" },
                                ModifiedOn: { type: "date" },
                                TimeZoneAbbr: { type: "string" },
                                Notes: { type: "string" },
                                ShortNotes: { type: "string" },
                                MileStoneName: { type: "string" }
                            }
                        }
                    }
                },
                selectable: false,
                sortable: true,
                //filterable: true,
                //height: 435,
                filterable: {
                    extra: true,
                    operators: {
                        string: {
                            contains: "Contain",
                            startswith: "Start with",
                            eq: "Equal to",
                            neq: "Not equal to",
                            doesnotcontain: "Not contain",
                            endswith: "End with",
                        },
                        number: {
                            eq: "Equal to",
                            neq: "Not equal to",
                            gte: "Greater than or equal to",
                            gt: "Greater than",
                            lte: "Less than or equal to",
                            lt: "Less than"
                        },
                        date: {
                            eq: "Equal to",
                            neq: "Not equal to",
                            gte: "After or equal to",
                            gt: "After",
                            lte: "Before or equal to",
                            lt: "Before"
                        },
                        enums: {
                            eq: "Equal to",
                            neq: "Not equal to"
                        }
                    }
                },
                resizable: true,
                scrollable: true,
                reorderable: true,
                pageable: {
                    pageSize: me.PAGE_SIZE,
                    //pageSizes: [me.PAGE_SIZE, 500, 1000],
                    // previousNext: false,
                    numeric: false,
                },
                columns: columns,
            }).data("kendoGrid");
            me.setNotesToolTip2();
            //edit button 
            me.grid.table.on('click', '.history_grid_edit', function (e) {
                e.preventDefault();
                goToEditor(e);
            });
        };
        ARHistoryController.prototype.loadGrid = function (id) {
            var me = this, deferred = $.Deferred();
            me.gridDataSource = new HistoryGridListDataSource();
            me.gridDataSource
                .getDataSource(id)
                .done(function (model) {
                //
                me.grid.setDataSource(model.DataSource);
                me.gridModel = model;
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_PAGELOADERROR]);
                deferred.reject();
            })
                .always(function () {
                deferred.resolve();
            });
            return deferred.promise();
        };
        ARHistoryController.prototype.setNotesToolTip2 = function () {
            var me = this;
            this.gridContainer.kendoTooltip({
                filter: "td:nth-child(9)",
                position: "center",
                //width: 300,
                content: function (e) {
                    //
                    var dataItem = me.gridContainer.data("kendoGrid").dataItem(e.target.closest("tr"));
                    var content = dataItem.get("Notes");
                    //return content;
                    var width = content.length * 0.8 > 200 ? content.length * 0.8 : 200;
                    return '<div style="width: ' + width + 'px;">' + content + '</div>';
                }
            }).data("kendoTooltip");
        };
        ARHistoryController.prototype.saveNotes = function () {
            var me = this, deferred = $.Deferred();
            if (me.fieldsOnLoad === me.historyVm.notesText()) {
                UI.showNotificationMessage("No changes on the notes.", UI.messageTypeValues.info);
                return;
            }
            //var waitContainer = UI.showWaitIndicator(this.container);
            me.saveNotesButton.prop('disabled', true);
            var data = { ID: me.historyVm.noteID(), Notes: me.historyVm.notesText(), ConcurrencyHash: me.historyVm.concurrencyHash() };
            ARHistory.SaveNotes(data)
                .done(function (response) {
                if (response.Success) {
                    //
                    me.grid.dataSource.read();
                    UI.showNotificationMessage("The notes has been saved.", UI.messageTypeValues.success);
                    me.editorBoxContainer.modal('hide');
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                }
            })
                .fail(function () {
                UI.showErrorMessage([UI.PHRASE_FAILED_SAVING_HISTORY_NOTES_DATA]);
                deferred.resolve();
            })
                .always(function () {
                // UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        ARHistoryController.prototype.getButtonPermissions = function () {
            var app = Global.App(), me = this, deferred = $.Deferred();
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "History", "GetButtonPermissions"]), "GET")
                .done(function (response) {
                //
                if (response.Success) {
                    var permissions = response.Permissions;
                    me.historyVm.isEditPermission(permissions && permissions["SaveHistoryNotes"] != undefined);
                }
                else {
                    UI.showErrorMessage(response.Messages, response.ErrorMessages);
                    deferred.reject(response.Messages);
                }
            })
                .fail(function () {
                UI.showErrorMessage(["Failed to load the screen."]);
                deferred.reject();
            });
        };
        ARHistoryController.prototype.showColumns = function (isHidden, grid) {
            if (isHidden) {
                grid.hideColumn("Editor");
            }
            else {
                grid.showColumn("Editor");
            }
        };
        ARHistoryController.prototype.workspaceHeight = function () {
            var height = $(window).height() - 150;
            if (height < 0) {
                height = 0;
            }
            if ($(window).width() <= 480) {
                height = height - 45;
            }
            return height;
        };
        return ARHistoryController;
    }());
    ARHistory.ARHistoryController = ARHistoryController;
})(ARHistory || (ARHistory = {}));
//# sourceMappingURL=ARHistory.js.map