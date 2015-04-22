if (typeof JSFramework === "undefined" || JSFramework === null)
    var JSFramework = {}
if (typeof JSFramework.Commons === "undefined" || JSFramework.Commons === null)
    JSFramework.Commons = {}

JSFramework.Commons.wsAjax = {
    //wsMethod          = el nombre del Método del webService
    //context           = cualquier objeto que luego se podrá obtener en el OnRequestSuccess
    //OnRequestSuccess  = función que se llamará si la llamada al ws retorna correctamente
    //OnRequestError    = función que se llamará si la llamada al ws retorna con un error
    //paramArrays       = array de parámetros que requiere el método del ws. Se usa nomenclatura JSon. Ej: {CnnName:'CnnDefault', Objeto:'Customers', ColumnValue:'ALFKI'}
    doCallWS: function (wsURL, wsMethod, context, OnRequestSuccess, OnRequestError, paramArrays, settings, serializeData) {

        if (typeof wsMethod == "undefined" || wsMethod == null || wsMethod == "") {
            alert("Se debe indicar el método a ejecutar");
            return false;
        }

        var jsonData = "";

        if (serializeData = (serializeData !== false)) {
            if (typeof paramArrays != "undefined" && paramArrays != null) {
                for (var prop in paramArrays) {
                    if (typeof paramArrays[prop] != 'undefined') {
                        if (paramArrays[prop] instanceof Array)
                            jsonData = jsonData + ",\"" + prop + "\":" + JSFramework.Commons.wsAjax.getArrayText(paramArrays[prop]);
                        else
                            jsonData = jsonData + ",\"" + prop + "\":\"" + paramArrays[prop] + "\"";
                    }
                }

                if (jsonData.length > 0)
                    jsonData = jsonData.substring(1);
            }
        }

        var $defaults = {
            type: 'POST'
                , url: wsURL + "/" + wsMethod
                , async: true
            //si se configuró para que serialice el dato a enviar, se manda el data en forma de texto, sino se envía directamente el paramArrays.
                , data: serializeData ? "{" + jsonData + "}" : paramArrays
                , datatype: "json"
                , success: function (result, status, XMLHttpRequest) {
                    if (typeof OnRequestSuccess != "undefined" && OnRequestSuccess != null) {
                        if (typeof result != "undefined" && result != null) {
                            if (result.hasOwnProperty("d"))
                                result = result.d;
                        }
                        else
                            result = null;
                        OnRequestSuccess(result, this, status, XMLHttpRequest);
                    }
                }
                , error: OnRequestError
                , context: context
                , contentType: "application/json; charset=utf-8"
            //,timeout
        };

        $defaults = $.extend($defaults, settings);
        jQuery.ajax($defaults);
    },
    getArrayText: function (arr) {
        var retVal = "";
        for (var iCount = 0; iCount < arr.length; iCount++)
            retVal = retVal + ",\"" + arr[iCount] + "\"";

        retVal = retVal.substring(1);

        return "[" + retVal + "]";
    }

}

/*
================================================================
                          VERSIÓN
================================================================
Código:       | wsAjax - 2015-04-22 1719 - v3.0.0.0
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
Versión:      | v3.0.0.0
----------------------------------------------------------------
Fecha:        | 2015-04-22 17:19
----------------------------------------------------------------
Cambios de la Versión:
 - Se corrigió la llamada a getArrayText, que usaba un espacio 
 de nombres distinto.
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