//////////////////////////////////////////////////////////////////////////////////////////
//COOKIES
//////////////////////////////////////////////////////////////////////////////////////////
JSFramework.Cookies = {
    get: function (cookieName) {
        return this._getCookie(cookieName, false);
    },
    set: function (cookieName, value, options) {
        if (typeof options === "undefined" || options === null)
            options = {};

        var daysToExpire = options.hasOwnProperty("daysToExpiration") ? options["daysToExpiration"] : null;
        var domain = options.hasOwnProperty("domain") ? options["domain"] : null;
        var path = options.hasOwnProperty("path") ? options["path"] : null;
        var secure = options.hasOwnProperty("secure") ? options["secure"] : null;

        this._setCookie(cookieName, value, daysToExpire, domain, path, secure, false);
    },
    remove: function (cookieName, options) {

        var domain = options.hasOwnProperty("domain") ? options["domain"] : null;
        var path = options.hasOwnProperty("path") ? options["path"] : null;

        this._removeCookie(cookieName, domain, path);
    },
    ///Convierte el string de una cookie (ej: document.cookie) a un objeto json en deonde cada cookie es una propiedad del objeto.
    ///tomado de Yahoo.Util.Cookie
    _cookieToObject: function (text, doDecode) {
        var cookies /*:Object*/ = {};
        if (text.length > 0) {
            //realiza un split por el "; " 
            var cookieParts = text.split(/;\s/g),
                cookieName = null,
                cookieValue = null,
                cookieNameValue = null;

            for (var i = 0, len = cookieParts.length; i < len; i++) {
                //busca las cookies con el formato "nombre=valor"
                cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
                if (cookieNameValue instanceof Array) {
                    try {
                        cookieName = decodeURIComponent(cookieNameValue[1]);
                        cookieValue = cookieParts[i].substring(cookieNameValue[1].length + 1);
                        if (doDecode === true)
                            cookieValue = decodeURIComponent(cookieValue);
                    } catch (ex) {
                        //si genera un error se omite la cookie.
                    }
                } else {
                    //means the cookie does not have an "=", so treat it as a boolean flag
                    cookieName = decodeURIComponent(cookieParts[i]);
                    cookieValue = "";
                }
                cookies[cookieName] = cookieValue;
            }
        }

        return cookies;
    },
    _setCookie: function (name, value, daysToExpiration, domain, path, secure, doEncode) {
        //se escapa el valor de la cookie.
        value = (doEncode === true ? encodeURIComponent(value) : value);
        var cookie = name + "=" + value;

        //si está definida la expiración se agrega a la cookie.
        if (typeof daysToExpiration !== "undefined" && daysToExpiration !== null && !isNaN(daysToExpiration)) {
            var exdate;
            //si la cantidad de días es negativa, es porque se quiere eliminar la cookie, por lo que se coloca una fecha en el pasado.
            if (parseFloat(daysToExpiration) < 0)
                exdate = new Date(0);
            else {
                exdate = new Date();
                exdate.setDate(exdate.getDate() + daysToExpiration);
            }

            cookie += (";expires=" + exdate.toUTCString());
        }

        //si está definido el dominio se agrega a la cookie.
        if (typeof domain !== "undefined" && domain !== null && domain !== "")
            cookie += (";domain=" + domain);

        //si está definido el path se agrega a la cookie.
        if (typeof path !== "undefined" && path !== null && path !== "")
            cookie += (";path =" + path);

        //si está definido el path se agrega a la cookie.
        if (secure === true)
            cookie += (";secure");

        document.cookie = cookie;
    },
    _getCookie: function (cookieName, doEncode) {
        var cookies = this._cookieToObject(document.cookie, doEncode);
        var cookieValue = null;
        if (cookies.hasOwnProperty(cookieName))
            cookieValue = cookies[cookieName];

        return (cookieValue === "undefined" || cookieValue === null ? null : ((doEncode === true) ? decodeURIComponent(cookieValue) : cookieValue));
    },
    _removeCookie: function (name, domain, path) {
        if (typeof name === "undefined" || name === null || name === "")
            throw new TypeError("debe ingresar un nombre de cookie.");

        //para eliminar una cookie se setea su expiración en el pasado.
        this._setCookie(name, "", -1, domain, path);
    }
}
//////////////////////////////////////////////////////////////////////////////////////////