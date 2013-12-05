function showCourtain(options) {
    var $default = {
        sufixId: '',
        courtainCss: 'ui-widget-overlay',
        imageCSS: {
            backgroundColor: "#BBBBBB",
            zIndex: 9998
        },
        loadingImg: '../images/indicator.gif',
        appendTo: 'body'
    }

    var settings = $.extend({}, $default, options);
    var courtainId = "divCourtain" + (settings.sufixId !== "" ? ("_" + settings.sufixId) : "");
    var imgLoadingId = "imgLoading" + (settings.sufixId !== "" ? ("_" + settings.sufixId) : "");

    var courtain = $("<div id='" + courtainId + "' courtainId='" + courtainId + "' courtainType='courtain'></div>")
					.addClass(settings.courtainCss)
					.css({
					    position: "absolute",
					    top: $(window).scrollTop(),
					    left: $(window).scrollLeft(),
					    width: $(window).width(),
					    height: $(window).height(),
					    zIndex: 9997
					})
					.appendTo($(settings.appendTo));

    $("<img id='" + imgLoadingId + "'  courtainId='" + courtainId + "' courtainType='loading' src='" + settings.loadingImg + "' alt='Cargando'/>")
		.appendTo($(settings.appendTo))
		.css(settings.imageCSS)
		.position({
		    my: 'center center',
		    at: 'center center',
		    of: courtain
		});

    $(window).scroll(function () {
        $("[courtainId]").css({
            top: $(window).scrollTop(),
            left: $(window).scrollLeft()
        });
    });


    return courtainId;
}

function hideCourtain(id) {
    if (typeof id === "undefined")
        $("[courtainId]").remove();
    else
        $("[courtainId=" + id + "]").remove();
}