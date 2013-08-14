//////////////////////////////////////////////////////////////////////////////////////////
//SEARCHER
//////////////////////////////////////////////////////////////////////////////////////////
if (typeof PJJS == "undefined" || !PJJS)
    var PJJS = {};
if (typeof PJJS.Searcher == "undefined" || !PJJS.Searcher)
    PJJS.Searcher = {};

//////////////////////////////////////////////////////////////////////////////////////////
//TRU
//////////////////////////////////////////////////////////////////////////////////////////
var AMMOUNT_TO_CACHE = 10;
//////////////////////////////////////////////////////////////////////////////////////////
PJJS.Searcher.TRU = {
    add: function (objectName, objectVal) {
        if (typeof objectVal != "undefined" && objectVal != null) {
            if (typeof objectVal.length != "undefined")
                PJJS.Searcher.TRU.addRange(objectName, objectVal);
            else
                PJJS.Searcher.TRU.addItem(objectName, objectVal);
        }
    },
    addItem: function (objectName, objectValue) {
        if (typeof objectValue != "undefined" && objectValue != null) {
            var oList = this.listItems(objectName);
            if (oList == null)
                oList = []
            var iIndex = null;
            //si existe se borra para agregarlo al comienzo de la lista como TRU.
            iIndex = this.__existsItem(oList, objectValue)
            if (iIndex != null)
                oList.splice(iIndex, 1);
            //si supera el monto máximo se quita el primero de la lista que es el más viejo (es el primero porque se invirtió la lista).
            if (oList.length == AMMOUNT_TO_CACHE)
                oList.pop(0);

            oList = oList.reverse()
            //al agregar se agrega al final de la lista.
            oList.push({ 'id': escape(objectValue.id), 'desc': escape(objectValue.desc), 'info': escape(objectValue.info), 'searcher': escape(objectValue.searcher) });
            //se vuelve a invertir para conservar el orden, quedando ahora ordenado por último ingresado. Así el último ingresado va a estar primero en la lista.
            oList = oList.reverse()


            var URL = PJJS.Searcher.Commons.documentURL();
            var cookDomain = URL.domain;
            if (cookDomain == "localhost")
                cookDomain = ".localhost.com";

            PJJS.Searcher.Cookies.setSub("searcher_" + URL.domain + ":" + URL.port + "_" + URL.firstPath, objectName, this.parseToString(oList), { expires: new Date("2050/02/25"), domain: cookDomain, path: "/" + URL.firstPath });
        }
    },
    addRange: function (objectName, objectValueArray) {
        if (typeof objectValueArray != "undefined" && objectValueArray != null) {
            for (var iCount = 0; iCount < objectValueArray.length; iCount++)
                this.addItem(objectName, objectValueArray[iCount]);
        }
    },
    getTRU: function (objectName) {
        var retValue = null;
        var oList = this.listItems(objectName);
        if (oList != null && oList.length > 0) {
            //el primero de la lista es el último agregado y por ende el TRU
            retValue = oList[0];
        }

        return retValue;
    },
    getItem: function (objectName, index) {
        var oList = this.listItems(objectName);
        var retValue = null;
        if (oList != null) {
            if (oList.length >= index)
                retValue = oList[index];
        }

        return retValue;
    },
    listItems: function (objectName) {
        var URL = PJJS.Searcher.Commons.documentURL();
        var sValue = PJJS.Searcher.Cookies.getSub("searcher_" + URL.domain + URL.port + "_" + URL.firstPath, objectName, { expires: new Date("2050/02/25") });
        var retValue = null;

        if (sValue != null)
            retValue = this.parseToList(sValue);


        return retValue;
    },
    existsItem: function (objectName, oItem) {
        var oList = this.listItems(objectName);
        var bExist = false;
        if (oList != null) {
            bExist = (this.__existsItem(oList, oItem) != null);
        }
        return bExist;
    },
    __existsItem: function (oList, oItem) {
        var bExist = false;
        var retValue = null;
        if (typeof oList != "undefined" && oList != null) {
            for (var iCount = 0; iCount < oList.length; iCount++) {
                if (oList[iCount].id == oItem.id) {
                    retValue = iCount
                    break;
                }
            }
        }
        return retValue;
    },
    cleanList: function (objectName) {
        var URL = PJJS.Searcher.Commons.documentURL();
        PJJS.Searcher.Cookies.removeSub("searcher_" + URL.domain + URL.port + "_" + URL.firstPath, objectName, { expires: new Date("2050/02/25"),
            path: "/"/*,
            domain: "localhost"*/
        });
    },
    parseToList: function (strList) {
        var oList = [];
        if (strList != null) {
            var arrSplit = strList.split("||");
            for (var iCount = 0; iCount < arrSplit.length; iCount++)
                eval("oList.push({" + arrSplit[iCount] + "})");
        }
        return oList;
    },
    parseToString: function (oObject) {
        var RetValue = "";
        if (typeof oObject != "undefined" && oObject != null) {
            if (typeof oObject.length != "undefined") {
                for (var iCount = 0; iCount < oObject.length; iCount++) {
                    var item = oObject[iCount];
                    RetValue += "'id':'" + this.formatString(item.id) + "','desc':'" + this.formatString(item.desc) + "','info':'" + this.formatString(item.info) + "','searcher':'" + this.formatString(item.searcher) + "'||";
                }
            }
            else {
                RetValue += "'id':'" + this.formatString(oObject.id) + "','desc':'" + this.formatString(oObject.desc) + "','info':'" + this.formatString(oObject.info) + "','searcher':'" + this.formatString(oObject.searcher) + "'||";
            }
        }

        return RetValue.substring(0, RetValue.length - 2);
    },
    formatString: function (strValue) {
        //strValue = (strValue != null ? strValue : "").replace(/'/gi, "\\'");
        strValue = (strValue != null ? strValue : "").replace('\r\n', '');
        return strValue;
    }
}
//////////////////////////////////////////////////////////////////////////////////////////