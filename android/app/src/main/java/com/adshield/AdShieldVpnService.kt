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
import java.nio.channels.FileChannel
import java.nio.channels.Selector
import java.nio.channels.SelectionKey

class AdShieldVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private val TAG = "AdShieldVpnService"
    private val NOTIFICATION_CHANNEL_ID = "AdShieldChannel"
    private val NOTIFICATION_ID = 1
    @Volatile private var isRunning = false
    
    // Ajout d'une référence au thread pour un meilleur contrôle
    private var vpnThread: Thread? = null

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
                // 🚨 Démarre le nouveau thread NIO
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
        isRunning = false // Indique au thread de s'arrêter
        vpnThread?.interrupt() // 🚨 Interrompt le thread pour le sortir du selector.select()
        try {
            vpnInterface?.close()
            vpnInterface = null
            vpnThread?.join(1000) // Attendre la fin du thread (max 1s)
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        } catch (e: Exception) {
            Log.e(TAG, "Erreur lors de l'arrêt du VPN", e)
        }
    }
    
    // Remplacement de startTunneling pour gérer le thread
    private fun startTunneling() {
        if (vpnThread == null || !vpnThread!!.isAlive) {
            isRunning = true
            vpnThread = Thread { runTunneling() }
            vpnThread?.start()
            Log.d(TAG, "Tunneling thread démarré.")
        }
    }

    // 🚨 FONCTION CLÉ : Implémentation du tunneling NIO basé sur Selector
    private fun runTunneling() {
        // Ces objets seront gérés dans le bloc finally
        var vpnInput: FileInputStream? = null
        var vpnOutput: FileOutputStream? = null
        var vpnInputChannel: FileChannel? = null
        var selector: Selector? = null
        
        // Taille maximale pour un paquet IP
        val buffer = ByteBuffer.allocate(32767) 

        try {
            vpnInput = FileInputStream(vpnInterface!!.fileDescriptor)
            vpnOutput = FileOutputStream(vpnInterface!!.fileDescriptor)
            vpnInputChannel = vpnInput.channel
            selector = Selector.open()

            // Enregistre le canal VPN pour la lecture. Le Selector surveillera les paquets entrants.
            vpnInputChannel.configureBlocking(false) // Rendre le canal non bloquant
            vpnInputChannel.register(selector, SelectionKey.OP_READ)

            while (isRunning && !Thread.interrupted()) {
                // Bloque, n'utilise pas de CPU tant qu'il n'y a pas de trafic
                val readyChannels = selector.select() 
                
                if (readyChannels == 0) continue

                val selectedKeys = selector.selectedKeys()
                val keyIterator = selectedKeys.iterator()

                while (keyIterator.hasNext()) {
                    val key = keyIterator.next()
                    keyIterator.remove()

                    if (key.isValid && key.isReadable) {
                        // Un paquet est prêt à être lu depuis l'interface VPN
                        processVpnInput(vpnInputChannel, vpnOutput, buffer)
                    }
                }
            }
        } catch (e: Exception) {
            // C'est normal si le thread est interrompu par stopVpn()
            if (isRunning) { 
                Log.e(TAG, "Erreur fatale dans le thread de tunneling", e)
            }
        } finally {
            Log.d(TAG, "Tunneling thread arrêté. Fermeture des ressources.")
            // Fermer toutes les ressources de manière sécurisée
            try { selector?.close() } catch (e: Exception) { Log.e(TAG, "Erreur fermeture selector", e) }
            try { vpnInputChannel?.close() } catch (e: Exception) { Log.e(TAG, "Erreur fermeture input channel", e) }
            try { vpnOutput?.close() } catch (e: Exception) { Log.e(TAG, "Erreur fermeture output", e) }
            try { vpnInput?.close() } catch (e: Exception) { Log.e(TAG, "Erreur fermeture input", e) }
        }
    }
    
    // 🚨 NOUVELLE FONCTION: Utilise FileChannel pour la lecture
    private fun processVpnInput(vpnInputChannel: FileChannel, vpnOutput: FileOutputStream, buffer: ByteBuffer) {
        buffer.clear()
        
        // La lecture non bloquante
        val bytesRead = vpnInputChannel.read(buffer) 
        
        if (bytesRead > 0) {
            // Préparer le buffer pour la lecture
            buffer.flip() 
            
            // Transformer le ByteBuffer en ByteArray pour utiliser votre logique existante
            val packet = ByteArray(bytesRead)
            buffer.get(packet)

            val processed = processPacket(packet)

            if (processed != null) {
                vpnOutput.write(processed)
            } else {
                Log.d(TAG, "Packet dropped (blocked)")
            }
        }
    }
    
    // -------------------------------------------------------------------------
    // VOTRE LOGIQUE DNS EXISTANTE (pas de changement nécessaire dans ces fonctions)
    // -------------------------------------------------------------------------

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
    
    // -------------------------------------------------------------------------
    // ... (Le reste des fonctions de notification/revocation/destroy sont inchangées)
    // -------------------------------------------------------------------------

    private fun createNotification(): Notification {
        // ... (Code de createNotification inchangé) ...
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
            Intent(this, MainActivity::class.java).let { notificationIntent ->
                PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
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
        Log.w(TAG, "Permission VPN révoquée par le système ou l'utilisateur.")
    }

    override fun onDestroy() {
        stopVpn()
        Log.d(TAG, "Service AdShield détruit.")
        super.onDestroy()
    }
}