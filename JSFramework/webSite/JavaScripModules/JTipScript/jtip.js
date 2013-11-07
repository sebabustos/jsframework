/*//////////////////////////////////////////////////////////////////////////////////////////
Dependencias:
    jquery-ui.min.js
    jquery.js        
//////////////////////////////////////////////////////////////////////////////////////////*/
/* Built Fri May 12 12:53:18 2006 */


/*
* JTip
* By Cody Lindley (http://www.codylindley.com)
* Under an Attribution, Share Alike License
* JTip is built on top of the very light weight jquery library.
*/
//on page load (as soon as its ready) call JT_init
$(window).load(function () {
    JT_init();
});

var bHideMenu = false;
var isMenuShow = false;
var isMenuLocked = false;
var isDragging = false;
////////////////////////////////////////////////
function JT_init() {
    $(".jTip")
   .hover(function () { JT_show(this.previewURL, this.id, this.name, this.target, this.componentValue) }, function () { bHideMenu = true; window.setTimeout("JT_Hide('JT')", 500) })
    //.click(function(){return false});	   
}
////////////////////////////////////////////////
function JT_remove(linkId, time) {
    bHideMenu = true
    window.setTimeout("JT_Hide('" + linkId + "')", 1700)
}
////////////////////////////////////////////////
function JT_Hide(linkId, ForceClose) {
    if (ForceClose || ((bHideMenu) && (!isMenuLocked))) {
        var source = document.getElementById(linkId);
        if (source != null) {
            isMenuShow = false;
            RemoveFromOverlapedObj(linkId);
            source.parentNode.removeChild(source);
        }
        bHideMenu = false;
        isMenuLocked = false;
    }
}
////////////////////////////////////////////////
function JT_show(url, linkId, title, componentValue) {
    try {
        if (!isMenuShow) {
            if (title == false)
                title = "&nbsp;";
            var de = document.documentElement;
            var oLinkElement = document.getElementById(linkId);
            var bShow = true;
            if (componentValue) {
                var oCompValue = document.getElementById(componentValue);
                if (oCompValue) {
                    if (oCompValue.value != "") {
                        url = url.replace("[ID]", oCompValue.value);
                        var oLinkId = document.getElementById(linkId);
                        if ((oLinkId) && (oLinkId.parentElement) && (oLinkId.parentElement.href)) {
                            var strLink = oLinkId.parentElement.href;
                            strLink = strLink.replace("[ID]", oCompValue.value);
                            oLinkId.parentElement.href = strLink;
                        }
                    }
                    else
                        bShow = false;
                }
            }
            if (bShow) {
                var Width = self.innerWidth || (de && de.clientWidth) || document.body.clientWidth;
                var pLinkIdPosition = GetElementLayout(document.getElementById(linkId))
                var hasArea = Width - pLinkIdPosition.Left;
                var clickElementy = pLinkIdPosition.Top + 17; //set y position
                var queryString = url.replace(/^[^\?]+\??/, '');
                var params = parseQuery(queryString);
                if (params['width'] === undefined)
                    params['width'] = 250;
                if (params['link'] !== undefined) {
                    oLinkElement.style.cursor = 'pointer';
                }
                var divPreview = "";
                var arrowOffset = 0;
                var oDiv = document.createElement("DIV")
                oDiv.id = "JT";
                oDiv.style.width = params['width'] * 1 + "px";
                if (params['height'] != undefined)
                    oDiv.style.height = params['height'] * 1 + "px";


                if (hasArea > ((params['width'] * 1) + 75))
                    arrowOffset = getElementWidth(linkId) + 11;
                else
                    arrowOffset = (-1) * ((params['width'] * 1) + 15)
                oDiv.innerHTML = GetToolTipHTML(title);
                document.body.appendChild(oDiv)
                $("#JT").css("cursor", "move");
                $("#imgPinUnlock").css("cursor", "pointer");
                $("#JT").draggable({
                    start: function (event, src) { OnOnDragToolTipStart(event, src) },
                    drag: function (event, src) { OnDragToolTip(event, src) },
                    stop: function (event, src) { OnOnDragToolTipEnd(event, src) },
                    opacity: 0.5
                });
                var clickElementx = pLinkIdPosition.Left + arrowOffset; //set x position
                try {
                    var oElem = document.getElementById(componentValue.split("$")[0]);
                    clickElementx = GetElementLayout(oElem).Left;
                }
                catch (e)
                { }


                $("#JT").hover(function () { ToolTipMouseOver() })
                $("#JT").mouseleave(function () { ToolTipMouseLeave() })
                $('#JT').css({ left: clickElementx + "px", top: clickElementy + "px" });
                $('#JT').show();
                $('#JT_copy').load(url);

                //si hay combos encima del area los oculto.
                OcultarControles(document.getElementById("JT"));
                bHideMenu = false;
                isMenuShow = true;
            }
        }
    }
    catch (e) {
        alert("JTShow: " + e.Message);
    }

}
////////////////////////////////////////////////
function GetToolTipHTML(title) {
    var divPreview = "";
    divPreview = "<img src='"+ linkPreview.Images.prevFlecha + "' id='JT_Arrow' class='Flecha' >";
    divPreview += "<table width='100%' cellspacing='0' cellpadding='0'>"
    divPreview += "<tr>"
    divPreview += "<td class='Top_Left' style='background-image: url(" + linkPreview.Images.PrevArriba_izq + ");'>"
    divPreview += "</td>"
    divPreview += "<td class='Top' style='background-image: url(" + linkPreview.Images.PrevArriba + ");'>" + title + "</td>"
    divPreview += "<td class='Top_Right' style='background-image: url(" + linkPreview.Images.PrevArriba_der + ");'>"
    divPreview += "<img id=\"imgPinUnlock\" class=\"PinUnlock\" src='" + linkPreview.Images.pin_UnLocked + "' onclick='LockPreview(event, this)' >"
    divPreview += "</td>"
    divPreview += "</tr>"
    divPreview += "<tr>"
    divPreview += "<td class='Left' style='background-image: url(" + linkPreview.Images.PrevIzquierda + ");'>&nbsp;</td>"
    divPreview += "<td class='Middle'style='background-image: url(" + linkPreview.Images.PrevMedio + ");'>"
    divPreview += "<div id='JT_copy'>"
    divPreview += "<div class='JT_loader' style='background-image: url(" + linkPreview.Images.Loader + ");'>"
    divPreview += "</div>"
    divPreview += "</div>"
    divPreview += "</td>"
    divPreview += "<td class='Right' style='background-image: url(" + linkPreview.Images.PrevDerecha + ");'>&nbsp;</td>"
    divPreview += "</tr>"
    divPreview += "<tr>"
    divPreview += "<td class='Bottom_Left' style='background-image: url(" + linkPreview.Images.PrevAbajo_izq + ");'>&nbsp;</td>"
    divPreview += "<td class='Bottom' style='background-image: url(" + linkPreview.Images.PrevAbajo + ");'>&nbsp;</td >"
    divPreview += "<td class='Bottom_Right' style='background-image: url(" + linkPreview.Images.PrevAbajo_der + ");'>&nbsp;</td>"
    divPreview += "</tr>"

    divPreview += "</table>";

    return divPreview;
}
////////////////////////////////////////////////
function ToolTipMouseOver() {
    bHideMenu = false;
}
////////////////////////////////////////////////
function ToolTipMouseLeave() {
    if (!isDragging)
        JT_remove("JT");
}
////////////////////////////////////////////////
function LockPreview(evt, src) {
    if (typeof evt == "undefined" || evt == null) {
        evt = window.event;
        src = window.event.srcElement
    }

    if (isMenuLocked) {
        isMenuLocked = false;
        src.className = "PinUnlock"
        src.src = linkPreview.Images.pin_UnLocked;
    }
    else {
        isMenuLocked = true;
        src.className = "PinLock"
        src.src = linkPreview.Images.pin_Locked;
    }
}
////////////////////////////////////////////////
function OnDragToolTip(evt, src) {
    OcultarControles(document.getElementById("JT"),true);
}
////////////////////////////////////////////////
function OnOnDragToolTipStart(evt, src) {
    try {
        var jtArrow = $("#JT_Arrow", src.helper);
        jtArrow.hide();
        src.helper.css("cursor", "move")
        isDragging = true;
    }
    catch (e) {
    }
    return true;
}

function OnOnDragToolTipEnd(evt, src) {
    try {
        src.helper.css("cursor", "");
        isDragging = false;
    }
    catch (e) {
    }
    return true;
}

////////////////////////////////////////////////
function getElementWidth(objectId) {
    x = document.getElementById(objectId);
    return x.offsetWidth;
}
////////////////////////////////////////////////
function getAbsoluteLeft(objectId) {
    // Get an object left position from the upper left viewport corner
    o = document.getElementById(objectId)
    oLeft = o.offsetLeft            // Get left position from the parent object
    while (o.offsetParent != null) {   // Parse the parent hierarchy up to the document element
        oParent = o.offsetParent    // Get parent object reference
        oLeft += oParent.offsetLeft // Add parent left position
        o = oParent
    }
    return oLeft
}

////////////////////////////////////////////////
function getAbsoluteTop(objectId) {
    // Get an object top position from the upper left viewport corner
    o = document.getElementById(objectId)
    oTop = o.offsetTop            // Get top position from the parent object
    while (o.offsetParent != null) { // Parse the parent hierarchy up to the document element
        oParent = o.offsetParent  // Get parent object reference
        oTop += oParent.offsetTop // Add parent top position
        o = oParent
    }
    return oTop
}

////////////////////////////////////////////////
function parseQuery(query) {
    var Params = new Object();
    if (!query) return Params; // return empty object
    var Pairs = query.split(/[;&]/);
    for (var i = 0; i < Pairs.length; i++) {
        var KeyVal = Pairs[i].split('=');
        if (!KeyVal || KeyVal.length != 2) continue;
        var key = unescape(KeyVal[0]);
        var val = unescape(KeyVal[1]);
        val = val.replace(/\+/g, ' ');
        Params[key] = val;
    }
    return Params;
}

////////////////////////////////////////////////
function blockEvents(evt) {
    if (evt.target) {
        evt.preventDefault();
    } else {
        evt.returnValue = false;
    }
}
/////////////////////////////////////
function getElementsByClass(node, searchClass, tag) {
    var classElements = new Array();
    var els = node.getElementsByTagName(tag); // use "*" for all elements
    var elsLen = els.length;
    var pattern = new RegExp(searchClass);
    for (i = 0, j = 0; i < elsLen; i++) {
        if (pattern.test(els[i].className)) {
            classElements[j] = els[i];
            j++;
        }
    }
    return classElements;
}
/////////////////////////////////////
/////////////////////////////////////
//REGION Ocultamiento de combos
var arrOverlapedObjects = [];
var isNetscape
var isMSIE = true;
var isIE5orOlder;
var isGeckoBrowser
var isOpera
var BrowserVersion
var isGeckoWithVersionLowThan6
DefineBrowser();
////////////////////////////////////////////////////////////////////
function OcultarControles(oElem, RemoveFromOverlaped) {
    var oMenuItem = document.getElementById(oElem.id);
    var oMenuItemLayout = GetElementLayout(oMenuItem);
    //		alert(oMenuItem)
    //		alert(oMenuItemLayout)
    if (RemoveFromOverlaped)
        RemoveFromOverlapedObj(oMenuItem.id);

    if (isMSIE)
        HideObjectsByTag(oMenuItemLayout, "SELECT", oMenuItem.id, oElem);
    /*        if((isGeckoBrowser&&BrowserVersion<7)||isOpera)
    HideObjectsByTag(oMenuItemLayout,"IFRAME",oMenuItem.id,oElem);
    */
    HideObjectsByTag(oMenuItemLayout, "APPLET", oMenuItem.id, oElem);
};
/////////////////////////////////////////////////////////////////////
function MostrarControles(oElem) {
    RemoveFromOverlapedObj(oElem.id);
}
/////////////////////////////////////////////////////////////////////
function HideObjectsByTag(oLayout, tag, id, oElem) {
    try {
        $(tag).each(function (index, src) {
            var oObjectLayout = GetElementLayout(src);
            if ((src.style.visibility != "hidden") && (IsContained(oObjectLayout, oLayout) || IsContained(oLayout, oObjectLayout) || IsCrossByArea(oObjectLayout, oLayout))) {
                src.style.visibility = "hidden";
                arrOverlapedObjects[arrOverlapedObjects.length] = id;
                arrOverlapedObjects[arrOverlapedObjects.length] = src;
            }
        }
        )
    }
    catch (e) {
        alert(e.message);
    }
};
/////////////////////////////////////////////////////////////////////
///GetElementLayout:
/// Devuelve un array con el Left, Top, Height y Width del objeto recibido 
///por parámetro.
/// El left y top que devuelve es el absolute.
function GetElementLayout(o) {
    try {
        var oLayout = { Left: $(o).offset().left, Top: $(o).offset().top, Width: $(o).width(), Height: $(o).height() };
        return oLayout;
    }
    catch (e)
    { }
};
/////////////////////////////////////////////////////////////////////
///IsContained:
/// Valida si el parametro 1 (oLayoutContained) se encuentra dentro de los límites del
///parámetro 2 (oLayoutContainer)
///<param name="oLayoutContained">array. Layout (left, top, width, height) a validar si se encuentra dentro del otro.</param>
///<param name="oLayoutContainer">array. Layout (left, top, width, height) contenedor, es el que se usa para ver si "oLayoutContained" se encuentra dentro.</param>
function IsContained(oLayoutContained, oLayoutContainer) {
    try {
        var left = oLayoutContained.Left//oLayoutContained[0];
        var OffsetWidth = oLayoutContained.Left + oLayoutContained.Width; //oLayoutContained[0]+oLayoutContained[2];
        var top = oLayoutContained.Top;
        var OffsetHeight = oLayoutContained.Top + oLayoutContained.Height;
        if (IsInArea(left, top, oLayoutContainer) || IsInArea(left, OffsetHeight, oLayoutContainer) || IsInArea(OffsetWidth, top, oLayoutContainer) || IsInArea(OffsetWidth, OffsetHeight, oLayoutContainer))
            return true;
        return false;
    }
    catch (e)
    { }
};
/////////////////////////////////////////////////////////////////////
///IsInArea:
/// Valida si las coordenadas recibidas (Left y Top) se encuentran dentro del área especificada (oAreaLayout)
///<param name="Left">int.Coordenada en X </param>
///<param name="Top">int. Coordenada en Y</param>
///<param name="oAreaLayout">array. Area.</param>
function IsInArea(Left, Top, oAreaLayout) {
    try {
        if ((Left >= oAreaLayout.Left && Left <= (oAreaLayout.Left + oAreaLayout.Width)) && (Top >= oAreaLayout.Top && Top <= (oAreaLayout.Top + oAreaLayout.Height)))
            return true;
        return false;
    }
    catch (e)
    { }
};

function IsCrossByArea(ElementLayout, AreaLayout) {
    try {
        var Left = ElementLayout.Left;
        var OffsetWidth = ElementLayout.Left + ElementLayout.Width;
        var Top = ElementLayout.Top;
        var OffsetHeight = ElementLayout.Top + ElementLayout.Height;

        if (Left < AreaLayout.Left && OffsetWidth > (AreaLayout.Left + AreaLayout.Width) && Top > AreaLayout.Top && (OffsetHeight < AreaLayout.Top + AreaLayout.Height))
            return true;
        return false;
    }
    catch (e)
    { }
};

/////////////////////////////////////////////////////////////////////
///RemoveFromOverlapedObj:
/// Verifica si en el array de objetos soslapados se encuentra el objeto con el id 
///indicado por parámetro y si lo encuentra lo coloca visible y lo quita del array.
///Además si no quedan objetos en el array lo inicializa.
function RemoveFromOverlapedObj(Id) {
    try {
        if (arrOverlapedObjects.length > 0) {
            for (var intCount = 0; intCount < arrOverlapedObjects.length; intCount += 2) {
                if (arrOverlapedObjects[intCount] == Id) {
                    arrOverlapedObjects[intCount + 1].style.visibility = "visible";
                    arrOverlapedObjects[intCount] = null;
                    arrOverlapedObjects[intCount + 1] = null;
                };
            };
            var bFlag = true;
            for (intCount = 0; intCount < arrOverlapedObjects.length; intCount += 2) {
                if (arrOverlapedObjects[intCount]) {
                    bFlag = false;
                    break;
                };
            };

            if (bFlag)
                arrOverlapedObjects = [];
        };
    }
    catch (e)
    { }
};
/////////////////////////////////////////////////////////////////////
function DefineBrowser() {
    try {
        var strUserAgent = navigator.userAgent;
        var strNavigatorName = navigator.appName;
        var strNavVersion = navigator.appVersion;
        bIsMachintosh = strNavVersion.indexOf("Mac") >= 0;
        var isAppleBrowser = (parseInt(navigator.productSub) >= 20020000) && (navigator.vendor.indexOf("Apple Computer") != -1);
        var isAppleGeckoBrowser = isAppleBrowser && (navigator.product == "Gecko");
        if (isAppleGeckoBrowser) {
            isGeckoBrowser = 1;
            BrowserVersion = 6;
            return;
        };
        if (strUserAgent.indexOf("Opera") >= 0) {
            isOpera = 1;
            BrowserVersion = parseFloat(strUserAgent.substring(strUserAgent.indexOf("Opera") + 6, strUserAgent.length));
        }
        else if (strNavigatorName.toLowerCase() == "netscape") {
            if (strUserAgent.indexOf("rv:") != -1 && strUserAgent.indexOf("Gecko") != -1 && strUserAgent.indexOf("Netscape") == -1) {
                isNetscape = 1;
                BrowserVersion = parseFloat(strUserAgent.substring(strUserAgent.indexOf("rv:") + 3, strUserAgent.length));
            }
            else {
                isGeckoBrowser = 1;
                if (strUserAgent.indexOf("Gecko") != -1 && strUserAgent.indexOf("Netscape") > strUserAgent.indexOf("Gecko")) {
                    if (strUserAgent.indexOf("Netscape6") > -1)
                        BrowserVersion = parseFloat(strUserAgent.substring(strUserAgent.indexOf("Netscape") + 10, strUserAgent.length));
                    else if (strUserAgent.indexOf("Netscape") > -1)
                        BrowserVersion = parseFloat(strUserAgent.substring(strUserAgent.indexOf("Netscape") + 9, strUserAgent.length));
                }
                else
                    BrowserVersion = parseFloat(strNavVersion)
            ;
            }
            ;
        }
        else if (document.all ? 1 : 0) {
            isMSIE = 1;
            BrowserVersion = parseFloat(strUserAgent.substring(strUserAgent.indexOf("MSIE ") + 5, strUserAgent.length));
        };

        isGeckoWithVersionLowThan6 = isGeckoBrowser && BrowserVersion < 6;
        isIE5orOlder = isMSIE && BrowserVersion >= 5;
        bIsBody = isMSIE || (isOpera && BrowserVersion >= 7);
    }
    catch (e)
    { }
};
//ENDREGION

