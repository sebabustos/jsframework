/*! cache.client - 2016-10-18 1117 - 1.0.0.0*/
'use strict'
if (typeof JSFramework === "undefined" || JSFramework === null)
    var JSFramework = {}
if (typeof JSFramework.Commons === "undefined" || JSFramework.Commons === null)
    JSFramework.Commons = {}
if (typeof JSFramework.Commons.CacheManager === "undefined" || JSFramework.Commons.CacheManager === null)
    JSFramework.Commons.CacheManager = {}

JSFramework.Commons.CacheManager.eCacheProviders = {
    defaultCache: 0,
    localStorage: 1,
    sessionStorage: 2
};

JSFramework.Commons.CacheManager.Cache = function (defaultCacheProvider) {
    var defaultCache = {
        cache: {},
        getItem: function (key) {
            var retVal;
            if (typeof this.cache[key] !== "undefined" && this.cache[key] !== null)
                retVal = this.cache[key];
            else
                retVal = null;
            return retVal;
        },
        setItem: function (key, value) {
            if (typeof value !== "undefined" && value !== null)
                this.cache[key] = value.toString();
        },
        removeItem: function (key) {
            if (typeof this.cache[key] !== "undefined" && this.cache[key] !== null) {
                this.cache[key] = null;
            }
        }
    };
    function tryLocalStorage() {
        try {
            localStorage.setItem("test", "test");
            localStorage.removeItem("test");
            return true;
        } catch (e) {
            return false;
        };
    }
    function trySessionStorage() {
        try {
            sessionStorage.setItem("test", "test");
            sessionStorage.removeItem("test");
            return true;
        } catch (e) {
            return false;
        };
    }

    var isLocalStorageAvailable = tryLocalStorage();
    var isSessionStorageAvailable = trySessionStorage();

    var cacheProvider = null;

    if (typeof defaultCacheProvider !== "undefined" && defaultCacheProvider !== null) {
        //Si el defaultCacheProvider es uno de los tipos predefinidos, utiliza ese cache.
        switch (defaultCacheProvider) {
            case JSFramework.Commons.CacheManager.eCacheProviders.localStorage:
                if (isLocalStorageAvailable)
                    cacheProvider = localStorage;
                else
                    throw "El 'localStorage' no está disponible";
                break;
            case JSFramework.Commons.CacheManager.eCacheProviders.sessionStorage:
                if (isSessionStorageAvailable)
                    cacheProvider = sessionStorage;
                else
                    throw "El 'sessionStorage' no está disponible";
                break;
            case JSFramework.Commons.CacheManager.eCacheProviders.defaultCache:
                cacheProvider = defaultCache;
                break;
                //si no es uno de los tipos predefinidos se asume que se está inyectando un provider, 
                //TODO: controlar que cumpla con la estructura de un proveedor de cache y se utiliza ese.
            default:
                cacheProvider = defaultCacheProvider;
                break;
        }
    }
    else {
        if (isSessionStorageAvailable)
            cacheProvider = sessionStorage;
        else if (isLocalStorageAvailable)
            cacheProvider = localStorage;
        else
            cacheProvider = defaultCache;
    }

    this.get = function (key) {
        return cacheProvider.getItem(key);
    };
    this.set = function (key, value) {
        cacheProvider.setItem(key, value);
    };
    this.getJson = function (key) {
        var retVal = this.get(key);
        if (retVal !== null && retVal.length > 0)
            retVal = $.secureEvalJSON(retVal);
        else
            retVal = null;

        return retVal;
    };
    this.setJson = function (key, value) {
        this.set(key, $.toJSON(value));
    };
    this.remove = function (key) {
        cacheProvider.removeItem(key);
    };
};

/*
================================================================
                           VERSIÓN
================================================================
Código:       | cache.client - 2016-10-18 1117 - 1.0.0.0
----------------------------------------------------------------
Nombre:       | cache.client
----------------------------------------------------------------
Tipo:         | FUNCIÓN - CLASE
----------------------------------------------------------------
Descripción:  | componente que permite el uso de cache en cliente
              | se encarga de resolver, automáticamente, qué 
              | proveedor de cache usar: sessionStorage, localStorage
              | o local en la página (si no son soportados 
              | los storage)
----------------------------------------------------------------
Autor:        | Sebastián Bustos
----------------------------------------------------------------
Versión:      | v1.0.0.0
----------------------------------------------------------------
Fecha:        | 2016-10-18 11:17
----------------------------------------------------------------
Cambios de la Versión:
- Primera versión del componente.
*/