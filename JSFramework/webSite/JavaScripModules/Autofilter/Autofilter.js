﻿/*! Autofilter - 2018-09-20 1327 - 5.0.0.0*/
(function ($) {
    "use strict";
    var $tempthis = null;
    var eFilterTextStyle = {
        Normal: 0,
        Uppercase: 1,
        Lowercase: 2
    }

    //Configuración por defecto del plugin 
    var $default = {
        //permite habilitar/deshabilitar el auto-ocultamiento de los controles
        autoToggle: true,
        accentInsensitive: false,
        filterSelector: null,
        doFilter: null,
        filterAttribute: null,
        useWatermark: true,
        filterTextStyle: eFilterTextStyle.Uppercase,
        watermark: null,
        watermarkClass: 'watermarked',
        //Cuando se define, sobre-escribe el comportamiento original de filtrado.
        //el plugin llamará a este método para que el mismo se encargue de realizar
        //el filtro de los datos.
        //Este método deberá devolver un json 2 propiedades:
        //elemsNotFound: conjunto de elemento que NO cumplen con el criterio de búsqueda
        //elemsFound: conjunto de elementos que SÍ cumplen con el criterio de búsqueda
        filterDelegate: null, //function (srcId, srcElem, settings, filterText, filterExpression)
        //Se ejecuta antes de realizar el filtro de los datos y si devuelve un valor del tipo string
        //sobreescribe el texto a partir del cual se filtrará.
        onBeforeFilter: null, //function (srcId, filterText) { },
        //Se ejecuta luego de realizar el filtro de los datos y mostrar u ocultar los elementos correspondientes
        //recibe por parámetro:
        //srcId: el autofilterId, 
        //filterText: el texto de filtro, 
        //found: la cantidad de elementos que cumplen  con el filtro
        //notFound: la cantidad de elementos que no cumplen con el filtro
        onAfterFilter: null, //function (srcId, filterText, found, notFound) { }
        //Se ejecuta, cuando el texto de filtro está vacío, antes de mostrar todos los elementos
        //si el evento devuelve false, cancela la operación de mostrado de todos los elementos.
        onAfterClearFilter: null, //function(srcId){}
        //Se ejecuta, cuando el texto de filtro está vacío, después de mostrar todos los elementos
        onBeforeClearFilter: null //function(srcId){}
    };

    //métodos públicos del plugin que se podrán acceder llamando a
    //la función jquery. Ej: $.fn.gridView().method1;
    //Se recomienda que los métodos definidos aquí no dependan del selector, 
    //es decir, que no asuman que el contexto es el componente incial (aquel con el cual se llamó inicialmente al plugin), 
    //sino que, de ser necesario identificar un componente, reciban un selector, id, etc, por parámetro y obtengan la referencia.
    //Ej: method1: function(gridViewId){$("[gvId=' + gridViewId + ']")}
    var methods = {
        doFilter: function (srcId, filterText, filterSelector) {
            var src;
            if ($tempthis !== null && $tempthis.length > 0) {
                src = $tempthis;
                srcId = src.attr("data-autofilterid");
            }
            else {
                src = $("[data-autofilterid=" + srcId + "]");
            }
            var settings = $.extend({}, $default, src.data("autofilterconfig"));

            if (typeof settings.onBeforeFilter === "function") {
                var response = settings.onBeforeFilter(srcId, filterText);
                if (typeof response !== "undefined")
                    filterText = response;
            }

            if (typeof filterText === "undefined" || filterText === "" || filterText === null) {
                var doClear = true;
                if (typeof settings.onBeforeClearFilter === "function")
                    //sólo cancelará la operación si el evento devuelte false.
                    doClear = (settings.onBeforeClearFilter(srcId) !== false);

                if (doClear)
                    $(filterSelector).show(200);

                if (typeof settings.onAfterClearFilter === "function")
                    settings.onAfterClearFilter(srcId);
            }
            else {
                var elemsNotFound, elemsFound;

                var filterExpression
                if (settings.filterTextStyle === eFilterTextStyle.Uppercase)
                    filterExpression = filterText.toUpperCase();
                else if (settings.filterTextStyle === eFilterTextStyle.Lowercase)
                    filterExpression = filterText.toLowerCase();

                if (settings.accentInsensitive)
                    filterExpression = methods.accentInsensitiveReplace(filterText);

                if (typeof settings.filterDelegate === "function") {
                    var result = settings.filterDelegate(srcId, src[0], settings, filterText, filterExpression);
                    if (typeof result !== "undefined" && result != null) {
                        if ("elemsNotFound" in result)
                            elemsNotFound = result.elemsNotFound;
                        else
                            throw "autofilter - filterDelegate no devolvió el listado de elementos no encontrados.";
                        if ("elemsFound" in result)
                            elemsFound = result.elemsFound;
                        else
                            throw "autofilter - filterDelegate no devolvió el listado de elementos encontrados.";
                    }
                    else
                        throw "autofilter - filterDelegate no devolvió un resultado válido.";

                }
                else {

                    //Si se define el atributo de filtro, se utiliza ese
                    if (typeof settings.filterAttribute !== "undefined" && settings.filterAttribute !== null && settings.filterAttribute !== "") {
                        if (settings.accentInsensitive) {
                            elemsNotFound = $(filterSelector + "[" + settings.filterAttribute + "]").filter(function () {
                                var regExp = new RegExp(filterExpression, "gi");
                                var val = $(this).attr(settings.filterAttribute);
                                return !regExp.test(val);
                            });
                            elemsFound = $(filterSelector + "[" + settings.filterAttribute + "]").filter(function () {
                                var regExp = new RegExp(filterExpression, "gi");
                                var val = $(this).attr(settings.filterAttribute);
                                return regExp.test(val);
                            });
                        }
                        else {
                            elemsNotFound = $(filterSelector).not("[" + settings.filterAttribute + '*="' + filterExpression + '"]');
                            elemsFound = $(filterSelector + "[" + settings.filterAttribute + '*="' + filterExpression + '"]');
                        }
                    }
                    //si no se define un atributo de filtro, se utiliza el contains.
                    else {
                        if (settings.accentInsensitive) {
                            elemsNotFound = $(filterSelector).filter(function () {
                                var regExp = new RegExp(filterExpression, "gi");
                                var val = $(this).text();
                                return !regExp.test(val);
                            });
                            elemsFound = $(filterSelector).filter(function () {
                                var regExp = new RegExp(filterExpression, "gi");
                                var val = $(this).text();
                                return regExp.test(val);
                            });
                        }
                        else {
                            elemsNotFound = $(filterSelector).not(":contains('" + filterExpression + "')");
                            elemsFound = $(filterSelector + ":contains('" + filterExpression + "')");
                        }
                    }
                }

                if (settings.autoToggle === true) {
                    elemsNotFound.hide(200).length
                    elemsFound.show(200).length
                }
                if (typeof settings.onAfterFilter === "function")
                    settings.onAfterFilter(srcId, filterText, elemsFound.length, elemsNotFound.length, elemsFound, elemsNotFound);
            }
        },
        filterTextbox_keyup: function () {
            var $this = $(this);
            if ($tempthis !== null && $tempthis.length > 0)
                $this = $tempthis;

            var settings = $.extend({}, $default, $this.data("autofilterconfig"));
            var filterSelector;
            if (typeof settings.filterSelector !== "undefined" && settings.filterSelector !== null && settings.filterSelector !== "")
                filterSelector = settings.filterSelector;
            else {
                if (typeof $this.attr("data-autofilter-filterselector") !== "undefined" && $this.attr("data-autofilter-filterselector") !== "")
                    filterSelector = $this.attr("data-autofilter-filterselector");
                else if (typeof $this.attr("filterSelector") !== "undefined" && $this.attr("filterSelector") !== "")
                    filterSelector = $this.attr("filterSelector");
            }

            if (typeof settings.doFilter === "function")
                settings.doFilter($this.attr("data-autofilterid"), $this.val(), filterSelector);
            else
                methods.doFilter($this.attr("data-autofilterid"), $this.val(), filterSelector);
        },
        filterTextbox_focus: function () {
            var $this = $(this);
            if ($tempthis !== null && $tempthis.length > 0)
                $this = $tempthis;
            var filter = $this.val();

            var settings = $.extend({}, $default, $this.data("autofilterconfig"));
            if (settings.useWatermark) {
                var watermark;
                if (typeof settings.watermark !== "undefined" && settings.watermark !== null && settings.watermark !== "")
                    watermark = settings.watermark;
                else if (typeof $this.attr("data-autofilter-watermark") !== "undefined" && $this.attr("data-autofilter-watermark") !== "")
                    watermark = $this.attr("data-autofilter-watermark");
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

            var settings = $.extend({}, $default, $this.data("autofilterconfig"));
            if (settings.useWatermark) {
                var watermark, watermarkClass = "";
                if (typeof settings.watermark !== "undefined" && settings.watermark !== null && settings.watermark !== "")
                    watermark = settings.watermark;
                else if (typeof $this.attr("data-autofilter-watermark") !== "undefined" && $this.attr("data-autofilter-watermark") !== "")
                    watermark = $this.attr("data-autofilter-watermark");
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

            var settings = $.extend({}, $default, $this.data("autofilterconfig"));


            if (settings.useWatermark) {
                var watermark, watermarkClass = "";
                if (typeof settings.watermark !== "undefined" && settings.watermark !== null && settings.watermark !== "")
                    watermark = settings.watermark;
                else if (typeof $this.attr("data-autofilter-watermark") !== "undefined" && $this.attr("data-autofilter-watermark") !== "")
                    watermark = $this.attr("data-autofilter-watermark");
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
                if (watermark !== "")
                    $this.val(watermark);
                if (watermarkClass !== "")
                    $this.addClass(watermarkClass);

                var filterSelector;
                if (typeof settings.filterSelector !== "undefined" && settings.filterSelector !== null && settings.filterSelector !== "")
                    filterSelector = settings.filterSelector;
                else
                    filterSelector = $this.attr("data-autofilter-filterselector");

                if (typeof settings.doFilter === "function")
                    settings.doFilter($this.attr("data-autofilterid"), filter, filterSelector);
                else
                    methods.doFilter($this.attr("data-autofilterid"), filter, filterSelector);

            }
            else if (watermarkClass !== "")
                $this.removeClass(watermarkClass);
        },
        accentInsensitiveReplace: function (text) {
            return text.replace(/[aàáâãäå]/g, "[aàáâãäå]")
                .replace(/[AÀÁÂÃÄÅ]/g, "[AÀÁÂÃÄÅ]")
                .replace(/[eèéêë]/g, "[eèéêë]")
                .replace(/[EÈÉÊË]/g, "[EÈÉÊË]")
                .replace(/[iìíîï]/g, "[iìíîï]")
                .replace(/[IÌÍÎÏ]/g, "[IÌÍÎÏ]")
                .replace(/[oòóôõ]/g, "[oòóôõ]")
                .replace(/[OÒÓÔÕ]/g, "[OÒÓÔÕ]")
                .replace(/[uùúûü]/g, "[uùúûü]")
                .replace(/[UÙÚÛÜ]/g, "[UÙÚÛÜ]");
        }
    };

    $.fn.autofilter = function (options) {
        var settings = $.extend({}, $default, options);
        //Si no se recibe el parámetro options, se devuelve el objeto "methods"
        //lo que permitirá ejecutar los métodos públicos definidos allí.
        //Esta funcionalidad permite obtener la referencia a methods sin la necesidad de 
        //que el contexto de llamada sea un objeto válido o el objeto inicial.
        //Ej: $("input").gridView(...) --> llama al plugin gridView siendo el selector los inputs, 
        //Ej: $().gridView().method1   --> llama al plugin sin un selector, obteniendo la referencia a methods y por lo tanto puede ejecutar el método "method1".
        //si no está inicializado, es decir no posee el autofilterId) pasa por la iniciacilización y no por la devolución del objeto
        //methods
        if (typeof options === "undefined" && typeof this.attr("data-autofilterid") !== "undefined" && this.attr("data-autofilterid") !== "") {
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
                //var settings = $.extend({}, $default, $(item).data("autofilterconfig"));

                var itemId = $(item).attr("data-autofilterid");
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
            var newId = (typeof target[0].id != "undefined" && target[0].id != "") ? target[0].id : guiid++;
            //se genera un array con las opciones recibidas en la llamada del plugin, lo conveniente es, a estas opciones particulares
            //almacenarlas en cada control (sólo las particulares no las default).
            var itemOptions = $.extend({}, options); //realiza una copia de las opciones originales.

            if (settings.useWatermark) {
                var watermark;
                if (typeof settings.watermark !== "undefined" && settings.watermark !== null && settings.watermark !== "")
                    watermark = settings.watermark;
                else if (typeof target.attr("data-autofilter-watermark") !== "undefined" && target.attr("data-autofilter-watermark") !== "")
                    watermark = target.attr("data-autofilter-watermark");
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
            target.data("autofilterconfig", itemOptions)
                .attr("data-autofilterid", newId)//se graba el nuevo Id.
                .attr("data-plugin", "autofilter");

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
Código:       | Autofilter - 2018-09-20 1327 - 5.0.0.0
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
Versión:      | v5.0.0.0
----------------------------------------------------------------
Fecha:        | 2018-09-20 13:27
----------------------------------------------------------------
Cambios de la Versión:
 - Se modificaron los atributos que agrega el plugin, a los controles
 para que agreguen prefijo "data-", y todo en minúscula.
 - se corrigió un error que se daba cuando el control no tenía Id.
 - Se agregó la posibilidad de deshabilitar el ocultamiento de los controles
 - se agregó la posibilidad de definir un delegado para aplicar el filtro
 sobre los controles.
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
 */