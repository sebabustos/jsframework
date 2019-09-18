/*! wsAjax - 2019-09-18 1332 - v3.2.0.0
https://github.com/sebabustos/jsframework/tree/master/JSFramework/webSite/JavaScripModules/wsAjax */

if (typeof JSFramework === "undefined" || JSFramework === null)
    var JSFramework = {};
if (typeof JSFramework.Commons === "undefined" || JSFramework.Commons === null)
    JSFramework.Commons = {};

JSFramework.Commons.wsAjax = {
    //wsMethod          = el nombre del Método del webService
    //context           = cualquier objeto que luego se podrá obtener en el OnRequestSuccess
    //OnRequestSuccess  = función que se llamará si la llamada al ws retorna correctamente
    //OnRequestError    = función que se llamará si la llamada al ws retorna con un error
    //parameters       = array de parámetros que requiere el método del ws. Se usa nomenclatura JSon. Ej: {CnnName:'CnnDefault', Objeto:'Customers', ColumnValue:'ALFKI'}
    doCallWS: function (wsURL, wsMethod, context, OnRequestSuccess, OnRequestError, parameters, settings, serializeData) {

        if (typeof wsMethod === "undefined" || wsMethod === null || wsMethod === "") {
            alert("Se debe indicar el método a ejecutar");
            return false;
        }

        if (serializeData !== false)
            paramData = JSON.stringify(parameters);
        else
            paramData = parameters;

        var $defaults = {
            type: 'POST'
            , url: wsURL + "/" + wsMethod
            , async: true
            , data: paramData
            , datatype: "json"
            , success: function (result, status, XMLHttpRequest) {
                if (typeof OnRequestSuccess !== "undefined" && OnRequestSuccess !== null) {
                    if (typeof result !== "undefined" && result !== null) {
                        if (result.hasOwnProperty("d"))
                            result = result.d;
                    }
                    else
                        result = null;
                    OnRequestSuccess(result, this, status, XMLHttpRequest);
                }
            }
            , error: OnRequestError/*function (jqXHR, textStatus, errorThrown)*/
            , context: context
            , contentType: "application/json; charset=utf-8"
            //,timeout
        };

        $defaults = $.extend($defaults, settings);
        jQuery.ajax($defaults);
    }
};

/*
================================================================
                          VERSIÓN
================================================================
Código:       | wsAjax - 2019-09-18 1332 - v3.2.0.0
----------------------------------------------------------------
Nombre:       | wsAjax
----------------------------------------------------------------
Tipo:         | FUNCIÓN
----------------------------------------------------------------
Descripción:  | función que simplifica la llamada a un servicio
              | web usando el componente ajax de jQuery.
----------------------------------------------------------------
Autor:        | Seba Bustos
----------------------------------------------------------------
Versión:      | v3.2.0.0
----------------------------------------------------------------
Fecha:        | 2019-09-18 13:32
----------------------------------------------------------------
Cambios de la Versión:
 - Se quitó el código de serialización usado y se reemplazó
 por el uso de la clase nativa JSON
================================================================
                        FUNCIONALIDADES
================================================================
- Llamada simplificada a un servicio web mediante el uso de
  jQuery.ajax.
- Permite definir una función que se ejecutará en el success de
  la llamada ajax
- Permite definir una función que se ejecutará en el error de
  la llamada ajax
- Los parámetros del ws se deben pasar en formato json.
- Utiliza la configuración por defecto en la llamada ajax, pero
  permite sobreescribir cualquier configuración de la llamada.
================================================================
                     POSIBLES MEJORAS
================================================================


================================================================
                  HISTORIAL DE VERSIONES
================================================================
Código:       | wsAjax - 2015-12-02 1354 - v3.1.0.0
Autor:        | Seba Bustos
Fecha:        | 2015-12-02 13:54
----------------------------------------------------------------
Cambios de la Versión:
 - Se corrigió una falla en la serialización de los datos por
 el cual, cuando una propiedad tenía el valor null, lo agregaba
 como cadena ("null").
 - Se agregó la utilización del componente $.toJSon(), para la
 serialización de los parámetros, cuando este se encuentra ins-
 talado.
================================================================
Código:       | wsAjax - 2015-04-22 1719 - v3.0.0.0
Fecha:        | 2015-04-22 17:19
----------------------------------------------------------------
Cambios de la Versión:
 - Se corrigió la llamada a getArrayText, que usaba un espacio
 de nombres distinto.
================================================================
Código:       | wsAjax - 2013-06-07 0919 - v1.0.3.0
Fecha:        | 2013-06-07 9:19
----------------------------------------------------------------
Cambios de la Versión:
 - Se modificó el método para sea posible configurar si el
 parámetro "data" se serializará (es decir se enviará como un
 string json) o si se enviará directamente como objeto json.
================================================================
Código:       | wsAjax - 2012-01-17 0926 - v1.0.2.0
Fecha:        | 2012-11-12 17:03
----------------------------------------------------------------
Cambios de la Versión:
 - Se modificó el json generado como parámetro del método $.ajax
 para que use comillas dobles tanto en los nombres de las propiedades
 como en los valores, para así hacerlo compatible con el consumo
 de servicios WCF (.svc)
 - Se modificó el evento onSuccess, para que, si el objeto resultado
 no tiene la propiedad "d", pero no es nulo ni "undefined", devuelva
 el objeto mismo, no "NULL"
================================================================
Código:       | wsAjax - 2012-01-17 0926 - v1.0.1.0
Fecha:        | 2012-01-17 09:26
----------------------------------------------------------------
Cambios de la Versión:
 - Se agregó un nuevo parámetro al método que permite sobreescri
   la configuración por defecto utilizada para hacer la llamada
   ajax.
================================================================
Código:       wsAjax - v1.0.0.0
Cambios de la Versión:
  - Primera versión del componente.
----------------------------------------------------------------
*/