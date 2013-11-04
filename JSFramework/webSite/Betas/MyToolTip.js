(function ($) {
    "use strict";


    var $defaults = {
        followMouse: false,
        offsetTop: 3,
        offsetLeft: 3,
        showUpDelay: 0,
        useEffect: true,
        showUpEffect: 'swing',
        showUpeffectDuration: 200,
        hideEffect: 'swing',
        hideeffectDuration: 200,
        textAttr: "MyToolTip",
        positionOptions: {
            my: "left bottom",
            at: "top top",
            collision: "none",
            offset: "10 -2"
        }
    };

    $.fn.myToolTip = function (options) {
        var settings = $.extend({}, $defaults, options);
        var createToolTip = function (src) {
            var toolTip = $("<div class='tooltip' id='divToolTip' plugin='MyToolTip'>" + $(src).attr(settings.textAttr) + "</div>").appendTo($("body")).css({ opacity: .85, position: 'absolute', display: 'none' });
            if (!settings.followMouse) {
                settings.positionOptions.of = src;
                toolTip.position(settings.positionOptions);
            }
            else {
                toolTip.css({ top: (parseFloat(e.clientY) + parseFloat(settings.offsetTop)), left: (parseFloat(e.clientX) + parseFloat(settings.offsetLeft)) });
                $(src).mousemove(function (e) {
                    $("#divToolTip").css({ top: (parseFloat(e.clientY) + parseFloat(settings.offsetTop)), left: (parseFloat(e.clientX) + parseFloat(settings.offsetLeft)) });
                });
            }
            toolTip.css({ zIndex: 1010 });
            if (!settings.showUpEffect)
                toolTip.show();
            else
                toolTip.show(settings.showUpeffectDuration, settings.showUpEffect);

        }
        var srcElement = this;
        srcElement.mouseenter(function (e) {
            if (settings.showUpDelay > 0) {
                var timeoutId;
                timeoutId = srcElement.attr("myToolTip_TOI");
                if (typeof timeoutId === "undefined" || timeoutId === "") {
                    srcElement.attr("myToolTip_TOI",
                            window.setTimeout(function () {
                                createToolTip(srcElement);
                            }, settings.showUpDelay));
                }
            }
            else
                createToolTip(this);
        }).mouseleave(function () {

            var duration = settings.showUpEffect ? settings.hideeffectDuration : 0;
            var effect = settings.showUpEffect ? settings.hideEffect : "swing";
            $("#divToolTip").hide(duration, effect,
                function () {
                    var timeoutId = srcElement.attr("myToolTip_TOI");
                    if (typeof timeoutId !== "undefined" && timeoutId !== "") {
                        window.clearTimeout(timeoutId);
                        srcElement.attr("myToolTip_TOI", "");
                    }
                    $(this).remove();
                });
        });
        return srcElement;
    }
})(jQuery);