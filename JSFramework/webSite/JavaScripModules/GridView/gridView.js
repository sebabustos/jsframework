﻿/*! GridView - 2019-07-18 1352 - v8.3.0.0
https://github.com/sebabustos/jsframework/tree/master/JSFramework/webSite/JavaScripModules/GridView */
/*
================================================================
                            VERSIÓN
================================================================
Código:         | GridView - 2019-07-18 1352 - v8.3.0.0
----------------------------------------------------------------
Nombre:         | GridView
----------------------------------------------------------------
Tipo:           | PLUGIN
----------------------------------------------------------------
Descripción:    | Plugin de jQuery que provee la funcionalidad de 
                | una grilla, que permite, entre otras cosas,
                | la configuración de las columnas, el servicio web
                | a consumir para obtener los datos, etc.
                | Es compatible con la estética de jQueryUI.    
----------------------------------------------------------------
Autor:          | Seba Bustos
----------------------------------------------------------------
Cambios de la Versión:
- Se modificó la función de conversión de json para que sólo utilice la clase JSON, nativa.
- Se modificó la función 'parseAjaxDateTimeToDate' para que soporte también el formato UTC (yyyy-mm-ddTHH:mm:ss.fff) y yyyy-mm-dd HH:mm:ss.fff
================================================================
                        IDEAS
================================================================
- quitar el div "<div class="divCellData" />"
- Permitir definir un template de fila, que permita usar la grilla como repeater, en lugar de grilla.
================================================================
                        FUNCIONALIDADES
================================================================
- Permite obtener el set de datos a dibujar de un WS, recibirlos 
por parámetro, o bien extraerlo del contenido de un control.
(el set debe cumplir con el formato json)
- Permite configurar las columnas que componen la grilla
- Permite ocultar columnas.
- Permite configurar las columnas para que se dibujen controles
- Permite definir para cada columna si su valor será devuelto
al seleccionar una fila.
- Permite configurar el uso de paginación o no, y la configuración
de la misma, ej: items por página, cant. de paginas por grupo, 
tipo de navegación back and forward, o con número de páginas.
- Permite configurar una celda para que se recorte su contenido y 
agregue la funcionalidad de previsualización al pasar el mouse 
sobre ella
- Permite configurar el ordenamiento al presionar sobre una 
columna
- Permite definir los siguientes evento:
    * onRowSelect: function (row, gridViewId, data). Cuando el usuario seleccione una fila
    * onCleanSearch: function ($gridViewSrc, settings, paggingData, gridViewId). Se dispara previo a realizar la limpieza de la grilla. Si el evento devuelte "false" cancela la limpieza.
    * onBeforeSearch: function (pageIndex, settings.pageSize, gridViewId). Se dispara antes de realizar la búsqueda. Permite cancelar la misma devolviendo "false"
    * onBeforeDraw: function (gridViewId, data). se dispara antes de iniciar el dibujado del cuerpo de la grilla. Permite cancelar el dibujado, devolviendo "false"
    * onError: function (jqXHR, textStatus, errorThrown). se dispara cuando se produce un error en la obtención o el procesamiento de los datos.
    * onGridDrawed: function (gridViewId){}. Se ejecutará al terminar de dibujarse la grilla.
    * onComplete: function (gridViewId, isSuccess, status, messageError). Se ejecutará al finalizar el procesamiento de búsqueda, dibujado, etc. aún cuando se produjera un error.
    * onSorting: function(gridViewId, row, column, { column: 'dataFieldName', sortDirection: 'asc|desc' }). Se ejecutará cuando el usuario presione sobre una columna ordenable, previo a ejectar el ordenamiento. Permite cancelar la acción devolviendo "false".
    * onRowDataBounding: function (gridViewId, data, rowIndex) { } Se ejecutará antes de crear e insertar una fila, recibe por parámetro el id de la grilla, un json con los datos que componente la fila (todas las columnas no sólo las que tengan "includeInResult: true") y la posición de la fila dentro de la grilla (el índice). Este evento puede, opcionalmente, devolver un json con los datos que usará el componente para dibujar la fila. Obviamente este json debe cumplir con la estructura del datasource, es decir del data recibido por parámetro.
    * onRowDataBound: function (row, gridViewId, data, rowIndex) { } Se ejecutará luego de haber agregado la fila a la grilla, recibe por parámetro el control TR correspondiente a la fila agregada, el id de la grilla, un json con los datos usados para dibujar la grilla y el índice de la fila agregada. Usando el parámetro row es posible, por ejemplo, acceder a los controles que se hubieren configurado dentro de la fila, y operar sobre ellos, por ejemplo, deshabilitar un textbox.
    * onPageIndexChanging: function (gridViewId, pageIndexFrom, pageIndexTo, isLastPage). Se ejecutará cuando el usuario realice un cambió en el índice de la página de resultados, pero previo a ejecutarse la paginación. Si la función devuelve "false" se cancela el cambio de página.
    * onPageIndexChanged: function (gridViewId, currentPageIndex). Se ejecutará luego de realizado el cambio de página. Es decir, luego de la búsqueda de los datos y dibujado de los mismos.
    * searchResultPreProcessing: function (gridViewId, data). Se ejecuta luego del onBeforeDraw, pero antes de dibujar la grilla, y permite modificar los datos que se usarán para dibujar la grilla.

- Permite utilizar la estética de jQuery o bien definir una 
estética personalizada sobreescribiendo las clases de estilo
- Permite configurar la grilla para sólo consulta o permitir la 
selección de una fila.
- Permite agregar grillas anidadas, en varios niveles, donde cada 
grilla agregada es una gridView en sí misma.
- Permite agregar filas manualmente en una grilla ya dibujada
(método addRow e insertRow)
*/


(function ($) {
    "use strict";
    var $paggingData = {
        currIndex: 0,
        totalRecords: 0,
        currPageGroupNum: 0,
        pageAmm: 0
    };
    var $tempthis = null;
    var $default = {
        includeOriginalDataSourceInResult: false,/*permite habilitar el registro completo del Origen de dato usado para dibujar la fila, 
         * si se habilita no se utilizará la propiedad IncludeInResult ya que se registrará el objeto completo
         * OJO! puede existir diferencia en los nombres de las estructura de datos.
         */
        cssClass: null,
        childGrid: null/* Misma config de gridView, o un objeto gridView.*/
        /*{
        showAllExpanded:false
        }*/,
        dataSourceType: "ws",  //"ws", "json"
        dataSourceObject: null,
        dataSource: "",
        useJQueryUI: true,
        allowSelection: true,
        usePagging: true,
        paggingNavigationMode: 'default', //'default', 'backforward'
        pagerPosition: "down", //"up"|"down"
        pageSize: 20,
        pagesShown: 10,
        allowSorting: false,
        sortColumn: null,
        sortDirection: null,
        defaultSortDirection: 'asc',
        showRecordsFound: true,
        recordsFoundsLabel: "Cant. de Registros: <span class='spTotalRecords'>{0}</span>",
        showFirstPageButton: true,
        showLastPageButton: true,
        showRowNumber: false,
        selectionMode: 'cell', //'row'|'cell'
        showProcessingIndicator: true,
        getFilterData: function () { return {}; },
        onCleanSearch: null, //function ($gridViewSrc, settings, paggingData, gridViewId) { return true;},
        onBeforeSearch: null, //function (pageIndex, settings.pageSize, gridViewId) { },
        onBeforeDraw: null, //function (gridViewId, data) { return true;},
        onError: null, //function (jqXHR, textStatus, errorThrown) { },
        onComplete: null,  //function (gridViewId, isSuccess, status, messageError) { },
        onSorting: null, //function(gridViewId, row, column, { column: 'dataFieldName', sortDirection: 'asc|desc' });
        searchResultPreProcessing: null, //function (gridViewId, data) { },
        ///<Type>Evento</Type>
        ///<Name>onRowSelect</Name>
        ///<Description>Este evento se ejecutará, si la grilla admite selección (alloSelection:true), cuando el usuario seleccione una fila, ya sea 
        ///mediante el uso del botón de selección (si selectionMode:'cell') o mediante el uso de la fila completa (selectionMode:'row')
        ///</Description>
        ///<Parametros>
        ///src: jquery, TR que representa la fila seleccionada
        ///itemData: json, que contendrá las columnas de datos que componen la fila, configuradas como "includeInResult:true"
        ///</Parametros>
        onRowSelect: null,  //function (row, gridViewId, data) { },
        onRowDataBounding: null,//function (gridViewId, data, rowIndex) { }
        //Se ejecutará antes de crear e insertar una fila, recibe por parámetro el id de la grilla, un json con los datos que componente la fila (todas las columnas no sólo las que tengan "includeInResult: true") y la posición de la fila dentro de la grilla (el índice)
        //Este evento puede, opcionalmente, devolver un json con los datos que usará el componente para dibujar la fila. Obviamente este json debe cumplir con la estructura del datasource, es decir del data recibido por parámetro.
        onRowDataBound: null,   //function (row, gridViewId, data, rowIndex) { }
        //Se ejecutará luego de haber agregado la fila a la grilla, recibe por parámetro el control TR correspondiente a la fila agregada, el id de la grilla, un json con los datos usados para dibujar la grilla y el índice de la fila agregada.
        //Usando el parámetro row es posible, por ejemplo, acceder a los controles que se hubieren configurado dentro de la fila, y operar sobre ellos, por ejemplo, deshabilitar un textbox.
        onGridDrawed: null, //function (gridViewId){}
        onPageIndexChanging: null, //function (gridViewId, pageIndexFrom, pageIndexTo, isLastPage) { },
        onPageIndexChanged: null, //function (gridViewId, currentPageIndex) { },
        totalRecordsProperty: null,
        dataResultProperty: null,
        ajaxLoaderImage: "/Images/indicator.gif",
        showRefresh: true, //muestra una imagen como ícono de refresh
        refreshImage: null, //indica qué imagen utilizará
        refreshIcon: null, //si true, dibujará un span en lugar de un image
        refreshIconTemplate: null, //un string o control que se usará como icono de refresh
        ajaxConfig: {
            async: true,
            type: "POST",
            dataType: 'json',
            data: '{}',
            contentType: 'application/json; charset=utf-8'
        },
        headerControls: [],
        //headerControls:[{
        //    label:"",
        //    onClick: function(row, id, rowType, data, src){},
        //    type:'', //'image' | 'button', --> si image, label es la URL de la imagen. DEFAULT = button
        //    template: '', //--> selector que indica el control modelo que se copiará para cada fila.
        //    cssClass: '',
        //    showInHeader:false,
        //    style:'',
        //    alt:'' //--> si el type es image, se usa para el atributo "alt".
        //    }],
        rowDataFieldId: null,//permite definir una columna como identificador de la fila, creándose un atributo con el nombre del DataFieldName de la columna y con el valor del mismo
        columns: [{}],
        //Ej de configuración de columnas.
        //{
        //  visible:true,
        //  width: "",
        //  description: "",
        //  dataFieldName: "", /*=> req.*/
        //  columnDataType: 'date', 'numeric','string', 'object'
        //  includeInResult: true,
        //  dataEval: function (){return ... }, --> permite definir una función a la cual se le pasará el valor del datasource y cuyo retorno se utilizará como texto de la celda.
        //  showPreview: false, 
        //  previewCellClass: '', 
        //  type:'databound', /*'databound', 'control', 'empty'*/
        //  cssClass:'',
        //  sortable:true,
        //  Controls:[{
        //    label:"",
        //    onClick: function(row, id, rowType, data, src){},
        //    events: [{name:'event', handler: function(row, id, rowType, data, src){}}]
        //    type:'', //'image' | 'button' | 'checkbox' | 'radio' | 'textbox' | 'select' --> si image, label es la URL de la imagen. Cualquier otro el value es es label. DEFAULT = button
        //    template: '', //--> selector que indica el control modelo que se copiará para cada fila.
        //    cssClass: '',
        //    showInHeader:false,
        //    style:'',
        //    alt:'' //--> si el type es image, se usa para el atributo "alt".
        //    headerControlTemplate: { //--> si no se configura, y showInHeader es true, se usa el mismo control.
        //          label:"",
        //          onClick: function(row, id, rowType, data, src){},
        //          events: [{name:'event', handler: function(row, id, rowType, data, src){}}]
        //          type:'', //'image' | 'button' | 'checkbox' | 'radio' | 'textbox' | 'select' --> si image, label es la URL de la imagen. Cualquier otro el value es es label. DEFAULT = button
        //          template: '', //--> selector que indica el control modelo que se copiará para cada fila.
        //          cssClass: '',
        //          style:'',
        //          alt:''
        //      }
        //}],
        //}
        noResultsCaption: ". : No se encontraron registros : .",
        noResultsClass: "tdNoRecords"
    };

    function getDefaults() {
        var retVal = $default;
        if (typeof window.GridView_GetConfiguration !== "undefined" && window.GridView_GetConfiguration !== null)
            retVal = $.extend({}, retVal, window.GridView_GetConfiguration($default));

        return retVal;
    }

    function isNullOrWhiteSpace(elem) {
        return (typeof elem === "undefined" || elem === null || $.trim(elem.toString()) === "");
    };

    /**
     * intenta convertir una cadena de fecha en el formato /Date(xxxx)/ o yyyy-mm-dd HH:mm:ss.fff- devuelto por un WebMethod, a un objeto fecha de javascript
     * @param {any} str cadena con la fecha a convertir 
     * @returns {Date} objeto fecha convertido
     */
    function parseAjaxDateTimeToDate(str) {
        var retVal;
        try {
            var ajaxTypeDateREGEX = /\/Date\((\d*)\)\//;
            var ajaxUTCTypeDateREGEX = /\d{4}-\d{1,2}-\d{1,2}([T| ]\d{1,2}:\d{1,2}(:\d{1,2}(\.\d{1,3}){0,1}){0,1}){0,1}/;

            if ($.isNullOrWhiteSpace(str))
                retVal = null;
            else if (ajaxTypeDateREGEX.test(str))
                retVal = (new Date(parseInt(str.replace(ajaxTypeDateREGEX, "$1"))));
            else if (ajaxUTCTypeDateREGEX.test(str)) {
                try {
                    var dateInt = Date.parse(str);
                    retVal = (new Date(dateInt));
                }
                catch (exc) {
                    throw "Se produjo un error al intentar parsear la fecha: '" + str + "'";
                }
            }
        }
        catch (excep) {
            retVal = null;
        }
        return retVal;
    };

    var defaultPager = {
        movePrevPage: function () {
            var gridViewId;
            if (arguments.length === 0 && $tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                gridViewId = arguments[0];
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));

            if (paggingData.currIndex > 0) {
                var fromIndex = paggingData.currIndex;
                var toIndex = paggingData.currIndex - 1;
                //Si está definido el evento de cambio de página, ejecuta el mismo
                if (settings.onPageIndexChanging instanceof Function) {
                    var isLastPage = (toIndex === (paggingData.pageAmm - 1));
                    //Se ejecuta el evento y si el evento devolvió false, entonces se cancela el movimiento de la página
                    if (settings.onPageIndexChanging(gridViewId, fromIndex, toIndex, isLastPage) === false)
                        return;
                }
                paggingData.currIndex--;
                elem.data("gridView:pagging", paggingData);
                if ((paggingData.currIndex - 1) <= (paggingData.currPageGroupNum * settings.pagesShown))
                    this.movePrevPageGroup(gridViewId);
                $(elem).gridView("doSearch", paggingData.currIndex);

                if (settings.onPageIndexChanged instanceof Function)
                    //Se ejecuta el evento y si el evento devolvió false, entonces se cancela el movimiento de la página
                    settings.onPageIndexChanged(gridViewId, paggingData.currIndex);
            }
        },
        moveNextPage: function () {
            var gridViewId;
            if (arguments.length === 0 && $tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                gridViewId = arguments[0];

            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));
            if ((paggingData.currIndex + 1) < paggingData.pageAmm) {
                var fromIndex = paggingData.currIndex;
                var toIndex = paggingData.currIndex + 1;

                //Si está definido el evento de cambio de página, ejecuta el mismo
                if (settings.onPageIndexChanging instanceof Function) {
                    var isLastPage = (toIndex === (paggingData.pageAmm - 1));

                    if (settings.onPageIndexChanging(gridViewId, fromIndex, toIndex, isLastPage) === false)
                        return;
                }
                paggingData.currIndex++;
                var nextPage = paggingData.currIndex + 1;
                elem.data("gridView:pagging", paggingData);
                if ((nextPage <= paggingData.pageAmm) && (nextPage > ((paggingData.currPageGroupNum + 1) * settings.pagesShown)))
                    this.moveNextPageGroup(gridViewId);
                $(elem).gridView("doSearch", paggingData.currIndex);

                if (settings.onPageIndexChanged instanceof Function)
                    //Se ejecuta el evento y si el evento devolvió false, entonces se cancela el movimiento de la página
                    settings.onPageIndexChanged(gridViewId, paggingData.currIndex);
            }
        },
        moveToPage: function (pageIndex) {
            var gridViewId;
            if (arguments.length === 0)
                return;

            //Si se recibe más de un argumento, el primero es siempre el GridViewId.
            //y el 2º el pageIndex.
            if (arguments.length > 1) {
                gridViewId = arguments[0];
                pageIndex = arguments[1];
            }
            //Si se recibe un sólo argumento es el pageIndex, pero el gridView debe haber sido precargado en la variable $tempthis.
            else if ($tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                throw new Error("No se ha indicado el control de grilla sobre el cual operar");

            if (isNaN(pageIndex))
                throw new Error("El pageIndex debe ser un n&uacutemero");

            pageIndex = parseFloat(pageIndex);

            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));

            if (pageIndex < 0 || pageIndex >= paggingData.pageAmm)
                throw new Error("El &iacutendice indicado est&aacute fuera del intervalo de p&aacuteginas v&aacutelidas");

            var fromIndex = paggingData.currIndex;
            var toIndex = pageIndex;
            //Si está definido el evento de cambio de página, ejecuta el mismo
            if (settings.onPageIndexChanging instanceof Function) {
                var isLastPage = (toIndex === (paggingData.pageAmm - 1));

                if (settings.onPageIndexChanging(gridViewId, fromIndex, toIndex, isLastPage) === false)
                    return;
            }

            $(elem).gridView("doSearch", pageIndex);

            if (settings.onPageIndexChanged instanceof Function)
                //Se ejecuta el evento y si el evento devolvió false, entonces se cancela el movimiento de la página
                settings.onPageIndexChanged(gridViewId, paggingData.currIndex);
        },
        movePrevPageGroup: function () {
            var gridViewId;
            if (arguments.length === 0 && $tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                gridViewId = arguments[0];
            var elem = $("[gridViewId=" + gridViewId + "]");
            var paggingData = $.extend({}, elem.data("gridView:pagging"));
            if (paggingData.currPageGroupNum > 0) {
                paggingData.currPageGroupNum--;
                elem.data("gridView:pagging", paggingData);
                $(elem).gridView("drawPager");
            }
        },
        moveNextPageGroup: function () {
            var gridViewId;
            if (arguments.length === 0 && $tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                gridViewId = arguments[0];
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));
            if (((paggingData.currPageGroupNum + 1) * settings.pagesShown) < paggingData.pageAmm) {
                paggingData.currPageGroupNum++;
                elem.data("gridView:pagging", paggingData);
                $(elem).gridView("drawPager");
            }
        },
        moveFirstPageGroup: function () {
            var gridViewId;
            if (arguments.length === 0 && $tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                gridViewId = arguments[0];
            var elem = $("[gridViewId=" + gridViewId + "]");
            var paggingData = $.extend({}, elem.data("gridView:pagging"));

            paggingData.currPageGroupNum = 0;
            elem.data("gridView:pagging", paggingData);

            $(elem).gridView("drawPager");
        },
        moveLastPageGroup: function () {
            var gridViewId;
            if (arguments.length === 0 && $tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                gridViewId = arguments[0];
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));

            var rest = (paggingData.pageAmm % settings.pagesShown);
            paggingData.currPageGroupNum = ((paggingData.pageAmm - rest) / settings.pagesShown) - (rest === 0 ? 1 : 0);
            elem.data("gridView:pagging", paggingData);
            $(elem).gridView("drawPager");
        },
        setPaggingData: function (paggingData, data, settings) {
            if (settings.usePagging) {
                if (settings.totalRecordsProperty === null) {
                    if (data.hasOwnProperty("totalRecords"))
                        paggingData.totalRecords = data.totalRecords;
                    else {
                        var resultData;
                        if (typeof settings.dataResultProperty !== "undefined" && settings.dataResultProperty !== null && data.hasOwnProperty(settings.dataResultProperty))
                            resultData = data[settings.dataResultProperty];
                        else if (data.hasOwnProperty("result"))
                            resultData = data.result;
                        else
                            resultData = data;

                        paggingData.totalRecords = resultData.length;
                    }
                }
                else {
                    if (!data.hasOwnProperty(settings.totalRecordsProperty)) {
                        alert("El resultado de la b&uacutesqueda no posee la propiedad \"" + settings.totalRecordsProperty + "\".");
                        return;
                    }
                    else
                        paggingData.totalRecords = data[settings.totalRecordsProperty];
                }
                //Sólo si está configurada la paginación se obtiene el totalRecords, se realizan los cálculos para la
                //paginación y se dibujan los controls, caso contrario se obvia toda esta sección.
                var rest = (paggingData.totalRecords % settings.pageSize);
                paggingData.pageAmm = ((paggingData.totalRecords - rest) / settings.pageSize) + ((rest === 0) ? 0 : 1);
            }

            return paggingData;
        },
        drawPager: function (gridViewId) {
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));
            if (paggingData.totalRecords > 0) {
                var $pagerContainer = $("[gridview_element=pagerContainer]", elem);
                $pagerContainer.empty();
                //la cantidad de registro se muestra siempre, si está habilitada.
                if (settings.showRecordsFound) {
                    if (settings.recordsFoundsLabel.indexOf("{0}") < 0)
                        settings.recordsFoundsLabel = settings.recordsFoundsLabel + " <span class='spTotalRecords'>{0}</span>";
                    $pagerContainer.append("<div class='pagerRow' gridview_element='recordsFoundContainer'><div class='pagerCell tdRecordsFounds'  gridview_element='recordsFound' colspan='8'>" + settings.recordsFoundsLabel.replace("{0}", paggingData.totalRecords) + "</div></div>");
                }

                //sólo muestra la consola de navegación si la cantidad de resultados supera la página definida.
                if (paggingData.totalRecords > settings.pageSize) {
                    var pageNumbers = "";
                    var prod = paggingData.currPageGroupNum * settings.pagesShown;
                    for (var icount = prod; (icount < prod + settings.pagesShown) && (icount < paggingData.pageAmm); icount++) {
                        var css = "";
                        if (paggingData.currIndex === icount)
                            css = " selected";
                        var spaces = "";
                        for (var amm = icount.toString().length; amm < 3; amm++)
                            spaces = spaces + "&nbsp;";

                        pageNumbers = pageNumbers + "<span class='pageNumber" + css + "' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.moveToPage(" + icount + ");'>" + (icount + 1) + "</span>" + spaces;
                    }

                    if (paggingData.pageAmm > 0) {
                        var htmlPager = "";
                        htmlPager = "<div class='pagerRow pagerNavigationContainer defaultPager' gridview_element='pagerNavigationContainer'>" +
                            "<div class='pagerCell tdCurrPage' gridview_element='currentPageLabel'>P&aacutegina " + (paggingData.currIndex + 1) + " de " + paggingData.pageAmm + "</div>";
                        var pagesGroupAmm = (paggingData.pageAmm / settings.pagesShown);
                        if (pagesGroupAmm > 1) {
                            if (settings.showFirstPageButton)
                                htmlPager += "<div class='pagerCell tdFirstPageGroup' gridview_element='firsGroupNavigation'><span class='MovePageGroup spFirstPageGroup' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.moveFirstPageGroup(\"" + gridViewId + "\");'>|<</span></div>";

                            htmlPager += "<div class='pagerCell tdPrevPageGroup' gridview_element='prevGroupNavigation'><span class='MovePageGroup spPrevPageGroup' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.movePrevPageGroup(\"" + gridViewId + "\");'><<</span></div>";
                        }

                        htmlPager = htmlPager + "<div class='pagerCell tdPrev' gridview_element='prevNavigation'><span class='MovePage spPrev' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.movePrevPage(\"" + gridViewId + "\");'><</span></div>" +
                            "<div class='pagerCell tdPageNumbers' gridview_element='pageNumber'><div class='divPageNumbers' >" + pageNumbers + "</div></div>" +
                            "<div class='pagerCell tdNext' gridview_element='nextNavigation'><span class='MovePage spNext' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.moveNextPage(\"" + gridViewId + "\");'>></span></div>";
                        if (pagesGroupAmm > 1) {
                            htmlPager += "<div class='pagerCell tdNextPageGroup' gridview_element='nextGroupNavigation'><span class='MovePageGroup spNextPageGroup' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.moveNextPageGroup(\"" + gridViewId + "\");'>>></span></div>";

                            if (settings.showLastPageButton)
                                htmlPager += "<div class='pagerCell tdLastPageGroup' gridview_element='lastGroupNavigation'><span class='MovePageGroup spLastPageGroup' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.moveLastPageGroup(\"" + gridViewId + "\");'>>|</span></div>";
                        }

                        htmlPager += "</div>";

                        $pagerContainer.append(htmlPager);
                    }
                }
            }
        }
    };

    var backForwardPager = {
        movePrevPage: function () {
            var gridViewId;
            if (arguments.length === 0 && $tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                gridViewId = arguments[0];
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));

            if (paggingData.currIndex > 0) {
                var fromIndex = paggingData.currIndex;
                var toIndex = paggingData.currIndex - 1;
                //Si está definido el evento de cambio de página, ejecuta el mismo
                if (settings.onPageIndexChanging instanceof Function) {
                    //Se ejecuta el evento y si el evento devolvió false, entonces se cancela el movimiento de la página
                    if (settings.onPageIndexChanging(gridViewId, fromIndex, toIndex, false) === false)
                        return;
                }
                paggingData.currIndex--;
                elem.data("gridView:pagging", paggingData);
                $(elem).gridView("doSearch", paggingData.currIndex);

                if (settings.onPageIndexChanged instanceof Function)
                    //Se ejecuta el evento y si el evento devolvió false, entonces se cancela el movimiento de la página
                    settings.onPageIndexChanged(gridViewId, paggingData.currIndex);
            }
        },
        moveNextPage: function () {
            var gridViewId;
            if (arguments.length === 0 && $tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                gridViewId = arguments[0];

            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));
            var fromIndex = paggingData.currIndex;
            var toIndex = fromIndex + 1;
            if (paggingData.totalRecords > 0) {
                //Si está definido el evento de cambio de página, ejecuta el mismo
                if (settings.onPageIndexChanging instanceof Function) {
                    if (settings.onPageIndexChanging(gridViewId, fromIndex, toIndex, false) === false)
                        return;
                }
                paggingData.currIndex++;
                var nextPage = paggingData.currIndex + 1;
                elem.data("gridView:pagging", paggingData);
                $(elem).gridView("doSearch", paggingData.currIndex);
                if (settings.onPageIndexChanged instanceof Function)
                    //Se ejecuta el evento y si el evento devolvió false, entonces se cancela el movimiento de la página
                    settings.onPageIndexChanged(gridViewId, paggingData.currIndex);
            }
        },
        moveToPage: function (pageIndex) {
            var gridViewId;
            if (arguments.length === 0)
                return;

            //Si se recibe más de un argumento, el primero es siempre el GridViewId.
            //y el 2º el pageIndex.
            if (arguments.length > 1) {
                gridViewId = arguments[0];
                pageIndex = arguments[1];
            }
            //Si se recibe un sólo argumento es el pageIndex, pero el gridView debe haber sido precargado en la variable $tempthis.
            else if ($tempthis !== null && $tempthis.length > 0)
                gridViewId = $tempthis.attr("gridViewId");
            else
                throw new Error("No se ha indicado el control de grilla sobre el cual operar");

            if (isNaN(pageIndex))
                throw new Error("El pageIndex debe ser un n&uacutemero");

            pageIndex = parseFloat(pageIndex);

            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));

            if (pageIndex < 0)
                throw new Error("El &iacutendice indicado est&aacute fuera del intervalo de p&aacuteginas v&aacutelidas");

            var fromIndex = paggingData.currIndex;
            var toIndex = pageIndex;
            if (toIndex < fromIndex || paggingData.totalRecords > 0) {
                //Si está definido el evento de cambio de página, ejecuta el mismo
                if (settings.onPageIndexChanging instanceof Function) {
                    if (settings.onPageIndexChanging(gridViewId, fromIndex, toIndex, false) === false)
                        return;
                }

                $(elem).gridView("doSearch", pageIndex);

                if (settings.onPageIndexChanged instanceof Function)
                    //Se ejecuta el evento y si el evento devolvió false, entonces se cancela el movimiento de la página
                    settings.onPageIndexChanged(gridViewId, paggingData.currIndex);
            }
        },
        moveFirstPage: function () {
            moveToPage(0);
        },
        moveLastPage: function () {
            //No se puede saber la última página.
        },
        setPaggingData: function (paggingData, data, settings) {
            if (settings.usePagging) {
                var totalRecords = 0;
                if (typeof data !== "undefined" && data !== null) {
                    var dataResults;
                    if (typeof settings.dataResultProperty !== "undefined" && settings.dataResultProperty !== null && data.hasOwnProperty(settings.dataResultProperty))
                        dataResults = data[settings.dataResultProperty];
                    else if (data.hasOwnProperty("result"))
                        dataResults = data.result;
                    else
                        dataResults = data;
                    if (typeof dataResults !== "undefined" && dataResults !== null)
                        totalRecords = dataResults.length;
                }

                paggingData.totalRecords = totalRecords;
            }

            return paggingData;
        },
        toggleGoTo: function ($src, evt) {
            var pagNro = $src.text();
            var $inputGotToPage = $("<input type='text' value='" + pagNro + "' class='inputGotToPage' gridview_element='inputGotToPage'/>");
            $inputGotToPage.bind("keypress focusout", function (evt) {
                if (evt.type === "focusout" || (evt.keyCode === 13 || evt.keyCode === 27)) {
                    var $this = $(this);
                    var pageNro = $this.val();
                    if (!isNaN(pageNro))
                        pageNro = parseFloat(pageNro) - 1;
                    else
                        pageNro = 1;
                    var $gridView = $this.parents("[gridViewId]:first");
                    var gridViewId = $gridView.attr("gridViewId");
                    var paggingData = $.extend({}, $gridView.data("gridView:pagging"));
                    var settings = $.extend({}, getDefaults(), $gridView.data("gridviewconfig"));

                    if (evt.keyCode !== 7 && (pageNro >= 0) && (pageNro !== paggingData.currIndex)) {
                        var methods = new Methods(privateMethods.getPageHandler(settings), gridViewId);
                        methods.pager.moveToPage($gridView.attr("gridViewId"), pageNro);
                    }
                    else
                        var $label = $("<span class='pageIndexNavigate' gridview_element='currentPageNumber'>" + (paggingData.currIndex + 1) + "</span>")
                            .click(function (evt) {
                                var $gridView = $(this).parents("[gridViewId]:first");
                                $gridView.gridView().pager.toggleGoTo($(this), evt);
                            });
                    $this.replaceWith($label);
                }
            });
            $src.replaceWith($inputGotToPage);
            $inputGotToPage.focus();
        },
        drawPager: function (gridViewId) {
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var paggingData = $.extend({}, elem.data("gridView:pagging"));
            if (paggingData.currIndex > 0 || (paggingData.totalRecords > 0 && paggingData.totalRecords >= settings.pageSize)) {
                var pageNumbers = "";
                var $pagerContainer = $("[gridview_element=pagerContainer]", elem);
                $pagerContainer.empty();
                var htmlPager = "";
                htmlPager = "<div class='pagerRow pagerNavigationContainer backForwardPager' gridview_element='pagerNavigationContainer'>";
                if (paggingData.currIndex > 0)
                    htmlPager += "<div class='pagerCell tdPrev' gridview_element='prevNavigation'><span class='MovePage spPrev' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.movePrevPage();'><</span></div>"
                htmlPager += "<div class='pagerCell tdCurrPage' gridview_element='currentPageLabel'>P&aacutegina actual: <span class='pageIndexNavigate' gridview_element='currentPageNumber'>" + (paggingData.currIndex + 1) + "</span></div>"
                if (paggingData.totalRecords > 0)
                    htmlPager += "<div class='pagerCell tdNext' gridview_element='nextNavigation'><span class='MovePage spNext' onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView().pager.moveNextPage();'>></span></div>";
                htmlPager += "</div>";
                $pagerContainer.append(htmlPager);

                $("[gridview_element=currentPageNumber]", $pagerContainer).click(function (evt) {
                    $("[gridViewId=" + gridViewId + "]").gridView().pager.toggleGoTo($(this), evt);
                });
            }
        }
    };
    function resolveDataFieldValue(data, columnSetting) {
        var retVal = null;

        if (!isNullOrWhiteSpace(columnSetting) && !isNullOrWhiteSpace(data)) {
            var fieldName = columnSetting.dataFieldName;
            if (!isNullOrWhiteSpace(fieldName)) {
                //resuelve los sub campos... los campos de propiedades json. Ej: Tipo.Descripcion
                if (fieldName.indexOf(".") >= 0) {
                    retVal = data;
                    var arrProp = fieldName.split(/\./g);
                    for (var prop in arrProp) {
                        if (!isNullOrWhiteSpace(retVal))
                            retVal = retVal[arrProp[prop]];
                        else
                            break;
                    }
                }
                //Si el campo no contiene punto, intenta obtenerlo directamente del set de resultados (data)
                else if (data.hasOwnProperty(fieldName)) {
                    retVal = data[fieldName];
                }
                //Si la columna tiene configurada un dataType, intenta generar ese tipo de dato.
                if (!isNullOrWhiteSpace(retVal) && !isNullOrWhiteSpace(columnSetting.columnDataType)) {
                    if (columnSetting.columnDataType.toLowerCase() === "date" || columnSetting.columnDataType.toLowerCase() === "datetime") {
                        var fecha = parseAjaxDateTimeToDate(retVal);
                        if (!isNullOrWhiteSpace(fecha))
                            retVal = fecha;
                    }
                }
            }
        }


        return retVal;
    }
    var privateMethods =
    {
        getEvenOddColumnClass: function (colIndex, prefix) {
            if (typeof prefix === "undefined" || prefix === null)
                prefix = "";
            return prefix + ((colIndex % 2) > 0 ? "evenColumn" : "oddColumn");
        },
        newRow: function (data, gridViewId, rowIndex, settings) {
            var idPrefix = gridViewId + "_Row_" + rowIndex;
            var row = $("<tr class='gridRow' id='" + idPrefix + "' gridView_rowIndex='" + rowIndex + "' gridview_rowType='row'></tr>");
            if ((rowIndex % 2) > 0)
                row.addClass("gridViewRowAlternate");
            else
                row.addClass("gridViewRow");

            var colIndex = 0;

            if (settings.childGrid !== null) {
                var childGridExpandCell = $("<td id='" + idPrefix + "_expandChild' gridview_cellType='childExpand' class='gridCell " + privateMethods.getEvenOddColumnClass(colIndex) + " childColapsed'></td>");

                if (settings.useJQueryUI)
                    childGridExpandCell.append("<div id='divExpandButton' class='ui-icon ui-icon-plus'>&nbsp;</div>");
                else
                    childGridExpandCell.html("&#x271A;");


                childGridExpandCell.click(function (evt) {
                    var index = $(this).parent().attr("gridView_rowIndex");
                    var $row = $(this).parents("[gridview_rowType=row]:first");
                    privateMethods.drawChildGrid($row, gridViewId, index);
                });

                row.append(childGridExpandCell);
                colIndex++;
            }

            //Celda de números
            if (settings.showRowNumber) {
                row.append($("<td id='" + idPrefix + "_rowNumber' gridview_cellType='rowNumber' class='gridCell " + privateMethods.getEvenOddColumnClass(colIndex) + " rowNumber' >" + (rowIndex + 1) + "</td>"));
                colIndex++;
            }
            var selectionColumn = $("<td id='" + idPrefix + "_selectionCell' gridview_cellType='selection' class='gridCell " + privateMethods.getEvenOddColumnClass(colIndex) + " selectionCell' style='cursor:pointer;'></td >");
            //Celda de selección
            if (settings.allowSelection && settings.selectionMode !== "row") {
                if (settings.useJQueryUI)
                    selectionColumn.append("<div class='ui-icon ui-icon-carat-1-e'>&nbsp;</div>");
                else
                    selectionColumn.html("&#x2023;");//x22B2
            }
            else if (settings.showRefresh === true)
                selectionColumn.html("&nbsp;");
            else
                selectionColumn = null;

            if (selectionColumn !== null) {
                row.append(selectionColumn);
                colIndex++;
            }

            if (settings.showColumnsHeader !== false && settings.headerControls !== null) {
                $.each(settings.headerControls, function (index, item) {
                    row.append($("<td id='" + idPrefix + "_emptyHeaderControl_" + index.toString() + "'  gridview_cellType='emptyHeaderControl' class='gridCell " + privateMethods.getEvenOddColumnClass(colIndex) + " emptyHeaderControl'></td>"));
                    colIndex++;
                });
            }

            var itemData = (settings.includeOriginalDataSourceInResult !== true) ? {} : data;
            var iColCount = 0;
            //Dibuja las columnas configuradas
            for (var col in settings.columns) {
                var columnSetting = settings.columns[col];
                var dataField = columnSetting.dataFieldName;
                if (typeof dataField === "undefined")
                    dataField = "";

                var cssClass = columnSetting.cssClass;
                if (typeof cssClass === "undefined" || cssClass === null)
                    cssClass = "";

                var cell = $("<td id='" + idPrefix + "_column" + iColCount + "' gridview_cellType='data' class='gridCell gridViewCell " + cssClass + "' " + (dataField !== "" ? "dataFieldName='" + dataField + "" : "") + "'></td>");
                var colValue = resolveDataFieldValue(data, columnSetting);
                //sólo considerará la propiedad IncludeInResult si no está habilitado el registro completo del origen de dato
                if (settings.includeOriginalDataSourceInResult !== true) {
                    if (!columnSetting.hasOwnProperty("includeInResult") || columnSetting.includeInResult === true)
                        itemData[dataField] = colValue;
                }

                if (typeof columnSetting.dataEval === "function" && columnSetting.dataEval !== null)
                    colValue = columnSetting.dataEval(colValue);

                var isVisible = true;
                if (columnSetting.hasOwnProperty("visible") && !columnSetting.visible) {
                    isVisible = false;
                    cell.hide();
                }

                //Si la columna tiene definida controles, dibuja los mismos pasando el value correspondiente al dataFieldName (el dataBind)
                if (columnSetting.hasOwnProperty("Controls") && columnSetting.Controls instanceof Array && columnSetting.Controls.length > 0) {
                    var ctrls = this.GetControls(columnSetting.Controls, gridViewId, false, idPrefix, colValue);
                    $.each(ctrls, function (index, item) {
                        item.attr("id", idPrefix + "_column" + iColCount + "_control_" + (typeof item.attr("id") !== "undefined" ? item.attr("id") : "") + "" + index);
                        item.attr("griview_isHeader", "false");
                        cell.addClass("controls_container").append(item);
                    });
                }
                //Si no tiene controles, pero tiene definido el ShowPreview, dibuja la celda con esta funcionalidad
                else if (columnSetting.hasOwnProperty("showPreview") && columnSetting.showPreview) {
                    var css = '';
                    if (columnSetting.hasOwnProperty("previewCellClass") && columnSetting.previewCellClass !== null && columnSetting.previewCellClass !== "")
                        css = ' ' + columnSetting.previewCellClass;

                    cell.attr("preview", "preview").append($("<div class='divPreview'" + css + ">" + ((colValue !== null) ? colValue : "&nbsp;") + "</div>"));
                }
                //Finalmente, si no tiene ninguna de las dos anteriores, dibuja la celda con el value como contenido.
                else
                    cell.html("<div class='divCellData'>" + ((colValue !== null) ? colValue : "&nbsp;") + "</div>");

                if (typeof settings.rowDataFieldId !== "undefined" && settings.rowDataFieldId !== null && settings.rowDataFieldId !== ""
                    && settings.rowDataFieldId.toLowerCase() === dataField.toLowerCase())
                    row.attr(dataField, colValue);

                if (isVisible)
                    cell.addClass(privateMethods.getEvenOddColumnClass(colIndex));

                row.append(cell);
                iColCount++;
                colIndex++;
            }

            row.data("itemData", itemData);

            if (settings.useJQueryUI) {
                row.mouseover(function () {
                    $(this).addClass("ui-state-hover");
                    //fix, este fix soluciona un problema que se da con el mouse over sobre una celda, que 
                    //al colocar negrita (por "ui-state-hover") se agranda y achica la fila haciendo un efecto molesto
                    $(this).children("TD").each(function () {
                        var origFont = $(this).css("font-size");
                        $(this)
                            .attr("origFont", origFont)
                            .css("font-size", (parseFloat($(this).css("font-size")) * 0.94));
                    });

                }).mouseout(function () {
                    $(this).removeClass("ui-state-hover");
                    //fix, este fix soluciona un problema que se da con el mouse over sobre una celda, que 
                    //al colocar negrita (por "ui-state-hover") se agranda y achica la fila haciendo un efecto molesto
                    $(this).children("TD").each(function () {
                        var origFont = $(this).attr("origFont");
                        $(this).css("font-size", origFont);
                    });
                });
            }
            return row;
        },
        GetControls: function (controls, gridViewId, isHeader, rowId, cellValue) {
            var result = [];
            $.each(controls, function (index) {
                //si es una celda común agrega el control al listado.
                if (!isHeader) {
                    result.push(privateMethods.CreateControl(controls[index], gridViewId, rowId, cellValue));
                }
                //si se tratara del encabezado, se verifica si la column tiene configurado mostrar el control
                //en el header
                else if (controls[index].showInHeader === true) {
                    var headerControl;
                    if (typeof controls[index].headerControlTemplate !== "undefined")
                        headerControl = controls[index].headerControlTemplate;
                    else
                        headerControl = controls[index];

                    result.push(privateMethods.CreateControl(headerControl, gridViewId, rowId, cellValue));
                }
            });
            return result;
        },
        CreateControl: function (control, gridViewId, rowId, cellValue) {
            var ctrlType = 'button';
            var value = "";
            var name = "";
            var ctrl = null;
            var ctrlsTemplate = null;
            var css = "";
            if (control.hasOwnProperty("type") && control.type !== null)
                ctrlType = control.type.toLowerCase();
            if (control.hasOwnProperty("label") && control.label !== null)
                value = control.label;
            if (control.hasOwnProperty("name") && control.name !== null)
                name = control.name;
            if (control.hasOwnProperty("template") && control.template !== null && (ctrlsTemplate = $(control.template)).length > 0)
                ctrlType = "template";
            if (control.hasOwnProperty("cssClass") && control.cssClass !== null)
                css = "class='" + control.cssClass + "'";
            //si se recibe un cellValue, se pisa el value.
            if (typeof cellValue !== "undefined" && cellValue !== null)
                value = cellValue

            var controlTypes = {
                template: 'template',
                image: 'image',
                button: 'button',
                checkbox: 'checkbox',
                radio: 'radio',
                textbox: 'textbox',
                select: 'select'
            };

            //TODO: ¿eventos onBeforeCreatingControl o algo así?
            switch (ctrlType) {
                case controlTypes.template:
                    ctrl = ctrlsTemplate.clone();
                    break;
                case controlTypes.image:
                    var alt = "";
                    if (control.hasOwnProperty("alt") && control.alt !== null)
                        alt = control.alt;

                    ctrl = $("<img src='" + value + "' alt='" + alt + "' " + css + "/>");
                    break;
                case controlTypes.button:
                    ctrl = $("<input type='button' value='" + value + "' " + css + " />");
                    break;
                case controlTypes.checkbox:
                    ctrl = $("<input type='checkbox' value='" + value + "' " + css + " />");
                    break;
                case controlTypes.radio:
                    ctrl = $("<input type='radio' value='" + value + "' " + css + " />");
                    break;
                case controlTypes.textbox:
                    ctrl = $("<input type='text'  value='" + value + "' " + css + " />");
                    break;
                case controlTypes.select:
                    ctrl = $("<select " + css + " />");
                    //si el value es un string se asume que es separado por comas y que contiene el listado de los options del select
                    if (value instanceof String) {
                        var arrValue = value.split(",");
                        value = [];
                        //se genera la estructura {value:..., id:...}
                        $.each(arrValue, function (index, item) {
                            value.push({ value: item, text: item });
                        })

                    }

                    if (value instanceof Array)
                        //se recorre el array y se agregan los options.
                        $.each(value, function (index, item) {
                            ctrl.append($("<option value='" + item.value + "'>" + item.text + "</option>"));
                        });
                    break;
            }

            if (name !== null) {
                //Si es un radio button, se usa el mismo ID para todos los radio, ya que es lo que agrupa los mismos.
                if (ctrlType !== controlTypes.radio)
                    //se actualiza el name, para que no todos los controles, de todas las filas, tengan el mismo name.
                    //Se le agrega el prefijo del id de la fila.
                    name = rowId + "_" + name;

                ctrl.attr("name", name);
            }

            if (typeof control.onClick === "function") {
                ctrl.click(function () {
                    //el control se encuentra agregado dentro de una celda, por lo que para obtener la referencia a la fila
                    //se debe tomar el padre del padre.
                    var tr = $(this).parent().parent();
                    control.onClick(tr, gridViewId, tr.attr("gridview_rowType"), tr.data("itemData"), this);
                });
            }

            if (control.events instanceof Array) {
                $.each(control.events, function (index, item) {
                    ctrl.bind(item.name, function () {
                        var tr = $(this).parent().parent();
                        item.handler(tr, gridViewId, tr.attr("gridview_rowType"), tr.data("itemData"), this);
                    });
                });

            }

            if (control.hasOwnProperty("style") && control.style !== null) {
                var style = "";
                if (ctrl.attr("style") !== "undefined" && ctrl.attr("style") !== "")
                    style = ctrl.attr("style");

                style += control.style;

                ctrl.attr("style", style);
            }

            return ctrl;
        },
        drawChildGrid: function (sourceRow, gridViewId, rowIndex, forcedState) {
            var settings;
            var parentSettings;
            //se obtiene la referencia a la grilla hija
            var parentGrid = $("[gridViewId=" + gridViewId + "]");
            parentSettings = $.extend({}, getDefaults(), parentGrid.data("gridviewconfig"));

            //se busca si ya existe la grilla hija.
            var childGridRow = sourceRow.next();

            if (childGridRow.length > 0 && childGridRow.attr("gridview_rowType") === "childGrid" && childGridRow.attr("gridView_rowIndex") === rowIndex.toString()) {
                var childGrid = $("[gridViewId=" + gridViewId + "_ChildGrid" + rowIndex + "]", childGridRow);
                settings = $.extend({}, getDefaults(), childGrid.data("gridviewconfig"));
            }
            //si no existe se crea.
            else {
                //se obtiene la configuración de grilla hija.
                settings = $.extend({}, getDefaults(), parentGrid.data("gridviewconfig").childGrid);
                //TODO_SEBA: en el DataSource de la grilla hija se debe poder parsear info. Ej: mandar el itemData de la fila.

                var cellsCount = sourceRow.children("[gridview_cellType]").length - 1;
                //Se crea la fila que va a contener la grilla hija.
                childGridRow = $("<tr id='" + gridViewId + "_Row_" + rowIndex + "_ChildGrid' gridView_rowIndex='" + rowIndex + "' class='gridRow childGridRowContainer' gridview_rowType='childGrid'>" +
                    "<td class='gridCell childGridEmptyCell' gridview_cellType='childGridEmptyCell'>&nbsp;</td>" +
                    "<td class='gridCell childGridCellContainer' gridview_cellType='childGridCell' colspan='" + cellsCount + "'></td>" +
                    "</tr>").hide();


                //se crea la tabla que será la grilla hija.
                var elem = $("<div id='" + gridViewId + "_ChildGrid" + rowIndex + "' gridViewType='childGridView'></div>");
                $("[gridview_cellType='childGridCell']", childGridRow).append(elem);
                //Se agrega la fila a la tabla para poder inicializar la grilla a través del plugin (siguiendo el camino normal de cualquier grilla).
                //esto es necesario, ya que de lo contrario el plugin no va a funcionar, ya que dentro realiza obtención de elementos que asume en el DOM.
                sourceRow.after(childGridRow);

                //Se inicializa la grilla hija. Siempre que se crea por primera vez se ejecuta la búsqueda.
                elem.gridView(settings, true);
            }
            var childExpandCell;
            //Se cambia el estado, la visibilidad, en función del estado actual (se hace un toggle)
            if (typeof forcedState === "undefined" || forcedState === null) {
                //se cambia la clase de la celda
                childExpandCell = $("[gridview_cellType='childExpand']", sourceRow).toggleClass("childExpanded childColapsed");

                if (parentSettings.useJQueryUI) {
                    var expandButton = $("#divExpandButton", childExpandCell);
                    expandButton.toggleClass("ui-icon-plus ui-icon-minus");
                }
                else {
                    if (childExpandCell.hasClass("childColapsed"))
                        childExpandCell.html("&#x271A;");
                    else
                        childExpandCell.html("&#x2796;");
                }
                //Si ya existe oculta y muestra la fila de la grilla.
                childGridRow.toggle();
            }
            else {
                //se cambia la clase de la celda
                childExpandCell = $("[gridview_cellType='childExpand']", sourceRow);
                if (forcedState === "show") {

                    childExpandCell.removeClass("childColapsed").addClass("childExpanded");

                    if (parentSettings.useJQueryUI)
                        $("#divExpandButton", childExpandCell).removeClass("ui-icon-plus").addClass("ui-icon-minus");
                    else
                        childExpandCell.html("&#x2796;");

                    childGridRow.show();
                }
                else if (forcedState === "hide") {

                    childExpandCell.removeClass("childExpanded").addClass("childColapsed");

                    if (parentSettings.useJQueryUI)
                        $("#divExpandButton", childExpandCell).removeClass("ui-icon-minus").addClass("ui-icon-plus");
                    else
                        childExpandCell.html("&#x271A;");

                    childGridRow.hide();
                }
            }
        },
        getPageHandler: function (settings) {
            var retVal;
            if (settings.usePagging)
                if (settings.paggingNavigationMode === 'backforward')
                    retVal = backForwardPager;
                else
                    retVal = defaultPager;

            return retVal;
        }
    };
    //#region Methods Object
    function Methods(pagerHandler, gridViewId) {
        var $gridView;
        if (typeof gridViewId !== "undefined" && gridViewId !== null)
            $gridView = $("[gridViewId=" + gridViewId + "]");
        else if (typeof $tempthis !== "undefined" && $tempthis !== null)
            $gridView = $tempthis;

        if (typeof $gridView !== "undefined" && $gridView !== null) {
            //si no lo recibe por parámetro, intenta obtener el handler de paginación de la configuración.
            if (typeof pagerHandler === "undefined" && $gridView.length === 1) {
                var settings = $.extend({}, getDefaults(), $gridView.data("gridviewconfig"));
                pagerHandler = privateMethods.getPageHandler(settings);
            }
        }

        this.pager = pagerHandler;

        this.childGridView = {
            //Devuelve el TR de la fila de datos, de la grilla padre asociada.
            getRowContainer: function (childGridViewId) {
                var $this;
                if (typeof childGridViewId === "undefined" || childGridViewId === null)
                    $this = $tempthis;
                else
                    $this = $("[gridViewId=" + childGridViewId + "]");

                var gridTR = $this.parents("[gridview_rowtype=childGrid]:first");
                //la grilla es contenido en la siguiente fila (TR) de la fila de datos asociada.
                return gridTR.prev();
            },
            ///Obtiene el itemData de la fila asociada
            getRowContainerData: function (childGridViewId) {
                var parentRow = getRowContainer(childGridViewId);
                return parentRow.data("itemData");
            },
            expandAllChildGrids: function (gridViewId, doShow) {
                var forcedState = null;
                if (doShow === true)
                    forcedState = "show";
                else if (doShow === false)
                    forcedState = "hide";
                var $tbBody = $("[gridview_element=tbBody]", $("[gridViewId=" + gridViewId + "]"));
                $tbBody.children("[gridview_rowType=row]").each(function (index, item) {
                    privateMethods.drawChildGrid($(item), gridViewId, index, forcedState);
                });

            }

        };
    };
    Methods.prototype.isChildGrid = function (gridViewId) {
        var $gridViewId = $("[gridViewId=" + gridViewId + "]");
        return $gridViewId.attr("gridview_rowType") === "childGrid";
    };
    Methods.prototype.cleanSearch = function () {
        var gridViewId;
        var elems;
        if (arguments.length === 0 && $tempthis !== null && $tempthis.length === 1) {
            gridViewId = $tempthis.attr("gridViewId");
            elems = $("[gridViewId=" + gridViewId + "]");
        }
        else if (arguments.length >= 1) {
            gridViewId = arguments[0];
            elems = $("[gridViewId=" + gridViewId + "]");
        }
        else
            elems = $tempthis;

        if (elems !== null && elems.length > 0) {
            $.each(elems, function (index, item) {
                var elem = $(item);
                var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
                var paggingData = $.extend({}, elem.data("gridView:pagging"));

                if (settings.onCleanSearch instanceof Function) {
                    var response = settings.onCleanSearch(elem, settings, paggingData, gridViewId);
                    if (typeof response !== "undefined" && !response)
                        return;
                }

                $("[gridview_element=tbBody]", elem).empty();
                $("[gridview_rowType=processingContainer], [gridview_rowType=messageContainer]", elem).remove();
                paggingData.totalRecords = 0;
                paggingData.pageAmm = 0;
                paggingData.currIndex = 0;
                paggingData.currPageGroupNum = 0;
                elem.data("gridView:pagging", paggingData);
                $("[gridview_element=pagerContainer]", elem).empty();
            });
        }
    };
    Methods.prototype.addRow = function (rowData) {
        this.insertRow(rowData, 'last');
    };
    Methods.prototype.insertRow = function (rowData, atPosition) {
        var gridViewId;
        var elem;
        if (arguments.length === 0)
            return;

        if (arguments.length === 2 && $tempthis !== null && $tempthis.length > 0) {
            gridViewId = $tempthis.attr("gridViewId");
            elem = $tempthis;
        }
        else {
            gridViewId = arguments[0];
            rowData = arguments[1];
            atPosition = arguments[2];
            elem = $("[gridViewId=" + gridViewId + "]");
        }

        var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));

        var lastRowIndex = $("[gridview_element=tbBody]", elem).children("[gridview_rowType=row]:last").attr("gridView_rowIndex");
        var rowIndex = parseFloat(lastRowIndex) + 1;

        if (settings.onRowDataBounding instanceof Function) {
            var result = settings.onRowDataBounding(gridViewId, rowData, rowIndex);
            if (typeof result !== "undefined" && result !== null)
                rowData = result;
        }

        var $row = privateMethods.newRow(rowData, gridViewId, rowIndex, settings);

        if (settings.onRowSelect instanceof Function && settings.allowSelection) {

            //En selectionMode=='cell' la fila sólo selecciona presionando sobre el botón de selección, por lo que s registra el evento en el mismo.
            if (typeof settings.selectionMode !== "undefined" && settings.selectionMode !== null && settings.selectionMode.toLowerCase() === 'cell') {
                $(".selectionCell", $row).click(function (evt) {
                    var $row = $(this).parents("[gridview_rowType=row]");
                    settings.onRowSelect($row, gridViewId, $row.data("itemData"));
                });
            }
            //En selectionMode=='row' la fila sólo selecciona presionando sobre cualquier parte de la fila
            else {
                $("[gridview_cellType=data]:not(.controls_container)", $row).click(function (evt) {
                    var $row = $(this).parents("[gridview_rowType=row]");
                    settings.onRowSelect($row, gridViewId, $row.data("itemData"));
                });
            }
        }

        if (atPosition === "last")
            $("[gridview_element=tbBody]", elem).append($row);//se agrega la fila
        else if (atPosition === "first")
            $("[gridview_element=tbBody]", elem).prepend($row);//se agrega la fila
        else if (!isNaN(atPosition))
            $("[gridview_element=tbBody]", elem).children("[gridview_rowType=row]:eq(" + atPosition + ")").before($row);//se agrega la fila
        else
            throw new Error("El atPosition debe ser un n&uacutemero o \"last\" o \"first\"");

        if (settings.onRowDataBound instanceof Function)
            settings.onRowDataBound($row, gridViewId, rowData, rowIndex);
    };
    //#endregion
    var guiid = 0;
    $.fn.gridView = function (options, executeSearch) {
        if (typeof options === "undefined") {
            if (this !== null && this.length > 0) {
                if (typeof this.attr("gridViewId") === "undefined" || this.attr("gridViewId") === "")
                    throw "La gridView no fue debidamente inicializada";
            }

            $tempthis = this;
            return new Methods();
        }

        if (typeof options === "string" && options !== "") {
            if (this.length <= 0)
                return this;
            var pageIndex = 0;
            if (arguments.length > 1)
                pageIndex = arguments[1];

            $.each(this, function (index, item) {
                var gridViewId = $(item).attr("gridViewId");
                var settings = $.extend({}, getDefaults(), $(item).data("gridviewconfig"));
                if ((options.toLowerCase() === "dosearch") || (options.toLowerCase() === "search")) {
                    doSearch(gridViewId, pageIndex);
                }
                else if (options.toLowerCase() === "drawpager") {
                    (new Methods(privateMethods.getPageHandler(settings), gridViewId)).pager.drawPager(gridViewId);
                }
                else if ((options.toLowerCase() === "dorefresh") || (options.toLowerCase() === "refresh")) {
                    doRefresh(gridViewId);
                }
                else {
                    alert("El m&eacutetodo invocado no es v&aacutelido");

                }
            });
            return this;
        }

        if (typeof executeSearch === "undefined" || executeSearch === null)
            executeSearch = true;

        function init(target) {
            if (target.length > 1)
                target.each(function (index) {
                    configGridView($(this));
                });
            else
                configGridView(target);

        }

        function configGridView(src) {
            var target;
            //reemplaza el tag del control por div.
            if (src[0].tagName !== "div") {
                target = $("<div></div>");
                src.replaceWith(target);
                var attributes = src.prop("attributes");
                // loop through <select> attributes and apply them on <div>
                $.each(attributes, function () {
                    target.attr(this.name, this.value);
                });
            }
            else
                target = src;

            var gridViewId = (typeof target[0].id !== "undefined") ? target[0].id : guiid++;
            var itemOptions = $.extend({}, options);


            if (!isNullOrWhiteSpace(itemOptions.cssClass))
                target.attr('class', itemOptions.cssClass + ' ' + target.attr('class'));


            if (typeof itemOptions.useJQueryUI === "undefined" || itemOptions.useJQueryUI === null)
                itemOptions.useJQueryUI = getDefaults().useJQueryUI;
            if (typeof target.attr("gridViewType") === "undefined")
                target.attr("gridViewType", "gridView");


            var $gridViewHeader = $("<div class='gridViewHeader' gridview_element='gridViewHeader'></div>");

            var $tbGridView = $("<table id='tbGridView_" + gridViewId + "' gridview_element='tbGridView' class='" + (itemOptions.useJQueryUI ? "ui-widget " : "") + "tbGridView'></table >");
            if (itemOptions.showColumnsHeader !== false)
                $tbGridView.append("<thead id='tbHeader_" + gridViewId + "' gridview_element='tbHeader' class='" + (itemOptions.useJQueryUI ? "ui-widget-header " : "") + "tbHeader'></thead>");//inserta el header
            $tbGridView.append("<tbody id='tbBody_" + gridViewId + "' gridview_element='tbBody' class='" + (itemOptions.useJQueryUI ? "ui-widget-content " : "") + "tbBody'></tbody>");//inserta el body

            var $gridViewBody = $("<div id='gridViewBody_" + gridViewId + "' gridview_element='gridViewBody' class='gridViewBody'></div>").append($tbGridView);

            var $gridViewFooter = $("<div class='gridViewFooter' gridview_element='gridViewFooter'></div>");

            //.addClass((itemOptions.useJQueryUI ? "ui-widget " : "") + "gridView")
            target.empty()
                .attr("gridview_element", "gridViewMain")
                .addClass("gridView")
                .append($gridViewHeader)
                .append($gridViewBody)
                .append($gridViewFooter);

            if (typeof itemOptions.pagerPosition === "undefined" || itemOptions.pagerPosition === null)
                itemOptions.pagerPosition = getDefaults().pagerPosition;

            /*Si no se configuro un selector en el pager, se inserta el pager por defecto*/
            var $pagerContainer = "<div class='pagerContainer' gridview_element='pagerContainer'></div>";
            if (itemOptions.pagerPosition.toLowerCase() === "down")
                $gridViewFooter.append($pagerContainer);
            else if (itemOptions.pagerPosition.toLowerCase() === "up")
                $gridViewHeader.prepend($pagerContainer);

            var sortConfig = { column: itemOptions.sortColumn, sortDirection: itemOptions.sortDirection }
            if (typeof sortConfig.sortDirection === "undefined" || sortConfig.sortDirection === null) {
                if (typeof itemOptions.defaultSortDirection !== "undefined" && itemOptions.defaultSortDirection !== null)
                    sortConfig.sortDirection = itemOptions.defaultSortDirection;
                else
                    sortConfig.sortDirection = getDefaults().defaultSortDirection;
            }

            target.data("gridviewconfig", itemOptions)
                .data("gridView:pagging", $paggingData)
                .data("gridView:sortConfig", sortConfig)
                .attr("gridViewId", gridViewId);


            var searchOnInit = executeSearch;
            if (itemOptions.showColumnsHeader !== false)
                searchOnInit = drawHeader(gridViewId) && executeSearch;

            if (searchOnInit)
                doSearch(gridViewId, 0);
        }

        function doSearch(gridViewId, pageIndex) {
            var isSuccess = true, status = "success", messageError = null;
            var settings = {};
            try {
                var elem = $("[gridViewId=" + gridViewId + "]");
                settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
                var paggingData = $.extend({}, elem.data("gridView:pagging"));
                var sortConfig = $.extend({}, elem.data("gridView:sortConfig"));

                if (isNaN(pageIndex))
                    throw new Error("El pageIndex debe ser un n&uacutemero");

                pageIndex = parseFloat(pageIndex);

                paggingData.currIndex = pageIndex;
                if (pageIndex === "") {
                    alert("Los par&aacutemetros de b&uacutesqueda son incorrectos.");
                    return;
                }
                var methods = new Methods(privateMethods.getPageHandler(settings), gridViewId);
                methods.cleanSearch(gridViewId);
                var eventResult;
                if (settings.onBeforeSearch instanceof Function) {
                    eventResult = settings.onBeforeSearch(pageIndex, settings.pageSize, gridViewId);
                    if (typeof eventResult !== "undefined" && !eventResult) {
                        return;
                    }
                }

                //obtiene la información de la fila padre.
                var parentRowData;
                if (elem.attr("gridViewType") === "childGridView") {
                    var gridTR = methods.childGridView.getRowContainer(gridViewId);
                    var rowIndex = gridTR.attr("gridView_rowIndex");
                    //obtiene la ROW hija de la grilla padre que contiene a este childGrid
                    var parentRow = gridTR.parents("[gridview_element=tbBody]:first").children("[gridView_rowIndex='" + rowIndex + "'][gridview_rowType=row]");
                    parentRowData = parentRow.data("itemData");
                }

                var dataFilter;
                if (typeof parentRowData !== "undefined")
                    dataFilter = settings.getFilterData(parentRowData);
                else
                    dataFilter = settings.getFilterData();
                if (typeof dataFilter === "string")
                    dataFilter = JSONConvert(dataFilter);
                if (settings.usePagging) {
                    if (!dataFilter.hasOwnProperty("pageSize"))
                        dataFilter.pageSize = settings.pageSize;
                    if (!dataFilter.hasOwnProperty("pageIndex"))
                        dataFilter.pageIndex = pageIndex;
                }
                if (settings.allowSorting) {
                    if (!dataFilter.hasOwnProperty("sortColumn"))
                        dataFilter.sortColumn = (typeof sortConfig.column === "undefined" ? null : sortConfig.column);
                    if (!dataFilter.hasOwnProperty("sortDirection"))
                        dataFilter.sortDirection = (typeof sortConfig.sortDirection === "undefined" ? null : sortConfig.sortDirection);
                }
                if (settings.showProcessingIndicator)
                    drawProcessingIcon(gridViewId);

                if (settings.dataSourceType.toLowerCase() === "ws") {
                    loadDataSourceWS(gridViewId, settings, dataFilter, paggingData, parentRowData);
                }
                else if (settings.dataSourceType.toLowerCase() === "json") {
                    loadDataSourceJSon(gridViewId, settings, paggingData, parentRowData);
                }
            } catch (error) {
                var msg = "Se produjo un error al intentar realizar la b&uacutesqueda. El error: " + error.message;
                if (error.number === -2146827274 || error.message === "Invalid character") {
                    msg = "El formato del JSON es inválido. Verifique que el mismo tenga los nombres de sus atributos entre comillas dobles.";
                }

                drawMessage(gridViewId, msg);

                isSuccess = false;
                status = "error";
                messageError = error.message;

                if (settings.onError !== null && settings.onError instanceof Function)
                    settings.onError(null, status, messageError, error);
            }
            finally {
                if (settings.dataSourceType.toLowerCase() === "json") {
                    $("[gridview_rowType=processingContainer]", $("[gridViewId=" + gridViewId + "]")).remove();
                    if (typeof settings !== "undefined" && typeof settings.onComplete !== "undefined") {
                        if (settings.onComplete !== null && settings.onComplete instanceof Function)
                            settings.onComplete(gridViewId, isSuccess, status, messageError);
                    }
                }
            }

        }

        function doRefresh(gridViewId) {
            var elem = $("[gridViewId=" + gridViewId + "]");
            var paggingData = $.extend({}, elem.data("gridView:pagging"));

            elem.gridView("doSearch", paggingData.currIndex);
        }

        function drawProcessingIcon(gridViewId) {
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            var columnsAmmount = elem.attr("gridView_columnsAmmount");
            $("[gridview_element=tbBody]", elem).empty();
            $("[gridview_element=gridViewBody]", elem).after("<div class='processingContainer' gridview_rowType='processingContainer'><div class='processingLabel' gridview_cellType='processing' ><img src='" + settings.ajaxLoaderImage + "' /></div></div>");
        }
        function drawMessage(gridViewId, msg, cssClass) {
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            if (typeof cssClass === "undefined" || cssClass === null)
                cssClass = "";
            var columnsAmmount = elem.attr("gridView_columnsAmmount");
            $("[gridview_element=tbBody]", elem).empty();
            $("[gridview_element=gridViewBody]", elem).after($("<div class='messageContainer' gridview_rowType='messageContainer'><div colspan='" + columnsAmmount + "' class='messageLabel" + (cssClass !== "" ? (" " + cssClass) : "") + "' gridview_cellType='message'>" + msg + "</div></div>"));
        }
        function drawHeader(gridViewId) {
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));

            $("[gridview_element=tbHeader]:first", elem).empty().append(getRowHeader(elem, settings));

            return true;
        }
        function drawResults(gridViewId, data) {
            var elem = $("[gridViewId=" + gridViewId + "]");
            var settings = $.extend({}, getDefaults(), elem.data("gridviewconfig"));
            drawGridView(elem, settings, data);
        }
        //Dibuja las filas y celdas de la grilla 
        function drawGridView(elem, settings, data) {
            var gridViewId = elem.attr("gridViewId");
            var rowIndex = 0;

            if (data !== null && data.length > 0) {

                $("[gridview_element=tbBody]", elem).empty();//limpia la tabla que contiene el body.


                //Dibuja las filas
                for (var item in data) {
                    var rowData = data[item];

                    if (settings.onRowDataBounding instanceof Function) {
                        var result = settings.onRowDataBounding(gridViewId, rowData, rowIndex);
                        if (typeof result !== "undefined" && result !== null)
                            rowData = result;
                    }

                    var $row = privateMethods.newRow(rowData, gridViewId, rowIndex, settings);
                    //agrega la fila
                    $("[gridview_element=tbBody]", elem).append($row);

                    if (settings.onRowDataBound instanceof Function)
                        settings.onRowDataBound($row, gridViewId, rowData, rowIndex);

                    rowIndex++;
                }


                if (settings.onRowSelect instanceof Function && settings.allowSelection) {

                    //En selectionMode=='cell' la fila sólo selecciona presionando sobre el botón de selección, por lo que s registra el evento en el mismo.
                    if (typeof settings.selectionMode !== "undefined" && settings.selectionMode !== null && settings.selectionMode.toLowerCase() === 'cell') {
                        $("[gridview_cellType=selection]", $("[gridview_element=tbBody]", elem)).click(function (evt) {
                            var $parentRow = $(this).parents("[gridview_rowType=row]:first");
                            settings.onRowSelect($parentRow, gridViewId, $parentRow.data("itemData"));
                        });
                    }
                    //En selectionMode=='row' la fila sólo selecciona presionando sobre cualquier parte de la fila
                    else {
                        $("[gridview_rowType=row]>[gridview_cellType=data]:not(.controls_container)", $("[gridview_element=tbBody]", elem))
                            .click(function (evt) {
                                var $row = $(this).parents("[gridview_rowType=row]");
                                settings.onRowSelect($row, gridViewId, $row.data("itemData"));
                            });
                    }

                }

                $("[preview]").mouseenter(function (evt) {
                    showPreviewCondition(this, evt);
                })
                    .mouseleave(function (evt) {
                        $("#previewContainer").remove();
                    });

                if (settings.onGridDrawed instanceof Function)
                    settings.onGridDrawed(gridViewId);

                if (settings.childGrid !== null && settings.childGrid.showAllExpanded) {
                    if (settings.childGrid.allowExpandAll) {
                        var childGridCell = $("[gridViewId=" + gridViewId + "]>[gridview_element=gridViewBody]>[gridview_element=tbGridView]>[gridview_element=tbHeader]>[gridview_rowType=header]>[gridview_cellType='expandAll']");
                        //se cambia la clase de la celda
                        childGridCell.toggleClass("childExpandedHeader childColapsedHeader");

                        if (settings.useJQueryUI) {
                            $("#divExpandButton", childGridCell).toggleClass("ui-icon-plus ui-icon-minus");
                        }
                        else {
                            if (childGridCell.hasClass("childColapsedHeader"))
                                childGridCell.html("&#x271A;");
                            else
                                childGridCell.html("&#x2796;");
                        }
                    }
                    var method = new Methods(privateMethods.getPageHandler(settings), gridViewId);
                    method.childGridView.expandAllChildGrids(gridViewId);
                }

            }
            else {
                if (settings.onGridDrawed instanceof Function)
                    settings.onGridDrawed(gridViewId);
                drawMessage(gridViewId, settings.noResultsCaption, settings.noResultsClass);
            }
        }

        function getRowHeader(elem, settings) {
            var columnsAmmount = 0;
            var gridViewId = elem.attr("gridViewId");
            var idPrefix = gridViewId + "_trRowHeader";
            var rowHeader = $("<tr id='" + idPrefix + "' gridview_rowType='header' class='gridRow'></tr>");
            var showRefresh = (typeof settings.showRefresh === "undefined" || settings.showRefresh === null || settings.showRefresh === true);

            if (settings.childGrid !== null) {
                //Se agrega la celda para el botón de expansión de las grillas anidadas.
                var childGridCell = $("<td class='gridCell gridViewCellHeader " + privateMethods.getEvenOddColumnClass(columnsAmmount) + " childColapsedHeader' gridview_cellType='expandAll'></td>");
                //Si se habilita la posibilidad de abrir todas las grillas hijas simultáneamente se dibuja el botón para ello.
                if (settings.childGrid.allowExpandAll) {

                    if (settings.useJQueryUI)
                        childGridCell.append($("<div id='divExpandButton' class='ui-icon ui-icon-plus'>&nbsp;</div>"));
                    else {
                        if (childGridCell.hasClass("childColapsedHeader"))
                            childGridCell.html("&#x271A;");
                        else
                            childGridCell.html("&#x2796;");
                    }

                    childGridCell.click(function () {
                        var $this = $(this);
                        //se cambia la clase de la celda
                        $this.toggleClass("childExpandedHeader childColapsedHeader");

                        if (settings.useJQueryUI) {
                            $("#divExpandButton", $this).toggleClass("ui-icon-plus ui-icon-minus");
                        }
                        else {
                            if ($this.hasClass("childColapsedHeader"))
                                $this.html("&#x271A;");
                            else
                                $this.html("&#x2796;");
                        }
                        var method = new Methods();
                        method.childGridView.expandAllChildGrids(gridViewId, $this.hasClass("childExpandedHeader"));
                    });
                }
                else
                    childGridCell.html("&nbsp;");

                columnsAmmount++;
                rowHeader.append(childGridCell);
            }

            if (settings.showRowNumber) {
                columnsAmmount++;
                rowHeader.append($("<td class='gridCell gridViewCellHeader " + privateMethods.getEvenOddColumnClass(columnsAmmount) + "' gridview_cellType='showRowNumber_header'>&nbsp;</td>"));
            }


            if (showRefresh) {
                var cornerCellHeader = $("<td class='gridCell gridViewCellHeader refreshButtonContainer " + privateMethods.getEvenOddColumnClass(columnsAmmount) + "' gridview_cellType='refresh'></td>");
                if (settings.useJQueryUI && (typeof settings.refreshImage === "undefined" || settings.refreshImage === null || settings.refreshImage === "")) {
                    //se configura una imagen de refrezco usando los íconos de jQueryUI
                    cornerCellHeader.append($("<div onclick='$(\"[gridViewId=" + gridViewId + "]\").gridView(\"doRefresh\");' class='ui-icon ui-icon-refresh'>&nbsp;</div>"));
                }
                else {
                    var $refreshIcon = null;
                    if (typeof settings.refreshIconTemplate !== "undefined" && settings.refreshIconTemplate !== null && settings.refreshIconTemplate !== "")
                        $refreshIcon = $(settings.refreshIconTemplate);
                    //se configura una imagen de refrezco con la configurada o la imagen por defecto
                    else if (typeof settings.refreshImage !== "undefined" && settings.refreshImage !== null && settings.refreshImage !== "")
                        $refreshIcon = $("<img src='" + settings.refreshImage + "' />");
                    else
                        $refreshIcon = $("<span >&#x21BA;</div>");

                    $refreshIcon.addClass("gridViewRefreshIcon");
                    $refreshIcon.click(function () { elem.gridView("doRefresh"); });
                    cornerCellHeader.append($refreshIcon);
                }
                columnsAmmount++;
                rowHeader.append(cornerCellHeader);
            }
            if (settings.headerControls !== null) {
                $.each(settings.headerControls, function (index, item) {
                    var cornerCellHeader = $("<td class='gridCell gridViewCellHeader " + privateMethods.getEvenOddColumnClass(columnsAmmount) + "' gridview_cellType='headerControl'></td>");
                    var ctrl = privateMethods.CreateControl(item, gridViewId);
                    ctrl.attr("id", idPrefix + "_headerControl_" + (typeof ctrl.attr("id") !== "undefined" ? ctrl.attr("id") : "") + "_" + index);
                    ctrl.attr("griview_isHeader", "true");

                    columnsAmmount++;
                    cornerCellHeader.append(ctrl);
                    rowHeader.append(cornerCellHeader);
                });
            }


            for (var col in settings.columns) {
                var cell = $("<td class='gridCell gridViewCellHeader' gridview_cellType='headerCell'></td>");
                var column = settings.columns[col];
                if (column.hasOwnProperty("width") && column.width !== "");
                cell.width(column.width);

                cell.attr("dataFieldName", column.dataFieldName);
                cell.attr("columnIndex", col);

                var colheader = (typeof column.description !== "undefined") ? column.description : ((typeof column.dataFieldName !== "undefined") ? column.dataFieldName : "&nbsp;");
                var headerCtrls = [];
                if (column.hasOwnProperty("Controls") && column.Controls.length > 0)
                    headerCtrls = privateMethods.GetControls(column.Controls, gridViewId, true, idPrefix);

                if (headerCtrls.length > 0) {
                    $.each(headerCtrls, function (index, ctrl) {
                        ctrl.attr("id", idPrefix + "_column" + col + "_controlHeaderIncluded_" + (typeof ctrl.attr("id") !== "undefined" ? ctrl.attr("id") : "") + "_" + index);
                        ctrl.attr("griview_isHeader", "true");
                        cell.append(ctrl);
                    });
                }
                else
                    cell.html(colheader);

                if (settings.allowSorting === true && column.sortable === true) {
                    var $sortIcon = $("<span class='sortArrow' gridview_element='sortArrow'></span>");
                    var sortConfig = elem.data("gridView:sortConfig");
                    if ((typeof sortConfig === "undefined" || sortConfig === null) || sortConfig.column !== column.dataFieldName) {
                        sortConfig = { sortDirection: 'asc' };
                        if (typeof settings.defaultSortDirection !== "undefined" && settings.defaultSortDirection !== null)
                            sortConfig.sortDirection = settings.defaultSortDirection;
                        if (typeof column.defaultSortDirection !== "undefined" && column.defaultSortDirection !== null)
                            sortConfig.sortDirection = column.defaultSortDirection;
                    }

                    if (settings.useJQueryUI) {
                        $sortIcon.addClass("ui-icon");

                        if (sortConfig.sortDirection.toLowerCase() === "asc")
                            $sortIcon.addClass("ui-icon-carat-1-n");
                        else
                            $sortIcon.addClass("ui-icon-carat-1-s");
                    }
                    else {
                        if (sortConfig.sortDirection.toLowerCase() === "asc")
                            $sortIcon.html("&#x25B4;");
                        else
                            $sortIcon.html("&#x25BE;");
                    }

                    cell.addClass("cellSortable")
                        .append($sortIcon)
                        .click(function () {
                            var $this = $(this);
                            var colIndex = $this.attr("columnIndex");
                            var $gridView = $this.parents("[gridViewId]:first");
                            var settings = $.extend({}, getDefaults(), $gridView.data("gridviewconfig"));
                            var $row = $this.parents("[gridview_rowType='header']:first");
                            var sortConfig = $gridView.data("gridView:sortConfig");
                            var paggingData = $gridView.data("gridView:pagging");
                            var column = settings.columns[colIndex];
                            if (typeof sortConfig === "undefined" || sortConfig === null)
                                sortConfig = { column: column.dataFieldName, sortDirection: 'asc' };

                            if (sortConfig.column !== column.dataFieldName) {
                                sortConfig.column = column.dataFieldName;
                                sortConfig.sortDirection = 'asc';

                                if (typeof settings.defaultSortDirection !== "undefined" && settings.defaultSortDirection !== null)
                                    sortConfig.sortDirection = settings.defaultSortDirection;
                                if (typeof column.defaultSortDirection !== "undefined" && column.defaultSortDirection !== null)
                                    sortConfig.sortDirection = column.defaultSortDirection;
                            }
                            else
                                sortConfig.sortDirection = (sortConfig.sortDirection.toLowerCase() === "asc" ? "desc" : "asc");

                            if (settings.onSorting instanceof Function) {
                                var eventResult = settings.onSorting(gridViewId, $row, $this, sortConfig);
                                if (eventResult === false)
                                    return;
                            }
                            var $sortIcon = $("[gridview_element=sortArrow]", $this);
                            if (settings.useJQueryUI) {
                                if (sortConfig.sortDirection.toLowerCase() === "asc") {
                                    $sortIcon.removeClass("ui-icon-carat-1-s");
                                    $sortIcon.addClass("ui-icon-carat-1-n");
                                }
                                else {
                                    $sortIcon.removeClass("ui-icon-carat-1-n");
                                    $sortIcon.addClass("ui-icon-carat-1-s");
                                }
                            }
                            else {
                                if (sortConfig.sortDirection.toLowerCase() === "asc")
                                    $sortIcon.html("&#x25B4;");
                                else
                                    $sortIcon.html("&#x25BE;");
                            }

                            $gridView.data("gridView:sortConfig", sortConfig);
                            $gridView.gridView("doSearch", (paggingData !== null ? paggingData.currIndex : 0));
                        });
                }

                if (column.hasOwnProperty("visible") && column.visible === false)
                    cell.hide();
                else
                    cell.addClass(privateMethods.getEvenOddColumnClass(columnsAmmount));

                columnsAmmount++;
                rowHeader.append(cell);
            }

            elem.attr("gridView_columnsAmmount", columnsAmmount);

            return rowHeader;
        }
        function showPreviewCondition(src, evt) {
            if ($("#previewContainer").length > 0)
                $("#previewContainer").remove();
            var prevCond = $("<div class='previewContainer' id='previewContainer'>" + $(".divPreview", $(src)).html() + "</div>")
                .css({ position: 'absolute', top: 0, left: 0, width: $(src).width() })
                .appendTo(src)
                .position({
                    my: 'middle bottom'
                    , at: 'bottom bottom'
                    , of: $(src)
                });
        }

        function loadDataSourceWS(gridViewId, settings, dataFilter, paggingData, parentGridRowData) {
            var wsUrl;
            if (settings.dataSource instanceof Function) {
                wsUrl = settings.dataSource(gridViewId, dataFilter, parentGridRowData);
            }
            else {
                wsUrl = settings.dataSource;
                for (var prop in parentGridRowData) {
                    var reg = new RegExp("\\[" + prop + "\\]", "gi");
                    wsUrl = wsUrl.replace(reg, parentGridRowData[prop]);
                }
            }
            var isSuccess = true, status = "success", messageError = null;

            $.ajax({
                async: settings.ajaxConfig.async,
                type: settings.ajaxConfig.type,
                url: wsUrl,
                data: JSONConvert(dataFilter),
                dataType: settings.ajaxConfig.dataType,
                contentType: settings.ajaxConfig.contentType,
                success: function (data, textStatus, jqXHR) {
                    try {
                        var eventResult;
                        if (data.hasOwnProperty("d"))
                            data = data.d;

                        if (settings.searchResultPreProcessing instanceof Function) {
                            eventResult = settings.searchResultPreProcessing(gridViewId, data);
                            if (typeof eventResult !== "undefined" && eventResult !== null)
                                data = eventResult;
                            else
                                data = [];
                        }

                        if (settings.onBeforeDraw instanceof Function) {
                            eventResult = settings.onBeforeDraw(gridViewId, data);
                            if (eventResult === false)
                                return;
                        }

                        var methods = new Methods(privateMethods.getPageHandler(settings), gridViewId);
                        if (settings.usePagging)
                            methods.pager.setPaggingData(paggingData, data, settings);

                        $("[gridViewId=" + gridViewId + "]").data("gridView:pagging", paggingData);
                        //Sólo si está configurada la paginación se obtiene el totalRecords, se realizan los cálculos para la
                        //paginación y se dibujan los controls, caso contrario se obvia toda esta sección.
                        if (settings.usePagging)
                            methods.pager.drawPager(gridViewId);

                        var resultData;
                        if (typeof settings.dataResultProperty !== "undefined" && settings.dataResultProperty !== null)
                            resultData = data[settings.dataResultProperty];
                        else if (data.hasOwnProperty("result"))
                            resultData = data.result;
                        else
                            resultData = data;

                        drawResults(gridViewId, resultData);
                    }
                    catch (excep) {
                        isSuccess = false;
                        status = "error";
                        messageError = excep.message;
                        if (settings.onError !== null && settings.onError instanceof Function)
                            settings.onError(null, status, messageError, excep);
                    }
                    finally {
                        if (settings.onComplete !== null && settings.onComplete instanceof Function)
                            settings.onComplete(gridViewId, isSuccess, status, messageError);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    isSuccess = false;
                    status = "error";
                    messageError = errorThrown;
                    drawMessage(gridViewId, "Se produjo un error al intentar realizar la b&uacutesqueda. <br/> Intente nuevamente m&aacutes tarde.");
                    if (settings.onError !== null && settings.onError instanceof Function)
                        settings.onError(jqXHR, textStatus, errorThrown);
                    if (settings.onComplete !== null && settings.onComplete instanceof Function)
                        settings.onComplete(gridViewId, isSuccess, status, messageError);
                },
                complete: function () {
                    $("[gridview_rowType=processingContainer]", $("[gridViewId=" + gridViewId + "]")).remove();
                }
            });
        }
        /*data puede ser el string a deserealizar o el json a serializar.*/
        function JSONConvert(data) {
            var retVal;
            //intenta realizar la operación con el objeto JSON nantivo.
            if (typeof data !== "undefined" && data instanceof String)
                retVal = JSON.parse(data);
            else
                retVal = JSON.stringify(data);

            return retVal;
        }
        function loadDataSourceJSon(gridViewId, settings, paggingData, parentGridRowData) {
            var data = null;
            var eventResult;

            //Los datos pasados son una referencia a un control (ej: input, hidden, etc...), se intenta obtener el objeto y leer su valor 
            //Se autodetecta si se debe leer mediante el método "val" o "text" de jQuery.
            if (settings.dataSourceObject !== null) {
                var dataString = "{}";
                if (typeof (dataString = $(settings.dataSourceObject).val()) === "undefined" || dataString === null)
                    dataString = $(settings.dataSourceObject).text();

                //como se trata de un data source del tipo json, se realiza un eval
                if (typeof dataString !== "undefined" && dataString !== null) {
                    data = JSONConvert(dataString);
                }
            }
            //Los datos pasado puede ser un texto
            else if (typeof settings.dataSource === "string") {
                data = JSONConvert(settings.dataSource);
            }
            //Los datos pasado puede ser un objeto json
            else if (typeof settings.dataSource === "object") {
                data = settings.dataSource;
            }
            //Los datos pasado puede ser un objeto json
            else if (typeof settings.dataSource === "function") {
                data = settings.dataSource(settings, paggingData, parentGridRowData);
            }

            //Se ejecuta el evento OnBeforeDraw si estuviera definido.
            //El evento puede cancelar el dibujado de la grilla, si tras su ejecución devolviera false.
            if (settings.onBeforeDraw instanceof Function) {
                eventResult = settings.onBeforeDraw(gridViewId, data);
                if (eventResult === false)
                    return;
            }

            if (settings.searchResultPreProcessing instanceof Function) {
                eventResult = settings.searchResultPreProcessing(gridViewId, data);
                if (typeof eventResult !== "undefined" && eventResult !== null)
                    data = eventResult;
                else
                    data = [];
            }

            var resultData;
            if (typeof settings.dataResultProperty !== "undefined" && settings.dataResultProperty !== null)
                resultData = data[settings.dataResultProperty];
            else if (data.hasOwnProperty("result"))
                resultData = data.result;
            else
                resultData = data;


            if (typeof resultData !== "undefined" && resultData !== null) {
                paggingData.totalRecords = resultData.length;
                var methods = new Methods(privateMethods.getPageHandler(settings), gridViewId);
                if (settings.usePagging)
                    methods.pager.setPaggingData(paggingData, resultData, settings);
                $("[gridViewId=" + gridViewId + "]").data("gridView:pagging", paggingData);

                //Sólo si está configurada la paginación se obtiene el totalRecords, se realizan los cálculos para la
                //paginación y se dibujan los controls, caso contrario se obvia toda esta sección.
                if (settings.usePagging) {
                    (new Methods(privateMethods.getPageHandler(settings), gridViewId)).pager.drawPager(gridViewId);

                    //Se realiza la paginación de los datos.
                    if (resultData !== null && resultData.length > 0) {
                        var lowerBound = paggingData.currIndex * settings.pageSize;
                        resultData = resultData.slice(lowerBound, lowerBound + settings.pageSize);
                    }
                }

                drawResults(gridViewId, resultData);
            }
        }

        init(this);
        return this;
    };
})(jQuery);