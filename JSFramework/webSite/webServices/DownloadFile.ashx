<%@ WebHandler Language="C#" Class="DownloadFile" %>

using System;
using System.Web;

public class DownloadFile : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/force-download";
        context.Response.AddHeader("Content-disposition", "attachment; filename=indicator.gif");
        string uid = context.Request.QueryString["uid"];
        HttpCookie downloadComplete = new HttpCookie("downloadedFile",uid);
        context.Response.Cookies.Add(downloadComplete);
            System.Threading.Thread.Sleep(5000);
            context.Response.WriteFile(context.Server.MapPath("~/Images/indicator.gif"));
        context.Response.Flush();
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}