$.get("/App/Views/Shared/template/Controls/list.html", function (response) {
    if (!ko.components.isRegistered('list')) {
        ko.components.register('list', {
            viewModel: function (params) {
                var self = this;
                // Util properties
                self.isNothing = function (obj) {
                    return obj === null || typeof obj === 'undefined';
                };
                self.isEmptyString = function (str) {
                    return (self.isNothing(str) || 0 === str.length);
                };
                // Config global variable definition
                // Get properties from control
                self.Collection = params.collection;
                self.Text = params.text;
                self.Abbr = self.isEmptyString(params.abbr) ? "" : params.abbr; // optional
                self.Desc = self.isEmptyString(params.description) ? "" : params.description; // optional
                self.Desc_2 = self.isEmptyString(params.description_2) ? "" : params.description_2; // optional
                //self.LoadingList = params.loading;
                self.Loading = params.loading;
                self.RefreshFunc = params.refresh;
                self.Add = params.add;
                self.Click = params.click;
                self.IsGroupHeader = (params.isGroupHeader != undefined) ? params.isGroupHeader :
                    function () {
                        return false;
                    };
                self.HideFilterButton = params.hideFilter;
                self.HideAllButtons = params.hideButtons;
                self.ShowAddButton = ko.computed(function () {
                    return self.Add != undefined;
                }, self);
                // Get Filter properties from control and analyze them
                // *** position is important , it should be before Filters
                self.OppositeItems = [];
                self.Fil = params.filters;
                self.Filters = ko.computed(function () {
                    var myFilters = [];
                    for (var i = 0; i < self.Fil.length; i++) {
                        var mapped = {};
                        for (var prop in self.Fil[i]) {
                            if (self.Fil[i].hasOwnProperty(prop)) {
                                if (prop == 'filter') {
                                    var value = self.isEmptyString(self.Fil[i]['default']) ? false : self.Fil[i]['default'];
                                    mapped[self.Fil[i][prop]] = ko.observable(value);
                                    mapped['filterName'] = ko.observable(self.Fil[i][prop]);
                                }
                                if (prop == 'title') {
                                    mapped[prop] = ko.observable(self.Fil[i][prop]);
                                }
                                if (prop == 'opposite') {
                                    self.OppositeItems.push({ name: self.Fil[i]['filter'], value: self.Fil[i][prop] });
                                }
                            }
                        }
                        myFilters.push(mapped);
                    }
                    return myFilters;
                });
                // *** position is important , it should be immediately after Filters
                self.AddOppositeItemsToCollection = ko.computed(function () {
                    for (var i = 0; i < self.Collection().length; i++) {
                        var item = self.Collection()[i];
                        for (var j = 0; j < self.OppositeItems.length; j++) {
                            var oppItem = self.OppositeItems[j];
                            item[oppItem.name] = !item[oppItem.value]();
                        }
                    }
                });
                self.GetCheckFunc = function (data) {
                    return data[data["filterName"]()];
                };
                // Actions properties
                //self.Loading = ko.computed(function () {
                //    
                //    return self.LoadingList;
                //}, self);
                self.IsFilterShow = ko.observable(false);
                self.ShowFilter = function () {
                    self.IsFilterShow(true);
                };
                self.HideFilter = function () {
                    self.IsFilterShow(false);
                };
                self.Refresh = function () {
                    self.RefreshFunc(null);
                };
                // Get Properties
                self.GetText = function (data) {
                    return data[self.Text];
                };
                self.GetAbbr = function (data) {
                    return self.isEmptyString(self.Abbr) ? data[self.Abbr] : "(" + data[self.Abbr] + ")";
                };
                self.GetDesc = function (data) {
                    return data[self.Desc];
                };
                self.GetDesc2 = function (data) {
                    return data[self.Desc_2];
                };
                // Search
                self.SearchText = ko.observable();
                self.SearchText.subscribe(function (newValue) {
                    self.FilterCollection();
                });
                self.Search = function () {
                    // **************** 
                    self.FilterCollection();
                };
                // Main filter collection
                self.FilterCollection = ko.computed(function () {
                    var length = self.Filters().length, filters = self.Filters, orgLength = self.Collection().length, 
                    //org = sort(self.Collection()),//when we add new item , we need to sort
                    org = self.Collection(), arr = [], newcollection = ko.observableArray();
                    for (var i = 0; i < orgLength; i++) {
                        // Include (check boxes)
                        var sum = 0;
                        for (var j = 0; j < length; j++) {
                            var item = org[i], filterName = filters()[j].filterName();
                            sum = sum + (filters()[j][filterName]() ? (ko.unwrap(item[filterName]) == filters()[j][filterName]() ? 1 : 0) : 0);
                        }
                        // Filter (Texts)
                        var textFilter = self.isNothing(self.SearchText()) ? true : item[self.Text]().toLowerCase().indexOf(self.SearchText().toLowerCase()) > -1;
                        // final decision
                        if (sum != 0 && textFilter) {
                            arr.push(org[i]);
                        }
                    }
                    newcollection(arr);
                    return newcollection();
                }, this);
                self.HasRecord = ko.computed(function () {
                    return self.FilterCollection().length > 0;
                });
                function sort(arr) {
                    var sortedArr = arr.sort(function (a, b) {
                        if (a[self.Text] < b[self.Text])
                            return -1;
                        if (a[self.Text] > b[self.Text])
                            return 1;
                        return 0;
                    });
                    return sortedArr;
                }
            },
            template: response
        });
    }
});
ko.bindingHandlers.SetSelectCSS = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $elem = $(element);
        $(element).mouseup(function (e) {
            //cat-ud-pointer
            //reset all background-color
            $elem.parent().children().css("background-color", "#ffffff");
            $elem.parent().children().css("border-left", "4px solid transparent");
            $elem.parent().children().find(".cat-ud-pointer").css("color", "#ccc");
            $elem.parent().children().removeClass("cat-ud-custom-row");
            //set select background-color for current element 
            $elem.css("background-color", "#e3e8eb");
            $elem.find(".cat-ud-pointer").css("color", "#e31937");
            $elem.css("border-left", "4px solid #e31937");
            $elem.addClass("cat-ud-custom-row");
        });
        $(element).hover(function () {
            var $self = $(this);
            $self.find(".cat-ud-pointer").css("color", "#e31937");
            $self.css("border-left", "4px solid #e31937");
            $self.css("background-color", "#e3e8eb");
        }, function () {
            var $self = $(this);
            var hasCatUserDefinedClass = $self.hasClass("cat-ud-custom-row");
            if (hasCatUserDefinedClass) {
                $self.find(".cat-ud-pointer ").css("color", "#e31937");
                $self.css("border-left", "4px solid #e31937");
            }
            else {
                $self.find(".cat-ud-pointer ").css("color", "#ccc");
                $self.css("border-left", "4px solid transparent");
                $self.css("background-color", "white");
            }
        });
    }
};
//# sourceMappingURL=list.js.map