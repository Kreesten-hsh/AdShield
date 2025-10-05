package com.adshield

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.util.Log 
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class AdShieldNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    // 🚨 Le Companion Object pour stocker l'instance Singleton
    companion object {
        private var instance: AdShieldNativeModule? = null

        fun getInstance(): AdShieldNativeModule? {
            return instance
        }

        fun checkDomainForBlockingStatic(domain: String): Boolean {
            // Logique de simulation inchangée
            return domain.contains("facebook") || domain.contains("adserver")
        }
    }

    init {
        // Stocke l'instance du module au moment de sa création
        instance = this
    }

    override fun getName(): String {
        return "AdShield"
    }

    private val REQUEST_VPN_PERMISSION = 42

    // 🚨 NOUVELLE FONCTION : Envoi d'un événement au JavaScript
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

    private fun startAdShieldService(context: Context) {
        val intent = Intent(context, AdShieldVpnService::class.java)
        context.startService(intent)
    }

    @ReactMethod
    fun startNativeShield(isActive: Boolean, promise: Promise) {
        Log.d("AdShieldDebug", "🔥🔥 APPEL RÉUSSI au module natif!...")
        
        val context = reactApplicationContext
        val activity: Activity? = reactApplicationContext.currentActivity 

        if (activity == null) {
            promise.reject("ACTIVITY_UNAVAILABLE", "L'activité n'est pas disponible pour démarrer le VPN.")
            return
        }

        if (isActive) {
            val vpnIntent: Intent? = VpnService.prepare(context)
            
            if (vpnIntent != null) {
                // Permission non accordée -> Lancer la demande
                Log.d("AdShieldDebug", "Permission VPN requise. Lancement de l'activité.") 
                activity.startActivityForResult(vpnIntent, REQUEST_VPN_PERMISSION)
                
                promise.resolve("Permission VPN demandée. Veuillez accepter la boîte de dialogue.")
            } else {
                // Permission déjà accordée -> Démarrer le service directement
                Log.d("AdShieldDebug", "Permission VPN déjà accordée. Démarrage du service AdShield.")
                startAdShieldService(context) 
                promise.resolve("Service VPN démarré avec succès.")
            }
        } else {
            // Logique d'arrêt
            val stopIntent = Intent(context, AdShieldVpnService::class.java).setAction("stop")
            context.startService(stopIntent)
            promise.resolve("Service VPN arrêté avec succès.")
        }
    }

    @ReactMethod
    fun checkDomainForBlocking(domain: String, promise: Promise) {
        val shouldBlock = checkDomainForBlockingStatic(domain)
        promise.resolve(shouldBlock)
    }
}
