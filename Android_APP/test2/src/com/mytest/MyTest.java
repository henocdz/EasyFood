package com.mytest;

import android.app.Activity;
import android.os.Bundle;
import android.view.Menu;
import org.apache.cordova.*;

public class MyTest extends DroidGap
{
    /** Called when the activity is first created. */
   /* @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
    }*/
	
	
	@Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        super.loadUrl("file:///android_asset/www/index.html");
    }
	
	
}
