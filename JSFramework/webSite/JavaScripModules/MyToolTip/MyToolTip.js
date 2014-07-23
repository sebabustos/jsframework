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
        cssClass: null,
        positionOptions: {
            my: "left bottom",
            at: "top top",
            collision: "none",
            offset: "10 -2"
        }
    };
    var defaultStyle = 'background-color: #F6F6F6;border: 1px solid #F1F1F1;padding: 5px;border-radius: 3px;box-shadow: #999999 4px 2px 10px;';
    var guiid = 0;

    $.fn.myToolTip = function (options) {
        var eStates = {
            visible: "visible",
            notShown: "notShown",
            showUpDelay: "showUpDelay",
            hiding: "hiding"
        }
        var createToolTip = function (src) {
            var myToolTipId = src.attr("myToolTipId");
            var settings = $.extend({}, $defaults, src.data("myToolTipconfig"));

            var state = src.attr("myToolTip_state")
            if (state !== eStates.hiding) {
                var styleAttr;
                if (typeof settings.cssClass !== "undefined" && settings.cssClass !== null)
                    styleAttr = "class='" + settings.cssClass + "'";
                else
                    styleAttr = "style='" + defaultStyle + "'";

                var toolTip = $("<div " + styleAttr + " id='divToolTip_" + myToolTipId + "' plugin='MyToolTip'>" + $(src).attr(settings.textAttr) + "</div>").appendTo($("body")).css({ opacity: .85, position: 'absolute', display: 'none' });


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

                src.attr("myToolTip_state", eStates.visible);
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
                        $this.attr("myToolTip_state", eStates.showUpDelay);
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
                $this.attr("myToolTip_state", eStates.hiding);
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
                            $this.attr("myToolTip_state", eStates.notShown);
                            $(this).remove();
                        });
                }
                    //si el tooltip no existe, se quita el attributo myToolTip_TOI (el id del setTimeOut), 
                    //de lo contrario, nunca va a volver a mostrarse.
                else {
                    $this.attr("myToolTip_state", eStates.notShown);
                    $this.attr("myToolTip_TOI", "");
                }
            });

            var itemOptions = $.extend({}, options);
            target.data("myToolTipconfig", itemOptions)
                  .attr("myToolTipId", myToolTipId);
        }

        function init(target) {
            if (typeof target !== "undefined" && target !== null && target.length > 0) {
                if (target.length > 1)
                    target.each(function (index) {
                        configMyToolTop($(this));
                    });
                else
                    configMyToolTop(target);
            }
        }

        init(this);
        return this;
    }
})(jQuery);
/*
================================================================
                            VERSIÓN
================================================================
Código:       | MyToolTip - 2014-07-23 - 1.0.0.0
----------------------------------------------------------------
Nombre:       | MyToolTip
----------------------------------------------------------------
Tipo:         | PLUGIN (de jquery) 
----------------------------------------------------------------
Descripción:  | Muestra un pequeño popup, no intrusivo, que sigue
              | al cursor, con un mensaje descriptivo, tomando
              | el texto del mensaje del atributo MyToolTip del 
              | control
----------------------------------------------------------------
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Versión:      | v1.0.0.0
----------------------------------------------------------------
Fecha:        | 2014-07-23 08:42
----------------------------------------------------------------
Cambios de la Versión:
 - Primera versión estable del producto.
 ================================================================
                       FUNCIONALIDADES
================================================================
- Es un plugin de jquery
- Permite mostrar un mensaje cuando se pasa el mouse
sobre el control configurado (simil alt de los anchor)
- Permite configurar el atributo, en los controles, del cual se 
tomará el mensaje (por defecto "MyToolTip")
- Permite configurar si, cuando se desplaza el mouse sobre el control,
el tooltipo seguirá al mouse, o una vez mostrado el tooltip, este
no se moverá.
- permite configurar un offset, desde la posición del mouse, donde 
se mostrará el tooltip.
- permite configurar un delay entre que se posiciona con el mouse
y se muestra el mensaje
- permite configurar si se usara un efecto al mostrar y ocultar el
tooltip, como así también cada efecto para cada una de estas acciones
- Permite configurar la clase de estilo base del div usado como tooltip
- permite configurar el zIndex del tooltip
- permite configurar la posición exacta donde se mostrará el tooltip
mediante el uso del objeto position de jquery.
================================================================
                       POSIBLES MEJORAS
================================================================
 [Posibles mejoras pendientes para el componente/producto/funcionalidad]

================================================================
                    HISTORIAL DE VERSIONES
    [Registro histórico resumido de las distintas versiones]
================================================================
Código:       [código del producto]
Autor:        [Autor]
Cambios de la Versión:
  - [Cambios que incluyó la versión]
================================================================
*/