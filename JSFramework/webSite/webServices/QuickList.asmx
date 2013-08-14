<%@ WebService Language="C#" Class="gridView" %>

using System;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.Collections.Generic;
using System.Linq;

[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
[System.Web.Script.Services.ScriptService]
public class gridView : System.Web.Services.WebService
{
    public class itemResult
    {
        public int id {get; set;}
        public string value {get; set;}
        public string info {get; set;}
    }

    [WebMethod]
    public object SearchValues(string filter)
    {
        List<itemResult> retVal = new List<itemResult>();
        retVal.Add(new itemResult() { id = 1, value = "item 1", info = "item info 1" });
        retVal.Add(new itemResult() { id = 2, value = "item 2", info = "item info 2" });
        retVal.Add(new itemResult() { id = 3, value = "item 3", info = "item info 3" });
        retVal.Add(new itemResult() { id = 4, value = "item 4", info = "item info 4" });
        retVal.Add(new itemResult() { id = 5, value = "item 5", info = "item info 5" });
        retVal.Add(new itemResult() { id = 6, value = "item 6", info = "item info 6" });
        retVal.Add(new itemResult() { id = 7, value = "item 7", info = "item info 7" });
        retVal.Add(new itemResult() { id = 8, value = "item 8", info = "item info 8" });
        retVal.Add(new itemResult() { id = 9, value = "item 9", info = "item info 9" });
        retVal.Add(new itemResult() { id = 10, value = "item 10", info = "item info 10" });
        retVal.Add(new itemResult() { id = 11, value = "item 11", info = "item info 11" });
        retVal.Add(new itemResult() { id = 12, value = "item 12", info = "item info 12" });
        retVal.Add(new itemResult() { id = 13, value = "item 13", info = "item info 13" });
        retVal.Add(new itemResult() { id = 14, value = "item 14", info = "item info 14" });
        retVal.Add(new itemResult() { id = 15, value = "item 15", info = "item info 15" });
        retVal.Add(new itemResult() { id = 16, value = "item 16", info = "item info 16" });
        retVal.Add(new itemResult() { id = 17, value = "item 17", info = "item info 17" });
        retVal.Add(new itemResult() { id = 18, value = "item 18", info = "item info 18" });
        retVal.Add(new itemResult() { id = 19, value = "item 19", info = "item info 19" });
        retVal.Add(new itemResult() { id = 20, value = "item 20", info = "item info 20" });
        retVal.Add(new itemResult() { id = 21, value = "item 21", info = "item info 21" });
        retVal.Add(new itemResult() { id = 22, value = "item 22", info = "item info 22" });
        retVal.Add(new itemResult() { id = 23, value = "item 23", info = "item info 23" });
        retVal.Add(new itemResult() { id = 24, value = "item 24", info = "item info 24" });
        retVal.Add(new itemResult() { id = 25, value = "item 25", info = "item info 25" });
        retVal.Add(new itemResult() { id = 26, value = "item 26", info = "item info 26" });
        retVal.Add(new itemResult() { id = 27, value = "item 27", info = "item info 27" });
        retVal.Add(new itemResult() { id = 28, value = "item 28", info = "item info 28" });
        retVal.Add(new itemResult() { id = 29, value = "item 29", info = "item info 29" });
        retVal.Add(new itemResult() { id = 30, value = "item 30", info = "item info 30" });
        retVal.Add(new itemResult() { id = 31, value = "item 31", info = "item info 31" });
        retVal.Add(new itemResult() { id = 32, value = "item 32", info = "item info 32" });
        retVal.Add(new itemResult() { id = 33, value = "item 33", info = "item info 33" });
        retVal.Add(new itemResult() { id = 34, value = "item 34", info = "item info 34" });
        retVal.Add(new itemResult() { id = 35, value = "item 35", info = "item info 35" });
        retVal.Add(new itemResult() { id = 36, value = "item 36", info = "item info 36" });
        retVal.Add(new itemResult() { id = 37, value = "item 37", info = "item info 37" });
        retVal.Add(new itemResult() { id = 38, value = "item 38", info = "item info 38" });
        retVal.Add(new itemResult() { id = 39, value = "item 39", info = "item info 39" });
        retVal.Add(new itemResult() { id = 40, value = "item 40", info = "item info 40" });


        System.Threading.Thread.Sleep(3000);
        
        return (from item in retVal where item.value.Contains(filter) select item);
    }
    
}