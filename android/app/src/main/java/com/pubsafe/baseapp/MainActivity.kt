package com.pubsafe.baseapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import android.os.Bundle
import com.splashview.SplashView

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "BaseApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   *
   * The custom getLaunchOptions() override forwards Detox's `launchArgs` (an intent extra Detox
   * sets on every instrumented launch — see node_modules/detox/android/detox/.../LaunchArgs.java)
   * as the RN root component's initialProps. Outside of a Detox test run this extra is simply
   * absent, so launchOptions falls back to the default (null) and app behavior is unchanged.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
        override fun getLaunchOptions(): Bundle? = intent?.getBundleExtra("launchArgs")
      }

  /**
  * added for react-native-splash-view
  */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    SplashView.showSplashView(this) // Show the splash screen
  }
}
