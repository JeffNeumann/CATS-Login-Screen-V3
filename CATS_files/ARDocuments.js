var ARDocuments;
(function (ARDocuments) {
    var ConfigOptions = new Configuration.DM_Config();
    function getCSRFToken() {
        var csrfToken = $('#forgeryToken').val();
        return csrfToken;
    }
    ARDocuments.getCSRFToken = getCSRFToken;
    //-------------------------------------------------------------------------------
    // Constants/Templates name
    var TEMPLATE_FILE_NAME = "ARDocuments";
    var TEMPLATE_LIST = "template_ardocumentsTemplate";
    // Controller
    var ARDocumentsController = (function () {
        function ARDocumentsController() {
            this.fieldsOnLoad = null;
            this.descending = "fa fa-arrow-down";
            this.ascending = "fa fa-arrow-up";
            var me = this;
            this.documentVm = {
                ID: ko.observable(0),
                pageSize: ko.observable(15),
                pageIndex: ko.observable(0),
                totalPages: ko.observable(0),
                togglePageLeftRight: function (e) {
                    me.togglePageLeftRight();
                },
                totalPagesHolder: ko.observableArray([]),
                pageController: function (targetPage) {
                    this.gotoPage(targetPage - 1);
                },
                previousPage: function () {
                    if (this.pageIndex() > 0) {
                        this.pageIndex(this.pageIndex() - 1);
                    }
                },
                nextPage: function () {
                    if (this.pageIndex() < this.maxPageIndex()) {
                        this.pageIndex(this.pageIndex() + 1);
                    }
                },
                firstPage: function () {
                    if (this.pageIndex() >= 0) {
                        this.pageIndex(0);
                    }
                },
                lastPage: function () {
                    if (this.maxPageIndex() > 0) {
                        this.pageIndex(this.maxPageIndex());
                    }
                },
                gotoPage: function (data) {
                    this.pageIndex(data);
                },
                maxPageIndex: ko.observable(),
                gridendRecord: ko.observable(),
                gridstartRecord: ko.observable(),
                startRecord: ko.observable(),
                endRecord: ko.observable(),
                gridpageSize: ko.observable(25),
                gridpageIndex: ko.observable(0),
                gridtotalPages: ko.observable(0),
                gridtotalPagesHolder: ko.observableArray([]),
                gridpageController: function (targetPage) {
                    this.gridgotoPage(targetPage - 1);
                },
                gridfirstPage: function () {
                    if (this.gridpageIndex() >= 0) {
                        this.gridpageIndex(0);
                    }
                },
                gridlastPage: function () {
                    if (this.gridmaxPageIndex() > 0) {
                        this.gridpageIndex(this.gridmaxPageIndex());
                    }
                },
                gridpreviousPage: function () {
                    if (this.gridpageIndex() > 0) {
                        this.gridpageIndex(this.gridpageIndex() - 1);
                    }
                },
                gridnextPage: function () {
                    if (this.gridpageIndex() < this.gridmaxPageIndex()) {
                        this.gridpageIndex(this.gridpageIndex() + 1);
                    }
                },
                gridgotoPage: function (data) {
                    this.gridpageIndex(data);
                },
                gridmaxPageIndex: ko.observable(),
                DocumentGroupID: ko.observable(),
                CategoryID: ko.observable(),
                ClientID: ko.observable(),
                AccountID: ko.observable(),
                CategoryName: ko.observable(),
                SelectedCategory: ko.observable(),
                SubCategoryID: ko.observable(),
                UserID: ko.observable(),
                UserName: ko.observable(),
                IsActive: ko.observable(),
                IsAddVersion: ko.observable(),
                CurrentVersion: ko.observable(),
                CurrentDocID: ko.observable(),
                filteredGrid: ko.observable(),
                displayGrid: ko.observable(),
                filteredDocuments: ko.observable(),
                DataCaptureFields: ko.observableArray(),
                DataCaptureFieldValues: ko.observableArray(),
                DataGroupValues: ko.observableArray(),
                Extensions: ko.observableArray(),
                Documents: ko.observableArray(),
                AllDocuments: ko.observableArray(),
                NewDocuments: ko.observableArray(),
                DocumentToMove: ko.observable(),
                GroupConcurrencyHash: ko.observable(),
                TimeZoneAbbr: ko.observable(),
                Columns: ko.observableArray(),
                MoveColumns: ko.observableArray(),
                columnState: ko.observable(),
                columnProperty: ko.observable(),
                filterText: ko.observable(),
                DocumentfilterText: ko.observable(),
                Note: ko.observable(),
                FileName: ko.observable(),
                uploadedGuid: ko.observable(),
                Categories: ko.observableArray(),
                SubCategories: ko.observableArray(),
                ActiveSubCategories: ko.observableArray(),
                DocumentGroupGrid: ko.observableArray(),
                AllDocumentGroupGrid: ko.observableArray(),
                errors: ko.observable(),
                HasFlagDocumentAsExternal: ko.observable(),
                HasAccesstoExternalDocuments: ko.observable(),
                HasAccesstoInternalDocuments: ko.observable(),
                HasUploadDocument: ko.observable(),
                HasAddVersion: ko.observable(),
                HasMoveToDocumentGroup: ko.observable(),
                HasDeleteRestore: ko.observable(),
                HasChangeDocumentStatus: ko.observable(),
                HasSubCategory: ko.observable(),
                UploadErrorMessage: ko.observable(),
                openUploadModal: function (obj, isVersion) {
                    //reset kendo control
                    me.container.find("[data-id='uploadedFileTable']").hide();
                    me.container.find("[data-id='uploadSaveButton']").prop('disabled', true);
                    me.container.find(".k-upload-files.k-reset").find("li").remove();
                    me.container.find(".k-upload-status").remove();
                    me.container.find(".k-upload.k-header").addClass("k-upload-empty");
                    me.container.find(".k-upload-button").removeClass("k-state-focused");
                    me.container.find(".k-upload-files").removeClass("k-upload-files");
                    me.documentVm.UploadErrorMessage("");
                    if (isVersion) {
                        me.documentVm.SubCategoryID(obj.SubCategoryID());
                        me.documentVm.CurrentVersion(obj.Version());
                        if (obj.ParentID() == null)
                            me.documentVm.CurrentDocID(obj.ID());
                        else
                            me.documentVm.CurrentDocID(obj.ParentID());
                    }
                    me.documentVm.IsAddVersion(isVersion);
                    me.container.find("div[data-id='uploadDialog']").modal("show");
                },
                sortClick: function (column) {
                    try {
                        // Call this method to clear the state of any columns OTHER than the target
                        // so we can keep track of the ascending/descending
                        me.clearColumnStates(column);
                        // Get the state of the sort type
                        if (column.State() === "" || column.State() === me.descending) {
                            column.State(me.ascending);
                        }
                        else {
                            column.State(me.descending);
                        }
                        switch (column.Type()) {
                            case "number":
                                me.numberSort(column);
                                break;
                            case "date":
                                me.dateSort(column);
                                break;
                            case "object":
                                me.objectSort(column);
                                break;
                            case "string":
                            default:
                                me.stringSort(column);
                                break;
                        }
                    }
                    catch (err) {
                        // Always remember to handle those errors that could occur during a user interaction
                        alert(err);
                    }
                },
                sortMoveClick: function (column) {
                    try {
                        // Call this method to clear the state of any columns OTHER than the target
                        // so we can keep track of the ascending/descending
                        me.clearColumnStates(column);
                        // Get the state of the sort type
                        if (column.State() === "" || column.State() === me.descending) {
                            column.State(me.ascending);
                        }
                        else {
                            column.State(me.descending);
                        }
                        switch (column.Type()) {
                            case "number":
                                me.numberMoveSort(column);
                                break;
                            case "date":
                                me.dateMoveSort(column);
                                break;
                            case "string":
                            default:
                                me.stringMoveSort(column);
                                break;
                        }
                    }
                    catch (err) {
                        // Always remember to handle those errors that could occur during a user interaction
                        alert(err);
                    }
                },
                SaveUpload: function (e) {
                    var app = Global.App(), waitContainer = UI.showWaitIndicator(me.container), deferred = $.Deferred();
                    var saveParams = {
                        DocumentGroupID: me.documentVm.DocumentGroupID(),
                        IsAddVersion: me.documentVm.IsAddVersion(),
                        NewDocuments: me.documentVm.NewDocuments()
                    };
                    for (var i = 0; i < saveParams.NewDocuments.length; i++) {
                        saveParams.NewDocuments[i].SubCategoryID(me.documentVm.NewDocuments()[i].SelectedSubCategoryID());
                    }
                    //if there are multiple versioning, perform versioning here because the adding/removing/canceling of documents can mess up the version numbers. 
                    //This guarantees incremental numbers
                    if (me.documentVm.IsAddVersion()) {
                        for (var i = 0; i < saveParams.NewDocuments.length; i++) {
                            saveParams.NewDocuments[i].Version(me.documentVm.CurrentVersion() + i + 1);
                            saveParams.NewDocuments[i].SubCategoryID(me.documentVm.SubCategoryID());
                        }
                    }
                    DocumentData.SaveNewDocuments(ko.toJS(saveParams))
                        .done(function (response) {
                        if (response.Success) {
                            UI.showNotificationMessage(UI.PHRASE_RECORDSAVED, UI.messageTypeValues.success);
                            //reload documents only
                            me.updateDocuments(response.Payload);
                            deferred.resolve();
                        }
                        else {
                            UI.showErrorMessage(response.ErrorMessages);
                            deferred.reject();
                        }
                    })
                        .fail(function () {
                        deferred.reject();
                    })
                        .always(function () {
                        UI.hideWaitIndicator(me.container, waitContainer);
                    });
                    me.documentVm.NewDocuments.removeAll();
                    this.pageIndex(0);
                    me.container.find("div[data-id='uploadDialog']").modal("hide");
                },
                CancelUpload: function (e) {
                    me.documentVm.NewDocuments.removeAll();
                    me.container.find("div[data-id='uploadDialog']").modal("hide");
                },
                CancelMove: function (e) {
                    me.documentVm.displayGrid(false);
                    me.container.find("div[data-id='moveDialog']").modal("hide");
                },
                SelectGroup: function (group) {
                    var app = Global.App(), deferred = $.Deferred();
                    //save document to new group
                    DocumentData.MoveToDocumentGroup(group.DocumentGroupID(), ko.toJS(me.documentVm.DocumentToMove()), me.documentVm.GroupConcurrencyHash())
                        .done(function (response) {
                        if (response.Success) {
                            UI.showNotificationMessage("It has been moved", UI.messageTypeValues.success);
                            me.documentVm.IsActive(response.Payload.IsActive);
                            me.documentVm.GroupConcurrencyHash(response.Payload.GroupConcurrencyHash);
                            me.documentVm.Documents.remove(me.documentVm.DocumentToMove());
                            me.documentVm.DocumentToMove(null);
                            me.documentVm.displayGrid(false);
                        }
                        else {
                            UI.showErrorMessage(response.ErrorMessages);
                        }
                    })
                        .always(function () {
                        // UI.hideWaitIndicator(me.container, waitContainer);
                        deferred.resolve();
                    });
                    deferred.resolve();
                    me.container.find("div[data-id='moveDialog']").modal("hide");
                },
                save: function (e) {
                    me.save(false);
                },
                change: function (text) {
                    var fText = text.DocumentfilterText();
                    me.clearAllColumnStates();
                    var filteredCollection = ko.utils.arrayFilter(me.documentVm.AllDocuments(), function (document) {
                        if (fText != "" && fText != undefined) {
                            if (document.SubCategoryName() == undefined) {
                                document.SubCategoryName("");
                            }
                            return document.SubCategoryName().toLowerCase().toString().indexOf(fText.toLowerCase()) >= 0 || document.FileName().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || document.Type().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || document.Version().toString().indexOf(fText.toLowerCase()) >= 0 || document.UploadedBy().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || moment(document.DateTimeCreated()).format('MM-DD-YYYY hh:mm A').indexOf(fText.toLowerCase()) >= 0 || moment(document.DateTimeModified()).format('MM-DD-YYYY hh:mm A').indexOf(fText.toLowerCase()) >= 0;
                        }
                        else
                            return true;
                    });
                    me.documentVm.Documents.removeAll();
                    var newItems = ko.utils.arrayMap(filteredCollection, function (document) {
                        return me.createDocument(ko.toJS(document));
                    });
                    me.documentVm.Documents.push.apply(me.documentVm.Documents, newItems);
                    this.pageIndex(0);
                },
                changeOnEnter: function (data, event) {
                    var keyCode = (event.which ? event.which : event.keyCode);
                    if (keyCode === 13) {
                        this.gridChange(data);
                        return false;
                    }
                    return true;
                },
                gridChange: function (text) {
                    if (me.documentVm.filterText() != "") {
                        me.clearAllMoveColumnStates();
                        var reg;
                        // If many white spaces in a row, replace with only one white space
                        var fText = me.documentVm.filterText();
                        reg = new RegExp(fText, "gi");
                        // If there is anything in the search box, filter for this
                        var filteredCollection = ko.utils.arrayFilter(me.documentVm.AllDocumentGroupGrid(), function (group) {
                            if (fText != "" && fText != undefined) {
                                if (group.PropertyCode() == undefined) {
                                    group.PropertyCode("");
                                }
                                if (group.ContractCode() == undefined) {
                                    group.ContractCode("");
                                }
                                if (group.Property() == undefined) {
                                    group.Property("");
                                }
                                if (group.OtherFields() == undefined) {
                                    group.OtherFields("");
                                }
                                if (group.KeyDateString() == undefined) {
                                    group.KeyDateString("");
                                }
                                return group.DocumentGroupID().toString().indexOf(fText.toLowerCase()) >= 0 || group.ContractCode().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || group.PropertyCode().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || group.Property().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || group.KeyDateString().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || group.OtherFields().toLowerCase().indexOf(fText.toLowerCase()) >= 0;
                            }
                            else
                                return true;
                        });
                        me.documentVm.DocumentGroupGrid.removeAll();
                        var newItems = ko.utils.arrayMap(filteredCollection, function (grid) {
                            return me.createDocumentGroupGrid(ko.toJS(grid));
                        });
                        me.documentVm.DocumentGroupGrid.push.apply(me.documentVm.DocumentGroupGrid, newItems);
                        this.gridpageIndex(0);
                        me.documentVm.displayGrid(true);
                    }
                },
                clearText: function (text) {
                    //   me.loadRecord(me.documentVm.DocumentGroupID());  
                    me.documentVm.DocumentfilterText("");
                    me.clearAllColumnStates();
                    this.pageIndex(0);
                    me.documentVm.Documents.removeAll();
                    me.documentVm.Documents.push.apply(me.documentVm.Documents, me.documentVm.AllDocuments());
                },
                clearGridText: function (text) {
                    //   me.loadRecord(me.documentVm.DocumentGroupID());  
                    me.documentVm.filterText("");
                    this.gridpageIndex(0);
                    me.documentVm.displayGrid(false);
                },
                close: function (e) {
                    me.close();
                },
                saveandclose: function (e) {
                    me.saveandclose();
                },
                EditDocumentGroup: function (e) {
                    me.editDocGroup();
                },
                DeleteRestore: function (documentGroup) {
                    me.toggleStatus(documentGroup.DocumentGroupID(), documentGroup.IsActive());
                },
                SortByString: function (a, b) {
                    if (me.documentVm.columnProperty() == "SubCategoryName") {
                        if (a.SubCategoryName() == undefined)
                            a.SubCategoryName("");
                        if (b.SubCategoryName() == undefined)
                            b.SubCategoryName("");
                        var stringA = a.SubCategoryName().toLowerCase();
                        var stringB = b.SubCategoryName().toLowerCase();
                    }
                    else {
                        var stringA = a[me.documentVm.columnProperty()]().toLowerCase();
                        var stringB = b[me.documentVm.columnProperty()]().toLowerCase();
                    }
                    if (stringA < stringB) {
                        return (me.documentVm.columnState() === me.ascending) ? -1 : 1;
                    }
                    else if (stringA > stringB) {
                        return (me.documentVm.columnState() === me.ascending) ? 1 : -1;
                    }
                    else {
                        return 0;
                    }
                },
                SortByDate: function (a, b) {
                    var stringA = a[me.documentVm.columnProperty()]();
                    var stringB = b[me.documentVm.columnProperty()]();
                    if (me.documentVm.columnState() === me.ascending) {
                        return (Date.parse(stringA) < Date.parse(stringB) ? -1 : (Date.parse(stringA) > Date.parse(stringB) ? 1 : 0));
                    }
                    else {
                        return (Date.parse(stringA) > Date.parse(stringB) ? -1 : (Date.parse(stringA) < Date.parse(stringB) ? 1 : 0));
                    }
                },
                SortByNumber: function (a, b) {
                    var stringA = a[me.documentVm.columnProperty()]();
                    var stringB = b[me.documentVm.columnProperty()]();
                    if (me.documentVm.columnState() === me.ascending) {
                        return stringA - stringB;
                    }
                    else {
                        return stringB - stringA;
                    }
                }
            };
            this.documentVm.maxPageIndex = ko.computed(function () {
                return Math.ceil(me.documentVm.Documents().length / me.documentVm.pageSize()) - 1;
            }, this);
            this.documentVm.totalPages = ko.computed(function () {
                var div = Math.floor(me.documentVm.Documents().length / me.documentVm.pageSize());
                div += me.documentVm.Documents().length % me.documentVm.pageSize() > 0 ? 1 : 0;
                var pages = div - 1;
                me.documentVm.totalPagesHolder.removeAll();
                for (var i = 0; i < pages + 1; i++) {
                    me.documentVm.totalPagesHolder.push(i + 1);
                }
                return div - 1;
            });
            this.documentVm.gridmaxPageIndex = ko.computed(function () {
                return Math.ceil(me.documentVm.DocumentGroupGrid().length / me.documentVm.gridpageSize()) - 1;
            }, this);
            this.documentVm.gridstartRecord = ko.computed(function () {
                return (1 + (me.documentVm.gridpageIndex() * me.documentVm.gridpageSize()));
            }, this);
            this.documentVm.gridendRecord = ko.computed(function () {
                if (me.documentVm.DocumentGroupGrid().length < (me.documentVm.gridpageSize() * (me.documentVm.gridpageIndex() + 1))) {
                    return (me.documentVm.DocumentGroupGrid().length);
                }
                else {
                    return (me.documentVm.gridpageSize() * (me.documentVm.gridpageIndex() + 1));
                }
            }, this);
            this.documentVm.startRecord = ko.computed(function () {
                return (1 + (me.documentVm.pageIndex() * me.documentVm.pageSize()));
            }, this);
            this.documentVm.endRecord = ko.computed(function () {
                if (me.documentVm.Documents().length < (me.documentVm.pageSize() * (me.documentVm.pageIndex() + 1))) {
                    return (me.documentVm.Documents().length);
                }
                else {
                    return (me.documentVm.pageSize() * (me.documentVm.pageIndex() + 1));
                }
            }, this);
            this.documentVm.gridtotalPages = ko.computed(function () {
                var div = Math.floor(me.documentVm.DocumentGroupGrid().length / me.documentVm.gridpageSize());
                div += me.documentVm.DocumentGroupGrid().length % me.documentVm.gridpageSize() > 0 ? 1 : 0;
                var pages = div - 1;
                me.documentVm.gridtotalPagesHolder.removeAll();
                for (var i = 0; i < pages + 1; i++) {
                    me.documentVm.gridtotalPagesHolder.push(i + 1);
                }
                return div - 1;
            });
            this.documentVm.filteredGrid = ko.pureComputed(function () {
                var filteredCollection = null;
                var size = me.documentVm.gridpageSize();
                var start = me.documentVm.gridpageIndex() * size;
                //    //if (fText != "" && fText != undefined) {
                //    //    return filteredCollection.slice(0, 0 + size);
                //    //}
                //    //else {
                //    //    return filteredCollection.slice(start, start + size);
                //        return me.documentVm.Documents.slice(start, start + size);
                //  // }
                return filteredCollection = me.documentVm.DocumentGroupGrid.slice(start, start + size);
            }, me.documentVm.DocumentGroupGrid());
            this.documentVm.filteredDocuments = ko.pureComputed(function () {
                //var reg;
                //// If many white spaces in a row, replace with only one white space
                //var fText = me.documentVm.DocumentfilterText();
                //reg = new RegExp(fText, "gi");
                var filteredCollection = null;
                //    //// If there is anything in the search box, filter for this
                //    //filteredCollection = ko.utils.arrayFilter(me.documentVm.Documents(), function (document: IDocument) {
                //    //    if (fText != "" && fText != undefined) {
                //    //        if (document.SubCategoryName() == undefined) {
                //    //            document.SubCategoryName("");
                //    //        }
                //    //        return  document.SubCategoryName().toLowerCase().toString().indexOf(fText.toLowerCase()) >= 0 || document.FileName().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || document.Type().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || document.Version().toString().indexOf(fText.toLowerCase()) >= 0 || document.UploadedBy().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || document.DateTimeCreated().toLowerCase().indexOf(fText.toLowerCase()) >= 0 || document.DateTimeModified().toLowerCase().indexOf(fText.toLowerCase()) >= 0;
                //    //    }
                //    //    else
                //    //        return true;
                //    //});
                //    
                var size = me.documentVm.pageSize();
                var start = me.documentVm.pageIndex() * size;
                //    //if (fText != "" && fText != undefined) {
                //    //    return filteredCollection.slice(0, 0 + size);
                //    //}
                //    //else {
                //    //    return filteredCollection.slice(start, start + size);
                //        return me.documentVm.Documents.slice(start, start + size);
                //  // }
                return filteredCollection = me.documentVm.Documents.slice(start, start + size);
            }, me.documentVm.Documents());
            this.documentVm.errors = ko.validation.group(this.documentVm, { deep: true });
            this.documentVm.SelectedCategory.subscribe(function (newValue) {
                if (newValue != undefined && newValue != 0) {
                    me.loadSubCategoriesDocumentGroups(newValue);
                }
            });
        }
        ARDocumentsController.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LIST, this.container)
                .done(function () {
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
                    error: _.bind(me.onError, me),
                    cancel: _.bind(me.onRemove, me),
                    multiple: true
                });
                // for dynamic resizing of left nav list;
                //clean bindings to reapply to right container
                me.doGrid(this.gridContainer, $(window).height());
                me.rightFormContainer = container.find("div[data-id='rightFormContainer']");
                //   me.gridContainer = container.find("div[data-id='DocumentGrid']");
                ko.cleanNode(me.container[0]);
                ko.applyBindings(me.documentVm, me.container[0]);
                deferred.resolve();
            });
            return deferred.promise();
        };
        ARDocumentsController.prototype.load = function (loadParams) {
            var me = this;
            // In real case we have to use callWebService to get data. 
            // we can create that method in this page or if page is complicate we can create other page to mange data (CRUD)
            var deferred = $.Deferred();
            me.documentVm.ID(loadParams.taskID);
            me.loadRecord(loadParams.taskID);
            deferred.resolve();
            return deferred.promise();
        };
        //Load the data for the specified record
        ARDocumentsController.prototype.loadRecord = function (id) {
            var me = this, deferred = $.Deferred(), waitContainer = UI.showWaitIndicator(this.container);
            DocumentData.GetDocumentMaster(id)
                .done(function (response) {
                if (response.Success) {
                    var permissions = response.Permissions;
                    me.documentVm.HasFlagDocumentAsExternal(permissions && permissions["FlagDocumentAsExternal"] != undefined);
                    me.documentVm.HasAccesstoExternalDocuments(permissions && permissions["HasAccesstoExternalDocuments"] != undefined);
                    me.documentVm.HasAccesstoInternalDocuments(permissions && permissions["HasAccesstoInternalDocuments"] != undefined);
                    me.documentVm.HasUploadDocument(permissions && permissions["HasUploadDocument"] != undefined);
                    me.documentVm.HasAddVersion(permissions && permissions["HasAddVersion"] != undefined);
                    me.documentVm.HasMoveToDocumentGroup(permissions && permissions["HasMoveToDocumentGroup"] != undefined);
                    me.documentVm.HasDeleteRestore(permissions && permissions["HasDeleteRestore"] != undefined);
                    me.documentVm.HasChangeDocumentStatus(permissions && permissions["HasChangeDocumentStatus"] != undefined);
                    me.documentVm.HasSubCategory(permissions && permissions["HasSubCategory"] != undefined);
                    me.updateViewModel(response.Payload);
                }
                else {
                    UI.showErrorMessage(response.ErrorMessages);
                }
            })
                .always(function () {
                UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            return deferred.promise();
        };
        //Return true if the user has edited any of the fields
        ARDocumentsController.prototype.haveFieldsChanged = function () {
            return false;
        };
        ARDocumentsController.prototype.doGrid = function (gridContainer, height) {
            $('#DocGrid').height(height - 350);
        };
        ARDocumentsController.prototype.height = function (height) {
            var fieldHeight = height - 50;
            if (fieldHeight > 0) {
                this.container.height(fieldHeight);
            }
            if (height > 50) {
                UI.resizeGrid(this.gridContainer, (height - 165));
            }
        };
        //Returns a unique ID for this controller
        ARDocumentsController.prototype.appRouterID = function (id) {
            return "ARDocuments";
        };
        //Returns a title for the page
        ARDocumentsController.prototype.title = function () {
            //TODO - replace with the title for your page
            return "Task Manager - Documents";
        };
        ARDocumentsController.prototype.subTitle = function () {
            //TODO - use data from view model to create a subTitle that
            //describes the record being displayed
            return "";
        };
        ARDocumentsController.prototype.allowRecordToChangeAfterLoad = function () {
            //Always false, this controller can only display the record
            //it was initially loaded with.  The record can not be changed.
            return false;
        };
        //Call the web service to update the database in the DB
        ARDocumentsController.prototype.save = function (isExit) {
            var me = this, app = Global.App(), waitContainer = UI.showWaitIndicator(this.container), deferred = $.Deferred();
            return deferred.promise();
        };
        ARDocumentsController.prototype.resize = function (height) {
        };
        //Collapse Left Side Navigation and Make Right ane Full Screen Toggle
        ARDocumentsController.prototype.togglePageLeftRight = function () {
            $("[data-id='leftContainer']").toggleClass('closed', 250);
            $("[data-id='rightPane']").toggleClass('full', 250);
        };
        //////////////////////////////
        //Private Functions//
        //////////////////////////////
        ARDocumentsController.prototype.loadSubCategoriesDocumentGroups = function (categoryID) {
            var me = this, deferred = $.Deferred(), waitContainer = UI.showWaitIndicator(this.container);
            me.container.find("div[data-id='moveDialog']").modal("hide");
            //var newContainer = me.container.find("[data-id='moveDialog']");
            DocumentData.GetSubCategoriesDocumentGroups(categoryID, me.documentVm.ClientID(), ko.toJS(me.documentVm.DocumentToMove()))
                .done(function (response) {
                if (response.Success) {
                    me.updateDocumentGroupGrid(response.Payload);
                }
                else {
                    UI.showErrorMessage(response.ErrorMessages);
                }
            })
                .always(function () {
                UI.hideWaitIndicator(me.container, waitContainer);
                me.container.find("div[data-id='moveDialog']").modal("show");
                deferred.resolve();
            });
            return deferred.promise();
        };
        ARDocumentsController.prototype.updateDocumentGroupGrid = function (documentGroupGridMaster) {
            var me = this, app = Global.App();
            me.documentVm.AllDocumentGroupGrid.removeAll();
            me.documentVm.DocumentGroupGrid.removeAll();
            me.documentVm.MoveColumns.removeAll();
            var newItems = ko.utils.arrayMap(documentGroupGridMaster.DocumentGroupGrid, function (grid) {
                return me.createDocumentGroupGrid(grid);
            });
            me.documentVm.DocumentGroupGrid.push.apply(me.documentVm.DocumentGroupGrid, newItems);
            me.documentVm.AllDocumentGroupGrid.push.apply(me.documentVm.AllDocumentGroupGrid, newItems);
            me.documentVm.displayGrid(false);
            me.documentVm.MoveColumns.push(me.createColumns("", "", "string", false));
            me.documentVm.MoveColumns.push(me.createColumns("DocumentGroupID", "GroupID", "number", true));
            me.documentVm.MoveColumns.push(me.createColumns("Count", "Count", "number", true));
            me.documentVm.MoveColumns.push(me.createColumns("ContractCode", "Contract", "string", true));
            me.documentVm.MoveColumns.push(me.createColumns("PropertyCode", "Code", "string", true));
            me.documentVm.MoveColumns.push(me.createColumns("Property", "Name", "string", true));
            me.documentVm.MoveColumns.push(me.createColumns("KeyDateString", "KeyDate", "date", true));
            me.documentVm.MoveColumns.push(me.createColumns("OtherFields", "Other", "string", true));
            //me.documentVm.Documents.remove(me.documentVm.DocumentToMove());
            // me.documentVm.DocumentToMove(null);       
        };
        ARDocumentsController.prototype.createDocumentGroupGrid = function (docGroupGrid) {
            var me = this;
            var vmdocgrid = {
                DocumentGroupID: ko.observable(docGroupGrid ? docGroupGrid.DocumentGroupID : 0),
                Count: ko.observable(docGroupGrid ? docGroupGrid.Count : 0),
                PropertyCode: ko.observable(docGroupGrid ? docGroupGrid.PropertyCode : ""),
                Property: ko.observable(docGroupGrid ? docGroupGrid.Property : ""),
                ContractCode: ko.observable(docGroupGrid ? docGroupGrid.ContractCode : ""),
                KeyDateString: ko.observable(docGroupGrid ? docGroupGrid.KeyDateString : ""),
                OtherFields: ko.observable(docGroupGrid ? (docGroupGrid.OtherFields == null ? "" : docGroupGrid.OtherFields.replace(/!/g, ' / ')) : "")
            };
            return vmdocgrid;
        };
        ARDocumentsController.prototype.createSubCategories = function (subcategory) {
            var me = this;
            var vmSubcategory = {
                ID: ko.observable(subcategory ? subcategory.ID : 0),
                Name: ko.observable(subcategory ? subcategory.Name : ""),
                CategoryID: ko.observable(subcategory ? subcategory.CategoryID : 0),
                IsActive: ko.observable(subcategory ? subcategory.IsActive : true)
            };
            return vmSubcategory;
        };
        ARDocumentsController.prototype.editDocGroup = function () {
            var me = this, app = Global.App();
            app.router().navigate('DocMan/DocumentGroup/' + me.documentVm.DocumentGroupID(), true);
        };
        ARDocumentsController.prototype.toggleStatus = function (DocumentGroupID, IsActive) {
            var me = this, waitContainer, deferred = $.Deferred();
            var groupHash;
            DocumentData.DeleteRestore(DocumentGroupID, !IsActive, me.documentVm.GroupConcurrencyHash())
                .done(function (response) {
                if (response.Success) {
                    groupHash = response.Payload;
                    me.documentVm.GroupConcurrencyHash(groupHash);
                    me.documentVm.IsActive(!IsActive);
                    if (!IsActive)
                        UI.showNotificationMessage("It is restored", UI.messageTypeValues.success);
                    else
                        UI.showNotificationMessage("It has been deleted", UI.messageTypeValues.success);
                }
                else {
                    UI.showErrorMessage(response.ErrorMessages);
                }
            })
                .always(function () {
                // UI.hideWaitIndicator(me.container, waitContainer);
                deferred.resolve();
            });
            deferred.resolve();
            return !IsActive;
        };
        ARDocumentsController.prototype.onSelect = function (e) {
            var me = this;
            if (e.files.length > 0) {
                for (var i = 0; i < e.files.length; i++) {
                    //var fileParts = e.files[i].name.split(".");
                    //if (fileParts.length > 2) {
                    //    var errmessage = "Character '.' in file name not permitted.";
                    //    UI.showErrorMessage([errmessage]);
                    //    e.preventDefault();
                    //}
                    //if (e.files[i].name.indexOf('!') >= 0 || e.files[i].name.indexOf('+') >= 0 || e.files[i].name.indexOf('@') >= 0 || e.files[i].name.indexOf('#') >= 0 || e.files[i].name.indexOf('$') >= 0 || e.files[i].name.indexOf('%') >= 0 || e.files[i].name.indexOf('^') >= 0 || e.files[i].name.indexOf('&') >= 0 || e.files[i].name.indexOf('*') >= 0 ) {
                    //    var errmessage = "Characters '!@#$%^&*+/\<>=:?' in file name not permitted.";
                    //    UI.showErrorMessage([errmessage]);
                    //    e.preventDefault();
                    //}
                    var match = ko.utils.arrayFirst(me.documentVm.Extensions(), function (extension) {
                        return extension.Extension() === e.files[i].extension.toLowerCase();
                    });
                    var message = "File extension " + e.files[i].extension + " not permitted.";
                    if (match == null) {
                        UI.showErrorMessage([message]);
                        e.preventDefault();
                        return;
                    }
                }
            }
        };
        ARDocumentsController.prototype.onError = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", deferred = $.Deferred(), fileParts, fileID = "";
            if (e.files.length > 0) {
                // 
                var lastIndex = e.files[0].name.lastIndexOf('.');
                fileName = e.files[0].name.substr(0, lastIndex);
                extension = e.files[0].name.substr(lastIndex + 1);
                fileID = e.files[0].uid;
                var errmessage = "Error uploading one or more files. ";
                me.documentVm.UploadErrorMessage(me.documentVm.UploadErrorMessage() + ' ' + fileName);
                UI.showErrorMessage([errmessage]);
                //UI.showNotificationMessage(errmessage, UI.messageTypeValues.error);
                me.container.find(".k-upload-files.k-reset").find("li[data-uid='" + e.files[0].uid + "']").remove();
                var attachment = ko.utils.arrayFirst(me.documentVm.NewDocuments(), function (document) {
                    return document.UniqueID() === e.files[0].uid;
                });
                me.documentVm.NewDocuments.remove(attachment);
                if (me.documentVm.NewDocuments().length == 0)
                    me.container.find("[data-id='uploadSaveButton']").prop('disabled', true);
            }
        };
        ARDocumentsController.prototype.onCancel = function (e) {
            var me = this;
            me.Remove(e);
        };
        ARDocumentsController.prototype.Remove = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", deferred = $.Deferred(), fileParts, fileID = "";
            if (e.files.length > 0) {
                var lastIndex = e.files[0].name.lastIndexOf('.');
                fileName = e.files[0].name.substr(0, lastIndex);
                extension = e.files[0].name.substr(lastIndex + 1);
                fileID = e.files[0].uid;
            }
            me.container.find(".k-upload-files.k-reset").find("li[data-uid='" + e.files[0].uid + "']").remove();
            var attachment = ko.utils.arrayFirst(me.documentVm.NewDocuments(), function (document) {
                return document.UniqueID() === e.files[0].uid;
            });
            me.documentVm.NewDocuments.remove(attachment);
            if (me.documentVm.NewDocuments().length == 0)
                me.container.find("[data-id='uploadSaveButton']").prop('disabled', true);
        };
        ARDocumentsController.prototype.onRemove = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", deferred = $.Deferred(), fileParts, fileID = "";
            me.Remove(e);
            if (e.files.length > 0) {
                var lastIndex = e.files[0].name.lastIndexOf('.');
                fileName = e.files[0].name.substr(0, lastIndex);
                extension = e.files[0].name.substr(lastIndex + 1);
                fileID = e.files[0].uid;
            }
            var documentEntity = {
                ID: 0,
                FileName: fileName + '.' + extension,
                FileLocation: 'attachment/Document Management/admClient/' + me.documentVm.ClientID(),
                LastModified: new Date(),
                UniqueID: fileID
            };
            DocumentData.DeleteDocument(ko.toJS(documentEntity), me.documentVm.ClientID())
                .done(function (response) {
                if (response.Success) {
                    console.log('deleted...');
                }
                else {
                    UI.showErrorMessage(response.ErrorMessages);
                }
            })
                .always(function () {
                deferred.resolve();
            });
        };
        ARDocumentsController.prototype.onUpload = function (e) {
            var me = this, app = Global.App(), url = ConfigOptions.baseURL, extension = "", fileName = "", fileParts, fileID = "";
            //k - icon k- i - close k- cancel
            //Disable the client timeout and start a heart beat to keep server session alive... AR
            var timer = Util.startHeartBeat(30000);
            app.sessionTimeoutDisabled = true;
            me.container.find("[data-id='uploadSaveButton']").prop('disabled', true);
            me.container.find(".uploadFiles").prop('disabled', true);
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
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        //Check if a refresh token exists within the response
                        //If so, update our refresh token cookie and DSC
                        var jsonObj = JSON.parse(xhr.response);
                        var refreshToken = jsonObj.RefreshToken;
                        if (!Util.isNullOrEmpty(refreshToken)) {
                            Util.deleteCookie(Util.COOKIE_AUTHENTICATIONTOKEN);
                            Util.deleteCookie(Util.COOKIE_DSC);
                            Util.setCookie(Util.COOKIE_AUTHENTICATIONTOKEN, refreshToken);
                            Util.setCookie(Util.COOKIE_DSC, jsonObj.DSC);
                        }
                    }
                });
            }
            me.documentVm.FileName(fileName + '.' + extension);
            me.documentVm.uploadedGuid(fileID);
            e.sender.options.async.saveUrl = url + "/api/Document/UploadDocument/" + me.documentVm.ClientID() + "/" + extension + "/" + fileID;
            if (me.documentVm.IsAddVersion()) {
                me.documentVm.CurrentVersion(me.documentVm.CurrentVersion());
                me.documentVm.NewDocuments.push(me.createDocument({ ID: 0, ParentID: me.documentVm.CurrentDocID(), FileName: me.documentVm.FileName(), SelectedSubCategoryID: me.documentVm.SubCategoryID(), FileLocation: 'attachment/Document Management/admClient/' + me.documentVm.ClientID(), UniqueID: me.documentVm.uploadedGuid(), DateTimeCreated: Date(), DateTimeModified: Date(), Version: me.documentVm.CurrentVersion(), UploadedBy: me.documentVm.UserName() }));
            }
            else {
                me.documentVm.NewDocuments.push(me.createDocument({ ID: 0, FileName: me.documentVm.FileName(), FileLocation: 'attachment/Document Management/admClient/' + me.documentVm.ClientID(), UniqueID: me.documentVm.uploadedGuid(), DateTimeCreated: Date(), DateTimeModified: Date(), Version: 1, UploadedBy: me.documentVm.UserName() }));
            }
        };
        ARDocumentsController.prototype.onComplete = function (e) {
            var me = this, global = Global.App();
            me.container.find(".uploadFiles").prop('disabled', false);
            if (me.documentVm.NewDocuments().length == 0)
                me.container.find("[data-id='uploadSaveButton']").prop('disabled', true);
            else
                me.container.find("[data-id='uploadSaveButton']").prop('disabled', false);
            Util.stopHeartBeat();
            global.sessionTimeoutDisabled = false;
            if (!me.documentVm.IsAddVersion()) {
                me.container.find("[data-id='uploadedFileTable']").show();
                me.container.find(".k-upload-files").hide();
            }
        };
        ARDocumentsController.prototype.stringSort = function (column) {
            var me = this;
            me.documentVm.columnState(column.State());
            me.documentVm.columnProperty(column.Property());
            me.documentVm.Documents(me.documentVm.Documents().sort(me.documentVm.SortByString));
        };
        ARDocumentsController.prototype.stringMoveSort = function (column) {
            var me = this;
            me.documentVm.columnState(column.State());
            me.documentVm.columnProperty(column.Property());
            me.documentVm.DocumentGroupGrid(me.documentVm.DocumentGroupGrid().sort(me.documentVm.SortByString));
        };
        ARDocumentsController.prototype.numberSort = function (column) {
            var me = this;
            me.container.find("[data-id='documentTable']").hide();
            me.documentVm.columnState(column.State());
            me.documentVm.columnProperty(column.Property());
            me.documentVm.Documents(me.documentVm.Documents().sort(me.documentVm.SortByNumber));
            me.container.find("[data-id='documentTable']").show();
        };
        ARDocumentsController.prototype.numberMoveSort = function (column) {
            var me = this;
            me.documentVm.columnState(column.State());
            me.documentVm.columnProperty(column.Property());
            me.documentVm.DocumentGroupGrid(me.documentVm.DocumentGroupGrid().sort(me.documentVm.SortByNumber));
        };
        ARDocumentsController.prototype.dateMoveSort = function (column) {
            var me = this;
            me.documentVm.columnState(column.State());
            me.documentVm.columnProperty(column.Property());
            me.documentVm.DocumentGroupGrid(me.documentVm.DocumentGroupGrid().sort(me.documentVm.SortByDate));
        };
        ARDocumentsController.prototype.dateSort = function (column) {
            var me = this;
            me.container.find("[data-id='documentTable']").hide();
            me.documentVm.columnState(column.State());
            me.documentVm.columnProperty(column.Property());
            me.documentVm.Documents(me.documentVm.Documents().sort(me.documentVm.SortByDate));
            me.container.find("[data-id='documentTable']").show();
        };
        ARDocumentsController.prototype.objectSort = function (column) {
            var me = this;
        };
        ARDocumentsController.prototype.clearColumnStates = function (selectedColumn) {
            var me = this;
            var otherColumns = me.documentVm.Columns().filter(function (col) {
                return col != selectedColumn;
            });
            for (var i = 0; i < otherColumns.length; i++) {
                otherColumns[i].State("");
            }
        };
        ARDocumentsController.prototype.clearAllColumnStates = function () {
            var me = this;
            for (var i = 0; i < me.documentVm.Columns().length; i++) {
                me.documentVm.Columns()[i].State("");
            }
        };
        ARDocumentsController.prototype.clearAllMoveColumnStates = function () {
            var me = this;
            for (var i = 0; i < me.documentVm.MoveColumns().length; i++) {
                me.documentVm.MoveColumns()[i].State("");
            }
        };
        ARDocumentsController.prototype.clearMoveColumnStates = function (selectedColumn) {
            var me = this;
            var otherColumns = me.documentVm.MoveColumns().filter(function (col) {
                return col != selectedColumn;
            });
            for (var i = 0; i < otherColumns.length; i++) {
                otherColumns[i].State("");
            }
        };
        ARDocumentsController.prototype.updateViewModel = function (master) {
            var me = this;
            me.documentVm.Documents.removeAll();
            me.documentVm.AllDocuments.removeAll();
            me.documentVm.Columns.removeAll();
            me.documentVm.Extensions.removeAll();
            me.documentVm.Categories.removeAll();
            me.documentVm.SubCategories.removeAll();
            me.documentVm.ActiveSubCategories.removeAll();
            me.documentVm.DataCaptureFields.removeAll();
            me.documentVm.DataCaptureFieldValues.removeAll();
            me.documentVm.DataGroupValues.removeAll();
            me.documentVm.CategoryID(master.CategoryID);
            me.documentVm.AccountID(master.AccountID);
            me.documentVm.ClientID(master.ClientID);
            me.documentVm.CategoryName(master.CategoryName);
            me.documentVm.UserName(master.UserName);
            me.documentVm.TimeZoneAbbr(master.TimeZoneAbbr);
            me.documentVm.UserID(master.UserID);
            me.documentVm.IsActive(master.IsActive);
            me.documentVm.DocumentGroupID(master.DocumentGroupID);
            me.documentVm.Note(master.Note);
            me.documentVm.GroupConcurrencyHash(master.GroupConcurrencyHash);
            _.forEach(master.Extensions, function (extension) {
                me.documentVm.Extensions.push(me.createExtensions(extension));
            });
            _.forEach(master.Categories, function (category) {
                me.documentVm.Categories.push(me.createCategoryObservable(category));
            });
            _.forEach(master.SubCategories, function (subcategory) {
                me.documentVm.SubCategories.push(me.createSubCategories(subcategory));
            });
            _.forEach(master.ActiveSubCategories, function (subcategory) {
                me.documentVm.ActiveSubCategories.push(me.createSubCategories(subcategory));
            });
            _.forEach(master.DataCaptureFields, function (datacapturefield) {
                me.documentVm.DataCaptureFields.push(me.createDataCaptureFields(datacapturefield));
            });
            _.forEach(master.DataCaptureFieldValues, function (datacapturevalue) {
                me.documentVm.DataCaptureFieldValues.push(me.createDataCaptureFieldValues(datacapturevalue));
            });
            //_.forEach(master.Documents, function (document: DocumentData.IDocument) {
            //    me.documentVm.Documents.push(me.createDocument(document));
            //});
            var newItems = ko.utils.arrayMap(master.Documents, function (document) {
                return me.createDocument(document);
            });
            me.documentVm.Documents.push.apply(me.documentVm.Documents, newItems);
            me.documentVm.AllDocuments.push.apply(me.documentVm.AllDocuments, newItems);
            me.documentVm.Columns.push(me.createColumns("", "", "string", false));
            me.documentVm.Columns.push(me.createColumns("FileName", "Document Name", "string", true));
            me.documentVm.Columns.push(me.createColumns("Type", "Type", "string", true));
            me.documentVm.Columns.push(me.createColumns("SubCategoryName", "SubCategory", "string", true));
            me.documentVm.Columns.push(me.createColumns("Version", "Version", "number", true));
            me.documentVm.Columns.push(me.createColumns("IsExternal", "External", "number", true));
            me.documentVm.Columns.push(me.createColumns("UploadedBy", "Uploaded By", "string", true));
            me.documentVm.Columns.push(me.createColumns("DateTimeCreated", "Uploaded On", "date", true));
            me.documentVm.Columns.push(me.createColumns("DateTimeModified", "Last Accessed", "date", true));
            me.documentVm.Columns.push(me.createColumns("Actions", "Actions", "object", false));
            for (var i = 0; i < me.documentVm.DataCaptureFields().length; i++) {
                var datafieldValue = ko.utils.arrayFirst(me.documentVm.DataCaptureFieldValues(), function (thisdataFieldValue) {
                    return me.documentVm.DataCaptureFields()[i].ID() === thisdataFieldValue.DataCaptureFieldID();
                });
                me.documentVm.DataGroupValues.push(me.createDataGroupValues(me.documentVm.DataCaptureFields()[i].Name(), datafieldValue.DataValue()));
            }
        };
        ARDocumentsController.prototype.createExtensions = function (extensions) {
            var me = this;
            var vmExtensions = {
                ID: ko.observable(extensions ? extensions.ID : 0),
                Extension: ko.observable(extensions ? extensions.Extension : "")
            };
            return vmExtensions;
        };
        ARDocumentsController.prototype.createCategoryObservable = function (category) {
            var me = this;
            var vmcategory = {
                ID: ko.observable(category ? category.ID : 0),
                Name: ko.observable(category ? category.Name : ""),
                IsActive: ko.observable(category ? category.IsActive : true),
                AccountID: ko.observable(category ? category.ID : 0)
            };
            return vmcategory;
        };
        ARDocumentsController.prototype.updateDocuments = function (documents) {
            var me = this;
            me.documentVm.Columns.removeAll();
            me.documentVm.Documents.removeAll();
            var newItems = ko.utils.arrayMap(documents, function (document) {
                return me.createDocument(document);
            });
            me.documentVm.Documents.push.apply(me.documentVm.Documents, newItems);
            me.documentVm.AllDocuments.push.apply(me.documentVm.AllDocuments, newItems);
            me.documentVm.Columns.push(me.createColumns("", "", "string", false));
            me.documentVm.Columns.push(me.createColumns("FileName", "Document Name", "string", true));
            me.documentVm.Columns.push(me.createColumns("Type", "Type", "string", true));
            me.documentVm.Columns.push(me.createColumns("SubCategoryName", "SubCategory", "string", true));
            me.documentVm.Columns.push(me.createColumns("Version", "Version", "number", true));
            me.documentVm.Columns.push(me.createColumns("IsExternal", "External", "number", true));
            me.documentVm.Columns.push(me.createColumns("UploadedBy", "Uploaded By", "string", true));
            me.documentVm.Columns.push(me.createColumns("DateTimeCreated", "Uploaded On", "date", true));
            me.documentVm.Columns.push(me.createColumns("DateTimeModified", "Last Accessed", "date", true));
            me.documentVm.Columns.push(me.createColumns("Actions", "Actions", "object", false));
        };
        ARDocumentsController.prototype.createColumns = function (property, header, type, isSortable) {
            var me = this;
            var vmColumns = {
                Property: ko.observable(property ? property : ""),
                Header: ko.observable(header ? header : ""),
                Type: ko.observable(type ? type : ""),
                State: ko.observable(""),
                IsSortable: ko.observable(isSortable)
            };
            return vmColumns;
        };
        ARDocumentsController.prototype.createDocument = function (document) {
            var me = this;
            var url = ConfigOptions.baseURL;
            var fileName;
            var extension;
            var vmDocument = {
                ID: ko.observable(document ? document.ID : 0),
                DocumentGroupID: ko.observable(document ? document.DocumentGroupID : 0),
                SubCategoryID: ko.observable(document ? document.SubCategoryID : 0),
                SelectedSubCategoryID: ko.observable(document ? document.SelectedSubCategoryID : 0),
                SubCategoryName: ko.observable(document ? document.SubCategoryName : ""),
                SubCategories: ko.observableArray(),
                UniqueID: ko.observable(document ? document.UniqueID : ""),
                ParentID: ko.observable(document ? document.ParentID : 0),
                Version: ko.observable(document ? document.Version : ""),
                IsActive: ko.observable(document ? document.IsActive : true),
                IsExternal: ko.observable(document ? document.IsExternal : true),
                UploadedBy: ko.observable(document ? document.UploadedBy : ""),
                DateTimeCreated: ko.observable(document ? document.DateTimeCreated : ""),
                DateTimeModified: ko.observable(document ? document.DateTimeModified : ""),
                FileLocation: ko.observable(document ? document.FileLocation : ""),
                FileName: ko.observable(document ? document.FileName : ""),
                Type: ko.observable("pdf"),
                URL: ko.observable(""),
                PreviousVersions: ko.observableArray(),
                showPreviousVersions: ko.observable(false),
                DocumentConcurrencyHash: ko.observable(document ? document.DocumentConcurrencyHash : "")
            };
            vmDocument.SubCategoryID.subscribe(function (newValue) {
                if (event.type == "change") {
                    if (newValue == undefined)
                        newValue = null;
                    //save sub category for document
                    var deferred = $.Deferred();
                    //DocumentData.SaveSubCategory(vmDocument.ID(), newValue, vmDocument.DocumentConcurrencyHash())
                    //    .done(function (response: Data.Response<string>) {
                    //        if (response.Success) {
                    //            vmDocument.DocumentConcurrencyHash(response.Payload);
                    //            UI.showNotificationMessage("Subcategory saved", UI.messageTypeValues.success);
                    //        } else {
                    //            UI.showErrorMessage(response.ErrorMessages);
                    //        }
                    //    })
                    //    .always(function () {
                    //        // UI.hideWaitIndicator(me.container, waitContainer);
                    //        deferred.resolve();
                    //    });
                    return deferred.promise();
                }
            });
            var lastIndex = vmDocument.FileName().lastIndexOf('.');
            fileName = vmDocument.FileName().substr(0, lastIndex);
            extension = vmDocument.FileName().substr(lastIndex + 1);
            //var fileParts = vmDocument.FileName().split(".");
            //if (fileParts.length > 1) {
            //    fileName = fileParts[fileParts.length - 2];
            //    extension = fileParts[fileParts.length - 1];
            //}
            _.forEach(document.SubCategories, function (subcategory) {
                vmDocument.SubCategories.push(me.createSubCategories(subcategory));
            });
            vmDocument.Type(extension);
            _.forEach(document.PreviousVersions, function (version) {
                vmDocument.PreviousVersions.push(me.createDocument(version));
            });
            vmDocument.showVersions = function (file) {
                if (vmDocument.showPreviousVersions()) {
                    vmDocument.showPreviousVersions(false);
                }
                else {
                    vmDocument.showPreviousVersions(true);
                }
            };
            vmDocument.RemoveFromTable = function (document) {
                me.documentVm.NewDocuments.remove(document);
                if (me.documentVm.NewDocuments().length == 0)
                    me.container.find("[data-id='uploadSaveButton']").prop('disabled', true);
            };
            var subcategoryMatch = ko.utils.arrayFirst(me.documentVm.SubCategories(), function (thissubcategory) {
                return vmDocument.SubCategoryID() === thissubcategory.ID();
            });
            if (subcategoryMatch != null)
                vmDocument.SubCategoryName(subcategoryMatch.Name());
            vmDocument.openMoveModal = function (document) {
                me.documentVm.DocumentToMove(document);
                me.documentVm.SelectedCategory(null);
                me.documentVm.filterText("");
                me.container.find("div[data-id='moveDialog']").modal("show");
            };
            vmDocument.DeleteDocument = function (document) {
                var deferred = $.Deferred();
                //DocumentData.ChangeDocumentStatus(document.ID(), !document.IsActive(), document.DocumentConcurrencyHash())
                //    .done(function (response: Data.Response<string>) {
                //        if (response.Success) {
                //            vmDocument.DocumentConcurrencyHash(response.Payload);
                //            vmDocument.IsActive(!document.IsActive());
                //            if (document.IsActive())
                //                UI.showNotificationMessage("It is restored", UI.messageTypeValues.success);
                //            else
                //                UI.showNotificationMessage("It has been deleted", UI.messageTypeValues.success);
                //            me.loadRecord(me.documentVm.DocumentGroupID());
                //        } else {
                //            UI.showErrorMessage(response.ErrorMessages);
                //        }
                //    })
                //    .always(function () {
                //        // UI.hideWaitIndicator(me.container, waitContainer);
                //        deferred.resolve();
                //    });
                return deferred.promise();
            };
            vmDocument.IsExternalSave = function (document) {
                var deferred = $.Deferred();
                //DocumentData.IsExternalSave(document.ID(), !document.IsExternal(), document.DocumentConcurrencyHash())
                //    .done(function (response: Data.Response<string>) {
                //        if (response.Success) {
                //            vmDocument.DocumentConcurrencyHash(response.Payload);
                //            vmDocument.IsExternal(!document.IsExternal());
                //            if (document.IsExternal())
                //                UI.showNotificationMessage("It is external", UI.messageTypeValues.success);
                //            else
                //                UI.showNotificationMessage("It is internal", UI.messageTypeValues.success);
                //        } else {
                //            UI.showErrorMessage(response.ErrorMessages);
                //        }
                //    })
                //    .always(function () {
                //        // UI.hideWaitIndicator(me.container, waitContainer);
                //        deferred.resolve();
                //    });
                return deferred.promise();
            };
            vmDocument.DownloadDocument = function (e) {
                var documentUrl = url + "/api/Document/DownloadDocument/" + me.documentVm.ClientID() + "/" + encodeURIComponent(fileName) + "/" + extension + "/" + vmDocument.UniqueID() + "/" + me.documentVm.UserID() + "/" + me.documentVm.DocumentGroupID();
                window.location.assign(documentUrl);
            };
            if (ConfigOptions.launchDocumentViewer === true) {
                var documentUrl = ConfigOptions.documentViewerURL + "/?DocumentId=" +
                    encodeURIComponent(url + "/api/Document/DownloadDocument/" + me.documentVm.ClientID() + "/" + fileName + "/" + extension + "/" + vmDocument.UniqueID() + "/" + me.documentVm.UserID() + "/" + me.documentVm.DocumentGroupID());
                vmDocument.URL(documentUrl);
            }
            else {
                var documentUrl = url + "/api/Document/DownloadDocument/" + me.documentVm.ClientID() + "/" + vmDocument.UniqueID() + "/" + me.documentVm.UserID() + "/" + me.documentVm.DocumentGroupID();
                vmDocument.URL(documentUrl);
            }
            return vmDocument;
        };
        ARDocumentsController.prototype.createDataCaptureFieldValues = function (datacapturefieldvalue) {
            var me = this;
            var vmdatacapturefieldvalues = {
                ID: ko.observable(datacapturefieldvalue ? datacapturefieldvalue.ID : 0),
                CategoryID: ko.observable(datacapturefieldvalue ? datacapturefieldvalue.CategoryID : 0),
                SubCategoryID: ko.observable(datacapturefieldvalue ? datacapturefieldvalue.SubCategoryID : 0),
                DataCaptureFieldID: ko.observable(datacapturefieldvalue ? datacapturefieldvalue.DataCaptureFieldID : 0),
                IsActive: ko.observable(datacapturefieldvalue ? datacapturefieldvalue.IsActive : true),
                DataValue: ko.observable(datacapturefieldvalue ? datacapturefieldvalue.DataValue : "")
            };
            return vmdatacapturefieldvalues;
        };
        ARDocumentsController.prototype.createDataGroupValues = function (name, datavalue) {
            var me = this;
            var vmDataGroupValues = {
                FieldName: ko.observable(name ? name : ""),
                DataValue: ko.observable(datavalue ? datavalue : "")
            };
            return vmDataGroupValues;
        };
        ARDocumentsController.prototype.createDataCaptureFields = function (datacapturefield) {
            var me = this;
            var vmDataCaptureField = {
                ID: ko.observable(datacapturefield ? datacapturefield.ID : 0),
                CategoryID: ko.observable(datacapturefield ? datacapturefield.CategoryID : 0),
                Name: ko.observable(datacapturefield ? datacapturefield.Name : ""),
                DataCaptureFieldTypeID: ko.observable(datacapturefield ? datacapturefield.DataCaptureFieldTypeID : 0),
                IsActive: ko.observable(datacapturefield ? datacapturefield.IsActive : true),
                IntegratedServiceID: ko.observable(datacapturefield ? datacapturefield.IntegratedServiceID : 0),
                IntegratedServiceFieldID: ko.observable(datacapturefield ? datacapturefield.IntegratedServiceFieldID : 0)
            };
            return vmDataCaptureField;
        };
        ARDocumentsController.prototype.confirmChange = function (onConfirmed) {
            var me = this;
            var fieldsChanged = me.haveFieldsChanged();
            if (fieldsChanged) {
                UI.showConfirmDialog("There are unsaved changes on this page. Are you sure you want to close this page and lose these unsaved changes?", function () { onConfirmed(); }, function () { });
            }
            else
                onConfirmed();
        };
        ARDocumentsController.prototype.close = function () {
            var app = Global.App(), self = this;
            var paramId1 = Util.getUrlParam(3);
            if (Util.isNumber(paramId1) && paramId1 > 0) {
                app.router().closeTab("DocMan/Documents" + "/" + paramId1);
            }
            else {
                app.router().closeTab("DocMan/Documents");
            }
        };
        ARDocumentsController.prototype.saveandclose = function () {
            var me = this;
            me.save(true);
        };
        return ARDocumentsController;
    }());
    ARDocuments.ARDocumentsController = ARDocumentsController;
})(ARDocuments || (ARDocuments = {}));
//# sourceMappingURL=ARDocuments.js.map