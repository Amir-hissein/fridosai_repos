# Fridos AI — Website Officiel

Site marketing statique de l'application **Fridos AI**, entièrement multilingue (🇹🇷 TR / 🇫🇷 FR / 🇬🇧 EN).

## 📁 Structure

```
fridosai_web/
├── index.html           → Page d'accueil principale
├── privacy.html         → Politique de confidentialité
├── terms.html           → Conditions d'utilisation
├── delete-account.html  → Suppression de compte
├── server.js            → Serveur HTTP Node.js
├── package.json         → Métadonnées du projet
├── css/
│   ├── style.css        → Design system complet
│   └── legal.css        → Styles pages légales
├── js/
│   ├── translations.js  → Dictionnaire i18n TR/FR/EN
│   └── main.js          → Logique interactive
└── assets/
    └── logo.png         → Logo Fridos AI
```

## 🚀 Lancer le site

```bash
cd fridosai_web
npm start
# → http://localhost:8844
```

## 🌍 Système de traduction

La langue est sélectionnable via les boutons **TR / FR / EN** dans le footer.
La préférence est mémorisée via `localStorage` entre les pages.

| Clé `data-i18n`    | Usage                        |
|--------------------|------------------------------|
| `data-i18n="..."` | Texte simple                  |
| `data-i18n-html="true"` | HTML riche (liens, gras) |

## 📦 Tech Stack

- HTML5 sémantique
- CSS3 vanilla (variables CSS, animations, glassmorphism)
- JavaScript vanilla (ES6+)
- Node.js (serveur de développement)

## 📄 Licence

Propriétaire — © 2026 Fridos AI. Tous droits réservés.
