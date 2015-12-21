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
    public class ItemData
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string HiddenValue { get; set; }
        public string PreviewValue { get; set; }
    }

    private static List<ItemData> dataSource;
    public static List<ItemData> DataSource
    {
        get
        {
            if (dataSource == null)
            {
                List<ItemData> retVal = new List<ItemData>();
                Random rand = new Random(System.DateTime.Now.Millisecond);
                for (int index = 0; index < 40; index++)
                {
                    ItemData newItem = new ItemData() { Id = rand.Next(), Description = RandomString(rand.Next(10, 20), rand), PreviewValue = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." };
                    newItem.HiddenValue = string.Format("{0} - {1}", newItem.Id, newItem.Description);
                    retVal.Add(newItem);
                }
                dataSource = retVal;
            }
            return dataSource;
        }
    }

    public static string RandomString(int length, Random random)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return new string(Enumerable.Repeat(chars, length)
          .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    [WebMethod]
    public object SearchValues(string filterData, int pageSize, int pageIndex)
    {
        var result = DataSource.Where(x => x.Description.StartsWith(filterData, StringComparison.CurrentCultureIgnoreCase));

        return new { totalRecords = result.Count(), result = result.Skip(pageIndex * pageSize).Take(pageSize) };
    }

    [WebMethod]
    public object SearchValuesSort(string filterData, int pageSize, int pageIndex, string sortColumn, string sortDirection)
    {
        System.Threading.Thread.Sleep(1000);
        Func<ItemData, Object> orderByFunc = null;
        if (!string.IsNullOrWhiteSpace(sortColumn))
        {
            switch (sortColumn.ToLower())
            {
                case "id":
                    orderByFunc = x => x.Id;
                    break;
                case "description":
                    orderByFunc = x => x.Description;
                    break;
            }
        }
        var result = DataSource.Where(x => x.Description.StartsWith(filterData, StringComparison.CurrentCultureIgnoreCase));
        if (orderByFunc!=null)
        {
            if((sortDirection??"asc").ToLower()=="asc")
                result = result.OrderBy(orderByFunc);
            else
                result = result.OrderByDescending(orderByFunc);
        }

        return new { totalRecords = result.Count(), result = result.Skip(pageIndex * pageSize).Take(pageSize) };
    }
}