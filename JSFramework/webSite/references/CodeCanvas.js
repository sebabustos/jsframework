(function($)
{
    var formatCodeEngine = {
        Color:function (code)
        {
            var retVal = code;
            var matches = null;
            var start, end;
            if ((start = retVal.indexOf("//")) >= 0) {
                var htm = "";
                if((end = retVal.indexOf("\n")) >= 0)
                    htm = retVal.substring(start, end);
                else
                    htm = retVal.substring(start);

                retVal = retVal.replace(htm, "<font class='green'>" + htm + "</font>");
            }
            else{

                matches = retVal.match(/[^\\]{0,1}(\'|\")([\w\sáÁäéÉëíÍïóÓöúÚü\*/\\#<>:,;+-/.¿/?=%$@!{}/[])*[^\\]{0,1}(\'|\")/g);
                if(matches!=null)
                {
                    //primero se eliminan las cadenas para continuar con el coloreado
                    //estas se reemplazan por un código, que luego se va volver a reemplazar
                    //para evitar que se coloree dentro de una cadena.
                    for(var index=0;index<matches.length;index++)
                        retVal = retVal.replace(matches[index].substring(1),"{index="+index+"}");
                }
                retVal = retVal.replace(/(<|&lt;)(\s)*script(\s)*(>|&gt;)/g,"<font class='blue'>&lt;</font><font class='darkred'>script</font><font class='blue'>&gt;</font>");
                retVal = retVal.replace(/(<|&lt;)(\s)*\/(\s)*script(\s)*(>|&gt;)/g,"<font class='blue'>&lt;/</font><font class='darkred'>script</font><font class='blue'>&gt;</font>");


                retVal = formatCodeEngine.DoMatch(/(\(|>|;|^|\s)var /g,retVal, "var");
                retVal = formatCodeEngine.DoMatch(/(\s)in(\s)/g,retVal, "in");
                retVal = retVal.replace(/(>|;|^|\s)else /g,"<font class=\"blue\">else </font>");
                retVal = formatCodeEngine.DoMatch(/(>|;|^|\s)function(\(|\s)/g,retVal, "function");
                retVal = formatCodeEngine.DoMatch(/(>|;|^|\s)if(\(|\s)/g,retVal, "if");
                retVal = formatCodeEngine.DoMatch(/(>|;|^|\s)switch(\(|\s)/g,retVal, "switch");
                retVal = formatCodeEngine.DoMatch(/(>|;|^|\s)for(\(|\s)/g,retVal, "for");
                retVal = formatCodeEngine.DoMatch(/(>|;|^|\s)try(\{|\s)/g,retVal, "try");
                retVal = formatCodeEngine.DoMatch(/(>|;|^|\s)catch(\(|\s)/g,retVal, "catch");
                
                if(matches!=null)
                {
                    for(var index=0;index<matches.length;index++)
                    {
                        var str = matches[index].substring(1);
                        str = "<font class='darkred'>"+str+"</font>";
                        retVal = retVal.replace("{index="+index+"}",str);
                    }
                }
            }
            return retVal;
        },
        DoMatch:function (regex, string, reservedWord)
        {
            var retVal = string;
            var matches = retVal.match(regex);
            if(matches!=null)
            {
                var prefix, sufix;
                prefix = matches[0].substring(0,matches[0].indexOf(reservedWord));
                sufix = matches[0].substring(matches[0].indexOf(reservedWord)+reservedWord.length);

                retVal = retVal.replace(regex,prefix+"<font class=\"blue\">"+ reservedWord +"</font>"+sufix);
            }
            return retVal;
        }
    };

    $.fn.outerHTML=function(){
		if(this.length>0)
		{
			if(this.length>1)
			{
				var html = [];
				this.each(function(index){
					html.push($("<div></div>").append(this[index].clone).html());
				})
				return html;
			}
			else
				return $("<div></div>").append(this.clone()).html();
		}
		return null;
	};

    $.fn.formatCode = function(){
        return $(this).each(function(){
                var arr = $(this).text().split("\n");
                var newHTML="";
                for(var index in arr)
                {
                    var newLine = $("<p></p>");
                    newLine.html(formatCodeEngine.Color(arr[index]));
                    var spaces = arr[index].search(/\S/);
                    newLine.css({ marginLeft: 5 * spaces});
                    newHTML +=newLine.outerHTML();
                }
                var divRoot = $("<div><div formatCodeid='divCodeContainer' class='CodeContainer'>ver/ocultar código</div><div formatCodeidId='divCodeBody' class='CodeBody' style='display:none'></div></div>");
                var divCode = $("<div></div>",{'class':'code', 'id':$(this).attr("id")});
                divCode.html(newHTML);
                var divCodeContainer = $("[formatCodeid=divCodeContainer]", divRoot);

                divCodeContainer.click(function () {
                    $("[formatCodeidId=divCodeBody]", $(this).parent()).toggle();
                });
                divRoot.insertAfter($(this));
                $("[formatCodeidId=divCodeBody]", divRoot).append(divCode);
                $(this).remove();
            })    


    }
})(jQuery);