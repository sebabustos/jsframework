/////////////////////////////////////////////////////
//        Template de un plugin de JQUERY          //
/////////////////////////////////////////////////////
(function ($) {
    "use strict";
    var $tempthis = null;
    //Configuración por defecto del plugin 
    var $default = {
        filterSelector: null,
        useWatermark: true,
        watermark: null,
        watermarkClass: 'watermarked'
    };

    //métodos públicos del plugin que se podrán acceder llamando a
    //la función jquery. Ej: $.fn.gridView().method1;
    //Se recomienda que los métodos definidos aquí no dependan del selector, 
    //es decir, que no asuman que el contexto es el componente incial (aquel con el cual se llamó inicialmente al plugin), 
    //sino que, de ser necesario identificar un componente, reciban un selector, id, etc, por parámetro y obtengan la referencia.
    //Ej: method1: function(gridViewId){$("[gvId=' + gridViewId + ']")}
    var methods = {
        doFilter: function (filter, filterSelector) {
            if (filter === "") {
                $(filterSelector).show(200);
            }
            else {
                $(filterSelector).not(":contains('" + filter.toUpperCase() + "')").hide(200);
                $(filterSelector + ":contains('" + filter.toUpperCase() + "')").show(200);
            }
        },
        filterTextbox_keyup: function () {
            var $this = $(this);
            if ($tempthis !== null && $tempthis.length > 0)
                $this = $tempthis;

            var settings = $.extend({}, $default, $this.data("autofilterConfig"));
            var filterSelector;
            if (typeof settings.filterSelector !== "undefined" && settings.filterSelector !== null && settings.filterSelector !== "")
                filterSelector = settings.filterSelector;
            else
                filterSelector = $this.attr("filterSelector");
            
            methods.doFilter($this.val(), filterSelector);
        },
        filterTextbox_focus: function () {
            var $this = $(this);
            if ($tempthis !== null && $tempthis.length > 0)
                $this = $tempthis;
            var filter = $this.val();

            var settings = $.extend({}, $default, $this.data("autofilterConfig"));
            if (settings.useWatermark) {
                var watermark;
                if (typeof settings.watermark !== "undefined" && settings.watermark !== null && settings.watermark !== "")
                    watermark = settings.watermark;
                else if (typeof $this.attr("watermark") !== "undefined" && $this.attr("watermark") !== "")
                    watermark = $this.attr("watermark");

                if (filter.toUpperCase() === watermark.toUpperCase()) {
                    if (typeof settings.watermarkClass !== "undefined" && settings.watermarkClass !== null && settings.watermarkClass !== "")
                        $this.removeClass(settings.watermarkClass);
                    $this.val("");
                }
            }
        },
        filterTextbox_blur: function () {
            var $this = $(this);
            if ($tempthis !== null && $tempthis.length > 0)
                $this = $tempthis;
            var filter = $this.val();

            var settings = $.extend({}, $default, $this.data("autofilterConfig"));
            if (settings.useWatermark) {
                var watermark, watermarkClass = "";
                if (typeof settings.watermark !== "undefined" && settings.watermark !== null && settings.watermark !== "")
                    watermark = settings.watermark;
                else if (typeof $this.attr("watermark") !== "undefined" && $this.attr("watermark") !== "")
                    watermark = $this.attr("watermark");

                if (typeof settings.watermarkClass !== "undefined" && settings.watermarkClass !== null && settings.watermarkClass !== "")
                    watermarkClass = (settings.watermarkClass);

                if (filter === "" || filter.toUpperCase() === watermark.toUpperCase()) {
                    $this.val(watermark);
                    if (watermarkClass !== "")
                        $this.addClass(watermarkClass);
                }
                else if (watermarkClass !== "")
                    $this.removeClass(watermarkClass);

            }
        },
        filterTextbox_change: function () {
            var $this = $(this);
            if ($tempthis !== null && $tempthis.length > 0)
                $this = $tempthis;
            var filter = $this.val();
            var watermark = "", watermarkClass = "";

            var settings = $.extend({}, $default, $this.data("autofilterConfig"));


            if (settings.useWatermark) {
                var watermark, watermarkClass = "";
                if (typeof settings.watermark !== "undefined" && settings.watermark !== null && settings.watermark !== "")
                    watermark = settings.watermark;
                else if (typeof $this.attr("watermark") !== "undefined" && $this.attr("watermark") !== "")
                    watermark = $this.attr("watermark");

                if (typeof settings.watermarkClass !== "undefined" && settings.watermarkClass !== null && settings.watermarkClass !== "")
                    watermarkClass = (settings.watermarkClass);

                if (filter === "" || filter.toUpperCase() === watermark.toUpperCase()) {
                    $this.val(watermark);
                    if (watermarkClass !== "")
                        $this.addClass(watermarkClass);
                }
                else if (watermarkClass !== "")
                    $this.removeClass(watermarkClass);

            }

            if (filter === "" || filter.toUpperCase() === watermark.toUpperCase()) {
                if(watermark!=="")
                    $this.val(watermark);
                if (watermarkClass !== "")
                    $this.addClass(watermarkClass);

                var filterSelector;
                if (typeof settings.filterSelector !== "undefined" && settings.filterSelector !== null && settings.filterSelector !== "")
                    filterSelector = settings.filterSelector;
                else
                    filterSelector = $this.attr("filterSelector");

                methods.doFilter(filter, filterSelector);
            }
            else if (watermarkClass !== "")
                $this.removeClass(watermarkClass);
        }
    };

    $.fn.autofilter = function (options) {
        var settings = $.extend($default, options);
        //Si no se recibe el parámetro options, se devuelve el objeto "methods"
        //lo que permitirá ejecutar los métodos públicos definidos allí.
        //Esta funcionalidad permite obtener la referencia a methods sin la necesidad de 
        //que el contexto de llamada sea un objeto válido o el objeto inicial.
        //Ej: $("input").gridView(...) --> llama al plugin gridView siendo el selector los inputs, 
        //Ej: $().gridView().method1   --> llama al plugin sin un selector, obteniendo la referencia a methods y por lo tanto puede ejecutar el método "method1".
        //si no está inicializado, es decir no posee el autofilterId) pasa por la iniciacilización y no por la devolución del objeto
        //methods
        if (typeof options === "undefined" && typeof this.prop("autofilterId")!=="undefined" && this.prop("autofilterId")!=="") {
            $tempthis = this;
            return methods;
        }

        //Si el parámetro options es un string, se asume la ejecución de un método del plugin indicado por este parámetro.
        //Este uso asume que el contexto es un componente válido, incluso el componente inicial 
        //el método que se ejecutará se recomienda sea un método definido en el contexto del plugin (una función dentro de $.fn.autofilter)
        //y no dentro de methods, ya que methods ya tiene otro acceso 
        /*if (typeof options === "string" && options !== "") {
            if (this.length <= 0)
                return this;     //por recomendación de jquery, el plugin debe devolver siempre el mismo selector
                                //esto permite el encadenamiento de métodos, ej: $("selector").gridView().hide().css({...});

            //el each se debe a que el selector puede devolver varios componentes.
            $.each(this, function (index, item) {
                //usando el método "data" de jquery, se obtiene la configuración particular de ese componente (ver más adelante)
                //var settings = $.extend({}, $default, $(item).data("autofilterConfig"));

                var itemId = $(item).attr("autofilterId");
                if(methods.hasOwnProperty(options))
                    //eval("$(\"[autofilterId=" + itemId + "]\").autofilter()." + options + "()");
                    
                else
                    throw "El método invocado no es válido";
            });
            return this;
        }*/

        //================
        //Métodos Internos
        //================

        //Es conveniente tener un método de inicialización del plugin en el cual se realice toda la configuración 
        //del mismo. Este método se llamará al final del plugin.
        function init(target) {
            if (target.length > 1)
                //Siendo que el target puede ser un array de controles, se llama al método de configuración/inicialización para cada uno de ellos.
                target.each(function (index) {
                    config($(this));
                });
            else
                //Cuando es un sólo control se llama al método de configuración/inicialización para el target sólo.
                config(target);

        }
        //un contador que servirá para lleva un registro del último ID (incremental en este caso) usado para asignar a cada control.
        var guiid = 0;
        function config(target) {
            //una forma de identificar cada objeto y verificar si fue inicializado es crear un nuevo atributo con un ID generado
            //Este ID puede ser el mismo ID del control, si este tuviera uno o bien un ID aleatorio (o incremental)
            var newId = (typeof target[0].id != "undefined") ? target[0].id : guiid++;
            //se genera un array con las opciones recibidas en la llamada del plugin, lo conveniente es, a estas opciones particulares
            //almacenarlas en cada control (sólo las particulares no las default).
            var itemOptions = $.extend({}, options); //realiza una copia de las opciones originales.

            if (settings.useWatermark) {
                var watermark;
                if (typeof settings.watermark !== "undefined" && settings.watermark !== null && settings.watermark !== "")
                    watermark = settings.watermark;
                else if (typeof target.attr("watermark") !== "undefined" && target.attr("watermark") !== "") 
                    watermark = target.attr("watermark");

                target.val(watermark);
                if (typeof settings.watermarkClass !== "undefined" && settings.watermarkClass !== null && settings.watermarkClass !== "")
                    target.addClass(settings.watermarkClass);

                target.focus(methods.filterTextbox_focus);
                target.blur(methods.filterTextbox_blur);
            }

            
            target.keyup(methods.filterTextbox_keyup);
            target.change(methods.filterTextbox_change);

            //se almacena la configuración del usuario en un atributo del control usando el método "data" de jquery.
            target.data("autofilterConfig", itemOptions)
                .attr("autofilterId", newId); //se graba el nuevo Id.s

        }
        //================

        init(this);
        return this;
    }
})(jQuery);
/*
================================================================
                            VERSIÓN
================================================================
Código:       | Autofilter - 2014-07-24 1123 - 1.0.0.0
----------------------------------------------------------------
Nombre:       | Autofilter
----------------------------------------------------------------
Tipo:         | PLUGIN (de jquery) 
----------------------------------------------------------------
Descripción:  | Configura un control para que al cambiar su valor
              | (eventos keyup y change) realice un 
              | filtro de controles que cumplan con el selector
              | configurado (filterSelector), mostrandolos y 
              | ocultandolos según contengan o no el texto 
              | del control original.
----------------------------------------------------------------
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Versión:      | v1.0.0.0
----------------------------------------------------------------
Fecha:        | 2014-07-24 11:23
----------------------------------------------------------------
Cambios de la Versión:
 - Primera versión del plugin

================================================================
                       FUNCIONALIDADES
================================================================
[Una opcional enumeraciones de las funciones del 
componente/producto/funcionalidad]
- Agrega los eventos keyup y change al control para que 
filtre otros controles (según el selector configurado) en función
del texto que se vaya ingresando.
- permite configurar el plugin para que muestre una marca de 
agua cuando el control está vacío.
- permite configurar el contenido del watermark al inicializar el
selector, o mediante el atributo watermark en el control
- permite configurar el selector usado para filtrar los controles
al inicializar el selector, o bien mediante el atributo 
filterSelector en el control.
- permite configurar la clase que se le colocará al control
cuando este contenga el watermark o cuando se le quite el mismo.
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