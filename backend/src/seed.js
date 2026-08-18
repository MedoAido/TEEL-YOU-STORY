// seed.js — remplit la base avec les mêmes données de démonstration que le prototype T.Y.S.
// Usage : node src/seed.js
const db = require('./db');
const { hashPassword, generateId } = require('./auth');

function upsertUser({ id, name, email, password, role }) {
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (existing) return existing.id;
  db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, email, hashPassword(password), role);
  return id;
}

function upsertProfile(userId, profile) {
  const existing = db.prepare('SELECT user_id FROM provider_profiles WHERE user_id = ?').get(userId);
  if (existing) {
    db.prepare(`UPDATE provider_profiles SET role_label=?, bio=?, zone=?, services=?, ava_bg=?, tags=?, satisfaction=?, communes=? WHERE user_id=?`)
      .run(profile.role_label, profile.bio, profile.zone, profile.services, profile.ava_bg, JSON.stringify(profile.tags), profile.satisfaction, profile.communes, userId);
  } else {
    db.prepare(`INSERT INTO provider_profiles (user_id, role_label, bio, zone, services, ava_bg, tags, satisfaction, communes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(userId, profile.role_label, profile.bio, profile.zone, profile.services, profile.ava_bg, JSON.stringify(profile.tags), profile.satisfaction, profile.communes);
  }
}

function insertPostIfMissing(id, userId, caption, tags) {
  const existing = db.prepare('SELECT id FROM posts WHERE id = ?').get(id);
  if (existing) return;
  db.prepare('INSERT INTO posts (id, user_id, caption, tags) VALUES (?, ?, ?, ?)')
    .run(id, userId, caption, JSON.stringify(tags));
}

// --- Comptes prestataires (mot de passe de démo identique : demo1234) ---
const be = upsertUser({ id: 'u_busenergie', name: "Bus'Énergie", email: 'contact@busenergie.example', password: 'demo1234', role: 'prestataire' });
upsertProfile(be, {
  role_label: 'Coaching sportif · Électricité · Ateliers éco-énergie',
  bio: "La santé par le mouvement, directement chez vous. Un bus, un intervenant polyvalent, trois services, une seule visite. Sport sur ordonnance, dépannage électrique et ateliers éco-énergie pour les collectivités, entreprises et particuliers des zones rurales. Assuré en Responsabilité Civile Professionnelle (risque sport et risque électrique) — habilitation électrique B1V à jour.",
  zone: "Itinérant — zones rurales, quartiers prioritaires et zones d'activités. Tournées hebdomadaires sur convention avec les mairies et entreprises partenaires.",
  services: "Coaching sportif — 300 €/mois (forfait) · séances seniors, entreprises (QVT) et sport sur ordonnance · Dépannage électrique — 60 €/h (habilitation B1V) · Ateliers éco-énergie — 500 €/demi-journée · sensibilisation aux économies d'énergie",
  ava_bg: 'linear-gradient(135deg,#5B4FE9,#FF7A59)',
  tags: ['Coaching sportif', 'Électricité', 'Ateliers éco-énergie', 'Sport sur ordonnance', 'Zones rurales'],
  satisfaction: 4.9, communes: 6
});

const md = upsertUser({ id: 'u_marie', name: 'Marie D.', email: 'marie@busenergie.example', password: 'demo1234', role: 'prestataire' });
upsertProfile(md, {
  role_label: 'Coiffure à domicile',
  bio: "Coiffeuse itinérante, spécialisée dans l'accompagnement des seniors et des personnes à mobilité réduite.",
  zone: 'Secteur Nord — passages tous les jeudis.',
  services: 'Coupe & brushing — 25 € · Coloration — 45 € · Forfait mensuel seniors — sur devis',
  ava_bg: 'linear-gradient(135deg,#1BA97A,#7EE9C0)',
  tags: ['Coiffure', 'Seniors'],
  satisfaction: 4.8, communes: 3
});

const jp = upsertUser({ id: 'u_julien', name: 'Julien P.', email: 'julien@busenergie.example', password: 'demo1234', role: 'prestataire' });
upsertProfile(jp, {
  role_label: 'Petit bricolage',
  bio: 'Interventions de petit bricolage et dépannage du quotidien : montage, fixation, petites réparations.',
  zone: 'Itinérant — zone élargie, à la demande.',
  services: 'Petites réparations — 35 €/h · Montage de meuble — sur devis · Pack "Journée bricolage" — 220 €',
  ava_bg: 'linear-gradient(135deg,#FF7A59,#FFC29B)',
  tags: ['Bricolage', 'Dépannage'],
  satisfaction: 4.7, communes: 5
});

// --- Compte client de démo ---
const client = upsertUser({ id: 'u_client_bernard', name: 'Famille Bernard', email: 'bernard@example.com', password: 'demo1234', role: 'client' });

// --- Publications ---
insertPostIfMissing('post_be_2', be,
  "☀️ Le bus est fin prêt ! Panneaux solaires sur le toit, espace sportif équipé (sangles TRX, miroir de correction de posture, sol amorti) et coin atelier avec établi escamotable et panneau à outils pour le dépannage élec. La santé par le mouvement, directement chez vous 💪🔧 Réservation des créneaux bientôt ouverte.",
  ['SportSantéItinérant', 'CoachingSportif', 'DépannageÉlectrique']);
insertPostIfMissing('post_be_1', be,
  "📍 De passage cette semaine ! Le bus était sur la place du village mardi — 3 séances de coaching, 2 dépannages élec et un après-midi atelier bricolage. Merci à tous ceux qui sont passés dire bonjour 🙌",
  ['CoachingSportif', 'DépannageÉlectrique', 'ZonesRurales']);
insertPostIfMissing('post_md_1', md,
  'Merci pour votre confiance cette semaine ✂️ Trois nouveaux créneaux ouverts pour les seniors du secteur, sur rendez-vous.',
  ['CoiffureÀDomicile', 'Seniors']);
insertPostIfMissing('post_jp_1', jp,
  'Journée bien remplie : 4 interventions de petit bricolage dans le quartier. Prochaine tournée annoncée dans quelques jours.',
  ['Bricolage', 'ServiceItinérant']);

// --- Conversation de démo (Bus'Énergie <-> Famille Bernard) ---
const [a, b] = [be, client].sort();
let conv = db.prepare('SELECT id FROM conversations WHERE user_a = ? AND user_b = ?').get(a, b);
let convId = conv ? conv.id : generateId('conv');
if (!conv) {
  db.prepare('INSERT INTO conversations (id, user_a, user_b) VALUES (?, ?, ?)').run(convId, a, b);
  db.prepare('INSERT INTO messages (id, conversation_id, sender_id, text) VALUES (?, ?, ?, ?)')
    .run(generateId('msg'), convId, client, 'Bonjour, est-ce que le bus passe bien près de la mairie jeudi ?');
  db.prepare('INSERT INTO messages (id, conversation_id, sender_id, text) VALUES (?, ?, ?, ?)')
    .run(generateId('msg'), convId, be, 'Oui, arrêt prévu de 14h à 17h sur la place.');
  db.prepare('INSERT INTO messages (id, conversation_id, sender_id, text) VALUES (?, ?, ?, ?)')
    .run(generateId('msg'), convId, client, 'Parfait, on vous attend jeudi.');
}

console.log('Données de démonstration insérées.');
console.log('Comptes de test (mot de passe: demo1234) :');
console.log("  contact@busenergie.example (Bus'Énergie, prestataire)");
console.log('  marie@busenergie.example (Marie D., prestataire)');
console.log('  julien@busenergie.example (Julien P., prestataire)');
console.log('  bernard@example.com (Famille Bernard, client)');
