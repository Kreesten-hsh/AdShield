package com.adshield // 🚨 REMPLACER par le nom de votre package

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.*

class AdShieldPackage : ReactPackage {
    
    // Enregistre le Module natif (AdShieldNativeModule) pour qu'il soit disponible en JS
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules: MutableList<NativeModule> = ArrayList()
        modules.add(AdShieldNativeModule(reactContext))
        return modules
    }

    // Nous n'utilisons pas de ViewManager (composants UI natifs)
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}