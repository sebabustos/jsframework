// JScript File

 function shortcut_manager(e)
    {
    
        switch (e.keyCode)
        {
            case 113://f2
            {
                if (window.parent)
                {
                    owin=window.parent;
                    if(owin.ToggleExpandPane!=null)
                        owin.ToggleExpandPane("SlidingZone1","Menu1");                    
                 }
                else
                    ToggleExpandPane("SlidingZone1","Menu1");
                break;
            }
            case 118://f7
            {
                if (window.parent)
                {
                    owin=window.parent;
                    if(owin.GoFastPath!=null)
                        owin.GoFastPath(e.srcElement);
                 }
                else
                    GoFastPath(e.srcElement);
                break;
                
            }

            
        }
    }
  
 shortcut.add("F2", shortcut_manager,{
'type':'keydown',
'propagate':true,
'disable_in_input':false,
'target':document,
'keycode':65
});

 shortcut.add("F7", shortcut_manager,{
'type':'keydown',
'propagate':true,
'disable_in_input':false,
'target':document,
'keycode':65
});



