var LoginDialog;
(function (LoginDialog) {
    var MainConfig = new Configuration.Main_Config(), ConfigOptions = new Configuration.Config_Config(), AccountId = 0, AccountName = "";
    var Dialog = (function () {
        function Dialog() {
        }
        Dialog.prototype.show = function (accountId, accountName) {
            AccountId = accountId;
            AccountName = accountName;
            var self = this;
            $("#userPass-dialog").css('visibility', 'visible');
            var loginWindow = $("#login-dialog").dialog({
                dialogClass: "no-close",
                title: "Login",
                autoOpen: false,
                modal: true,
                resizable: false,
                draggable: false,
                buttons: {
                    "Login": function () {
                        var selfdialog = $(this);
                        self.login(selfdialog);
                    }
                } //,
            });
            $('#dialog-login-error').text("");
            loginWindow.dialog("open");
        };
        Dialog.prototype.login = function (selfdialog) {
            var self = this, deferred = $.Deferred(), app = Global.App();
            var data = {
                EMail: $('#dialog-username').val(),
                PasswordString: $('#dialog-password').val()
            };
            $('#dialog-login-error').text();
            var self = this;
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "login"]), "POST", data)
                .done(function (response) {
                $("#userPass-dialog").css('visibility', 'hidden');
                if (response.Success && !response.Payload.HasMultipleAccount) {
                    app.setUserSession(response.Payload);
                    selfdialog.dialog("close");
                }
                else if (response.Success && response.Payload.HasMultipleAccount) {
                    app.setUserSession(response.Payload);
                    self.loadUSerAccount(selfdialog);
                }
                else {
                    $('#dialog-login-error').text(response.Messages);
                    $("#userPass-dialog").css('visibility', 'visible');
                    if (response.Payload.IsResetPasswordRequired) {
                        window.location.href = MainConfig.ResetPassword;
                    }
                }
            });
            return deferred.promise();
        };
        Dialog.prototype.loadUSerAccount = function (selfdialog) {
            var self = this, deferred = $.Deferred();
            // hidden the user/pass dialog 
            $("#userPass-dialog").hide();
            $("button:contains('Login')").replaceWith("<input type='button' id='chooseAccount-button' value='Choose Account'/>");
            // load and show the choose account 
            $("#chooseAccount-dialog").css('visibility', 'visible');
            $('#dialog-accoutName').text(AccountName);
            var deferred = $.Deferred();
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "UserAccounts"]), "GET").done(function (response) {
                if (response.Success) {
                    var options = $("#chooseAccount-dropdown");
                    options.empty();
                    $.each(response.Payload, function () {
                        options.append($("<option />").val(this.ID).text(this.Name));
                    });
                    return deferred.promise();
                }
            });
            // set event
            $('#chooseAccount-button').click(function () {
                self.chooseAccount(selfdialog);
            });
            return deferred.promise();
        };
        Dialog.prototype.chooseAccount = function (selfdialog) {
            var self = this, deferred = $.Deferred();
            var selectedAccount = $('#chooseAccount-dropdown').val();
            Util.callWebService(Util.BuildURL([ConfigOptions.baseURL, "ChooseAccount", selectedAccount]), "POST").done(function (response) {
                selfdialog.dialog("close");
                // refresh the dialog and divisible the login 
                // hide the choose account 
                //$("#chooseAccount-dialog").hide();
                $("#chooseAccount-dialog").css('visibility', 'hidden');
                $('#dialog-accoutName').text("");
                $("#userPass-dialog").css('display', 'block');
                $("button:contains('Login')").replaceWith("<input type='button' value='Login'/>");
                if (AccountId != selectedAccount) {
                    window.location.href = MainConfig.StartUpPage;
                }
            });
            return deferred.promise();
        };
        return Dialog;
    }());
    LoginDialog.Dialog = Dialog;
})(LoginDialog || (LoginDialog = {}));
//# sourceMappingURL=loginDialog.js.map