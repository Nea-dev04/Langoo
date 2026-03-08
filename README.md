# 🌍 Langoo — Plateforme de cours de langues en ligne

Langoo est une marketplace mettant en relation des **élèves** et des **professeurs** pour des cours particuliers en visioconférence.

## 🎯 Concept

Langoo joue le rôle d'intermédiaire entre élèves et professeurs, en prenant une **commission de 15%** sur chaque séance réservée.

## 🌐 Langues proposées

- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇸🇦 Arabe

## 💶 Tarification

- **25€** par séance de 60 minutes
- Paiement sécurisé via **Stripe**
- Remboursement garanti si le cours n'a pas lieu

## 📄 Pages du site

| Fichier | Description |
|---|---|
| `home.html` | Page d'accueil |
| `auth.html` | Inscription / Connexion |
| `recherche.html` | Recherche de professeurs |
| `profil.html` | Profil d'un prof + réservation |
| `dashboard-eleve.html` | Espace élève |
| `dashboard-prof.html` | Espace professeur |
| `supabase.js` | Client Supabase (base de données) |

## ⚙️ Stack technique

- **Frontend** — HTML / CSS / JavaScript
- **Base de données** — [Supabase](https://supabase.com)
- **Paiements** — Stripe (à venir)
- **Hébergement** — GitHub Pages / Vercel

## ✨ Fonctionnalités

### Élève
- Inscription et connexion
- Recherche de profs par langue, niveau, spécialité
- Réservation d'un créneau en ligne
- Paiement sécurisé
- Messagerie avec le prof
- Historique des cours
- Notation des professeurs

### Professeur
- Inscription et création de profil
- Gestion des disponibilités
- Tableau de bord des séances
- Suivi des gains en temps réel
- Virement automatique via Stripe
- Messagerie avec les élèves
- Gestion des avis reçus

## 🗄️ Base de données

Tables Supabase :
- `profiles` — Utilisateurs (élèves + profs)
- `profs` — Profils professeurs
- `disponibilites` — Créneaux disponibles
- `reservations` — Cours réservés
- `messages` — Messagerie
- `avis` — Notes et commentaires
- `gains` — Suivi des revenus

## 🚀 Déploiement

Site hébergé sur **GitHub Pages** :
👉 [https://nea-dev04.github.io/Langoo](https://nea-dev04.github.io/Langoo)

## 📬 Contact

📧 langooacademy@gmail.com

---

*Langoo — Apprends une langue avec un vrai prof.*
