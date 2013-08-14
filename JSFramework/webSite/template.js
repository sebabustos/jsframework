//-

/////////////////////////////////////////////////////
//        Template de una función genérica         //
/////////////////////////////////////////////////////

//El espacio de nombre común es PJJS.Commons. Aunque se puede cambiar PJJS debería ser siempre, 
//los restantes pueden modificarse a conveniencia

//Si no existe el objeto (espacio de nombre) se crea
if (typeof PJJS != "undefined" || PJJS == null)
    var PJJS = {}

//Si no existe el objeto (espacio de nombre) se crea
if (typeof PJJS.Commons != "undefined" || PJJS.Commons == null)
    PJJS.Commons = {}


PJJS.Commons.wsAjax = {
    method: function (param1, param2, ....) {

    }
}

/////////////////////////////////////////////////////
//        Template de un plugin de JQUERY          //
/////////////////////////////////////////////////////

(function ($) {
    "use strict";
    //Configuración por defecto del plugin 
    var $default = {};
    
    //métodos públicos del plugin que se podrán acceder llamando a
    //la función jquery. Ej: $.fn.gridView().method1;
    //Se recomienda que los métodos definidos aquí no dependan del selector, 
    //es decir, que no asuman que el contexto es el componente incial (aquel con el cual se llamó inicialmente al plugin), 
    //sino que, de ser necesario identificar un componente, reciban un selector, id, etc, por parámetro y obtengan la referencia.
    //Ej: method1: function(gridViewId){$("[gvId=' + gridViewId + ']")}
    var methods = {
        method1: function(){},
        method2: function(){}
    };
    
    $.fn.[pluginName] = function (options) {
        //Si no se recibe el parámetro options, se devuelve el objeto "methods"
        //lo que permitirá ejecutar los métodos públicos definidos allí.
        //Esta funcionalidad permite obtener la referencia a methods sin la necesidad de 
        //que el contexto de llamada sea un objeto válido o el objeto inicial.
        //Ej: $("input").gridView(...) --> llama al plugin gridView siendo el selector los inputs, 
        //Ej: $().gridView().method1   --> llama al plugin sin un selector, obteniendo la referencia a methods y por lo tanto puede ejecutar el método "method1".
        if (typeof options == "undefined")
            return methods;

        //Si el parámetro options es un string, se asume la ejecución de un método del plugin indicado por este parámetro.
        //Este uso asume que el contexto es un componente válido, incluso el componente inicial 
        //el método que se ejecutará se recomienda sea un método definido en el contexto del plugin (una función dentro de $.fn.[pluginName])
        //y no dentro de methods, ya que methods ya tiene otro acceso 
        if (typeof options === "string" && options != "") {
            if (this.length <= 0)
                return this;     //por recomendación de jquery, el plugin debe devolver siempre el mismo selector
                                //esto permite el encadenamiento de métodos, ej: $("selector").gridView().hide().css({...});


            //el each se debe a que el selector puede devolver varios componentes.
            $.each(this, function (index, item) {
                //usando el método "data" de jquery, se obtiene la configuración particular de ese componente (ver más adelante)
                var settings = $.extend({}, $default, $(item).data("[pluginName]Config"));

				 var itemId = $(item).attr("[pluginName]Id");
				 if(methods.hasOwnProperty(options))
					 eval("$(\"[[pluginName]Id=" + itemId + "]\").[pluginName]()." + options + "()");
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
            target.data("[pluginName]Config", itemOptions)
                .attr("[pluginName]Id", newId); //se graba el nuevo Id.s

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