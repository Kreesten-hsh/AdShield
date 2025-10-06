
# 🛡️ AdShield : Votre Bouclier Anti-Publicité & Vie Privée (React Native)

## ✨ Proposition de Valeur

**AdShield** est une application mobile construite avec **React Native (CLI)** et **TypeScript**, conçue pour offrir une expérience utilisateur fluide, rapide et sécurisée. En agissant comme un **bouclier VPN local** (selon la plateforme), l'application bloque les publicités, les traqueurs et les domaines malveillants en temps réel, garantissant :

  * **Sécurité** : Protection contre les logiciels malveillants et le pistage.
  * **Performance** : Réduction de la consommation de données et accélération de la navigation.
  * **Confort** : Une utilisation mobile sans interruption visuelle.

-----

## 🚀 Fonctionnalités Clés

| Icône | Fonctionnalité | Description |
| :---: | :--- | :--- |
| 🛡️ | **Protection en Temps Réel** | Blocage instantané des publicités et des traqueurs via un service VPN local. |
| 📊 | **Statistiques Détaillées** | Visualisation du nombre de publicités bloquées et de la bande passante économisée. |
| 🎨 | **UI Moderne & Minimaliste** | Conception épurée et réactive, compatible avec les thèmes clair et sombre. |
| ⚛️ | **Code Natif & Hybride** | Utilisation de modules natifs pour une intégration performante (Android/iOS). |

-----

## 📸 Aperçu de l'Interface

| Écran d'Accueil (Activation/Statut) | Écran des Statistiques (Métrique) | Écran des Réglages (Configuration) |
| :---: | :---: | :---: |
| ![Accueil AdShield](https://raw.githubusercontent.com/Kreesten-hsh/AdShield/main/screenshots/home.jpg) | ![Stats AdShield](https://raw.githubusercontent.com/Kreesten-hsh/AdShield/main/screenshots/stats.jpg) | ![Réglages AdShield](https://raw.githubusercontent.com/Kreesten-hsh/AdShield/main/screenshots/settings.jpg) |

---

## ⚙️ Technologies et Architecture

| Catégorie | Technologie | Rôle dans le Projet |
| :--- | :--- | :--- |
| **Framework** | **React Native** (CLI) | Base du développement mobile multiplateforme. |
| **Langage** | **TypeScript** | Assure la robustesse et la maintenabilité du code avec typage statique. |
| **Gestion d'État**| **React Context / Hooks** | Gestion du statut du bouclier (`ShieldContext`) et des données globales. |
| **Navigation**| **React Navigation (Tab)** | **Gestion des écrans principaux via une barre d'onglets personnalisée et moderne.** |
| **Persistance** | **AsyncStorage** | Stockage local des préférences utilisateur et des compteurs (pub bloquées). |
| **UI/Thèmes** | **Stylesheets & Context** | Stylisme performant et prise en charge native des thèmes (Dark/Light Mode). |

-----

## 🛠️ Démarrer le Développement

Suivez ces instructions pour lancer le projet dans votre environnement de développement local.

### Prérequis

Assurez-vous que votre environnement est configuré selon la [documentation officielle React Native CLI](https://reactnative.dev/docs/environment-setup) :

  * **Node.js** (version 18+)
  * **Java Development Kit (JDK)** (version 17 ou supérieure)
  * **Android Studio** (avec les outils et un émulateur/appareil configuré)
  * **Xcode** (pour le développement iOS, optionnel)

### Installation et Lancement

1.  **Clonez le dépôt :**

    ```bash
    git clone https://github.com/Kreesten-hsh/AdShield.git
    cd AdShield
    ```

2.  **Installez les dépendances :**

    ```bash
    npm install
    ```

3.  **Lancement (Android) :**

      * **Terminal 1 (Metro Bundler) :**
        ```bash
        npx react-native start
        ```
      * **Terminal 2 (Lancement de l'App) :**
        ```bash
        npx react-native run-android
        ```

-----

## 🤝 Contribuer au Projet

Toutes les contributions qui rendent AdShield plus rapide, plus sûr ou plus beau sont les bienvenues \!

1.  *Fork* (dupliquez) ce dépôt.
2.  Créez votre branche de fonctionnalité : `git checkout -b feat/nom-de-la-feature`
3.  Commitez vos changements : `git commit -m 'feat: Nouvelle implémentation de X'`
4.  Poussez la branche : `git push origin feat/nom-de-la-feature`
5.  Ouvrez une **Pull Request (PR)** détaillée.

-----

## 🔑 Licence

Ce projet est sous licence **[MIT License](https://opensource.org/licenses/MIT)**. Vous pouvez consulter le fichier `LICENSE` pour tous les détails.

-----

## 👤 Contact Développeur

Développé et maintenu par **Kreesten AGBOTON**.

  * [Mon profil GitHub](https://github.com/Kreesten-hsh)
  * [Mon profil LinkedIn](https://www.linkedin.com/in/kreesten-agboton-4817a1382/)
  * **Email :** *[akreesten@gmail.com]*