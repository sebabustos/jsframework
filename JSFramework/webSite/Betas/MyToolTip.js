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
        zIndex: 1010,
        cssClass: 'tooltip',
        positionOptions: {
            my: "left bottom",
            at: "top top",
            collision: "none",
            offset: "10 -2"
        }
    };
    var guiid = 0;

    $.fn.myToolTip = function (options) {
        var eStates = {
            showUpDelay: "showUpDelay",
            hiding: "hiding"
        }
        var createToolTip = function (src) {
            var myToolTipId = src.attr("myToolTipId");
            var settings = $.extend({}, $defaults, src.data("myToolTipconfig"));

            var state = src.attr("myToolTip_state")
            if (state == eStates.showUpDelay) {
                var toolTip = $("<div class='" + settings.cssClass + "' id='divToolTip_" + myToolTipId + "' plugin='MyToolTip'>" + $(src).attr(settings.textAttr) + "</div>").appendTo($("body")).css({ opacity: .85, position: 'absolute', display: 'none' });
                if (!settings.followMouse) {
                    settings.positionOptions.of = src;
                    toolTip.position(settings.positionOptions);
                }
                else {
                    toolTip.css({ top: (parseFloat(e.clientY) + parseFloat(settings.offsetTop)), left: (parseFloat(e.clientX) + parseFloat(settings.offsetLeft)) });
                    $(src).mousemove(function (e) {
                        $("#divToolTip_" + myToolTipId).css({ top: (parseFloat(e.clientY) + parseFloat(settings.offsetTop)), left: (parseFloat(e.clientX) + parseFloat(settings.offsetLeft)) });
                    });
                }
                toolTip.css({ zIndex: settings.zIndex });
                if (!settings.showUpEffect)
                    toolTip.show();
                else
                    toolTip.show(settings.showUpeffectDuration, settings.showUpEffect);
            }
        }



        var srcElement = this;
        function configMyToolTop(target) {
            var myToolTipId = (typeof target[0].id != "undefined") ? target[0].id : guiid++;
            target.mouseenter(function (e) {
                var $this = $(this);
                var settings = $.extend({}, $defaults, $this.data("myToolTipconfig"));
                if (settings.showUpDelay > 0) {
                    var timeoutId;
                    timeoutId = $this.attr("myToolTip_TOI");
                    if (typeof timeoutId === "undefined" || timeoutId === "") {
                        $this.attr("myToolTip_state", "showUpDelay");
                        $this.attr("myToolTip_TOI",
                                window.setTimeout(function () {
                                    createToolTip($this);
                                }, settings.showUpDelay));
                    }
                }
                else
                    createToolTip($this);
            }).mouseleave(function () {
                var $this = $(this);
                var settings = $.extend({}, $defaults, $this.data("myToolTipconfig"));
                var duration = settings.showUpEffect ? settings.hideeffectDuration : 0;
                var effect = settings.showUpEffect ? settings.hideEffect : "swing";
                $this.attr("myToolTip_state", "hiding");
                var myToolTipId = $this.attr("myToolTipId");

                var divToolTip = $("#divToolTip_" + myToolTipId);
                //si se encuentra el tooltip se realiza el ocultamiento.
                if (divToolTip.length > 0) {
                    divToolTip.hide(duration, effect,
                        function () {
                            var timeoutId = $this.attr("myToolTip_TOI");
                            if (typeof timeoutId !== "undefined" && timeoutId !== "") {
                                window.clearTimeout(timeoutId);
                                $this.attr("myToolTip_TOI", "");
                            }
                            $(this).remove();
                        });
                }
                    //si el tooltip no existe, se quita el attributo myToolTip_TOI (el id del setTimeOut), 
                    //de lo contrario, nunca va a volver a mostrarse.
                else
                    $this.attr("myToolTip_TOI", "");
            });

            var itemOptions = $.extend({}, options);
            target.data("myToolTipconfig", itemOptions)
                  .attr("myToolTipId", myToolTipId);
        }

        function init(target) {
            if (target.length > 1)
                target.each(function (index) {
                    configMyToolTop($(this));
                });
            else
                configMyToolTop(target);

        }

        init(this);
        return this;
    }
})(jQuery);