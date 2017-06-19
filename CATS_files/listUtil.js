/// <reference path="../../../../scripts/typings/jquery-1.9.1/jquery.d.ts" />
// General Purpose Widgets related to lists and grids
var ListUtil;
(function (ListUtil) {
    //Constants
    var TEMPLATE_FILE_NAME = "listUtil";
    var TEMPLATE_LISTUTIL_FILTER = "template_listUtil_filter";
    var TEMPLATE_LISTUTIL_GRIDFILTER = "template_listUtil_gridfilter";
    var TEMPLATE_LISTUTIL_LIST = "template_listUtil_list";
    var TEMPLATE_LISTUTIL_TREEVIEW = "template_listUtil_treeview";
    var FilterUIWidget = (function () {
        //Constructors
        function FilterUIWidget(settings) {
            var me = this;
            this.Settings = settings;
            //Set defaulte values for settings not supplied
            if (settings.ShowFilterText == null) {
                settings.ShowFilterText = true;
            }
            if (settings.ShowAddButton == null) {
                settings.ShowAddButton = false;
            }
            if (settings.ShowRefreshButton == null) {
                settings.ShowRefreshButton = true;
            }
            if (settings.ShowFilterMenu == null) {
                settings.ShowFilterMenu = true;
            }
            if (settings.FilterMenu == null) {
                //Set to empty array to kendo doesn't error
                settings.FilterMenu = [];
                settings.ShowFilterMenu = false;
            }
            if (settings.ShowExportButton == null) {
                settings.ShowExportButton = false;
            }
            this.viewModel = kendo.observable({
                Settings: settings,
                SearchText: "",
                change: function (e) {
                    me.notifyOfChange();
                },
                add: function (e) {
                    //  ////
                    me.notifyOfAdd();
                },
                refresh: function (e) {
                    me.notifyOfRefresh();
                },
                exportClick: function (e) {
                    me.notifyOfExport();
                },
                onKeyPress: function (e) {
                    //if (e.which === 13) {
                    //    me.notifyOfChange();
                    //}
                }
            });
        }
        FilterUIWidget.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LISTUTIL_FILTER, this.container)
                .done(function () {
                //Bind the view model
                kendo.bind(me.container, me.viewModel);
                //Create controls
                me.container.find("ul[data-id='filterMenu']").kendoMenu();
                //Bind events
                //Trap enter key and do search
                me.container.find("input[data-id='filterSearchText']").on("keydown", function (event) {
                    return me.searchKeyDown(event);
                });
                deferred.resolve();
            });
            return deferred.promise();
        };
        FilterUIWidget.prototype.showAddButton = function (value) {
            this.viewModel.set("Settings.ShowAddButton", value);
            kendo.bind(this.container, this.viewModel);
        };
        FilterUIWidget.prototype.change = function (callback) {
            this.changeCallback = callback;
        };
        FilterUIWidget.prototype.add = function (callback) {
            this.addCallback = callback;
        };
        FilterUIWidget.prototype.refresh = function (callback) {
            this.refreshCallback = callback;
        };
        FilterUIWidget.prototype.exportClick = function (callback) {
            this.exportCallback = callback;
        };
        FilterUIWidget.prototype.notifyOfChange = function () {
            if (this.changeCallback != null) {
                //Notify the creator of this object that a filter value has changed
                this.changeCallback(this.getFilterValues());
            }
        };
        FilterUIWidget.prototype.notifyOfSearchTextChange = function (searchText) {
            if (this.changeCallback != null) {
                //Notify the creator of this object that a filter value has changed
                this.changeCallback(this.getFilterValues());
            }
        };
        FilterUIWidget.prototype.notifyOfAdd = function () {
            if (this.addCallback != null) {
                this.addCallback();
            }
        };
        FilterUIWidget.prototype.notifyOfRefresh = function () {
            if (this.refreshCallback != null) {
                this.refreshCallback();
            }
        };
        FilterUIWidget.prototype.notifyOfExport = function () {
            if (this.exportCallback != null) {
                this.exportCallback();
            }
        };
        FilterUIWidget.prototype.getFilterValues = function () {
            var filterValues = {}, filterMenu = this.viewModel.get("Settings").get("FilterMenu");
            filterValues.SearchText = this.viewModel.get("SearchText");
            if (filterMenu != null) {
                filterValues.Options = filterMenu;
            }
            return filterValues;
        };
        //private methods
        FilterUIWidget.prototype.searchKeyDown = function (event) {
            var me = this, keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
            this.viewModel.set("SearchText", $(event.target).val());
            ///console.log('SearchText: ' + this.viewModel.get("SearchText"));
            if (keyCode == 13) {
                me.notifyOfChange();
                return false;
            }
            else {
                if (me.searchTimeoutID != null) {
                    window.clearTimeout(me.searchTimeoutID);
                }
                //Wait 1/2 second before refreshing the tree.  This basically will wait
                //until the user is done typing before refreshing
                me.searchTimeoutID = window.setTimeout(function () {
                    me.notifyOfChange();
                }, 500);
                return true;
            }
        };
        return FilterUIWidget;
    }());
    ListUtil.FilterUIWidget = FilterUIWidget;
    ;
    var GridFilterUIWidget = (function () {
        //Constructors
        function GridFilterUIWidget(settings) {
            this.AddMenu = [];
            var me = this;
            //Set defaulte values for settings not supplied
            if (settings.ShowSearchText == null) {
                settings.ShowSearchText = true;
            }
            if (settings.ShowAddButton == null) {
                settings.ShowAddButton = false;
            }
            if (settings.ShowNewButton == null) {
                settings.ShowNewButton = false;
            }
            if (settings.ShowRefreshButton == null) {
                settings.ShowRefreshButton = true;
            }
            if (settings.ShowFilterMenu == null) {
                settings.ShowFilterMenu = true;
            }
            if (settings.FilterMenu == null) {
                //Set to empty array to kendo doesn't error
                settings.FilterMenu = [];
                settings.ShowFilterMenu = false;
            }
            if (settings.AddMenu == null) {
                settings.AddMenu = [];
            }
            if (settings.ShowViewMenu == null) {
                settings.ShowViewMenu = true;
            }
            if (settings.ViewMenu == null) {
                //Set to empty array to kendo doesn't error
                settings.ViewMenu = [];
                settings.ShowViewMenu = false;
            }
            if (settings.ShowExportButton == null) {
                settings.ShowExportButton = false;
            }
            if (settings.ShowExpandButton == null) {
                settings.ShowExpandButton = false;
            }
            if (settings.ShowAdvancedSearchButton == null) {
                settings.ShowAdvancedSearchButton = false;
            }
            if (settings.ShowDateRange == null) {
                settings.ShowDateRange = false;
            }
            if (settings.Buttons == null) {
                //Set to empty array to kendo doesn't error
                settings.Buttons = [];
            }
            me.AddMenu = settings.AddMenu;
            me.menu = null;
            me.SearchText = "";
            this.viewModel = kendo.observable({
                Settings: settings,
                SearchText: "",
                View: "",
                StartDate: "",
                EndDate: "",
                menu: jQuery,
                clearSearchText: function (e) {
                    e.preventDefault();
                    me.setSearchBoxPlaceHolder("search");
                    me.viewModel.set("SearchText", "");
                    me.notifyOfChange();
                    me.notifyOfAdvancedSearchClear();
                },
                change: function (e) {
                    me.notifyOfChange();
                },
                add: function (e) {
                    me.notifyOfAdd(e);
                },
                newClick: function () {
                    me.notifyOfNew();
                },
                refresh: function (e) {
                    me.notifyOfRefresh();
                },
                exportClick: function (e) {
                    me.notifyOfExport();
                },
                expandClick: function (e) {
                    me.notifyOfExpand();
                },
                advancedSearchClick: function (e) {
                    me.notifyOfAdvancedSearch();
                },
                advancedSearchClear: function (e) {
                    me.notifyOfAdvancedSearchClear();
                },
                setAddMenu: function (e) {
                }
            });
        }
        GridFilterUIWidget.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            app.templates()
                .render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LISTUTIL_GRIDFILTER, this.container)
                .done(function () {
                //
                //Bind the view model
                //    debugger
                kendo.bind(me.container, me.viewModel);
                var Forms = me.AddMenu;
                //Create controls
                me.container.find("ul[data-id='filterMenu']").kendoMenu();
                var menu = me.container.find("#addMenu").kendoMenu({
                    direction: "right", orientation: "vertical",
                }).data("kendoMenu");
                me.container.find("ul[data-id='buttons']").kendoMenu();
                for (var i = 0; i < Forms.length; i++) {
                    var form = Forms[i];
                    menu.append({ text: form.text, cssClass: form.text.replace(/ /g, '') }, "");
                    if (form.items != null || form.items != undefined) {
                        for (var j = 0; j < form.items.length; j++) {
                            //  menu.append({ text: "<span id='" + form.items[j].url + "'>" + form.items[j].text + "</span>", encoded: false, value: form.items[j].url }, $("." + form.text.replace(/ /g, '')));
                            menu.append("<li data-selectable='true' data-client='" + form.items[j].clientID + "' data-form='" + form.items[j].formID + "' data-id='" + form.items[j].url + "'>" + form.items[j].text + "</li>", $("." + form.text.replace(/ /g, '')));
                        }
                    }
                }
                //Bind events
                //Trap enter key and do search
                me.container.find("input[data-id='filterSearchText']").on("keydown", function (event) {
                    return me.searchKeyDown(event);
                });
                deferred.resolve();
            });
            return deferred.promise();
        };
        GridFilterUIWidget.prototype.onSelect = function (e) {
        };
        GridFilterUIWidget.prototype.change = function (callback) {
            this.changeCallback = callback;
        };
        GridFilterUIWidget.prototype.add = function (callback) {
            this.addCallback = callback;
        };
        GridFilterUIWidget.prototype.newClick = function (callback) {
            this.newCallback = callback;
        };
        GridFilterUIWidget.prototype.refresh = function (callback) {
            this.refreshCallback = callback;
        };
        GridFilterUIWidget.prototype.exportClick = function (callback) {
            this.exportCallback = callback;
        };
        GridFilterUIWidget.prototype.expandClick = function (callback) {
            this.expandCallback = callback;
        };
        GridFilterUIWidget.prototype.advancedSearchClick = function (callback) {
            this.advancedSearchCallback = callback;
        };
        GridFilterUIWidget.prototype.advancedSearchClear = function (callback) {
            this.advancedSearchClearCallback = callback;
        };
        GridFilterUIWidget.prototype.notifyOfChange = function () {
            if (this.changeCallback != null) {
                //Notify the creator of this object that a filter value has changed
                this.changeCallback(this.getFilterValues());
            }
        };
        GridFilterUIWidget.prototype.notifyOfAdd = function (e) {
            if (this.addCallback != null) {
                this.addCallback(e);
            }
        };
        GridFilterUIWidget.prototype.notifyOfNew = function () {
            if (this.newCallback != null) {
                this.newCallback();
            }
        };
        GridFilterUIWidget.prototype.notifyOfRefresh = function () {
            if (this.refreshCallback != null) {
                this.refreshCallback();
            }
        };
        GridFilterUIWidget.prototype.notifyOfExport = function () {
            if (this.exportCallback != null) {
                this.exportCallback();
            }
        };
        GridFilterUIWidget.prototype.notifyOfExpand = function () {
            if (this.expandCallback != null) {
                this.expandCallback();
            }
        };
        GridFilterUIWidget.prototype.notifyOfAdvancedSearch = function () {
            if (this.advancedSearchCallback != null) {
                this.advancedSearchCallback();
            }
        };
        GridFilterUIWidget.prototype.notifyOfAdvancedSearchClear = function () {
            if (this.advancedSearchClearCallback != null) {
                this.advancedSearchClearCallback();
            }
        };
        GridFilterUIWidget.prototype.getFilterValues = function () {
            var filterValues = {}, filterMenu = this.viewModel.get("Settings").get("FilterMenu");
            filterValues.SearchText = this.viewModel.get("SearchText");
            filterValues.View = this.viewModel.get("View");
            filterValues.StartDate = kendo.toString(this.viewModel.get("StartDate"), "MM/dd/yyyy");
            if (filterValues.StartDate == null) {
                filterValues.StartDate = "";
            }
            filterValues.EndDate = kendo.toString(this.viewModel.get("EndDate"), "MM/dd/yyyy");
            if (filterValues.EndDate == null) {
                filterValues.EndDate = "";
            }
            if (filterMenu != null) {
                filterValues.Options = filterMenu;
            }
            return filterValues;
        };
        GridFilterUIWidget.prototype.setDateRange = function (startDate, endDate) {
            this.viewModel.set("StartDate", startDate);
            this.viewModel.set("EndDate", endDate);
        };
        GridFilterUIWidget.prototype.setSearchBoxPlaceHolder = function (placeHolderText) {
            var me = this;
            var searchTextBox = this.container.find("[data-id='filterSearchText']");
            this.viewModel.set("SearchText", "");
            searchTextBox.attr("placeholder", placeHolderText);
        };
        //private methods
        GridFilterUIWidget.prototype.searchKeyDown = function (event) {
            var me = this, keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
            if (keyCode == 13) {
                this.viewModel.set("SearchText", $(event.target).val());
                ////console.log('SearchText: ' + this.viewModel.get("SearchText"));
                me.notifyOfChange();
                return false;
            }
            else {
                //if (me.searchTimeoutID != null) {
                //    window.clearTimeout(me.searchTimeoutID);
                //}
                ////Wait 1/2 second before refreshing the tree.  This basically will wait
                ////until the user is done typing before refreshing
                //me.searchTimeoutID = window.setTimeout(
                //    function () {
                //        me.notifyOfChange();
                //    },
                //    500);
                return true;
            }
        };
        return GridFilterUIWidget;
    }());
    ListUtil.GridFilterUIWidget = GridFilterUIWidget;
    ;
    //-------------------------------------------------------------------------------
    //General purpose control for displaying a list of data.  Includes a pager control
    //Assumes filtering is done on the server
    var ListUIWidget = (function () {
        //Constructors
        function ListUIWidget(templateFileName, itemTemplate, showPreviousNext) {
            this.templateFileName = templateFileName;
            this.itemTemplate = itemTemplate;
            this.showPreviousNext = showPreviousNext;
            this.lastSelectedIndex = null;
            this.previousSelectedIndex = null;
            this.tempIndex = null;
            this.disableSelectCallback = false;
        }
        //Public methods
        //Outputs the control to the HTML
        //returns a jQuery promise.
        ListUIWidget.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            //Load the master template for the list control, and the template
            //used to render the items in the list
            $.when(app.templates().render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LISTUTIL_LIST, this.container), app.templates().render(me.templateFileName, moduleName, moduleArea, me.itemTemplate))
                .done(function () {
                //save references to commonly used elemnts
                me.listViewContainer = container.find("div[data-id='listView']");
                me.pagerContainer = container.find("div[data-id='pager']");
                //Create controls
                me.listView = me.listViewContainer.kendoListView({
                    selectable: "single",
                    template: kendo.template($("#" + me.itemTemplate).html()),
                    change: function () {
                        var data = this.dataSource.view(), index = this.select().index();
                        me.previousSelectedIndex = me.lastSelectedIndex;
                        me.lastSelectedIndex = index;
                        if (me.disableSelectCallback) {
                            //Callback was disables, re-enable it
                            me.disableSelectCallback = false;
                        }
                        else {
                            if (me.userSelectCallback != null) {
                                me.userSelectCallback(data[index]);
                            }
                        }
                    }
                }).data("kendoListView");
                //By default the change event won't fire if the mouse moves
                //at all during the click.  This line works around that issue
                //and says lets the mouse move up to 40 pixels during a click.
                //me.listView.selectable.userEvents.threshold = 40;
                me.refreshPager(null);
                deferred.resolve();
            });
            return deferred.promise();
        };
        //Put data into this control.  
        //Call after rendering the control
        ListUIWidget.prototype.load = function (dataSource, filter) {
            this.refreshPager(dataSource);
            this.listView.setDataSource(dataSource);
        };
        //Refresh the list with new filter tables
        ListUIWidget.prototype.updateFilter = function (filter) {
            //Do nothing, not called because we are doing server side filtering
        };
        //Set callback for when a user is selected
        ListUIWidget.prototype.recordSelect = function (callback) {
            this.userSelectCallback = callback;
        };
        ListUIWidget.prototype.resize = function (height) {
            var listHeight = height - this.pagerContainer.outerHeight(true);
            if (listHeight > 0) {
                this.listViewContainer.height(listHeight);
            }
        };
        ListUIWidget.prototype.selectPreviousItem = function () {
            //Select the previously selected item, if there was one
            if (this.previousSelectedIndex != null) {
                // ////
                this.disableSelectCallback = true;
                if (this.tempIndex != null && this.tempIndex == this.previousSelectedIndex) {
                    this.listView.select(this.listView.element.children()[this.lastSelectedIndex]);
                }
                else {
                    this.listView.select(this.listView.element.children()[this.tempIndex]);
                }
                this.tempIndex = this.previousSelectedIndex;
            }
        };
        //private methods
        //Refreshed the pager control.  Note that the data source
        //must be set when the control is created and cannot be changed.
        //So to refresh the control we have to remove it, then re-create it.
        ListUIWidget.prototype.refreshPager = function (dataSource) {
            if (this.pager != null) {
                this.pager.destroy();
                $(this.pagerContainer).empty();
            }
            this.pager = this.pagerContainer.kendoPager({
                dataSource: dataSource,
                numeric: false,
                previousNext: this.showPreviousNext
            }).data("kendoPager");
        };
        return ListUIWidget;
    }());
    ListUtil.ListUIWidget = ListUIWidget;
    ;
    var TreeViewUIWidget = (function () {
        //Constructors
        //getFilteredItems - returns a list of items that match the filter
        //dataModel - maps the fields in the data to what the kendo Grid View needs
        //          should include mapping for: id, hasChildren, children and expanded
        function TreeViewUIWidget(templateFileName, itemTemplate, getFilteredItems, dataModel) {
            this.templateFileName = templateFileName;
            this.itemTemplate = itemTemplate;
            this.getFilteredItems = getFilteredItems;
            this.dataModel = dataModel;
            this.lastSelectedIndex = null;
            this.previousSelectedIndex = null;
            this.disableSelectCallback = false;
        }
        //Public methods
        //Outputs the control to the HTML
        //returns a jQuery promise.
        TreeViewUIWidget.prototype.render = function (container, moduleName, moduleArea) {
            var me = this, app = Global.App(), deferred = $.Deferred();
            this.container = container;
            //Load the master template for the list control, and the template
            //used to render the items in the list
            $.when(app.templates().render(TEMPLATE_FILE_NAME, moduleName, moduleArea, TEMPLATE_LISTUTIL_TREEVIEW, this.container), app.templates().render(me.templateFileName, moduleName, moduleArea, me.itemTemplate))
                .done(function () {
                //save references to commonly used elemnts
                me.treeViewContainer = container.find("div[data-id='treeView']");
                //Create controls
                me.treeView = me.treeViewContainer.kendoTreeView({
                    template: kendo.template($("#" + me.itemTemplate).html()),
                    select: function (e) {
                        var data = this.dataItem(e.node);
                        if (me.disableSelectCallback) {
                            //Callback was disables, re-enable it
                            me.disableSelectCallback = false;
                        }
                        else {
                            if (me.userSelectCallback != null) {
                                me.userSelectCallback(data);
                            }
                        }
                        /*
                        var data = this.dataSource.view(),
                            index = this.select().index();
                        console.log();
                        me.previousSelectedIndex = me.lastSelectedIndex;
                        me.lastSelectedIndex = index;*/
                    }
                }).data("kendoTreeView");
                deferred.resolve();
            });
            return deferred.promise();
        };
        //Put data into this control.  
        //Call after rendering the control
        TreeViewUIWidget.prototype.load = function (dataSource, filter) {
            //Read the data and convert to a plain array
            this.allItems = dataSource;
            this.filter = filter;
            this.loadTreeView();
        };
        //Refresh the list with new filter tables
        TreeViewUIWidget.prototype.updateFilter = function (filter) {
            this.filter = filter;
            this.loadTreeView();
        };
        //Set callback for when a user is selected
        TreeViewUIWidget.prototype.recordSelect = function (callback) {
            this.userSelectCallback = callback;
        };
        TreeViewUIWidget.prototype.resize = function (height) {
            if (height > 0) {
                this.treeViewContainer.height(height);
            }
        };
        TreeViewUIWidget.prototype.selectPreviousItem = function () {
            //Select the previously selected item, if there was one
            if (this.previousSelectedIndex != null) {
                //Do not do a callback on this change
                this.disableSelectCallback = true;
                this.treeView.select(this.treeView.element.children()[this.previousSelectedIndex]);
            }
        };
        //private methods
        //Filter the list and update the data source and controls
        TreeViewUIWidget.prototype.loadTreeView = function () {
            if (this.treeView == null) {
                //Control not loaded yet
                return;
            }
            this.treeView.setDataSource(new kendo.data.HierarchicalDataSource({
                data: this.getFilteredItems(this.allItems, this.filter),
                schema: {
                    model: this.dataModel
                }
            }));
        };
        return TreeViewUIWidget;
    }());
    ListUtil.TreeViewUIWidget = TreeViewUIWidget;
    ;
})(ListUtil || (ListUtil = {}));
//# sourceMappingURL=listUtil.js.map