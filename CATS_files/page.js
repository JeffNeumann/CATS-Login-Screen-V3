/// <reference path="../Typings/jquery-1.9.1/jqueryui.d.ts" />
var Page;
(function (Page) {
    var mainConfig = new Configuration.Main_Config;
    var IDLE_TIMEOUT_COUNTER = mainConfig.Idle_Timeout_counter, IdleCounter = 0, IdleTimer, IsProcessing = false, RESPONSE_TIMEOUT_COUNTER = 2, //mins 2
    ResponseTimer, CountDownTimer, SessionWindow, NotificationWindow, phase1 = " You've been inactive for ", phase2 = " minutes, and will be logged out in <span style='color:red'>", phase3 = "</span>. <b>Do you want to stay logged in?</b>";
    var AppPage = (function () {
        function AppPage() {
            var me = this;
            /*Idle related*/
            IdleCounter = 0;
            document.onclick = function () {
                //Though call stopIdleTimer - this will reset the interval counter timer
                IdleCounter = 0;
                Page.AppPage.prototype.startIdleTimer();
            };
            document.onkeypress = function () {
                IdleCounter = 0;
                Page.AppPage.prototype.startIdleTimer();
            };
            document.onmousemove = function () {
                IdleCounter = 0;
                Page.AppPage.prototype.startIdleTimer();
            };
            if (Util.getCookie(Util.COOKIE_AUTHENTICATIONTOKEN).valueOf().length > 0) {
                this.startIdleTimer();
                //  SessionWindow = $("#sessionTimeoutWindow").dialog({
                SessionWindow = $("#customSessionTimeoutWindow").dialog({
                    dialogClass: "timeout-dialog",
                    width: 800,
                    title: "Session Time Out",
                    autoOpen: false,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    buttons: {
                        "Yes": function () {
                            //refresh token
                            var self = $(this);
                            Util.callWebService(Util.LastGetNoParameterUrl, "GET")
                                .done(function () {
                                IdleCounter = 0;
                                clearInterval(CountDownTimer);
                                Page.AppPage.prototype.stopResponseTimer();
                                IsProcessing = false;
                                self.dialog("close");
                            });
                        },
                        "No": function () {
                            $(this).dialog("close");
                            var global = Global.App();
                            global.logoutUser(true);
                            window.location.pathname = "/Shared/Login";
                        }
                    },
                });
            }
        }
        AppPage.prototype.startIdleTimer = function () {
            //clear previous timer
            if (IdleTimer != null || IdleTimer != undefined) {
                this.stopIdleTimer(false);
            }
            IdleTimer = window.setInterval(this.checkIdleTime, 60000); // 1 min
        };
        AppPage.prototype.stopIdleTimer = function (removeEvents) {
            clearInterval(IdleTimer);
            if (removeEvents) {
                document.onclick = null;
                document.onmousemove = null;
                document.onkeypress;
            }
        };
        AppPage.prototype.startResponseTimer = function () {
            //clear previous timer
            if (ResponseTimer != null || ResponseTimer != undefined) {
                this.stopResponseTimer();
            }
            ResponseTimer = setTimeout(function () { Page.AppPage.prototype.checkResponseTimeOut(); }, RESPONSE_TIMEOUT_COUNTER * 60000);
        };
        AppPage.prototype.stopResponseTimer = function () {
            clearTimeout(ResponseTimer);
        };
        AppPage.prototype.checkResponseTimeOut = function () {
            var me = this;
            Page.AppPage.prototype.stopResponseTimer();
            SessionWindow.dialog("close");
            var App = Global.App();
            App.logoutUser(true);
        };
        AppPage.prototype.checkIdleTime = function () {
            var global = Global.App();
            if (global.sessionTimeoutDisabled == false) {
                var me = this, count;
                IdleCounter++;
                if (IdleCounter == IDLE_TIMEOUT_COUNTER && !IsProcessing) {
                    IsProcessing = true;
                    IdleCounter = 0;
                    count = RESPONSE_TIMEOUT_COUNTER * 60;
                    if (SessionWindow) {
                        SessionWindow.html(phase1 + IDLE_TIMEOUT_COUNTER + phase2 + Math.floor(count / 60) + ":" + Page.AppPage.prototype.formatString(count % 60) + phase3);
                        SessionWindow.dialog("open");
                    }
                    CountDownTimer = setInterval(function () {
                        count--;
                        if (count > 0) {
                            SessionWindow.html(phase1 + IDLE_TIMEOUT_COUNTER + phase2 + Math.floor(count / 60) + ":" + Page.AppPage.prototype.formatString(count % 60) + phase3);
                        }
                    }, 1000);
                    Page.AppPage.prototype.startResponseTimer();
                }
            }
        };
        AppPage.prototype.formatString = function (x) {
            return ((x < 10 ? '0' : '') + x).toString();
        };
        return AppPage;
    }());
    Page.AppPage = AppPage;
})(Page || (Page = {}));
//# sourceMappingURL=page.js.map