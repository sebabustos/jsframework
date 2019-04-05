//

/*habilita el auto-ocultamiento al hacer click en el body fuera del combo y la lista*/
/*$("body").on("click", function () {
    if (!$.isNullOrWhiteSpace(event.target) && $.isNullOrWhiteSpace(event.target.getAttribute("data-filteredcombo"))) {
        if (!isMSIE || MSIE_Version > 9)
            $('.filteredCombolist').addClass('hide');
        $('.filteredCombolist').removeClass('shown');
    }
});

$("#txtIdTipoEscrito").autofilter({
    filterSelector: '.filteredCombo-item',
    useWatermark: false,
    onBeforeFilter: function () {
        $("#txtIdTipoEscrito").data("selecteditem", null);
    }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initFilteredComboTiposEscritos(arrData, onComplete) {
    var filterCtrl = $("#txtIdTipoEscrito");
    filterCtrl.on('focus.filteredCombo', function (src) {
        $(".filteredCombolist").addClass('shown');
        $(".filteredCombolist").removeClass('hide');
    });

    var filteredComboId = filterCtrl.attr("data-filteredcombo");
    var $autoCompleteList = $("<div class='filteredCombolist hide'></div>");
    $autoCompleteList.attr("id", "filteredCombolist_" + filteredComboId);
    $autoCompleteList.attr("data-filteredcombo-filtercontrolselector", filterCtrl.selector);
    $autoCompleteList.attr("data-filteredcombo", filteredComboId);

    var filteredComboItem_click = function () {
        var filteredCombolist = $(this).parents(".filteredCombolist:first");
        var filterControlSelector = filteredCombolist.data("filteredcombo-filtercontrolselector");
        var $filterControl = $(filterControlSelector);
        var itemData = $(this).data("item-data");
        var selecteditem = null;

        if (!$.isNullOrWhiteSpace(itemData)) {
            selecteditem = itemData;
            $filterControl.val(itemData.Descripcion);
        }
        else
            $filterControl.val("");

        $filterControl.data("selecteditem", selecteditem);
        filteredCombolist.removeClass('shown');
        filteredCombolist.addClass('hide');
        filteredCombo_SelectedIndexChange(this, $filterControl, selecteditem)
    };

    $autoCompleteList.append(
        $("<div class='filteredCombo-item selectLabel'>... limpiar selecci�n ...</div>").on("click", filteredComboItem_click));

    arrData.forEach(function (item, index) {
        var $itemCtrl = $("<div class='filteredCombo-item'></div>");
        $itemCtrl.text(item.Descripcion);
        $itemCtrl.data("item-data", item);
        $itemCtrl.on("click", filteredComboItem_click)
        $autoCompleteList.append($itemCtrl);
    });

    $autoCompleteList.insertAfter(filterCtrl);
    if (typeof onComplete === "function")
        onComplete(filterCtrl, $autoCompleteList, arrData);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function filteredCombo_SelectedIndexChange(src, $filterControl, selectedItem) {
    var courtainId = showCourtain();
    cleanCombo($("#ddlPlantillaTexto"));
    editor.instanceById("txtTexto").setContent("");

    $("#btnSig").focus();
    try {
        requiredSaving = true;
        if (selectedItem !== null) {
            var escrito = selectedItem;
            if (!$.isNullOrWhiteSpace(escrito) && escrito.isLoaded === true) {
                hideCourtain(courtainId);
                cargaDatosEscrito(escrito);
            }
            else {
                obtenerTipoEscrito(escrito.Id, courtainId, function (escrito) {
                    if (!$.isNullOrWhiteSpace(escrito) && !$.isNullOrWhiteSpace(escrito.Texto))
                        editor.instanceById("txtTexto").setContent(escrito.Texto);
                    else
                        editor.instanceById("txtTexto").setContent("");
                });
            }
        }
        else {
            hideCourtain(courtainId);
        }
    }
    catch (ex) {
        hideCourtain(courtainId);
    }
}
function txtIdTipoEscrito_OnFocus(src, evt) {
    src.select();
}


//<input id="txtIdTipoEscrito" type="text" class="form-control filteredCombo" onfocus="txtIdTipoEscrito_OnFocus(this, event);" placeholder="Seleccione el tipo de escrito" data-filteredcombo="TiposEscritos" />

*/
/////////////////////////////////////////////////////
//        Template de un plugin de JQUERY          //
/////////////////////////////////////////////////////

(function ($) {
    "use strict";
    //Configuración por defecto del plugin 
    var $default = {};
    var $tempthis = null;
    var internalMethods = {
        method1: function () { },
        method2: function () { }
    };

    if (typeof $.isNullOrWhiteSpace !== "function")
        $.isNullOrWhiteSpace = function (elem) {
            return (typeof elem === "undefined" || elem === null || $.trim(elem.toString()) === "");
        };

    if ($.isNullOrWhiteSpace($.fn.autofilter))
        throw "filteredcombo.js requiere del plugin autofilter.js";

    //métodos públicos del plugin que se podrán acceder llamando a
    //la función jquery. Ej: $.fn.filteredcombo().method1;
    //Se recomienda que los métodos definidos aquí no dependan del selector, 
    //es decir, que no asuman que el contexto es el componente incial (aquel con el cual se llamó inicialmente al plugin), 
    //sino que, de ser necesario identificar un componente, reciban un selector, id, etc, por parámetro y obtengan la referencia.
    //Ej: method1: function(filteredcomboId){$("[gvId=' + filteredcomboId + ']")}
    function Methods(srcId) {
        var $filteredcombo;
        if (!$.isNullOrWhiteSpace(srcId))
            $filteredcombo = $("[data-filteredcombo-id=" + srcId + "]");
        else if (typeof $tempthis !== "undefined" && $tempthis !== null)
            $filteredcombo = $tempthis;

        if (typeof $filteredcombo !== "undefined" && $filteredcombo !== null) {
            //si no lo recibe por parámetro, intenta obtener el handler de paginación de la configuración.
            if (typeof pagerHandler === "undefined" && $filteredcombo.length === 1) {
                var settings = $.extend({}, getDefaults(), $filteredcombo.data("gridviewconfig"));
                pagerHandler = privateMethods.getPageHandler(settings);
            }
        }
    };
    Methods.prototype.isChildGrid = function (filteredcomboId) {
        var $filteredcomboId = $("[data-filteredcombo-id=" + filteredcomboId + "]");
        return $filteredcomboId.attr("gridview_rowType") === "childGrid";
    };
    $.fn.filteredcombo = function (options) {
        //Si no se recibe el parámetro options, se devuelve el objeto "methods"
        //lo que permitirá ejecutar los métodos públicos definidos allí.
        //Esta funcionalidad permite obtener la referencia a methods sin la necesidad de 
        //que el contexto de llamada sea un objeto válido o el objeto inicial.
        //Ej: $("input").filteredcombo(...) --> llama al plugin filteredcombo siendo el selector los inputs, 
        //Ej: $().filteredcombo().method1   --> llama al plugin sin un selector, obteniendo la referencia a methods y por lo tanto puede ejecutar el método "method1".
        if ($.isNullOrWhiteSpace(options)) {
            if (this !== null && this.length > 0) {
                if ($.isNullOrWhiteSpace(this.attr("data-filteredcombo-id")))
                    throw "La filteredcombo no fue debidamente inicializada";
            }

            $tempthis = this;
            return new Methods();
        }

        //Si el parámetro options es un string, se asume la ejecución de un método del plugin indicado por este parámetro.
        //Este uso asume que el contexto es un componente válido, incluso el componente inicial 
        //el método que se ejecutará se recomienda sea un método definido en el contexto del plugin (una función dentro de $.fn.[pluginName])
        //y no dentro de methods, ya que methods ya tiene otro acceso 
        if (typeof options === "string" && options != "") {
            if (this.length <= 0)
                return this;     //por recomendación de jquery, el plugin debe devolver siempre el mismo selector
            //esto permite el encadenamiento de métodos, ej: $("selector").filteredcombo().hide().css({...});


            //el each se debe a que el selector puede devolver varios componentes.
            $.each(this, function (index, item) {
                var settings = $.extend({}, $default, $(item).attr("data-filteredcombo-config"));

                var itemId = $(item).attr("data-filteredcombo-id");
                if (options in methods)
                    eval("$(\"[data-filteredcombo-id=" + itemId + "]\").filteredCombo()." + options + "()");
                else
                    alert("El método invocado no es válido");
            });
            return this;
        }

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

            //RELIZAR LAS TAREAS DE INICIALIZACIÓN NECESARIAS. Por ejemplo dibujar el control, los auxiliares, etc.

            //se almacena la configuración del usuario en un atributo del control usando el método "data" de jquery.
            target.attr("data-filteredcombo-config", itemOptions)
                .attr("data-filteredcombo-id", newId); //se graba el nuevo Id.

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
Código:       | nombre - fecha - versión
----------------------------------------------------------------
Nombre:       | [nombre del componente/producto/funcionalidad]
----------------------------------------------------------------
Tipo:         | PLUGIN (de jquery) || FUNCIÓN
----------------------------------------------------------------
Descripción:  | [breve descripción del componente/producto/funcionalidad]
              | 
----------------------------------------------------------------
Autor:        | [Autor de la versión]
----------------------------------------------------------------
Versión:      | [Número de versión en formato vX.X.X.X]
----------------------------------------------------------------
Fecha:        | [fecha de liberación de la versión]
----------------------------------------------------------------
Cambios de la Versión:
 - [Cambios que se incluyen en la versión]

================================================================
                       FUNCIONALIDADES
================================================================
[Una opcional enumeraciones de las funciones del 
componente/producto/funcionalidad]
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