// ============================================================
//  LANGOO — Supabase Client
//  À inclure dans TOUTES les pages HTML :
//  <script src="supabase.js"></script>
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL  = 'https://zidldhezuvejwcbbqfbb.supabase.co'
const SUPABASE_ANON = 'sb_publishable_BTCl_TbQ4n1aJh8_ePoQEg_vDWGN2gN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ============================================================
//  AUTH — Inscription
// ============================================================
export async function inscrire({ prenom, nom, email, password, role, langue }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { prenom, nom, role }
    }
  })
  if (error) throw error

  // Si c'est un prof → créer son profil prof
  if (role === 'prof' && data.user) {
    const { error: profError } = await supabase
      .from('profs')
      .insert({ id: data.user.id, langue })
    if (profError) throw profError
  }

  return data
}

// ============================================================
//  AUTH — Connexion
// ============================================================
export async function connecter({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ============================================================
//  AUTH — Déconnexion
// ============================================================
export async function deconnecter() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ============================================================
//  AUTH — Utilisateur courant
// ============================================================
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ============================================================
//  AUTH — Profil complet
// ============================================================
export async function getProfil(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, profs(*)')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

// ============================================================
//  PROFS — Liste avec filtres
// ============================================================
export async function getProfs({ langue, search } = {}) {
  let query = supabase
    .from('profs')
    .select(`
      *,
      profiles (prenom, nom, avatar_url),
      avis (note)
    `)
    .eq('actif', true)

  if (langue) query = query.eq('langue', langue)

  const { data, error } = await query
  if (error) throw error

  // Calculer la note moyenne
  return data.map(p => ({
    ...p,
    nom_complet: `${p.profiles.prenom} ${p.profiles.nom}`,
    rating: p.avis.length
      ? (p.avis.reduce((s, a) => s + a.note, 0) / p.avis.length).toFixed(1)
      : null,
    nb_avis: p.avis.length
  }))
}

// ============================================================
//  PROFS — Profil détaillé
// ============================================================
export async function getProfDetail(profId) {
  const { data, error } = await supabase
    .from('profs')
    .select(`
      *,
      profiles (prenom, nom, avatar_url),
      avis (note, commentaire, created_at, profiles(prenom, nom)),
      disponibilites (date, heure, reserve)
    `)
    .eq('id', profId)
    .single()
  if (error) throw error
  return data
}

// ============================================================
//  DISPONIBILITÉS — Par prof et date
// ============================================================
export async function getDispos(profId, date) {
  const { data, error } = await supabase
    .from('disponibilites')
    .select('*')
    .eq('prof_id', profId)
    .eq('date', date)
    .eq('reserve', false)
  if (error) throw error
  return data
}

// ============================================================
//  RÉSERVATIONS — Créer
// ============================================================
export async function creerReservation({ eleveId, profId, dispoId, date, heure }) {
  // 1. Créer la réservation
  const { data: resa, error: resaError } = await supabase
    .from('reservations')
    .insert({
      eleve_id: eleveId,
      prof_id:  profId,
      dispo_id: dispoId,
      date,
      heure
    })
    .select()
    .single()
  if (resaError) throw resaError

  // 2. Marquer le créneau comme réservé
  const { error: dispoError } = await supabase
    .from('disponibilites')
    .update({ reserve: true })
    .eq('id', dispoId)
  if (dispoError) throw dispoError

  return resa
}

// ============================================================
//  RÉSERVATIONS — Mes cours (élève)
// ============================================================
export async function getMesCours(eleveId) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      profs (langue, profiles(prenom, nom))
    `)
    .eq('eleve_id', eleveId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

// ============================================================
//  RÉSERVATIONS — Mes séances (prof)
// ============================================================
export async function getMesSeances(profId) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      profiles (prenom, nom)
    `)
    .eq('prof_id', profId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

// ============================================================
//  MESSAGES — Conversation entre 2 users
// ============================================================
export async function getMessages(userId, otherId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// ============================================================
//  MESSAGES — Envoyer
// ============================================================
export async function envoyerMessage({ senderId, receiverId, contenu }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, contenu })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
//  MESSAGES — Temps réel (écoute les nouveaux messages)
// ============================================================
export function ecouterMessages(userId, callback) {
  return supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    }, callback)
    .subscribe()
}

// ============================================================
//  AVIS — Publier
// ============================================================
export async function publierAvis({ eleveId, profId, reservationId, note, commentaire }) {
  const { data, error } = await supabase
    .from('avis')
    .insert({ eleve_id: eleveId, prof_id: profId, reservation_id: reservationId, note, commentaire })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
//  GAINS — Mes gains (prof)
// ============================================================
export async function getMesGains(profId) {
  const { data, error } = await supabase
    .from('gains')
    .select('*, reservations(date, heure, profiles(prenom, nom))')
    .eq('prof_id', profId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}


