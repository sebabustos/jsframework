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
        textSource: null,
        zIndex: 1010,
        cssClass: null,
        positionOptions: {
            my: "left bottom",
            at: "top top",
            collision: "none",
            offset: "10 -2"
        }
    };
    var eStates = {
        visible: "visible",
        notShown: "notShown",
        showUpDelay: "showUpDelay",
        hiding: "hiding"
    }
    var $tempthis = null;
    var methods = {
        hasMyToolTip: function (target) {
            if (typeof target === "undefined" || target === null)
                target = $tempthis;
            return (typeof target.attr("myToolTipId") !== "undefined");
        },
        removeToolTip: function (target) {
            if (typeof target === "undefined" || target === null)
                target = $tempthis;

            if (typeof target.attr("myToolTipId") !== "undefined") {
                target.unbind("mouseenter.myToolTip");
                target.unbind("mouseleave.myToolTip");
                target.removeData("myToolTipconfig");
                target.removeAttr("myToolTipId");
            }
            return target;
        },
        show: function (target)
        {
            var $this = $(target);
            var settings = $.extend({}, $defaults, $this.data("myToolTipconfig"));
            if (settings.showUpDelay > 0) {
                var timeoutId;
                timeoutId = $this.attr("myToolTip_TOI");
                if (typeof timeoutId === "undefined" || timeoutId === "") {
                    $this.attr("myToolTip_state", eStates.showUpDelay);
                    $this.attr("myToolTip_TOI",
                            window.setTimeout(function () {
                                internalMethods.createToolTip($this);
                            }, settings.showUpDelay));
                }
            }
            else
                internalMethods.createToolTip($this);
        },
        hide: function (target)
        {
            var $this = $(target);
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
        },
        hideInstanstly: function (target) {
            var $this = $(target);
            var settings = $.extend({}, $defaults, $this.data("myToolTipconfig"));
            $this.attr("myToolTip_state", eStates.notShown);
            var myToolTipId = $this.attr("myToolTipId");
            var divToolTip = $("#divToolTip_" + myToolTipId);
            //si se encuentra el tooltip se realiza el ocultamiento.
            if (divToolTip.length > 0)
                divToolTip.remove();
                //si el tooltip no existe, se quita el attributo myToolTip_TOI (el id del setTimeOut), 
                //de lo contrario, nunca va a volver a mostrarse.
            else
                $this.attr("myToolTip_TOI", "");
        }
    };

    var internalMethods = {
        createToolTip: function (src) {
            var myToolTipId = src.attr("myToolTipId");
            var settings = $.extend({}, $defaults, src.data("myToolTipconfig"));

            var state = src.attr("myToolTip_state")
            if (state !== eStates.hiding) {
                var divToolTip = $("#divToolTip_" + myToolTipId);
                divToolTip.remove();
                var styleAttr;
                if (typeof settings.cssClass !== "undefined" && settings.cssClass !== null)
                    styleAttr = "class='" + settings.cssClass + "'";
                else
                    styleAttr = "style='" + defaultStyle + "'";
                //por compatibilidad hacia atrás, lo primero que intenta leer es el attributo
                var tooltipText = $(src).attr(settings.textAttr);
                if (typeof settings.textSource === "function")
                    tooltipText = settings.textSource(src, settings, myToolTipId);

                if (typeof tooltipText !== "undefined" && tooltipText !== null && tooltipText !== "") {
                    var toolTip = $("<div " + styleAttr + " id='divToolTip_" + myToolTipId + "' plugin='MyToolTip'>" + tooltipText + "</div>").appendTo($("body")).css({ opacity: .85, position: 'absolute', display: 'none' });

                    if (!settings.followMouse) {
                        $(src).unbind("mousemove.myToolTip");
                        settings.positionOptions.of = src;
                        toolTip.position(settings.positionOptions);
                    }
                    else {
                        var e = window.event;
                        toolTip.css({ top: (parseFloat(e.clientY) + parseFloat(settings.offsetTop)), left: (parseFloat(e.clientX) + parseFloat(settings.offsetLeft)) });

                        $(src).bind("mousemove.myToolTip", function (e) {
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
        }
    };

    var defaultStyle = 'background-color: #F6F6F6;border: 1px solid #F1F1F1;padding: 5px;border-radius: 3px;box-shadow: #999999 4px 2px 10px;';
    var guiid = 0;

    //El plugin admite ser llamadao con 1, 2 ó 3 parámetro.
    //el primero puede ser el texto a mostrar o la configuración,
    //  si es el texto a mostrar, se admite un segundo parámetro opcional, pudiendo ser la configuración o un booleano indicando si mostrar o no inmediatamente el tooltip.
    //   si es un booleano, indicará si se debe o no mostrar inmediatamente el tooltip, 
    //   si es la configuración, se admite un tercer parámetro opcional, que puede ser el booleano.
    //  si el primer parámetro es la configuración, sólo se admitirá un segundo parámetro, que podrá ser el booleano.
    //  si el primer paráemtro es el booleano, no se admitirán más parámetros (directamente se obviarán)
    //Ej: $...myToolTipo("hola Mundo");
    //Ej: $...myToolTipo("hola Mundo", {followMouse:true});
    //Ej: $...myToolTipo("hola Mundo", {followMouse:true}, true);
    //Ej: $...myToolTipo("hola Mundo", false);
    //Ej: $...myToolTipo({followMouse:true});
    //Ej: $...myToolTipo({followMouse:true}, false);
    //Ej: $...myToolTipo(true);
    $.fn.myToolTip = function (options) {
        var toolTipText = null;
        var doShow = false;
        //si ya está inicializado y se vuelve a llamar, sin options, se devuelve el objeto Methods.
        if (typeof options === "undefined" && this.length > 0 && methods.hasMyToolTip(this)) {
            $tempthis = this;
            return methods;
        }
        else if (options === "hasMyToolTip")
            return methods.hasMyToolTip(this);
        else if (options === "removeToolTip")
            return methods.removeToolTip(this);
        else if (typeof options === "string" && options !== "")
        {
            var textParam = options;
            if (arguments.length > 1) {
                switch (typeof arguments[1]) {
                    //si el 2º argumento es un objeto, puede haber un 3er argumento que indique si se debe o no mostrar el tooltip inmediatamente.
                    case "object":
                        options = arguments[1];
                        //si viene el 3er argumento se asumen booleano.
                        doShow = arguments.length > 2 ? arguments[2] === true : false;
                        break;
                        //si el 2º argumento es un boolean, no se espera un 3er argumento
                    case "boolean":
                        doShow = options;
                        options = null;
                        break;
                    default:
                        doShow = false;
                        options = null;
                        break;
                }
            }

            //Si está inicializado, se pisa el atributo del mensaje con el texto recibido y la configuración
            if (methods.hasMyToolTip(this)) {
                //si tiene tooltip y se recibe, en el 2º parámetro, la configuración, se pisa la actual, sino NO.

                //permite que el primer parámetro sea el texto y el 2º la configuración
                //Ej: $...myToolTipo("hola Mundo", {followMouse:true});
                var settings = $.extend({}, $defaults, options == null ? this.data("myToolTipconfig") : options);

                //se pisa el atributo del texto a mostrar en el tooltip, con el recibido por parámetro.
                this.attr(settings.textAttr, textParam);

                if (options !== null) {
                    //pisa la configuración del control, con la recibida por parámetro.
                    var itemOptions = $.extend({}, options);
                    this.data("myToolTipconfig", itemOptions);
                }
                if (doShow) {
                    methods.hideInstanstly(this);
                    methods.show(this);
                }
                return this;
            }
            else {
                //Si no tenía inicializado el ToolTip, asigna la info para incializarlo.
                toolTipText = textParam;
            }
        }
        else if (typeof options === "boolean")
        {
            doShow = options;
            options = {};
        }

        var srcElement = this;
        function configMyToolTop(target) {
            var myToolTipId = (typeof target[0].id != "undefined") ? target[0].id : guiid++;
            target
                .bind("mouseenter.myToolTip", function (e) {
                    methods.show(this);
                
            })
                .bind("mouseleave.myToolTip", function () {
                    methods.hide(this);
                });

            var itemOptions = $.extend({}, options);
            target.data("myToolTipconfig", itemOptions)
                  .attr("myToolTipId", myToolTipId);

            //Si se había recibido un texto por parámetro, se pisa el atributo del texto a mostrar.
            if (toolTipText !== null) {
                var settings = $.extend({}, $defaults, itemOptions);
                target.attr(settings.textAttr, toolTipText);
            }

            if (doShow) {
                methods.hideInstanstly(target);
                methods.show(target);
            }
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
Código:       | MyToolTip - 2014-10-31 - 1.1.0.0
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
Versión:      | v1.1.0.0
----------------------------------------------------------------
Fecha:        | 2014-10-31 08:58
----------------------------------------------------------------
Cambios de la Versión:
 - Se agregó la nueva propiedad "textSource" que permite definir 
   una función que devuelva el texto a mostrar en el tooltip
 - Se agregaron los siguientes métodos públicos:
  hasMyToolTip: permite identificar si un control tiene habilitado el 
        plugin.
        Ej: $("#MyDiv").myToolTip("hasMyToolTip")
  show: permite hacer que el MyToolTip de un control ya inicializado, 
        se muestre.
        Ej: $("#MyDiv").myToolTip().show();
  hide: permite hacer que el MyToolTip de un control ya inicializado, 
        se muestre ejecutando el efecto configurado.
        Ej: $("#MyDiv").myToolTip().hide();
  hideInstanstly: permite hacer que el MyToolTip de un control ya 
        inicializado, se muestre inmediatamente, sin efecto.
        Ej: $("#MyDiv").myToolTip().hide();
  - Se creó la variable internalMethods para contener los métodos
    internos del plugin, y se colocó como parte de él el método
    createToolTip.
  - Se agregó la posibilidad de llamar al plugin con el texto
  que se deberá mostrar, y con la posibilida de indicar que se muestre
  inmediatamente
    Ej:
      se mostrará inmediatamente el texto "hola mundo" y se inicializa
      el plugin con la configuración por defecto
      $("#MyDiv").myToolTipo("hola Mundo", true); 
      equivale a: 
      $("#MyDiv").myToolTipo("hola Mundo", {}, true);
      
      se mostrará inmediatamente el texto "hola mundo" y se inicializa
      el plugin con la configuración pasada por parámetro.
      $("#MyDiv").myToolTipo("hola Mundo", {followMouse:true}, true);
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
 - Una función que me muestre el tooltip sin inicializar el control 
    (por ej: si yo quiero manejar el mouse enter y leave por fuera del tooltip)
 - Que reciba el texto por parámetro, y lo inicialice.
 - Tooltips enlazados, de manera que no se muestren juntos. Es decir,
 al mostrarse uno, se ocultan rapidamente los otros.
================================================================
                    HISTORIAL DE VERSIONES
    [Registro histórico resumido de las distintas versiones]
================================================================
Código:       | MyToolTip - 2014-07-23 - 1.0.0.0
Autor:        | Sebastián Bustos Argañaraz

Cambios de la Versión:
 - Primera versión estable del producto.
================================================================
*/