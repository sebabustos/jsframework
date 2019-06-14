/** showCourtain.js 2.0.0.0
 * Se quitó la clase por defecto ui-widget-overlay
 * 
 */
function showCourtain(options) {
    var courtainId = 0;
    try {
        var $default = {
            sufixId: '',
            courtainCss: '',
            useDefaultStyle: true,
            loadingImg: '../images/loading.gif',
            content: null,
            appendTo: 'body'
        };

        var settings = $.extend({}, $default, options);
        courtainId = "divCourtain" + (settings.sufixId !== "" ? ("_" + settings.sufixId) : "");
        var defaultCourtainStyle = "";
        var defaultImageStyle = "";
        if (settings.useDefaultStyle) {
            defaultCourtainStyle = "style='position:fixed;top:0;right:0;bottom:0;left:0;height:100%;width:100%;background-color:#cccccc;opacity:.4;z-index:9997;text-align:center;'";
            defaultImageStyle = "style='position:relative;top:50%;margin-top:-16px'";
        }

        var courtain = $("<div id='" + courtainId + "' courtainId='" + courtainId + "' courtainType='courtain' class='courtain-container' " + defaultCourtainStyle + ">" +
            "<img courtainId = '" + courtainId + "' courtainType = 'loading' src = '" + settings.loadingImg + "' title = 'Cargando...' " + defaultImageStyle + "/>" +
            "</div >")
            .appendTo($(settings.appendTo));
        if (typeof settings.courtainCss !== "undefined" && settings.courtainCss !== null)
            courtain.addClass(settings.courtainCss);


    }
    catch (excep) {
        if (typeof console !== "undefined")
            console.log("Se produjo un error al intentar mostrar la cortina - ShowCourtain.js - " + excep.message);
    }


    return courtainId;
}

function hideCourtain(id) {
    if (typeof id === "undefined")
        $("[courtainId]").remove();
    else
        $("[courtainId=" + id + "]").remove();
}