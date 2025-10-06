package com.adshield

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.util.concurrent.Executors
import java.util.concurrent.Future

class AdShieldVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private val TAG = "AdShieldVpnService"
    private val NOTIFICATION_CHANNEL_ID = "AdShieldChannel"
    private val NOTIFICATION_ID = 1
    @Volatile private var isRunning = false
    
    private val executor = Executors.newSingleThreadExecutor()
    private var vpnTask: Future<*>? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service AdShield créé.")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "stop") {
            stopVpn()
            return START_NOT_STICKY
        }
        
        startForeground(NOTIFICATION_ID, createNotification())

        if (vpnInterface == null) {
            establishVpn()
        }

        return START_STICKY
    }

    private fun establishVpn() {
        try {
            val builder = Builder()
                .setSession("AdShieldVPN")
                .addAddress("10.8.0.1", 24)
                .addRoute("0.0.0.0", 0)
                .addDnsServer("8.8.8.8")
            
            vpnInterface = builder.establish()

            if (vpnInterface != null) {
                Log.i(TAG, "VPN établi avec succès.")
                startTunneling()
            } else {
                Log.e(TAG, "Échec de l'établissement du VPN.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Erreur lors de l'établissement du VPN", e)
        }
    }

    private fun stopVpn() {
        Log.d(TAG, "Arrêt du VPN AdShield.")
        isRunning = false
        
        vpnTask?.cancel(true) 
        
        try {
            vpnInterface?.close()
            vpnInterface = null
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        } catch (e: Exception) {
            Log.e(TAG, "Erreur lors de l'arrêt du VPN", e)
        }
    }
    
    private fun startTunneling() {
        if (vpnTask == null || vpnTask!!.isDone || vpnTask!!.isCancelled) {
            isRunning = true
            vpnTask = executor.submit { runTunneling() }
            Log.d(TAG, "Tunneling task démarrée.")
        }
    }

    private fun runTunneling() {
        var vpnInput: FileInputStream? = null
        var vpnOutput: FileOutputStream? = null
        
        val buffer = ByteBuffer.allocate(32767) 

        try {
            vpnInput = FileInputStream(vpnInterface!!.fileDescriptor)
            vpnOutput = FileOutputStream(vpnInterface!!.fileDescriptor)
            
            while (isRunning && !Thread.interrupted()) {
                
                buffer.clear()
                val bytesRead = vpnInput.channel.read(buffer) 
                
                if (bytesRead > 0) {
                    buffer.flip() 
                    val packet = ByteArray(bytesRead)
                    buffer.get(packet)

                    val processed = processPacket(packet)

                    if (processed != null) {
                        vpnOutput.write(processed)
                    } else {
                        Log.d(TAG, "Packet dropped (blocked)")
                    }
                } else if (bytesRead == -1) {
                    Log.w(TAG, "Interface VPN fermée.")
                    break
                } else {
                    Thread.sleep(10)
                }
            }
        } catch (e: InterruptedException) {
            Log.d(TAG, "Tunneling thread interrompu.")
        } catch (e: Exception) {
            if (isRunning) { 
                Log.e(TAG, "Erreur fatale dans le thread de tunneling", e)
            }
        } finally {
            Log.d(TAG, "Tunneling thread arrêté. Fermeture des ressources.")
            try { vpnInput?.close() } catch (e: Exception) { Log.e(TAG, "Erreur fermeture input", e) }
            try { vpnOutput?.close() } catch (e: Exception) { Log.e(TAG, "Erreur fermeture output", e) }
        }
    }
    
    private fun processPacket(packet: ByteArray): ByteArray? {
        if (packet.size < 28) return packet
        val ipHeaderLength = (packet[0].toInt() and 0x0F) * 4
        if (packet[9] != 17.toByte()) return packet // Not UDP
        val udpDestPort = ((packet[ipHeaderLength + 2].toInt() and 0xFF) shl 8) or (packet[ipHeaderLength + 3].toInt() and 0xFF)
        if (udpDestPort != 53) return packet // Not DNS
        val dnsStart = ipHeaderLength + 8
        if (dnsStart + 12 > packet.size) return packet
        val domain = parseDnsQueryName(packet, dnsStart + 12)
        
        if (domain != null && AdShieldNativeModule.checkDomainForBlockingStatic(domain)) {
             Log.d(TAG, "Blocking domain: $domain")
             return null
        }

        return packet
    }

    private fun parseDnsQueryName(packet: ByteArray, offset: Int): String? {
        return try {
            val sb = StringBuilder()
            var i = offset
            while (i < packet.size && packet[i] != 0.toByte()) {
                val length = packet[i].toInt() and 0xFF
                if (length == 0) break
                i++
                if (i + length > packet.size) return null
                val label = String(packet, i, length, Charsets.UTF_8)
                sb.append(label).append('.')
                i += length
            }
            if (sb.isNotEmpty()) sb.setLength(sb.length - 1)
            sb.toString()
        } catch (e: Exception) {
            null
        }
    }
    
    private fun createNotification(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "AdShield VPN Status"
            val descriptionText = "Le bouclier anti-publicité est actif."
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(NOTIFICATION_CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
        
        val pendingIntent: PendingIntent =
            Intent(this, Class.forName("com.adshield.MainActivity")).let { notificationIntent ->
                val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                } else {
                    PendingIntent.FLAG_UPDATE_CURRENT
                }
                PendingIntent.getActivity(this, 0, notificationIntent, flags)
            }
            
        return Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("AdShield Actif")
            .setContentText("Le bouclier anti-publicité fonctionne en arrière-plan.")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setTicker("VPN Démarré")
            .build()
    }
    
    override fun onRevoke() {
        stopVpn()
        AdShieldNativeModule.getInstance()?.sendVpnStatusEvent("DISCONNECTED")
        Log.w(TAG, "Permission VPN révoquée par le système ou l'utilisateur.")
    }

    override fun onDestroy() {
        stopVpn()
        Log.d(TAG, "Service AdShield détruit.")
        super.onDestroy()
    }
}