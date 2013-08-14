(function ($) {
    var classicAlert = window.alert;
    var methods = {
        close: function (id) {
            $("#" + id).effect('slide', { direction: 'up', mode: 'hide' }, 400, function () {
                window.setTimeout(function () { $("#" + id).empty().remove(); }, 1000);
            });
        },
        alert: function (text) { if (typeof text == "undefined") text = ""; classicAlert(text); }
    };
    $.fn.showNotification = function (text) {
        if (arguments.length == 0)
            return methods;

        var $default = {
            className: 'NotificationContainer',
            width: "max",
            header: '',
            footer: '',
            showImage: true,
            informationImage: '../../images/information.png',
            informationClass: 'InformationNotification',
            errorImage: '../../images/error.png',
            errorClass: 'ErrorNotification',
            warningImage: '../../images/warning.png',
            warningClass: 'WarningNotification',
            notificationType: 'message'
        }
        var settings = null;
        if (arguments.length > 1)
            settings = arguments[1];

        if (typeof settings === "object" && settings != null) {
            $default = $.extend($default, settings);
        }
        else if (typeof settings === "string") {
            $default.notificationType = settings;
        }

        var imageURL = $default.informationImage;

        if ($default.notificationType === null)
            $default.notificationType = "message";

        if ($default.notificationType.toLowerCase() == 'warning') {
            imageURL = $default.warningImage;
            $default.className = $default.className + " " + $default.warningClass;
        }
        else if ($default.notificationType.toLowerCase() == 'error') {
            imageURL = $default.errorImage;
            $default.className = $default.className + " " + $default.errorClass;
        }
        else {
            $default.className = $default.className + " " + $default.informationClass;
        }
        var id = "divNotification";
        var srcElem = this
        if (srcElem === window) {
            srcElem = $("body");
            id += "Alert";
        }
        else {
            if (typeof srcElem.id != "undefined" && srcElem.id != null)
                id += srcElem.id;
        }
        $("#" + id, srcElem).remove();
        //Clases:
        //  NotificationContainer
        //  NotificationHeader
        //  NotificationBody
        //  NotificationFooter
        var dwidth = $default.width;
        if ($default.width == "max")
            dwidth = srcElem.outerWidth();
        else {
            if ($default.width.indexOf("%") >= 0)
                dwidth = (srcElem.width() * parseFloat("0." + $default.width.replace("%", "")));
        }

        var notif = $("<div id='" + id + "' class='" + $default.className + "'><table width='100%' cellpadding='0' cellspacing='0' id='tblNotificationBody'></table></div>")
        .appendTo(srcElem)
        .css({
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 9999,
            visible: 'none',
            width: dwidth
        });

        notif.position({
            my: "center top",
            at: "center top",
            of: srcElem
        });

        var content = "";
        if ($default.showImage)
            content = "<td width='32px' class='tdNotificationImage'><img src='" + imageURL + "'/></td>";

        content = "<tr>" + content + "<td align='center' valign='middle'><span id='NotificationText' class='spNotificationBody'>" + text + "</span></td></tr>";
        content = content + "<tr><td colspan='2' align='right' valign='bottom' class='tdClose'>&nbsp;<span class='spClose' onclick='$().showNotification().close(\"" + id + "\")'>cerrar</span></td></tr>";
        $("#tblNotificationBody", notif).append($(content));
        $(".spClose", notif).hide();
        notif.effect('slide', { direction: 'up' }, 200, function () {
            $(this).effect('bounce', { direction: 'up', times: 3, duration: 300 }, function () {
                $(".spClose", $(this)).show();
            })
        });
        //esto está porque se usa un min-height en la css y no distribuye bien el height proporcional de los div internos.
        notif.height(notif.height())
        $(".NotificationBody").css({ verticalAlign: 'middle' });
    }
    window.alert = $("body").showNotification;
})(jQuery);    