/*
================================================================
VERSIÓN
================================================================
Código:       | QuickList - 2014-10-01 1640 - 3.0.1.0
----------------------------------------------------------------
Nombre:       | QuickList
----------------------------------------------------------------
Tipo:         | PLUGIN
----------------------------------------------------------------
Descripción:  | plugin de jquery que permite configurar un 
| listado de elementos que se mostrará debajo de 
| un textbox y seleccionar de él. Permite mostrar
| un listado dijo, o bien configurar el origen de 
| datos, desde el cual se obtendrá el listado.
----------------------------------------------------------------
Autor:        | Seba Bustos
----------------------------------------------------------------
Versión:      | v3.0.1.0
----------------------------------------------------------------
Fecha:        | 2014-10-01 16:40
----------------------------------------------------------------
Cambios de la Versión:
- se corrigió una falla que existía en el método hide, el cual, 
en algunas ocasiones, se llamaba pasando directamente el control,
no el Id del quickList y eso no estaba contemplado.
================================================================
FUNCIONALIDADES
================================================================
-
================================================================
POSIBLES MEJORAS
================================================================
- Mostrar paginación en el quickList.
- permitir anclar el listado
- multiples listados simultáneos.
================================================================
HISTORIAL DE VERSIONES
================================================================
Código:       QuickList - 2014-09-10 1613 - 3.0.0.0
Autor:        Seba Bustos
Cambios de la Versión:
- Se agregó la posibilidad de definir un Header al quickList
- Se agregó la posibilidad de definir un template que será el 
item que se usará para mostrar cada elemento de la lista.
- Se agregó la posiblidad de habilitar o deshabilitar el 
resaltado de la palabra de filtro en el listado de elementos de 
coincidencias.
- Se modificó el código para que puedan coexistir varios quicklist
en una misma página y que estos se vean simultáneamente.
================================================================
Código:       QuickList - 2012-02-10 1044 - 1.0.0.0
Autor:        Seba Bustos
Cambios de la Versión:
- Primera Versión del Producto
================================================================
Código:       QuickList - 2012-02-22 1834 - 1.0.0.1
Autor:        Seba Bustos
Cambios de la Versión:
- Se modificó el nombre del parámetro filerData, que estaba mal 
escrito, por filterData.
- Se agregó la posibilidad de que el filterData sea una función.
- Se corrigió una falla en la llamada del evento 
onShowMoreSelected. Al ejecutar el método se le pasaba el 
parámetro "src" el cual no existía. Se modificó para pasar el
$this.
================================================================
Código:       QuickList - 2012-03-29 1230 - 1.0.0.2
Autor:        Seba Bustos
Cambios de la Versión:
- En la obtención de los datos del filtro (filterData) se agregó
la validación por null como primera alternativa, porque estaba
generando un error.
================================================================
Código:       QuickList - 2012-05-04 1256 - 1.0.0.3
Autor:        Seba Bustos
Cambios de la Versión:
- Se corrigió una falla que existía cuando se realiza la compro-
bación de si existía el evento onbeforfilter, el tipo se compa-
raba con "Function" pero debía ser "function" (con f minúscula)
- Se agregó una nueva opción al parámetro "showMoreButton" para 
que se pueda configurar que siempre se muestre, no sólo cuando
la cantidad de registros supera la cantidad configurada. Se 
coloco esta funcionalidad por defecto (el always).
- Se modificó el método doSearch para que, si el evento
onBeforFilter devuelve false, cancele la búsqueda.
================================================================
*/
(function ($) {
    "use strict";
    var $default = {
        itemsShown: 10, //cantidad de registros que se mostrarán en el listado.
        showMoreButton: "always", //si se debe mostrar o no el botón más y "always" si se debe mostrar siempre.
        moreButtonLabel: 'Más...',
        filterData: null, //un control o un string, del control se toma el value o text y con el se filtra.
        showOn: null, //control/es a cuyo onclick se ejecutará la búsqueda.
        dataSource: null, //url, o array de datos o json. Si es string se asumo una URL.
        useKeyboard: true,
        autoFilter: false, //a medida que vaya escribiendo va filtrando
        minInput: 0, //la cantidad mínima de caracteres para que se ejecute el autoFilter.
        headerTemplate: null,
        footerTemplate: null,
        itemTemplate: null,
        //searchOnFocus: false,
        searchOnEnter: true,
        noDataLabel: "No se encontró ningún dato",
        indicatorImage: "../../Images/indicator.gif",
        highlightFilterInput: true,
        onShowMoreSelected: function (src) {
        }, //URL a la cual se navegará cuando se presione en el botón más.
        onSelect: function (src, index, data) {
            $(src).val(data.value);
        },
        onBeforeFilter: function () { },
        onFilterSucces: function () { },
        onError: function () { }
    }
    var $tempThis = null;
    var quickListIds = 0;
    var internalMethods = {
        showUp: function (src) {
            var settings = $.extend({}, $default, $(src).data("quickList_config"));
            var filter = null;

            if (typeof settings.filterData === "undefined" || settings.filterData == null)
                filter = $(src).val();
            else if (typeof settings.filterData === "function")
                filter = settings.filterData(src);
            else if (typeof settings.filterData === "string")
                filter = settings.filterData;
            else if (typeof settings.filterData === "object")
                filter = settings.filterData.val();

            internalMethods.doSearch(settings.dataSource, filter, $(src));
        },
        toggleIndicator: function ($this, doShow) {
            var quickListId = $this.attr("quickListId");
            $("[quickList_controlType=" + eControlType.QuickListIndicator + "][quickListId=" + quickListId + "]").remove();
            if (doShow) {
                var settings = $.extend({}, $default, $this.data("quickList_config"));
                var img = $("<img src='" + settings.indicatorImage + "' style='max-width:" + $this.width() + "px'/>");
                var indicatorDiv = $("<div class='QuickListItem' quickList_controlType='" + eControlType.QuickListIndicator + "' quickListId='" + quickListId + "' style='text-align:center;'></div>").append(img);
                internalMethods.createDiv(quickListId).append(indicatorDiv).fadeIn(500);
            }
        },
        createDiv: function (quickListId) {
            var $this = $("[quickList_controlType=" + eControlType.Source + "][quickListId=" + quickListId + "]");
            return $("<div class='QuickList' quickListId='" + quickListId + "' quickList_controlType='" + eControlType.QuickList + "' plugin='quickList' style='display:none'></div>")
                    .appendTo("body")
                    .css({ zIndex: 20, position: "absolute", width: $this.outerWidth(), top: $this.outerHeight(), left: 0, display: 'inline-block' })
                    .position({
                        my: "left top",
                        at: "left bottom",
                        of: $this,
                        collision: "none"
                    })
                    .hide();
        },
        doSearch: function (dataSource, filter, sourceControl) {
            var $this = $(sourceControl);
            var settings = $.extend({}, $default, $this.data("quickList_config"));
            //verifica si se definió el evento y se ejecuta
            if (typeof settings.onBeforeFilter === "function") {
                var result = settings.onBeforeFilter(filter, sourceControl);
                //si la respuseta del filter es false, entonces se cancela la ejecución del quicklist.
                if (result === false)
                    return;
                //el resultado del evento, si este devolviera algo, sobreescribirá el texto de filtro.
                if (typeof result != "undefined")
                    filter = result;
            }
            internalMethods.toggleIndicator($this, true);
            //se asume URL
            if (typeof dataSource !== "undefined" && dataSource != null) {
                if (typeof dataSource === "string") {
                    //el filter siempre debe tener un valor, si el parámetro es nulo o no viene se inicializa con un json vacio.
                    if (typeof filter === "undefined" || filter === null)
                        filter = {};
                        //si el filter es un string, se coloca dentro de un json, y el parámetro se asume que se llama "filter".
                    else if (typeof filter === "string")
                        filter = "{ 'filter': \"" + filter + "\"}";
                    else if (typeof filter === "object")
                        filter = $.toJSON(filter);

                    $.ajax({
                        url: dataSource,
                        asyn: true,
                        type: 'POST',
                        dataType: 'json',
                        data: filter,
                        contentType: 'application/json; charset=utf-8',
                        context: sourceControl,
                        success: function (result, status, XMLHttpRequest) {
                            if (result.hasOwnProperty("d"))
                                result = result.d;
                            if (typeof result === "undefined")
                                result = null;

                            var eventResponse = settings.onFilterSucces(result, this, status, XMLHttpRequest);
                            if (typeof eventResponse !== "undefined")
                                result = eventResponse;

                            var filterExpression = $this.prop("quickList_filterExpression");

                            methods.show(sourceControl, result, (typeof filterExpression === "undefined" || filterExpression === null) ? "" : filterExpression);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            settings.onError(jqXHR, textStatus, errorThrown);
                            internalMethods.toggleIndicator($this, false);
                        }
                    })
                }
                else if (dataSource instanceof Array) {
                    var result = []
                    if (typeof filter !== "undefined" && filter !== null) {
                        $.each(dataSource, function (index, item) {
                            //al ser un datasource estático (es decir se recibe el array con la info directamente) se realiza el filtro
                            //sobre él.
                            if (item.hasOwnProperty("value") && typeof item.value !== "undefined" && item.value !== null) {
                                if (item.value.toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0)
                                    result.push(item);
                            }
                        });
                    }
                    else
                        result = dataSource;

                    methods.show(sourceControl, result, filter);
                }
            }
        }
    };
    var eControlType = {
        Source: 'source',
        QuickList: 'quickList',
        QuickListItem: 'quickListItem',
        QuickListIndicator: 'divQuickListIndicator'
    }
    $.fn.quickList = function (options) {
        if (typeof options === "string" && options !== null && options !== "") {
            if (options.toLowerCase() === "methods") {
                $tempThis = this;
                return methods;
            }
        }

        var settings = $.extend({}, $default, options);

        function init($this) {
            $this.data("quickList_config", options)
                 .attr("quickList_controlType", eControlType.Source);

            $.each($this, function (index, item) {
                //if (typeof options.sourceControl !== "undefined" && options.sourceControl !== null)
                //    options.sourceControl
                $(item).attr("quickListId", quickListIds);
                quickListIds++;

                $(item).bind("keyup", function (evt) { methods.onKeyUp(this, evt); });
                /*
                if (settings.searchOnFocus)
                $(item).bind("focusin", function (evt) { methods.focusIn(this, evt); });
                */

            });
            $.each($(settings.showOn), function (index, item) {
                $(item).bind("click", function () {
                    if ($($this).attr("quickListShown") == "true")
                        methods.hide($this);
                    else
                        internalMethods.showUp($this);
                });
            });
        }

        init(this);

        return this;
    }
    $.quickList = {
        get: function (src, controlType) {
            var $this = $(src);
            if (typeof $this.attr("quickListId") !== "undefined") {
                var quickListId = $this.attr("quickListId");

                if (typeof controlType === "undefined" || controlType === null || controlType === "")
                    controlType = eControlType.Source;

                return $("[quickList_controlType=" + controlType + "][quickListId= " + quickListId + "]");
            }
            return $this;
        },
        ControlTypes: eControlType
    }
    //var isShown = false;
    var keys = {
        ENTER: 13, TAB: 9, ESC: 27, ARRUP: 38, ARRDN: 40, PLUS: 107, MINUS: 109, END: 35, HOME: 36,
        DELETE: 46, BACKSPACE: 8, CAPSLOCK: 20
    };
    var methods = {
        onKeyUp: function (src, evt) {
            var $this = $(src);
            var quickListId = $this.attr("quickListId");
            $this.prop("quickList_filterExpression", $this.val());

            var settings = $.extend({}, $default, $this.data("quickList_config"));

            if (evt.keyCode === keys.ENTER && settings.searchOnEnter) {
                if (typeof $this.attr("quickListShown") === "undefined" || $this.attr("quickListShown") == "false")
                    internalMethods.showUp($this);
                else {
                    var selected = methods.getSelected(quickListId);
                    if (selected != null) {
                        var onSelResult = true;
                        if (selected.elem !== null && selected.elem.id === "more")
                            onSelResult = settings.onShowMoreSelected($this);
                        else
                            onSelResult = settings.onSelect($this, selected.index, selected.elem);
                    }
                    if (typeof onSelResult === "undefined" && onSelResult !== false)
                        methods.hide(quickListId);
                }
            }
            else if (evt.keyCode === keys.ESC) {
                methods.hide(quickListId);
            }
            else if (evt.keyCode === keys.ARRDN || evt.keyCode === keys.ARRUP) {
                if (typeof $this.attr("quickListShown") === "undefined" || $this.attr("quickListShown") == "false") {
                    internalMethods.showUp($this);
                    methods.highligthItem(0, quickListId);
                }
                else {
                    methods.moveSelection(evt.keyCode, quickListId);
                }
            }
                //Sólo se ejecuta la búsqueda, autoFilter, si se presiona algún caracter alfa numérico o backspace o delete.
            else if ((evt.keyCode >= 48 && evt.keyCode <= 90) || (evt.keyCode >= 96 && evt.keyCode <= 105) || evt.keyCode == keys.BACKSPACE
                || evt.keyCode == keys.DELETE) {

                if (settings.autoFilter)
                    internalMethods.showUp($this);
                else
                    methods.hide(quickListId);
            }
        },
        getSelected: function (quickListId) {
            if (typeof quickListId === "undefined" || quickListId === null)
                quickListId = $tempThis.attr("quickListId");

            var $this = $("[quickList_controlType='" + eControlType.QuickList + "'][quickListId=" + quickListId + "]");

            var retVal = {};
            var selectedItem = null;

            if ((selectedItem = $(".QuickListItemSelected", $this)).length > 0) {
                retVal.index = selectedItem.attr("index");
                retVal.elem = eval("(" + selectedItem.attr("srcElem") + ")");
            }
            else
                retVal = null;

            return retVal;
        },
        moveSelection: function (key, quickListId) {
            var ARRUP = 38, ARRDN = 40, END = 35, HOME = 36;
            var selIndex = -1, selectedItem;

            if (typeof quickListId === "undefined" || quickListId === null)
                quickListId = $tempThis.attr("quickListId");

            var $this = $("[quickList_controlType='" + eControlType.QuickList + "'][quickListId=" + quickListId + "]");

            var itemCounts = $(".QuickListItem", $this).length - 1;
            if ((selectedItem = $(".QuickListItemSelected", $this)).length > 0)
                selIndex = parseFloat(selectedItem.attr("index"));

            if (key == ARRDN)
                selIndex = selIndex + 1;
            else if (key == ARRUP)
                selIndex = selIndex - 1;
            else if (key == END)
                selIndex = itemCounts;
            else if (key == HOME)
                selIndex = 0;

            if (selIndex > itemCounts)
                selIndex = 0;
            if (selIndex < 0)
                selIndex = itemCounts;

            this.highligthItem(selIndex, quickListId);
        },
        highligthItem: function (index, quickListId) {
            if (typeof quickListId === "undefined" || quickListId === null)
                quickListId = $tempThis.attr("quickListId");

            var $this = $("[quickList_controlType='" + eControlType.QuickList + "'][quickListId=" + quickListId + "]");

            $(".QuickListItemSelected", $this).removeClass("QuickListItemSelected");
            $(".QuickListItem[index='" + index + "']", $this).addClass("QuickListItemSelected");
        },
        hide: function (param) {
            var $this;
            var quickListId;
            if (typeof param === "undefined" || param === null)
                $this = $tempThis;
            else if (typeof param === "string") {
                quickListId = param
                $this = $("[quickList_controlType=" + eControlType.Source + "][quickListId= " + quickListId + "]");
            }
            else {
                $this = param;
                quickListId = $this.attr("quickListId");
            }

            var $quickList = $("[quickList_controlType='" + eControlType.QuickList + "'][quickListId=" + quickListId + "]");
            $quickList.fadeOut(250, function () {
                $("[quickList_controlType='" + eControlType.QuickList + "'][quickListId=" + quickListId + "]").remove();
            })
            $($this).removeAttr("quickListShown");
        },
        startHidding: function (quickListId, ms) {
            if (typeof ms == "undefined" || isNaN(ms))
                ms = 5000;
            var toId = window.setTimeout(function () {
                methods.hide(quickListId);
            }, ms);
            var $this = $("[quickList_controlType=" + eControlType.Source + "][quickListId= " + quickListId + "]");
            $this.attr("timeOutId", toId);
        },
        cancelHidding: function ($this) {
            var toId = $this.attr("timeOutId");
            if (typeof toId != "undefined" && toId != "")
                window.clearTimeout(toId);
        },
        show: function ($this, data, input) {
            var settings = $.extend({}, $default, $($this).data("quickList_config"));

            var quickListId = $this.attr("quickListId");

            $("[quickList_controlType='" + eControlType.QuickList + "'][quickListId=" + quickListId + "]").remove();
            var quickListItem = "";
            var index = 0;
            if (typeof data !== "undefined" && data !== null && data.length > 0) {
                for (var item in data) {
                    var css = (index == 0 ? " firstitem" : (index == (data.length - 1) ? " lastitem" : " miditem"));

                    if (data[item].css != null && data[item].css != "")
                        css = css + " " + data[item].css;
                    var content;
                    if (settings.itemTemplate)
                        content = settings.itemTemplate.replace("{value}", data[item].value);
                    else
                        content = data[item].value;

                    if (settings.highlightFilterInput) {
                        var items = input.split(" ");
                        for (var searchExpr in items) {
                            if (items[searchExpr] != "") {
                                var reg = new RegExp("(" + items[searchExpr] + ")", "gi");
                                content = content.replace(reg, "<span class='filterMatch' style='font-weight:bold;'>$1</span>");
                            }
                        }
                    }

                    var elem = "{id:'" + data[item].id + "', value:'" + data[item].value + "', info:'" + data[item].info + "',cssClass:'" + data[item].cssClass + "'}";
                    quickListItem += "<div class='QuickListItem" + css + "' index='" + index + "' quickListId='" + quickListId + "' quickList_controlType='" + eControlType.QuickListItem + "' srcElem=\"" + elem + "\" >" + content + " <div class='QuickListItemInfo'>" + data[item].info + "</div></div>";
                    index++;
                    if (index > settings.itemsShown)
                        break;
                }
                if ((settings.showMoreButton === "always") || (data.length > settings.itemsShown && settings.showMoreButton === true)) {
                    quickListItem += "<div class='QuickListItem MoreListItem' index='" + index + "' srcElem=\"{id:'more'}\">" + settings.moreButtonLabel + " </div>";
                }
            }
            else {
                quickListItem += "<div class='QuickListItem' index='0' id='QuickListItem_0' quickList_controlType='" + eControlType.QuickListItem + "' srcElem=\"{id:null,value:null, info:null, cssClass:null}\" > " + settings.noDataLabel + "</div>";
            }

            var quickList = internalMethods.createDiv(quickListId);

            if (typeof settings.headerTemplate !== "undefined" && settings.headerTemplate !== null)
                quickList.append(settings.headerTemplate);

            var quickListId = $this.attr("quickListId");
            quickList.append($(quickListItem).keyup(function (evt) { }))
                    .fadeIn(1000)
                    .mouseenter(function (evt) {
                        methods.cancelHidding($(this));
                    })
                    .mouseleave(function (evt) {
                        methods.startHidding(quickListId, 5000);
                    })
                    .focus(function () {
                        methods.cancelHidding($(this));
                    }).blur(function () {
                        methods.startHidding(quickListId, 5000);
                    });
            if (typeof settings.footerTemplate !== "undefined" && settings.footerTemplate !== null)
                quickList.append(settings.footerTemplate);

            if (typeof settings.onSelect != "undefined" && settings.onSelect != null) {
                $(".QuickListItem:not(.MoreListItem)", quickList).click(function (evt) {
                    var onSelResult = settings.onSelect($this, $(this).attr("index"), eval("(" + $(this).attr("srcElem") + ")"));
                    if (typeof onSelResult === "undefined" && onSelResult !== false)
                        methods.hide($this);
                }).mouseover(function () {
                    methods.highligthItem($(this).attr("index"), quickListId);
                })
            }
            if (settings.showMoreButton !== false) {
                var moreItem = $(".MoreListItem", quickList);
                if (typeof settings.onShowMoreSelected === "function") {
                    moreItem.click(function (evt) {
                        var onSelResult = settings.onShowMoreSelected(this);
                        if (typeof onSelResult === "undefined" && onSelResult !== false)
                            methods.hide($this);
                    }).keyup(function (evt) {
                        if (evt.keyCode == keys.ENTER) {
                            var onSelResult = settings.onShowMoreSelected(this);
                            if (typeof onSelResult === "undefined" && onSelResult !== false)
                                methods.hide($this);
                        }
                    });
                }
                moreItem.mouseover(function () {
                    methods.highligthItem($(this).attr("index"), quickListId);
                });
            }
            $($this).attr("quickListShown", true);

            internalMethods.toggleIndicator($this, false);
        }
    };
})(jQuery);