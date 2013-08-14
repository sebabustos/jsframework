(function ($) {
    "use strict";
    var $defaults = {
        followMouse: false,
        offsetTop: 3,
        offsetLeft: 3,
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
        this.mouseenter(function (e) {
            var toolTip = $("<div class='tooltip' id='divToolTip'>" + $(this).attr(settings.textAttr) + "</div>").appendTo($("body")).css({ opacity: .85, position: 'absolute' });
            if (!settings.followMouse) {
                settings.positionOptions.of = this;
                toolTip.position(settings.positionOptions);
            }
            else {
                toolTip.css({ top: (parseFloat(e.clientY) + parseFloat(settings.offsetTop)), left: (parseFloat(e.clientX) + parseFloat(settings.offsetLeft)) });
                $(this).mousemove(function (e) {
                    $("#divToolTip").css({ top: (parseFloat(e.clientY) + parseFloat(settings.offsetTop)), left: (parseFloat(e.clientX) + parseFloat(settings.offsetLeft)) });
                });
            }
            toolTip.css({ zIndex: 1010 });
        }).mouseleave(function () {
            $("#divToolTip").remove();
        });
            return this;
        }
})(jQuery);