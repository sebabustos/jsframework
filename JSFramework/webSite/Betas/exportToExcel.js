(function ($) {
    var $default = {
        URL: null,
        opacity: .95,
        appendTo: "body",
        width: $("body").width(),
        showLoadingImg: true,
        loadingText: 'Descargando... Aguarde un instante por favor',
        loadingImg: '../images/loading.gif',
        showClose: true,
        closeImg: '../images/close.png',
        closeText: 'Al finalizar la descarga cierre este mensaje->',
        onDownloadComplete: null,
        onBeforeDownload: function () { }
    };
    var methods = {
        clearDownloadElements: function () {
            $(".divCourtain").remove();
            $("#ifrDownload").remove();
            $("[Download='true']").css({ visibility: 'visible' });
        },
        cancelDownload: function () {
            $("#ifrDownload").attr("src", "about:blank");
            $().downloadFile('clearDownloadElements');
        },
        ifrDownload_onReadyStateChange: function () {
            if (document.readyState == "complete")
                $().downloadFile('clearDownloadElements');
        },
        destroy: function () {
            this.removeAttr("downloadFile");
            this.unbind("click");
            this.removeData("downloadFileConfig");
        }
    };
    var downloadFile = function (options) {
        if (typeof options === "string" && options !== null && options !== "") {
            if (methods[options]) {
                //llama al método pasándole el objeto y quitando el primer parámetro, ya que es el nombre del método a ejecutars
                return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
        else if (typeof options === 'object' || !options) {
            var settings = $.extend($default, options);
            settings.width = options.width = $(settings.appendTo).width() - 10;
            if (settings.onBeforeDownload instanceof Function) {
                //Si el resultado del OnBeforeDownload es falso se cancela la Downloadación.
                if (settings.onBeforeDownload() === false)
                    return;
            }

            methods.cancelDownload();
            var url = settings.URL;

            if (settings.URL instanceof Function)
                url = settings.URL();

            if (url != null && url != "") {
                if (url.indexOf("uid") < 0) {
                    var date = new Date();
                    var uid = date.getTime();
                    if (url.indexOf("?") >= 0)
                        url += "&uid=" + uid;
                    else
                        url += "?uid=" + uid;
                }

                var divCourtainHtml = "<div id='divDownload' class='divCourtain'><table width='100%' cellspacing='0' cellpadding='0' class='tblCourtain'><tr><td class='tdDownloading'>";
                if (settings.showLoadingImg)
                    divCourtainHtml += "<img id='imgLoading' src='" + settings.loadingImg + "' alt=''/>";

                divCourtainHtml += "<span class='spDownloadingText'>" + settings.loadingText + "</span></td>";
                if (settings.showClose) {
                    divCourtainHtml += "<td class='tdClose'>";
                    divCourtainHtml += "<table width='100%' cellpadding='0' cellspacing='0' class='tableClose'><tr>";
                    divCourtainHtml += "<td align='center' valign='middle' class='tdCloseText'>" + settings.closeText + "</td>";
                    divCourtainHtml += "<td align='center' valign='middle' class='tdCloseImage'><img src='" + settings.closeImg + "' onclick='$().downloadFile(\"cancelDownload\");'/></td>";
                    divCourtainHtml += "</tr></table>";
                    divCourtainHtml += "</td>";
                }
                divCourtainHtml += "</tr></table></div>";


                $(divCourtainHtml).appendTo($(settings.appendTo))
                    .css({
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: settings.width,
                        opacity: settings.opacity
                    });
                if (typeof src !== "undefined" && src !== null) {
                    $(src).css({ visibility: 'hidden' });
                    $(src).attr("downloadFile", 'true');
                }

                var ifrDownload = $("<iframe id='ifrDownload' src='" + url + "' uid=" + uid + " retries='100'></iframe>")
                    .hide()
                    .bind("load", function () {
                        if (typeof settings.onDownloadComplete == "function")
                            settings.onDownloadComplete();

                        $().downloadFile("ifrDownload_onReadyStateChange");
                    })
                            .bind("readystatechange", function () {
                                if (typeof settings.onDownloadComplete == "function")
                                    settings.onDownloadComplete();

                                $().downloadFile("ifrDownload_onReadyStateChange");
                            });
                ifrDownload.appendTo("body");
                var validateCookie = function (uid) {
                    var $ifrDownload = $("#ifrDownload");
                    var retries = $("#ifrDownload").attr("retries");
                    if (isNaN(retries))
                        retries = 0;
                    else
                        retries = parseFloat(retries);
                    if (retries > 0) {
                        retries--;
                        $("#ifrDownload").attr("retries", retries);

                        var uid = $ifrDownload.attr("uid");
                        if (typeof uid !== "undefined" && uid !== null && uid !== "") {
                            var parts = document.cookie.split("downloadedFile=");
                            var cookie;
                            if (parts.length == 2)
                                cookie = parts.pop().split(";").shift();
                            if (typeof cookie !== "undefined" && cookie !== null && cookie !== "" && cookie == uid) {
                                document.cookie = "downloadedFile=deleted; expires=" + new Date(0).toUTCString();
                                $().downloadFile('clearDownloadElements');
                            }
                            else
                                window.setTimeout(validateCookie, 1000, uid);
                        }
                    }
                };
                window.setTimeout(validateCookie, 1000, uid);
            }
        }
        else {
            $.error('El método: \"' + method + '\" no existe en la Downloadación.');
        }
        return false;
    };

    $.downloadFile = downloadFile;

    $.fn.downloadFile = function (options) {
        if (methods[options]) {
            //llama al método pasándole el objeto y quitando el primer parámetro, ya que es el nombre del método a ejecutars
            methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof options === 'object' || !options) {
            Init(this);
        }
        else {
            $.error('El método: \"' + method + '\" no existe en la Downloadación.');
        }

        return this;
    };

    function Init(src) {
        if (src.attr("downloadFile") !== "undefined" && src.attr("downloadFile") === "true") {
            methods["destroy"].apply(src);
        }

        src.data("downloadFileConfig", options);
        src.attr("downloadFile", "true");

        src.click(function () {
            $this.css({ visibility: 'hidden' });
            downloadFile(options);
        });
    }
})(jQuery);