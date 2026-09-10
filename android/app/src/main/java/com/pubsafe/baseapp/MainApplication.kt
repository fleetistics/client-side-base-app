package com.pubsafe.baseapp

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    installNativeCrashLogger()
    loadReactNative(this)
  }

  /**
   * Writes any uncaught JVM exception — including native-view-creation crashes (e.g. a bad prop
   * reaching a Fabric view manager) that kill the app before JS ever runs — to a plain file
   * under getFilesDir()/logs. That's the same directory react-native-blob-util's DocumentDir
   * resolves to on Android (see ReactNativeBlobUtilFS.getFilesDirPath), so crashReporting.ts
   * can pick this file up on the next launch and fold its text into the same rotated log files
   * ReportIssuePage already uploads — instead of the crash only being visible in Crashlytics.
   *
   * Chains to the previously-installed handler (Crashlytics' own) so native crash reporting
   * there is unaffected; this only adds a write in front of it.
   */
  private fun installNativeCrashLogger() {
    val previousHandler = Thread.getDefaultUncaughtExceptionHandler()
    Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
      try {
        val logsDir = File(filesDir, "logs")
        if (!logsDir.exists()) logsDir.mkdirs()
        val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        format.timeZone = TimeZone.getTimeZone("UTC")
        val text =
          "${format.format(Date())} [FATAL-NATIVE] Uncaught exception on thread '${thread.name}':\n" +
            "${Log.getStackTraceString(throwable)}\n"
        File(logsDir, "native-crash-pending.txt").appendText(text)
      } catch (_: Throwable) {
        // Must never throw from a crash handler — worst case we just lose this one crash's text.
      }
      previousHandler?.uncaughtException(thread, throwable)
    }
  }
}
