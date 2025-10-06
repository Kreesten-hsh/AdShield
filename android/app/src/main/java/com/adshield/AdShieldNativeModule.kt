package com.adshield

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build 
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AdShieldNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val REQUEST_VPN_PERMISSION = 42

    private val mActivityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == REQUEST_VPN_PERMISSION) {
                onVpnPermissionResult(resultCode == Activity.RESULT_OK)
            }
        }
    }

    companion object {
        @Volatile private var instance: AdShieldNativeModule? = null

        fun getInstance(): AdShieldNativeModule? {
            return instance
        }

        fun checkDomainForBlockingStatic(domain: String): Boolean {
            return domain.contains("facebook") || domain.contains("adserver")
        }
    }

    init {
        instance = this
        reactContext.addActivityEventListener(mActivityEventListener)
    }

    override fun getName(): String {
        return "AdShield"
    }

    fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
            Log.d("AdShieldEvents", "Événement $eventName envoyé à JS.")
        } catch (e: Exception) {
            Log.e("AdShieldEvents", "Erreur lors de l'envoi de l'événement $eventName", e)
        }
    }

    fun sendVpnStatusEvent(status: String) {
        val params = Arguments.createMap().apply {
            putString("status", status)
        }
        sendEvent("onVpnStatusChange", params)
    }

    private fun startAdShieldService(context: Context) {
        val intent = Intent(context, AdShieldVpnService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }
    }

    @ReactMethod
    fun startNativeShield(isActive: Boolean, promise: Promise) {
        val context = reactApplicationContext
        val activity: Activity? = reactApplicationContext.currentActivity

        if (activity == null) {
            promise.reject("ACTIVITY_UNAVAILABLE", "L'activité n'est pas disponible pour démarrer le VPN.")
            return
        }

        if (isActive) {
            val vpnIntent: Intent? = VpnService.prepare(context)

            if (vpnIntent != null) {
                activity.startActivityForResult(vpnIntent, REQUEST_VPN_PERMISSION)
                promise.resolve("Permission VPN demandée.")
            } else {
                startAdShieldService(context)
                promise.resolve("Service VPN démarré avec succès.")
                sendVpnStatusEvent("CONNECTED")
            }
        } else {
            val stopIntent = Intent(context, AdShieldVpnService::class.java).setAction("stop")
            context.startService(stopIntent)
            promise.resolve("Service VPN arrêté avec succès.")
            sendVpnStatusEvent("DISCONNECTED")
        }
    }

    fun onVpnPermissionResult(granted: Boolean) {
        if (granted) {
            Log.d("AdShieldDebug", "Permission VPN ACCEPTÉE. Démarrage du service.")
            startAdShieldService(reactApplicationContext)
            sendVpnStatusEvent("CONNECTED")
        } else {
            Log.d("AdShieldDebug", "Permission VPN REFUSÉE. Arrêt.")
            sendVpnStatusEvent("DISCONNECTED")
        }
    }

    @ReactMethod
    fun checkDomainForBlocking(domain: String, promise: Promise) {
        val shouldBlock = checkDomainForBlockingStatic(domain)
        promise.resolve(shouldBlock)
    }
}
