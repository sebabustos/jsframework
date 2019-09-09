/*! DataTypeValidators - 2019-09-09 1358 - v5.2.0.0
https://github.com/sebabustos/jsframework/tree/master/JSFramework/webSite/JavaScripModules/DataTypeValidators */
/*
================================================================
                            VERSIÓN
================================================================
Código:       | DataTypeValidators - 2019-09-09 1358 - v5.2.0.0
----------------------------------------------------------------
Nombre:       | DataTypeValidators
----------------------------------------------------------------
Tipo:         | PLUGIN 
----------------------------------------------------------------
Descripción:  | Permite configurar los controles para que 
              | acepten determinados tipos de datos.
			  | Asocia al control un comportamiento y restricciones
			  | en función del tipo de dato configurado.
			  | Permite configurar manualmente cada control, utilizando
			  | directamente el plugin de jquery y además
			  | al agregarse la referencia attacha al evento ready
			  | del document, un código que lee todos los controles
			  | con el atributo "datatype" y asocia automáticamente
			  | el validator correspondiente al control.
----------------------------------------------------------------
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Versión:      | v5.2.0.0
----------------------------------------------------------------
Fecha:        | 2019-09-09 13:58
----------------------------------------------------------------
Cambios de la Versión:
 - Se corrigió un error que existía, cuando se registra el evento onValidationFailed
 inline en el html, con un function(){...};
 ================================================================
                       FUNCIONALIDADES
================================================================
- Plugin de jquery que, según el tipo de dato definido:
    - No permite ingresar caracteres no válidos según el tipo
    - valide lo ingresado según el tipo de dato configurado al perder el foco
- Script que automáticamente lea un atributo e inicialice el plugin para los controles.
- Permite la siguiente configuración:
    dataType: '*':  * cualquier caracter
					alphabetic  => sólo letras [a-z A-Z] áÁ éÉ íÍ óÓ úÚ üÜ
					numeric    => sólo números [0-9] - , .
                    integer   => sólo números [0-9]
					currency    => números decimales [0-9] - , . $
					date     => los caracteres necesarios para una fecha [0-9] /
					regex    => que cumpla con la expresión regular definida
    dateformat: null => string, permite indicar el formato admitido de la fecha (ej: "dd/MM/yyyy HH:mm")
    includeTime: true => true|false, si no se define un dateFormat, permite configurar si el validador de tipo fecha, admite el ingreso de hora y minutos ( HH:mm)
    useJQueryDatepicker: true => true|false, permite habilitar o deshabilitar el plugin de datepicker de jquery, para los validadores del tipo fecha.
    datePickerSettings: {} => permite pisar la configuración por defecto, o agregar, al datepicker de jquery.
    allowCurrency: false => true|false, permite habilitar o deshabilitar el ingreso del caracter "$" en un validador del tipo numérico.
    allowThousandSeparator: false => true|false, permite habilitar o deshabilitar el ingreso del caracter de separador de miles en un validador del tipo numérico.
    allowDecimals: true => true|false, permite habilitar o deshabilitar el ingreso de decimales en un validador del tipo numérico.
    allowNegativesValues: true => true|false, permite habilitar o deshabilitar el ingreso del signo "menos" en un validador del tipo numérico.
    allowedChars: null => string, permite configurar los caracteres permitidos en un control, para los validadores del tipo genérico y alfabéticos
    specialChars: null => string, permite configurar caracteres, adicionales, permitidos en un control, para los validadores del tipo genérico y alfabéticos
    validDataRegex: null => string, permite definir una expresión regular que se evaluará para validar los datos ingresados, para los validadores del tipo genérico, alfabéticos y numéricos
    allowNumbers: true => true|false, permite habilitar el ingreso de números en un validador del tipo alfabético.
    commaSeparators: null => string o array de strings, el/los caracteres que se utilizarán como separador de decimales en los validadores del tipo numérico. Si se incluyen varios se permitirá cualquiera de ellos.
    thousandSeparators: null => string o array de strings, el/los caracteres que se utilizarán como separador de miles en los validadores del tipo numérico. Si se incluyen varios se permitirá cualquiera de ellos.
    trimmedInput: 'right' => 'left'|'right'|'both'|'none', permite configurar el validador, para que no considere los espacios adelante, atrás, ninguno, a la hora de ejecutar la validación, o bien sí considerarlos.
    invalidDataCss: 'invalidData' => string, clase de estilo que se le asignará al control, cuando el dato ingresado sea inválido.
    invalidMessageCss: 'default' => string, clase de estilo asignado al div que muestra el mensaje de dato inválido. (Si se configura 'default' utiliza el estilo por defecto del plugin)
    showInvalidMessage: true => true|false, permite habilitar o deshabilitar el uso del mensaje de dato inválido.
    invalidDataMessage: "El dato ingresado es inválido" => string, permite configurar el texto a mostrar en el mensaje de dato inválido.
    enableValidateOnFocusOut: true => true|false, permite habilitar o deshabilitar la ejecución e la validación de datos al perder el foco del control.
    enableValidateOnChange: true => true|false, permite habilitar o deshabilitar la ejecución e la validación de datos en el evento onchange del control.
 - Permite configurar los siguientes eventos:
     onValidationFailed: function (src) { }, //Se ejecuta cuando se pierde el foco y el dato del control es inválido
     onInvalidKeyPress: function (src, evt) { }, //Se ejecuta cada vez que se presiona una tecla inválida.
================================================================
                       POSIBLES MEJORAS
================================================================
- Permitir desactivar el script de inicialización automático.
- una función que se pueda hacer validate(myString, tipoDato) 
    Ej: 
      $.validate("12345", numeric|currency|string|"abc...XYZ");
*/
(function ($) {
    "use strict"
    var guid = 0;
    var $tempthis = null;
    var $default = {
        dataType: '*', /* *        => cualquier caracter
					alphabetic  => sólo letras [a-z A-Z] áÁ éÉ íÍ óÓ úÚ üÜ
					special   => letras y caracteres especiales [a-z A-Z] áÁ éÉ íÍ óÓ úÚ üÜ !"·$%&/()=?¿¡'+`{}[]-_<>ªº
					number    => sólo números [0-9] - , .
                    integer   => sólo números [0-9]
					currency    => números decimales [0-9] - , . $
					date     => los caracteres necesarios para una fecha [0-9] /
					datetime => los caracteres necesarios para una fecha y hora [0-9] / :
					time     => los caracteres necesarios para una hora [0-9] :
					regex    => que cumpla con la expresión regular definida
				*/

        dateformat: null,
        includeTime: true,
        useJQueryDatepicker: true,
        datePickerSettings: {},
        allowCurrency: false,
        allowThousandSeparator: false,
        allowDecimals: true,
        allowNegativesValues: true,
        allowedChars: null,
        specialChars: null,
        validDataRegex: null,
        allowNumbers: true,
        trimmedInput: 'right',
        commaSeparators: null, //el/los caracteres que se utilizarán como separador de decimales. Si se incluyen varios se permitirá cualquiera de ellos.
        thousandSeparators: null,
        invalidDataCss: 'invalidData',
        invalidMessageCss: 'default',
        showInvalidMessage: true,
        onValidationFailed: function (src) { }, //Se ejecuta cuando se pierde el foco y el dato del control es inválido
        onInvalidKeyPress: function (src, evt) { }, //Se ejecuta cada vez que se presiona una tecla inválida.
        invalidDataMessage: "El dato ingresado es inválido",
        enableValidateOnFocusOut: true,
        enableValidateOnChange: true
    }
    var $defaultMessageCss = {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#CCCCCC",
        borderRadius: "5px 5px",
        backgroundColor: "#FF8C8C",
        color: "#FFFFFF"
    };
    var internalMethods = {
        getAllowedChars: function (settings) {
            var allowedChars = settings.allowedChars;
            if (typeof allowedChars !== "undefined" && allowedChars !== null) {
                if (typeof settings.specialChars !== "undefined" && settings.specialChars !== null)
                    allowedChars += settings.specialChars;
                if (settings.allowCurrency)
                    allowedChars += "$";
                if (settings.allowDecimals) {
                    var isCommaDecSep = (parseFloat("1.0") > parseFloat("1,0"));
                    var commaSep;
                    if (isCommaDecSep)
                        commaSep = ","
                    else
                        commaSep = "."
                    allowedChars += commaSep;
                }
                if (settings.allowNegativesValues)
                    allowedChars += "-";
            }
            else allowedChars = null;

            return allowedChars;
        }
    }
    //#region Funciones de validación para cada tipo de dato
    var genericDataTypeValidator = {
        ValidateInput: function (keyCode, currValue, settings) {
            var allowedChars = internalMethods.getAllowedChars(settings)
            var inputChar = String.fromCharCode(keyCode);
            var isValid = true;
            //sólo se valida si existe algún caracter configurado, sino se asume que acepta todos.
            if (typeof allowedChars !== "undefined" && allowedChars !== null) {
                isValid = allowedChars.indexOf(inputChar) >= 0;
                if (!isValid && typeof specialChars === "string" && specialChars !== null)
                    isValid = isValid & specialChars.indexOf(inputChar);
            }
            return isValid;
        }
        , ValidateData: function (string, settings) {
            var retVal = false;
            var allowedChars = internalMethods.getAllowedChars(settings)
            var validDataRegex = settings.validDataRegex;

            var regConfig = "";
            var isValidDataRegexDefined = (typeof validDataRegex !== "undefined" && validDataRegex !== null && validDataRegex.length > 0);
            var isAllowedCharsDefined = (typeof allowedChars !== "undefined" && allowedChars !== null && allowedChars > 0);

            //Si no está definida la lista de caracteres permitidos, ni una expresión regular, se permiten todos los caracteres.
            if (!isValidDataRegexDefined && !isAllowedCharsDefined)
                retVal = true;
            else {
                if (!isValidDataRegexDefined) {
                    //se reemplazan los caracteres reservados de las expresiones regulares por sus respectivos caracteres de escape.
                    allowedChars = allowedChars
                        .replace(".", "\.")
                        .replace("[", "\[")
                        .replace("]", "\]")
                        .replace("(", "\(")
                        .replace(")", "\)")
                        .replace("*", "\*")
                        .replace("+", "\+")
                        .replace("$", "\$")
                        .replace("\\", "\\\\")
                        .replace("^", "\^");

                    validDataRegex = "^[" + allowedChars + "]*$";
                    regConfig = "gi";
                }
                else {
                    var end;
                    //se valida si la expresión regular tiene el formato /expres/config
                    //en cuyo caso se separa expres y config.

                    if (validDataRegex[0] === "/")
                        //Se quita el primer / si existe
                        validDataRegex = validDataRegex.slice(1);
                    if ((end = validDataRegex.lastIndexOf("/")) >= 0) {
                        //Se extrae la parte de configuración 
                        regConfig = validDataRegex.slice(end);
                        //se quita el / al comienzo de la configuración.
                        regConfig = regConfig.slice(1);
                        //se quita el / final de la expresión regular
                        //para obtener la expresión en sí misma, sin configuración
                        validDataRegex = validDataRegex.substring(0, end);
                    }
                }

                var regex = new RegExp(validDataRegex, regConfig);
                retVal = regex.test(string);
            }
            return retVal;
        }
    }
    var alphabeticDataTypeValidator = {
        ValidateInput: function (keyCode, currValue, settings) {
            var specialChars = settings.specialChars;
            var allowedChars = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ áéíóúÁÉÍÓÚüÜ";
            if (settings.allowNumbers)
                allowedChars += "0123456789";
            var inputChar = String.fromCharCode(keyCode);

            var isValid = allowedChars.indexOf(inputChar) >= 0;
            if (!isValid && typeof specialChars === "string" && specialChars !== null)
                isValid = isValid & specialChars.indexOf(inputChar);

            return isValid;
        }
        , ValidateData: function (string, settings) {
            var specialChars = settings.specialChars;
            var validDataRegex = settings.validDataRegex;
            var regConfig = "";
            if (typeof validDataRegex === "undefined" || validDataRegex === null || validDataRegex.length === 0) {
                var numberRegex = "";
                if (settings.allowNumbers)
                    numberRegex = "0123456789";

                validDataRegex = "^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\\s" + numberRegex + "]*$";
                regConfig = "gi";
            }
            else {
                var end;
                //se valida si la expresión regular tiene el formato /expres/config
                //en cuyo caso se separa expres y config.

                if (validDataRegex[0] === "/")
                    //Se quita el primer / si existe
                    validDataRegex = validDataRegex.slice(1);
                if ((end = validDataRegex.lastIndexOf("/")) > 0) {
                    //Se quita la parte de configuración y se guarda
                    regConfig = validDataRegex.slice(end);
                    //se quita el / final de la expresión regular.
                    regConfig = regConfig.slice(1);
                    //la expresión en sí misma.
                    validDataRegex = validDataRegex(0, end);
                }
            }

            var regex = new RegExp(validDataRegex, regConfig);
            return regex.test(string);
        }
    }
    var numericDataTypeValidator = {
        ValidateInput: function (keyCode, currValue, settings) {
            var commaSep = settings.commaSeparators;
            var thouSep = settings.thousandSeparators;
            var allowCurrency = settings.allowCurrency;
            var commaSepCharCode = [];
            var commaSepChar = [];
            var thouSepCharCode = [];
            var thouSepChar = [];

            if (typeof commaSep === "string") {
                commaSep = commaSep.split('');
            }
            if (typeof thouSep === "string")
                thouSep = thouSep.split('');


            if (typeof allowCurrency === "undefined" || allowCurrency !== true)
                allowCurrency = false;

            //para cada caracter del commaSep se obtiene el char Code
            if (typeof commaSep !== "undefined" && commaSep !== null && commaSep !== "") {
                for (var commaChar in commaSep) {
                    //se obtiene el charcode del caracter
                    commaSepCharCode.push(commaSep[commaChar].charCodeAt(0));
                    //se registra el caracter
                    commaSepChar.push(commaSep[commaChar]);
                }
            }
            //si no se configuró ningún separador particular, se usa el default
            else {
                var isCommaDecSep = !isNaN("1,0");
                if (isCommaDecSep) {
                    //44 ==> , (coma)  , teclado y numpad
                    commaSepCharCode = [44];
                    commaSepChar = [","];
                }
                else {
                    //46 ==> . (punto) , teclado y numpad
                    commaSepCharCode = [46];
                    commaSepChar = ["."];
                }
            }


            //para cada caracter del commaSep se obtiene el char Code
            if (typeof thouSep !== "undefined" && thouSep !== null && thouSep !== "") {
                for (var thouChar in thouSep) {
                    //se obtiene el charcode del caracter
                    thouSepCharCode.push(thouSep[thouChar].charCodeAt(0));
                    //se registra el caracter
                    thouSepChar.push(thouSep[thouChar]);
                }
            }
            //si no se configuró ningún separador particular, se usa el default
            else {
                //si el separador de decimales es el . entonces la , es la de miles.
                var isCommaThousandSep = isNaN("1,0");
                if (isCommaThousandSep) {
                    //44 ==> , (comma)  , teclado y numpad
                    thouSepCharCode = [44];
                    thouSepChar = [","];
                }
                else {
                    //46 ==> . (punto) , teclado y numpad
                    thouSepCharCode = [46];
                    thouSepChar = ["."];
                }
            }

            var isValid = (keyCode >= 48 && keyCode <= 57); //48 al 57 == Nº 0 al 1, teclado superior y numpad
            //Si no es un número se validan los caracteres especiales: separador de decimales y menos.
            if (!isValid) {
                if (typeof currValue === "undefined" || currValue === null)
                    currValue = "";

                //Sólo se admite el menos si es el primer caracter.
                isValid = isValid || ((keyCode === 45) && settings.allowNegativesValues && (currValue.length == 0)); //==> - (menos) , teclado y numpad 

                //si se habilita el símbolo de pesos y el caracter, hasta acá, no era válido, se verifica si es el símbolo.
                if (allowCurrency && !isValid) {
                    //se valida que el símbolo $ sea el primer caracter o el primero luego del -.
                    if (currValue.length == 0 || currValue.length == 1 && currValue === "-") {
                        //sólo se admite un caracter $
                        if (currValue.indexOf("$") < 0)
                            isValid = isValid || (keyCode == 36);
                    }
                }

                //Si el caracter NO es el menos, se verifica si es un separador de decimal. Pero sólo si ya hay algún número ingresado, 
                //ya que de lo contrario no se admite el separador.
                if (settings.allowDecimals && !isValid && (currValue.length > 1 || currValue.length == 1 && currValue !== "-")) {
                    var bAllow = true;
                    //Sólo se admite UN SÓLO caracter de decimales
                    for (var commaChar in commaSepChar) {
                        if (currValue.indexOf(commaSepChar[commaChar]) >= 0) {
                            bAllow = false;
                            break;
                        }
                    }
                    if (bAllow) {
                        for (var commaChar in commaSepCharCode) {
                            if (isValid = (isValid || (keyCode === commaSepCharCode[commaChar])))
                                break;
                        }
                    }
                }
                if (settings.allowThousandSeparator && !isValid) {
                    for (var thouChar in thouSepCharCode) {
                        if (isValid = (isValid || (keyCode === thouSepCharCode[thouChar])))
                            break;
                    }
                }
            }

            return isValid;
        }
        , ValidateData: function (string, settings) {
            var commaSep = settings.commaSeparators;
            var thouSep = settings.thousandSeparators;
            var allowCurrency = settings.allowCurrency;
            var allowThousandSeparator = settings.allowThousandSeparator;
            var validDataRegex = settings.validDataRegex;

            var regConfig = "";
            if (typeof validDataRegex === "undefined" || validDataRegex === null || validDataRegex.length === 0) {
                if (typeof commaSep === "undefined" || commaSep === null)
                    commaSep = (!isNaN("1,0") ? "," : "\\.");
                if (typeof thouSep === "undefined" || thouSep === null)
                    thouSep = (isNaN("1,0") ? "," : "\\.");

                var currencyRegex = allowCurrency ? "[\\$]{0,1}" : "";
                var decimalRegex = settings.allowDecimals ? "([" + commaSep + "]{0,1}(\\d)+||(\\d)*)" : "";
                var negativesRegex = settings.allowNegativesValues ? "[-]{0,1}" : "";
                var integerRegex = allowThousandSeparator ? "(\\d{1,3}([" + thouSep + "]{0,1}\\d{3})*)" : "(\\d+)";

                validDataRegex = "^" + negativesRegex + currencyRegex + integerRegex + decimalRegex + "$";
                regConfig = "gi";
            }
            else {
                var end;
                //se valida si la expresión regular tiene el formato /expres/config
                //en cuyo caso se separa expres y config.

                if (validDataRegex[0] === "/")
                    //Se quita el primer / si existe
                    validDataRegex = validDataRegex.slice(1);

                if ((end = validDataRegex.lastIndexOf("/")) > 0) {
                    //Se quita la parte de configuración y se guarda
                    regConfig = validDataRegex.slice(end);
                    //se quita el / final de la expresión regular.
                    regConfig = regConfig.slice(1);
                    //la expresión en sí misma.
                    validDataRegex = validDataRegex.slice(0, end);
                }
            }

            var regex = new RegExp(validDataRegex, regConfig);
            return regex.test(string);
        }
    }
    var dateDataTypeValidator = {
        ValidateInput: function (keyCode, currValue, settings) {
            var isValid = (keyCode >= 48 && keyCode <= 57); //48 al 57 == Nº 0 al 1, teclado superior y numpad
            //si no es un caracter numérico, se valida si es alguno de los caracteres especiales especificados.
            if (!isValid) {
                var specialChars = ["/"];
                if (settings.includeTime) {
                    specialChars.push(" ");
                    specialChars.push(":");
                }
                if (typeof specialChars !== "undefined" && specialChars !== null) {
                    for (var char in specialChars) {
                        if (isValid = (isValid || (keyCode == specialChars[char].charCodeAt(0))))
                            break;
                    }
                }
            }

            return isValid;
        }
        , ValidateData: function (string, settings) {
            var dateFormat = settings.dateformat;
            var validDataRegex;
            var regConfig = "";
            if (typeof dateFormat === "undefined" || dateFormat === null || dateFormat.length === 0) {
                validDataRegex = "^([0-9]{1,2})/([0-9]{1,2})/([0-9]{4})";
                if (settings.includeTime)
                    validDataRegex += "(?:\\s([0-9]{1,2}):([0-9]{1,2})){0,1}";
                validDataRegex += "$";
                regConfig = "gi";
            }
            else {
                var end;
                //se valida si la expresión regular tiene el formato /expres/config
                //en cuyo caso se separa expres y config.
                var AMPMformat = (validDataRegex.indexOf("hh") >= 0);

                validDataRegex = dateFormat;
                validDataRegex = validDataRegex.replace(/dd/g, "([0-9]{1,2})");
                validDataRegex = validDataRegex.replace(/MM/g, "([0-9]{1,2})");
                validDataRegex = validDataRegex.replace(/yyyy/g, "([0-9]{4})");
                validDataRegex = validDataRegex.replace(/HH/g, "([0-9]{1,2})");
                validDataRegex = validDataRegex.replace(/hh/g, "([0-9]{1,2})");
                if (AMPMformat)
                    validDataRegex = validDataRegex.replace(/mm/g, "([0-9]{1,2})");
                else
                    validDataRegex = validDataRegex.replace(/mm/g, "([0-9]{1,2})\\s(am|pm)");
            }

            var regex = new RegExp(validDataRegex, regConfig);
            return regex.test(string);
        }
    }
    //#endregion

    var methods = {
        initValidator: function ($this, $default, options, dataTypeObject) {
            var settings = $.extend({}, $default, options);
            var dataType = options.dataType;
            var validatorId = $this.data("validator-id");
            if (typeof validatorId === "undefined" || validatorId === "" || validatorId === null) {
                var elemId = $this[0].id;
                if (typeof elemId === "undefined" || elemId === "") {
                    elemId = guid;
                    guid++
                }

                $this.attr("data-validator-id", elemId);
            }

            $this.data("DataTypeValidatorConfig", options);

            $this.on("keypress.datatypevalidator", function (evt) {
                var $this = $(this);
                //si se presiona una tecla sobre el control, y está configurado el mensaje de validación, se oculta el mensaje.
                if (settings.showInvalidMessage) {
                    $this.removeClass(settings.invalidDataCss);
                    $("#InvalidMessage" + $this.data("validator-id")).remove();
                }

                var isValid = dataTypeObject.ValidateInput(evt.which, $this.val(), settings);

                if (!isValid && typeof settings.onInvalidKeyPress === "function")
                    settings.onInvalidKeyPress($this, evt);

                return isValid;
            })
                .on("keyup.datatypevalidator", function (evt) {
                    if (settings.showInvalidMessage) {
                        //si se presiona la tecla backspace o del sobre el control, y está configurado el mensaje de validación, se oculta el mensaje.
                        if (evt.which === 8 || evt.which === 46) {
                            var $this = $(this);
                            $this.removeClass(settings.invalidDataCss);
                            $("#InvalidMessage" + $this.data("validator-id")).remove();
                        }
                    }
                });
            if (settings.enableValidateOnFocusOut)
                $this.on("focusout.datatypevalidator", function () {
                    methods.validate($(this), settings, dataTypeObject);
                });

            if (settings.enableValidateOnChange)
                $this.on("change.datatypevalidator", function () {
                    methods.validate($(this), settings, dataTypeObject);
                });

            if ((dataType === "date" || dataType === "datetime") && settings.useJQueryDatepicker) {
                var $defaultDatePickerSetting = {
                    closeText: "cerrar",
                    prevText: "<",
                    nextText: ">",
                    currentText: "actual",
                    monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                    monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
                    dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
                    dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
                    dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
                    weekHeader: "Semana",
                    dateFormat: "dd/mm/yy"
                }

                var datePickSett = $.extend({}, $defaultDatePickerSetting, settings.datePickerSettings);
                $this.datepicker(datePickSett);
            }
        },
        validate: function ($this, settings, dataTypeObject) {
            if (typeof $this !== "undefined" && $this !== null && $this.length > 0) {
                if ($this.val() !== "") {
                    if (typeof settings === "undefined" || settings === null) {
                        var options = $this.data("DataTypeValidatorConfig");
                        settings = $.extend({}, $default, options);
                    }
                    if (typeof dataTypeObject === "undefined" || dataTypeObject === null) {
                        var dataTypeObject;
                        if ((settings.dataType === "numeric") || (settings.dataType === "integer") || (settings.dataType === "currency")) dataTypeObject = numericDataTypeValidator;
                        else if (settings.dataType === "alphabetic") dataTypeObject = alphabeticDataTypeValidator;
                        else if (settings.dataType === "date") dataTypeObject = dateDataTypeValidator;
                        else dataTypeObject = genericDataTypeValidator;
                    }
                    var elemId = $this.data("validator-id");
                    var stringtoValidate = $this.val();
                    if (typeof settings.trimmedInput !== "undefined" && settings.trimmedInput !== null && settings.trimmedInput !== "none") {
                        if (settings.trimmedInput.toLowerCase() == "right" || settings.trimmedInput.toLowerCase() == "both")
                            stringtoValidate = stringtoValidate.replace(/ +$/g, '');
                        if (settings.trimmedInput.toLowerCase() == "left" || settings.trimmedInput.toLowerCase() == "both")
                            stringtoValidate = stringtoValidate.replace(/^ +/, '');
                    }

                    if (!dataTypeObject.ValidateData(stringtoValidate, settings)) {
                        $this.addClass(settings.invalidDataCss);
                        if (settings.showInvalidMessage) {
                            $("#InvalidMessage" + elemId).remove();
                            //si el usuario sobreescribe el css message se usa ese, aunque este sea vacío, pero si no sobreescribe coloca
                            //por defecto "invalidMessage"
                            var cssMessage = settings.invalidMessageCss === 'default' ? "" : settings.invalidMessageCss;
                            //si existe definido un CSS para el mensaje, se coloca la clase específica según el tipo de dato, sino no.
                            var cssDataTypeMessage = (cssMessage !== '' && typeof cssMessage !== "undefined") ? " " + settings.dataType + cssMessage : "";

                            var invalidMsg = $("<div id='InvalidMessage" + elemId + "' class='" + cssMessage + cssDataTypeMessage + "' >" + settings.invalidDataMessage + "</div>");
                            $this.parent().append(invalidMsg);
                            var pos = $this.position();
                            invalidMsg.css({
                                position: "absolute",
                                top: (pos.top - ($this.height() - ($this.height() / 10))),
                                left: pos.left
                            });

                            if (settings.invalidMessageCss === 'default') {
                                invalidMsg.css($defaultMessageCss);
                            }

                        }
                        if (typeof settings.onValidationFailed === "function")
                            settings.onValidationFailed($this);
                    }
                    else {
                        if (settings.showInvalidMessage)
                            $("#InvalidMessage" + elemId).remove();
                        $this.removeClass(settings.invalidDataCss);
                    }
                }
            }
            else alert("Error - el objeto recibido no es válido. [DataTypeValidators - validate]");
        },
        setGenericValidator: function (options, $this) {
            methods.initValidator($this, $default, options, genericDataTypeValidator);
        },
        setCurrencyValidator: function (options, $this) {
            //El currency es un número que acepta el caracter de $. El allowCurrency define si se permite o no este caracter, y por defecto está 
            //deshabilitado por lo que se hace el extend para que, si el usuario no lo especificó, por defecto se habilite, para este tipo de dato.
            options = $.extend({ allowCurrency: true, allowThousandSeparator: true }, options);
            methods.initValidator($this, $default, options, numericDataTypeValidator);
        },
        setNumericValidator: function (options, $this) {
            methods.initValidator($this, $default, options, numericDataTypeValidator);
        },
        setAlphabeticValidator: function (options, $this) {
            methods.initValidator($this, $default, options, alphabeticDataTypeValidator);
        },
        setDateValidator: function (options, $this) {
            methods.initValidator($this, $default, options, dateDataTypeValidator);
        }
    };

    var publicMethods = {
        isValid: function ($this) {
            var retVal = true;
            if (typeof $this === "undefined" || $this === null)
                $this = $tempthis;

            if (typeof $this !== "undefined" && $this !== null) {
                var options = $this.data("DataTypeValidatorConfig");
                var settings = $.extend({}, $default, options);
                var dataTypeValidator = genericDataTypeValidator;
                if ((settings.dataType === "numeric") || (settings.dataType === "integer") || (settings.dataType === "currency"))
                    dataTypeValidator = numericDataTypeValidator;
                else if (settings.dataType === "alphabetic")
                    dataTypeValidator = alphabeticDataTypeValidator;
                else if (settings.dataType === "date")
                    dataTypeValidator = dateDataTypeValidator;

                if ($this.val() !== "")
                    retVal = dataTypeValidator.ValidateData($this.val(), settings);
            }
            return retVal;
        },
        remove: function ($this) {
            var retVal = true;
            if (typeof $this === "undefined" || $this === null)
                $this = $tempthis;

            if (typeof $this !== "undefined" && $this !== null) {
                var options = $this.data("DataTypeValidatorConfig");
                var settings = $.extend({}, $default, options);
                $this.off(".datatypevalidator");
                $this.data("validator-id", null);
                $this.data("DataTypeValidatorConfig", null);
                var dataType = $this.data("validator-datatype").toLowerCase();

                if (dataType === "date" && settings.useJQueryDatepicker)
                    $this.datepicker("destroy");
            }
        },
        validate: function ($this) {
            methods.validate($this);
        }
    };
    //metodos que permiten manejo grupales, por ejemplo
    //ejecutar todas las validaciones de todos los controles
    //con validators inicializados.
    var groupPublicMethods = {
        areValids: function () {
            var areAllValids = true;
            $("[data-validator-id]").each(function () {
                if (!(areAllValids = publicMethods.isValid($(this))))
                    return false;
            });

            return areAllValids;
        },
        executeValidators: function () {
            $("[data-validator-id]").each(function () {
                methods.validate($(this));
            });
        }
    }

    ///Plugin, este permite configurar los data type validators para un control o un conjunto de controles a partir del resultado de un selector 
    ///jquery
    $.fn.DataTypeValidator = function (options) {
        function init($this) {
            if (typeof options === "undefined" || options === null)
                options = getOptionsFromMarkup($this[0]);
            else if (typeof options === "string")
                options = { dataType: options };

            var settings = $.extend({}, $default, options);
            $this.data("validator-datatype", settings.dataType);

            if (settings.dataType === "numeric")
                methods.setNumericValidator(options, $this);
            else if (settings.dataType === "integer")
                methods.setNumericValidator($.extend({}, { allowDecimals: false }, options), $this);
            else if (settings.dataType === "alphabetic")
                methods.setAlphabeticValidator(options, $this);
            else if (settings.dataType === "currency")
                methods.setCurrencyValidator(options, $this);
            else if (settings.dataType === "date")
                methods.setDateValidator(options, $this);
            else
                methods.setGenericValidator(options, $this);
            /*else
                alert("El tipo de dato configurado no existe, los tipos válidos son: \"numeric\", \"integer\", \"alphabetic\", \"currency\", \"date\"");
            */
        }

        //si se ejecuto el selector sin parámetros, $(), el selector no devolvió ningún control, o bien el control 
        //ya fue inicializado con un validador, se devuelve el "publicMethods" para la ejecución de datos.
        if ((this.length <= 0) || (this.length === 1 && (typeof this.data("validator-id") !== "undefined" && this.data("validator-id") !== ""))) {
            var returnMethods = publicMethods;
            if (this.length <= 0)
                returnMethods = $.extend(groupPublicMethods);
            $tempthis = this.length == 1 ? this : arguments[0];//si viene de un control, y este fue inicializado, se coloca este como contexto, sino se asume que el control es el primer parámetro.

            return returnMethods;
        }
        else {
            this.each(function (index, item) {
                var $item = $(item);
                if (typeof $item.data("validator-id") === "undefined" || $item.data("validator-id") === "")
                    init($item);
            });
        }



        return this;
    }

    function getOptionsFromMarkup(src) {
        var $this = $(src);
        var dataType = $this.data("validator-datatype");
        if (typeof dataType === "undefined")
            dataType = $this.attr("DataType");
        dataType = dataType.toLowerCase();

        var options = {};
        if (typeof DateTypeValidatorGetSettings === "function")
            options = DateTypeValidatorGetSettings(dataType, this);

        var validRegex = $this.attr("validDataRegex");
        if (typeof validRegex !== "undefined" && validRegex !== null && validRegex !== "")
            options = $.extend(options, { "validDataRegex": validRegex });

        var allowedChars = $this.attr("allowedChars");
        if (typeof allowedChars !== "undefined" && allowedChars !== null && allowedChars !== "")
            options = $.extend(options, { "allowedChars": allowedChars });

        options = $.extend(options, { "dataType": dataType });
        //lee cualquier propiedad del control que estuviera configurada en él 
        for (var index in $default) {
            var dataAttr = $this.data("validator-" + index.toLocaleLowerCase());
            if (typeof dataAttr !== "undefined" && dataAttr !== null) {
                if (index == "onValidationFailed" || index == "onInvalidKeyPress") {
                    if (dataAttr !== "") {
                        if ((dataAttr.indexOf("function") == 0))
                            eval("dataAttr = " + dataAttr);
                        else {
                            if (index == "onValidationFailed")
                                dataAttr = window[dataAttr];
                            else if (index == "onInvalidKeyPress")
                                dataAttr = window[dataAttr];

                        }
                    }
                }
                options[index] = dataAttr;
            }
        }
        if (typeof options["allowedChars"] !== "undefined") {
            options["allowedChars"] = (options["allowedChars"].replace("0-9", "0123456789")
                .replace(/a-z/g, "abcdefghijklmnñopqrstuvwxyz")
                .replace(/A-Z/g, "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"));
        }

        return options;
    }

    ///Script que inicializa los validator de una página, para todos los controles que tengan definido el atributo "DataType". 
    ///Este script se ejecuta siempre que se agrega la referencia a este .js
    function Init() {
        $(document).ready(function () {
            //busca todos los controles que tengan el atributo "DataType"
            var $listControls = $("[data-validator-datatype]");
            if ($listControls.length <= 0)
                $listControls = $("[DataType]");

            $listControls.each(function (index) {
                $(this).DataTypeValidator();
            });
        });
    }
    Init();
})(jQuery);
/*
 *
================================================================
                    HISTORIAL DE VERSIONES
    [Registro histórico resumido de las distintas versiones]
================================================================
Código:       | DataTypeValidators - 2018-03-07 1211 - v5.1.0.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Cambios de la Versión:
 - Se agregó la posibilidad de configurar la omisión de los espacios
 al comienzo y final del texto a validar (trim). Quedando por defecto
 deshabilitado.
================================================================
Código:       | DataTypeValidators - 2018-02-28 1251 - v5.0.0.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Cambios de la Versión:
 - Se corrigió un error detectado por Francisco Gambino, por el cual
 si un input con tipo de dato fecha, se encuentra en estado inválido,
 y luego se selecciona una fecha válida, usando el calendar de jquery,
 no estaba quitando el mensaje, ni el estilo, de inválido.
 - Se agregó el nuevo evengo onchange, para detectar los cambios
 en el control y ejecutar las validaciones de tipo de dato, y la
 posibilidad de deshabilitar el uso de este evento con
 "enableValidateOnChange = false;"
================================================================
Código:       | DataTypeValidators - 2017-02-16 1515 - v4.0.0.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Cambios de la Versión:
 - Se modificaron los atributos que agrega y lee el plugin para que
 al control, para agregarles el prefijo "data-validator"
  Eh: <input type='text' dataType='date' ===> <input type='text' data-validator-datatype='date'
  Nota: Se mantuvo la compatibilidad con las formas anteriores pero
  se recomienda su modificación
- Se agregó la posibilidad de configurar, como atributo del html
cualquier elemento de configuración del DataTypeValidator, respetando
el siguiente format: data-validator-xxx => donde xxx es el atributo,
todo en minúscula. Los atributos permitidos son todos los enumerados en "FUNCIONALIDADES"
- Se agregó la posibilidad de deshabilitar la validación en el "onfocusout"
- Se agregó la posiblidad de llamar al plugin, con un selector jquery
vacío, que permita ejecutar métodos para todos los validators configurados:
    Ej: $().DataTypeValidator().areValids() => valida todos los controles y
                                               devuelve true|false, según si
                                               son todos válidos o existe
                                               alguno  inválido
        $().DataTypeValidator().execute() => ejecuta las validaciones de
                                        todos los validators (como si se hiciera
                                        el focusout)
- Se corrigió un error que se generaba, cuando se configuraba una
 expresión regular con las barras (ej: /{expresión}/)
================================================================
Código:       | DataTypeValidators - 2016-12-15 - v3.2.1.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Cambios de la Versión:
 - Se modificó la llamada al método DateTypeValidatorGetSettings,
 para agregar el parámetro this.
================================================================
Código:       | DataTypeValidators - 2015-09-29 - v3.2.0.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Cambios de la Versión:
 - Se agregó la nueva variable publicMethods, que contendrá el
 listado de métodos accesibles.
 - Se agregó la posibilidad de llamar al plugin, y ejecutar los
 métodos públicos.
 - Se agregó el nuevo método público "isValid", que permitirá
 ejecutar las validaciones, configuradas en el contro, a demanda,
 lo que aplicará las validaciones sobre el valor que tenga el control
 e indicará si el dato contenido cumple con la configuración
 del tipo de dato.
  Ej: $("miControl").DataTypeValidator().isValid();
 - Se agregó el nuevo método público "remove" que permite la remoción
 del validator del control.
================================================================
Código:       | DataTypeValidators - 2015-05-07 - v3.1.2.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Cambios de la Versión:
 - Se corrigió un error en la expresión regular del validador del tipo
numérico, cuando no se habilitaba el caracter de separador de miles.
================================================================
Código:       | DataTypeValidators - 2015-05-07 - v3.1.1.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
 - Se corrigió la configuración de los nombres de los días en el
 calendario JQuery, que figuraba el Lunes como primer día de la
 semana, desfasando todas las fechas.
 ================================================================
Código:       | DataTypeValidators - 2015-05-06 - v3.1.0.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
 - Se agregó la possibilidad de habilitar, y configurar, el caracter de
 separador de miles.
 ================================================================
Código:       | DataTypeValidators - 2015-01-22 - v3.0.0.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
- Se quitó la configuración "invalidMessageCss", que no era utilizada
 - Se agregó la posibilidad de configurar los caracteres permitidos
 que serán usados para permitir o no determinadas teclas (en el keyUp)
 La configuración es posible mediante la propiedad "allowedChars" o
 bien con un atributo "allowedChars" en el tag del control.
 Esta propiedad es una cadena con todos los caracteres permitidos, NO una
 expresión regular. Sin embargo se definieron algunos atajos que permitirán
 simplificar este listado, y que serán reemplazadas por su correspondiente
 secuencia de caracteres:
    * a-z: permitirá los caracteres de la "a" a la "z" en minúscula
    * A-Z: permitirá los caracteres de la "a" a la "z" en mayúscula
    * 0-9: permitirá los números del 0 al 9.
 - Se agregó la posibilidad de configurar la expresión regular usada
 para validar el texto ingresado como un atributo del control, mediante el
 atributo "validDataRegex"
  Ej:<input type="text" dataType="regex" id="txtMail" validDataRegex="^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$" allowedChars="a-zA-Z0-9_.+-@"/>
 - Se modificó el valor por defecto de la propiedad "specialChars"
 para que sea null, en lugar de false.
 - se agregó un nuevo DataTypeValidator, el "genericDataTypeValidator"
 que será usado para todos los tipos de datos no contemplados, y para el regex.
 Este validator sólo permitirá el ingreso de los caracteres que hayan sido definidos
 en la propiedad (o atributo del control) "allowedChars" (incluyendo la coma, punto, etc
 si se habilitaran los mismos); y validará que el texto ingresado cumpla con la expresión
 regular definida.
================================================================
Código:       | DataTypeValidators - 2013-09-12 - v1.2.0.0
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Cambios de la Versión:
 - Se renombró la propiedad "commaSeparators" a "commaSeparators" (2 emes)
 - Se corrigió un error encuando se definía un tipo de dato numérico (o currency)
  por el cual no estaba tomando la configuración del separador de comas especificada
  por el usuario.
 - Se corrigió una falla cuando la configuración de separadores de coma se especificaba
  como cadena (string) y no como array.
 - Se agregó la posibilidad de configurar la clase de estilo del mensaje de validación, y se
  modificó el comportamiento por defecto, para que, si no se sobreescribe, se agergue la configuración
  por código.
----------------------------------------------------------------
Código:       | DataTypeValidators - 2013-07-18 - v1.1.0.0
----------------------------------------------------------------
Autor:        | Sebastián Bustos Argañaraz
----------------------------------------------------------------
Cambios de la Versión:
 - Se agregó la posibilidad de definir, en la página, una función
 que será utilizada por el componente para obtener la configuración
 de cada tipo de dato, cuando se asignan automáticamente los tipos
 (en la carga de la página)
- Se agregó el nuevo tipo de dato "integer" que permite el ingreso
de números pero sin decimales
- Se agregaron dos configuraciones adicionales:
	* allowDecimals: afecta a numerics y currency. Permite configurar
			si se admitirán decimales o no (si se deshabilita no permitirá
			ingresar ni "," ni "."
	* allowNegativesValues: afecta a numerics, intenger y currency
			permite habilitar y deshabilitar la carga de valores
			negativos.
----------------------------------------------------------------
Código:      1.0.0.0
Autor:       Sebastián Bustos Argañaraz
Cambios de la Versión:
  - Primera Versión del plugin
================================================================
*/