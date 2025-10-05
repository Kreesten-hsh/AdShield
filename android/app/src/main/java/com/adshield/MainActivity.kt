package com.adshield

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  // Ce code DOIT correspondre à celui utilisé dans AdShieldNativeModule.kt
  private val REQUEST_VPN_PERMISSION = 42

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "AdShield"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled].
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
      
  // 🚨 AJOUT ESSENTIEL : Gère le résultat de la boîte de dialogue de permission VPN
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    
    if (requestCode == REQUEST_VPN_PERMISSION) {
      if (resultCode == RESULT_OK) {
        // La permission a été accordée. Démarrage du service VPN.
        val intent = Intent(this, AdShieldVpnService::class.java)
        startService(intent)
        Log.d("MainActivity", "Permission VPN accordée. Démarrage du service.")
        
        // OPTIONNEL : Envoyer un événement à JavaScript ici pour mettre à jour l'UI.
        
      } else {
        // La permission a été refusée ou l'utilisateur a annulé.
        Log.d("MainActivity", "Permission VPN refusée.")
        // OPTIONNEL : Envoyer un événement à JavaScript pour afficher une erreur.
      }
    }
  }
}