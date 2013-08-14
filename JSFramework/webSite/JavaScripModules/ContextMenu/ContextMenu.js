/*
================================================================
                        VERSIÓN
================================================================
Código:       | ContextMenu - 2012-02-12 - v1.0.0.0
----------------------------------------------------------------
Nombre:       | ContextMenu
----------------------------------------------------------------
Tipo:         | PLUGIN
----------------------------------------------------------------
Descripción:  | muestra un menú contextual al presionar el botón 
              | derecho sobre el control.
----------------------------------------------------------------
Autor:        | Seba Bustos
----------------------------------------------------------------
Versión:      | v1.0.0.0
----------------------------------------------------------------
Fecha:        | 2012-02-16
----------------------------------------------------------------
Cambios de la Versión:
- 
================================================================
                    FUNCIONALIDADES
================================================================
- Mostra con el botón derecho.
- Definir el control sobre el cual se debe presionar el botón
  derecho, o bien el body
- Reemplazar el menú contextual del browser
- estética tipo jquery.
- mostrar un json en duro,
- obtener el menú por ajax cada vez.
- cachar el ajax (que busque la primera vez y después no lo use más)
- PLUGIN DE JQUERY QUE MUESTRE EN UN MENÚ CONTEXTUAL UN CONTROL
- Asociar un control para que al presionarlo se muestre.
- modal (si se muestra el context menu se deshabilita todo)
================================================================
                    POSIBLES MEJORAS
================================================================
- mostrar un texto en duro?
- MenuItem Type == image|text|both
================================================================
                   HISTORIAL DE VERSIONES
================================================================
Código:       [código del producto]
Autor:        [Autor]
Cambios de la Versión:
- [Cambios que incluyó la versión]
================================================================
*/

(function ($) {
    var $default = {
        useJQueryUI: true,
        showOnEmpty: false,       // Establece si debe mostrar o no el menu, si el innerText del div est vaco.
        mouseOverContext: false,         // is the mouse over the context menu?
        datasource: {},                  // URL o array ó función
        datasourceType: null,            // null (para que por defecto defina entre json, y URL) | "control"
        title: null,
        cache: true,
        offset: "10 10",
        ajaxConfig: {
            async: true,
            type: "POST",
            dataType: 'json',
            data: '{}',
            contentType: 'application/json; charset=utf-8'
        },
        onItemSelected: function () { },
        autoClose: 5000,
        showOn: 'rightClick', //'leftClick', 'middleClick'
        showModal: false
    };
    var internalMethods = {
        getContextMenu: function (opts, contextMenuId, type) {
            var settings = $.extend({}, $default, opts);

            var divContextMenu = $("<div divContextMenuId='" + contextMenuId + "' contextMenuType='" + type + "' class='ContextMenu' style='display:none;position:absolute;top:0px;left:0px;'></div>");
            var divTitle = $("<div class='ContextMenuTitle'></div>");
            if (typeof settings.title !== "undefined" && settings.title !== null)
                divTitle.html(settings.title);

            var divBody = $("<div class='ContextMenuBody'></div>");

            divContextMenu.append(divTitle).append(divBody);

            if (typeof settings.datasource !== "undefined" && settings.datasource !== null) {
                if (settings.datasourceType != "control") {
                    //array
                    if (typeof settings.datasource === "object") {
                        divBody.append(internalMethods.drawMenuItems(settings.datasource, settings, contextMenuId));
                    }
                    //function
                    else if (typeof settings.datasource === "function") {
                        divBody.append(internalMethods.drawMenuItems(settings.datasource($this[0]), settings, contextMenuId));
                    }
                    //web service URL
                    else if (typeof settings.datasource === "string") {
                        loadWSDataSource(settings, contextMenuId);
                    }
                }
                else {
                    //TODO_SEBA: obtener el control de template.
                    divBody.append($(settings.datasource));
                }
            }
            if (settings.autoClose > 0) {
                divContextMenu.mouseenter(function () {
                    var toId;
                    if ((toId = divContextMenu.attr("timeOutId")) != null)
                        window.clearTimeout(toId);
                }).mouseleave(function () {
                    var toId = window.setTimeout(function () {
                        methods.close(contextMenuId);
                    }, settings.autoClose);

                    divContextMenu.attr("timeOutId", toId);

                });
            }

            divContextMenu.bind("contextmenu", function () { return false; });


            if (settings.useJQueryUI) {
                divContextMenu.addClass("ui-widget ui-widget-content ui-corner-all");
                //divContextMenu.addClass("ui-widget ui-widget-content ui-corner-all").css({paddingLeft:20,paddingRight:20,});
                divTitle.addClass("ui-widget-header");
                divBody.addClass("ui-widget-content");

                $("[contextMenuItemIndex]", divContextMenu).addClass("ui-state-default").mouseenter(
                    function () {
                        $(this).addClass("ui-state-hover");
                    }
                ).mouseleave(function () {
                    $(this).removeClass("ui-state-hover");
                });
            }

            return divContextMenu;
        },
        loadWSDataSource: function (settings, contextMenuId) {
            $.ajax({
                async: settings.ajaxConfig.async,
                type: settings.ajaxConfig.type,
                url: settings.dataSource,
                data: {},
                dataType: settings.ajaxConfig.dataType,
                contentType: settings.ajaxConfig.contentType,
                success: function (data, textStatus, jqXHR) {

                    if (data.hasOwnProperty("d"))
                        data = data.d;
                    var contextMenuBody = $(".ContextMenuBody", $("[divContextMenuId='" + contextMenuId + "']"));
                    contextMenuBody.append(internalMethods.drawMenuItems(data.result), settings, contextMenuId);

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    drawMessage(gridViewId, "Se produjo un error al intentar realizar la búsqueda. <br/> Intente nuevamente más tarde.");
                    if (settings.onError != null && onError instanceof Function)
                        settings.onError(jqXHR, textStatus, errorThrown);
                }
            });
        },
        drawMenuItems: function (data, settings, contextMenuId) {
            var result = "";
            $.each(data, function (index, item) {
                result += "<div class='ContextMenuItem' contextMenuItemIndex='" + index + "' contextMenuItemId='" + item.id + "'>" + item.value + "</div>";
            });

            return $(result).click(function () {
                settings.onItemSelected(this, $(this).attr("contextMenuItemIndex"), $(this).attr("contextMenuItemId"));
                methods.close(contextMenuId);
            });
        }
    }
    var methods = {
        close: function ($this) {
            if (typeof $this === "string")
                $this = $("[contextMenuId='" + $this + "']");

            //este método se utiliza tanto en el plugin como en la funcionalidad. La ppal diferencia radica en que en la funcionalidad
            //no existe un control asociado que tiene el atributo ContextMenuId, sino que en la funcionalidad el mismo menu
            //es el controlador, que contiene el atributo divContextMenuId.
            var divContextMenu = null;
            if (typeof $this.attr("divContextMenuId") !== "undefined") {
                divContextMenu = $this;
            }
            else {
                divContextMenu = $("[divContextMenuId='" + $this.attr("contextMenuId") + "']");
            }

            if ($this.length > 0) {
                var settings = $.extend({}, $default, $this.data("contextMenu_options"));

                if (settings.cache) {
                    divContextMenu.hide();
                    $("[divContextMenuCourtainId='" + $this.attr("contextMenuId") + "']").remove();
                }
                else
                    this.destroy($this); //divContextMenu.remove();
            }

        },
        show: function ($this, position) {
            var settings = $.extend({}, $default, $this.data("contextMenu_options"));
            var offs = { top: 0, left: 0 };
            if (typeof settings.offset !== "undefined" && settings.offset !== null) {
                var arrOff = settings.offset.split(" ");
                if (arrOff.length > 0) {
                    offs.top = parseFloat(arrOff[0]);
                    offs.left = offs.top;
                }
                else if (arrOff.length > 1)
                    offs.left = parseFloat(arrOff[1]);

            }

            if (typeof position === "undefined" || position === null || position === "")
                position = $this.position();

            //este método se utiliza tanto en el plugin como en la funcionalidad. La ppal diferencia radica en que en la funcionalidad
            //no existe un control asociado que tiene el atributo ContextMenuId, sino que en la funcionalidad el mismo menu
            //es el controlador, que contiene el atributo divContextMenuId.
            var divContextMenu;
            if (typeof $this.attr("divContextMenuId") !== "undefined")
                divContextMenu = $this;
            else
                divContextMenu = $("[divContextMenuId='" + $this.attr("contextMenuId") + "']");

            var toId;
            if (typeof (toId = divContextMenu.attr("timeOutId")) !== "undefined" && toId !== null) {
                window.clearTimeout(toId);
            }

            if (settings.showOnEmpty || (!settings.showOnEmpty && $("[contextMenuItemIndex]", divContextMenu).length > 0)) {
                divContextMenu.css({ top: (position.top + offs.top), left: (position.left + offs.left), zIndex: 100 }).show().focus();
                toId = window.setTimeout(function () {
                    methods.close($this);
                }, settings.autoClose);

                divContextMenu.attr("timeOutId", toId);

                if (settings.showModal != null && settings.showModal === true) {
                    var courtain = $("<div divContextMenuCourtainId='" + $this.attr("contextMenuId") + "'></div>");

                    if (settings.useJQueryUI) {
                        courtain.addClass("ui-widget-overlay");
                    }
                    else {
                        courtain.css({
                            position: "absolute",
                            width: $(window).width(),
                            height: $(window).height(),
                            zIndex: 99
                        });
                    }
                    courtain.appendTo($("body"));
                }
            }

        },
        destroy: function ($this) {
            if (typeof $this === "string")
                $this = $("[contextMenuId='" + $this + "']");

            //este método se utiliza tanto en el plugin como en la funcionalidad. La ppal diferencia radica en que en la funcionalidad
            //no existe un control asociado que tiene el atributo ContextMenuId, sino que en la funcionalidad el mismo menu
            //es el controlador, que contiene el atributo divContextMenuId.
            var divContextMenu = null;
            if (typeof $this.attr("divContextMenuId") !== "undefined") {
                divContextMenu = $this;
            }
            else {
                divContextMenu = $("[divContextMenuId='" + $this.attr("contextMenuId") + "']");
            }

            if (divContextMenu != null && divContextMenu.length > 0) {
                if (divContextMenu.attr("contextMenuType") == "plugin") {
                    $this.removeAttr("contextMenuId").removeAttr("contextMenu_options");
                }
                divContextMenu.remove();

                $("[divContextMenuCourtainId='" + $this.attr("contextMenuId") + "']").remove();
            }

        }
    };
    var contexMenuIdAvailables = 0;

    /////////////////////////
    //FUNCIÓN
    /////////////////////////
    $.contextMenu = function (options) {
        var settings = $.extend({}, $default, options);

        if (typeof settings.datasource === "string") {
            if (!options.hasOwnProperty("cache")) {
                settings.cache = false;
                options.cache = false;
            }
        }

        var contextMenuId = contexMenuIdAvailables;
        if (typeof options.name !== "undefined" && options.name !== "") {
            methods.destroy(contextMenuId = options.name);
        }
        else
            contexMenuIdAvailables++;

        var ctxMenu = internalMethods.getContextMenu(options, contextMenuId, "standalone");
        ctxMenu.data("contextMenu_options", options);
        ctxMenu.showMenu = function (position) {
            if (typeof position === "undefined")
                position = { top: 0, left: 0 };

            methods.show(this, position);
        };
        ctxMenu.hideMenu = function () {
            methods.close(this);
        };

        ctxMenu.appendTo("body");

        return ctxMenu;
    }
    /////////////////////////
    //PlugIN
    /////////////////////////
    $.fn.contextMenu = function (options) {
        if (typeof options === "string") {
            if (typeof this.attr("contextMenuId") === "undefined" && this.attr("contextMenuId") === "") {
                alert("Debe inicializar el menú contextual");
                return false;
            }

            if (options.toLowerCase() === "show")
                methods.show(this);
            else if (options.toLowerCase() === "close")
                methods.close(this);

            return;
        }



        var settings = $.extend({}, $default, options);

        function init($this) {
            $("body").bind("mousedown", function (a) {
                if (a.target != $this[0] && (typeof $(a.target).attr("contextMenuItemIndex") === "undefined")) {
                    $("[divContextMenuId]").each(function () {
                        var contextMenuId = $(this).attr("divContextMenuId");
                        $("[ContextMenuId=" + contextMenuId + "]").contextMenu("close");
                    });
                }
            });
            $.each($this, function (index, item) {
                //si es un webService y el usuario no configuró, explícitamente, el cache; entonces se deshabilita el cache, 
                //de manera que siempre busque los datos.
                if (typeof settings.datasource === "string") {
                    if (!options.hasOwnProperty("cache")) {
                        settings.cache = false;
                        options.cache = false;
                    }
                }
                var contextMenuId = contexMenuIdAvailables;
                $(item).attr("contextMenuId", contextMenuId);
                contexMenuIdAvailables++;
                $(item).data("contextMenu_options", options);

                if (settings.cache) {
                    drawContextMenu($(item));
                    $(item).mousedown(function (b) {
                        //showOn: 'rightClick', 'leftClick', 'middleClick'
                        if ((settings.showOn.toLowerCase() == 'leftclick' && b.which == 1) ||
                        (settings.showOn.toLowerCase() == 'middleclick' && b.which == 2) ||
                        (settings.showOn.toLowerCase() == 'rightclick' && b.which == 3)) {
                            this.oncontextmenu = function () { return false; }
                            methods.show($(item));
                        }
                    });
                }
                else {
                    $(item).mousedown(function (b) {
                        //si el botón presionado es el derecho.
                        if ((settings.showOn.toLowerCase() == 'leftclick' && b.which == 1) ||
                        (settings.showOn.toLowerCase() == 'middleclick' && b.which == 2) ||
                        (settings.showOn.toLowerCase() == 'rightclick' && b.which == 3)) {

                            this.oncontextmenu = function () { return false; }
                            methods.close();
                            drawContextMenu($(item));
                            methods.show($(item));
                        }
                    });
                }
            });
        }

        function drawContextMenu($this) {
            var opts = $this.data("contextMenu_options");
            var contextMenuId = $this.attr("contextMenuId");

            var divContextMenu = internalMethods.getContextMenu(opts, contextMenuId, "plugin");

            divContextMenu.appendTo("body");

            return divContextMenu;
        }

        init(this)

        return this;
    }


})(jQuery);
