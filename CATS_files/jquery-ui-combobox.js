
(function ($) {
    $.widget("ui.combobox", {
        _create: function () {

            var wrapper = this.wrapper = $("<span>")
                                .addClass("custom-combobox")
                                .insertAfter(this.element);

            var self = this,
					select = this.element.hide(),
					selected = select.children(":selected"),
					value = selected.val() ? selected.text() : "";





            var input = this.input = $("<input class='form-control'>")

          .appendTo(this.wrapper)
          .val(value)
          .attr("title", "")
          .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")


                   // .insertAfter(select)
					.val(value)
					.autocomplete({
					    delay: 0,
					    minLength: 0,
					    source: function (request, response) {

					        var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
					        response(select.children("option").map(function () {
					            var text = $(this).text();
					            if (this.value && (!request.term || matcher.test(text)))
					                return {
					                    label: text.replace(
											new RegExp(
												"(?![^&;]+;)(?!<[^<>]*)(" +
												$.ui.autocomplete.escapeRegex(request.term) +
												")(?![^<>]*>)(?![^&;]+;)", "gi"
											), "<strong>$1</strong>"),
					                    value: text,
					                    option: this
					                };
					        }));
					    },
					    select: function (event, ui) {

					        ui.item.option.selected = true;
					        self._trigger("selected", event, {
					            item: ui.item.option
					        });
					    },
					    change: function (event, ui) {
					        if (!ui.item) {
					            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
									valid = false;
					            select.children("option").each(function () {
					                if ($(this).text().match(matcher)) {
					                    this.selected = valid = true;
					                    return false;
					                }
					            });
					            if (!valid) {
					                // remove invalid value, as it didn't match anything

					                // $(this).val(""); //AR/CATS
					                // ADD  =================
					                //InquiryForm.InquiryFormController.addComboBoxOption($(this).val());
					                //==============
					                select.val("");
					                input.data("ui-autocomplete").term = "";
					                return false;
					            }
					        }
					    }
					})
					.addClass("ui-widget ui-widget-content ui-corner-left form-control iq-combo ");

            input.data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li></li>")
						.data("item.autocomplete", item)
						.append("<a class='cats-custom-combo-selected'>" + item.label + "</a>")
						.appendTo(ul);
            };
            this.button = $("<button  class='custom-combobox-toggle btn-default btn-custom-combo custom-combo-arrow'></button>")
          // this.button = $("<button><span class='glyphicon glyphicon-search form-control-feedback' aria-hidden='true'>")
         //   this.button = $("<a>")
					.attr("tabIndex", -1)
					.attr("title", "Show All Items")
					//.insertAfter(input)
 .appendTo(this.wrapper)
					.button({
					    icons: {
					        primary: "ui-icon-triangle-1-s"
					    },
					    text: false
					})
					.removeClass("ui-corner-all")
  .addClass("custom-combobox-toggle ui-corner-right")
					//.addClass("ui-corner-right ui-button-icon inquiry-combo-button")
					.click(function () {
					    // close if already visible
					    if (input.autocomplete("widget").is(":visible")) {
					        input.autocomplete("close");
					        return;
					    }

					    // work around a bug (likely same cause as #5265)
					    $(this).blur();

					    // pass empty string as value to search for, displaying all results
					    input.autocomplete("search", "");
					    input.focus();
					});
        },

        destroy: function () {
            this.input.remove();
            this.button.remove();
            this.element.show();
            $.Widget.prototype.destroy.call(this);
        }
    });
})(jQuery);









//(function ($) {
//    $.widget("ui.combobox", {
//        _create: function () {
//            var self = this,
//					select = this.element.hide(),
//					selected = select.children(":selected"),
//					value = selected.val() ? selected.text() : "";
//            var input = this.input = $("<input>")
//					.insertAfter(select)
//					.val(value)
//					.autocomplete({
//					    delay: 0,
//					    minLength: 0,
//					    source: function (request, response) {
//					        var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
//					        response(select.children("option").map(function () {
//					            var text = $(this).text();
//					            if (this.value && (!request.term || matcher.test(text)))
//					                return {
//					                    label: text.replace(
//											new RegExp(
//												"(?![^&;]+;)(?!<[^<>]*)(" +
//												$.ui.autocomplete.escapeRegex(request.term) +
//												")(?![^<>]*>)(?![^&;]+;)", "gi"
//											), "<strong>$1</strong>"),
//					                    value: text,
//					                    option: this
//					                };
//					        }));
//					    },
//					    select: function (event, ui) {
//					        ui.item.option.selected = true;
//					        self._trigger("selected", event, {
//					            item: ui.item.option
//					        });
//					    },
//					    change: function (event, ui) {
//					        if (!ui.item) {
//					            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
//									valid = false;
//					            select.children("option").each(function () {
//					                if ($(this).text().match(matcher)) {
//					                    this.selected = valid = true;
//					                    return false;
//					                }
//					            });
//					            if (!valid) {
//					                // remove invalid value, as it didn't match anything
//					                $(this).val("");
//					                select.val("");
//					                input.data("autocomplete").term = "";
//					                return false;
//					            }
//					        }
//					    }
//					})
//					.addClass("ui-widget ui-widget-content ui-corner-left");

//            input.data("autocomplete")._renderItem = function (ul, item) {
//                return $("<li></li>")
//						.data("item.autocomplete", item)
//						.append("<a>" + item.label + "</a>")
//						.appendTo(ul);
//            };

//            this.button = $("<button type='button'>&nbsp;</button>")
//					.attr("tabIndex", -1)
//					.attr("title", "Show All Items")
//					.insertAfter(input)
//					.button({
//					    icons: {
//					        primary: "ui-icon-triangle-1-s"
//					    },
//					    text: false
//					})
//					.removeClass("ui-corner-all")
//					.addClass("ui-corner-right ui-button-icon")
//					.click(function () {
//					    // close if already visible
//					    if (input.autocomplete("widget").is(":visible")) {
//					        input.autocomplete("close");
//					        return;
//					    }

//					    // work around a bug (likely same cause as #5265)
//					    $(this).blur();

//					    // pass empty string as value to search for, displaying all results
//					    input.autocomplete("search", "");
//					    input.focus();
//					});
//        },

//        destroy: function () {
//            this.input.remove();
//            this.button.remove();
//            this.element.show();
//            $.Widget.prototype.destroy.call(this);
//        }
//    });
//})(jQuery);