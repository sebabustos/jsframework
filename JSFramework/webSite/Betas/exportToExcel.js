(function ($) {
    var methods = {
        clearExportElements: function () {
            $(".divCourtain").remove();
            $("#ifrExport").remove();
            $("[exportToExcel='true']").css({ visibility: 'visible' });
            $("[exportMode='function']").removeAttr("exportToExcel");
        },
        cancelDownload: function () {
            $("#ifrExport").attr("src", "about:blank");
            $().exportToExcel('clearExportElements');
        },
        ifrExport_onReadyStateChange: function () {
            if (document.readyState == "complete")
                $().exportToExcel('clearExportElements');
        },
        destroy: function () {
            this.removeAttr("exportToExcel");
            this.unbind("click");
            this.removeData("exportToExcelConfig");
        }
    };
    var $default = {
        URL: null,
        opacity: .95,
        appendTo: "body",
        width: $("body").width(),
        showLoadingImg: true,
        loadingText: 'Exportando los resultados... Aguarde un instante por favor',
        loadingImg: '../../App_Themes/' + ((typeof appTheme === "undefined" || appTheme === null || appTheme === '') ? "Default" : appTheme) + '/images/ajax-loader.gif',
        showClose: true,
        closeImg: '../../App_Themes/' + ((typeof appTheme === "undefined" || appTheme === null || appTheme === '') ? "Default" : appTheme) + '/images/close.png',
        closeText: 'Al finalizar cierre este mensaje->',
        onBeforeExport: function () { }
    };
    $.fn.exportToExcel = function (options) {
        if (methods[options]) {
            //llama al método pasándole el objeto y quitando el primer parámetro, ya que es el nombre del método a ejecutars
            methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
            return this;
        }
        else if (typeof options === 'object' || !options) {

            function Init(src) {
                if (src.attr("exportToExcel") !== "undefined" && src.attr("exportToExcel") === "true") {
                    methods["destroy"].apply(src);
                }

                src.data("exportToExcelConfig", options);
                src.attr("exportToExcel", "true");
                src.attr("exportMode","plugin");

                src.click(function () {
                    var config = $(this).data("exportToExcelConfig");
                    var settings = $.extend($default, config);
                    settings.width = $(settings.appendTo).width() - 10;
                    if (settings.onBeforeExport instanceof Function)
                    {
                        //Si el resultado del OnBeforeExport es falso se cancela la exportación.
                        if (settings.onBeforeExport() === false)
                            return;
                    }
                    
                    methods.cancelDownload();
                    var url = settings.URL;

                    if (settings.URL instanceof Function)
                        url = settings.URL();
                        
                    if (url != null && url != "") {


                        var divCourtainHtml = "<div id='divExportToExcel' class='divCourtain'><table width='100%' cellspacing='0' cellpadding='0' class='tblCourtain'><tr><td class='tdExporting'>";
                        if (settings.showLoadingImg)
                            divCourtainHtml += "<img id='imgLoading' src='" + settings.loadingImg + "' alt=''/>";

                        divCourtainHtml += "<span class='spExportingText'>" + settings.loadingText + "</span></td>";
                        if (settings.showClose) {
                            divCourtainHtml += "<td class='tdClose'>"
                            divCourtainHtml += "<table width='100%' cellpadding='0' cellspacing='0' class='tableClose'><tr>";
                            divCourtainHtml += "<td align='center' valign='middle' class='tdCloseText'>" + settings.closeText + "</td>";
                            divCourtainHtml += "<td align='center' valign='middle' class='tdCloseImage'><img src='" + settings.closeImg + "' onclick='$().exportToExcel(\"cancelDownload\");'/></td>";
                            divCourtainHtml += "</tr></table>"
                            divCourtainHtml += "</td>";
                        }
                        divCourtainHtml += "</tr></table></div>";


                        $(divCourtainHtml)  .appendTo($(settings.appendTo))
                            .css({
                                width: settings.width,
                                opacity: settings.opacity
                            });

                        $(this).css({ visibility: 'hidden' });
                        
                        var ifrExport = $("<iframe id='ifrExport' onreadystatechange='$().exportToExcel(\"ifrExport_onReadyStateChange\");' src='" + url + "' ></iframe>")
                            .hide()
                            .appendTo("body");
                    }
                    return false;
                });
            };

            Init(this);
        }
        else {
            $.error('El método: \"' + method + '\" no existe en la exportación.');
        }

        return this;
    };

    $.exportToExcel = function (config, src) {
        var settings = $.extend($default, config);
        settings.width = $(settings.appendTo).width() - 10;
        if (settings.onBeforeExport instanceof Function) {
            //Si el resultado del OnBeforeExport es falso se cancela la exportación.
            if (settings.onBeforeExport() === false)
                return;
        }

        methods.cancelDownload();
        var url = settings.URL;

        if (settings.URL instanceof Function)
            url = settings.URL();

        if (url != null && url != "") {
            var divCourtainHtml = "<div id='divExportToExcel' class='divCourtain'><table width='100%' cellspacing='0' cellpadding='0' class='tblCourtain'><tr><td class='tdExporting'>";
            if (settings.showLoadingImg)
                divCourtainHtml += "<img id='imgLoading' src='" + settings.loadingImg + "' alt=''/>";

            divCourtainHtml += "<span class='spExportingText'>" + settings.loadingText + "</span></td>";
            if (settings.showClose) {
                divCourtainHtml += "<td class='tdClose'>"
                divCourtainHtml += "<table width='100%' cellpadding='0' cellspacing='0' class='tableClose'><tr>";
                divCourtainHtml += "<td align='center' valign='middle' class='tdCloseText'>" + settings.closeText + "</td>";
                divCourtainHtml += "<td align='center' valign='middle' class='tdCloseImage'><img src='" + settings.closeImg + "' onclick='$().exportToExcel(\"cancelDownload\");'/></td>";
                divCourtainHtml += "</tr></table>"
                divCourtainHtml += "</td>";
            }
            divCourtainHtml += "</tr></table></div>";


            $(divCourtainHtml).appendTo($(settings.appendTo))
                .css({
                    width: settings.width,
                    opacity: settings.opacity
                });
            if (typeof src !== "undefined" && src !== null) {
                $(src).css({ visibility: 'hidden' });
                $(src).attr("exportToExcel", 'true');
                $(src).attr("exportMode", 'function');
            }

            var ifrExport = $("<iframe id='ifrExport' onreadystatechange='$().exportToExcel(\"ifrExport_onReadyStateChange\");' src='" + url + "' ></iframe>")
                .hide()
                .appendTo("body");
        }
        return false;
    };
})(jQuery);
