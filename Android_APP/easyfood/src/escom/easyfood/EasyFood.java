package escom.easyfood;

import android.app.Activity;
import android.os.Bundle;
import org.apache.cordova.*;
	
public class EasyFood extends DroidGap
{
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        setContentView(R.layout.main);
        super.loadUrl("file:///android_asset/www/menu.html");
    }
}
