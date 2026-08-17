// server.js — API T.Y.S. Serveur HTTP natif Node.js (aucune dépendance externe : pas d'Express nécessaire).
const http = require('http');
const { URL } = require('url');
const db = require('./db');
const { hashPassword, verifyPassword, generateToken, generateId } = require('./auth');

const PORT = process.env.PORT || 4000;

function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8'))); }
      catch (e) { reject(new Error('Corps JSON invalide.')); }
    });
    req.on('error', reject);
  });
}

function getAuthUser(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) return null;
  return db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(session.user_id);
}

function publicUser(u) { return { id: u.id, name: u.name, email: u.email, role: u.role }; }

function providerCard(userRow, profileRow) {
  return {
    id: userRow.id,
    name: userRow.name,
    roleLabel: profileRow ? profileRow.role_label : '',
    bio: profileRow ? profileRow.bio : '',
    zone: profileRow ? profileRow.zone : '',
    services: profileRow ? profileRow.services : '',
    avaBg: profileRow ? profileRow.ava_bg : 'linear-gradient(135deg,#8E8E93,#C7C7CC)',
    tags: profileRow ? JSON.parse(profileRow.tags || '[]') : [],
    satisfaction: profileRow ? profileRow.satisfaction : null,
    communes: profileRow ? profileRow.communes : null
  };
}

function reactionCounts(postId) {
  const rows = db.prepare('SELECT type, COUNT(*) as n FROM reactions WHERE post_id = ? GROUP BY type').all(postId);
  const counts = { soutien: 0, merci: 0, coup_de_coeur: 0 };
  rows.forEach((r) => { counts[r.type] = r.n; });
  return counts;
}

function postCard(row) {
  const author = db.prepare('SELECT id, name FROM users WHERE id = ?').get(row.user_id);
  return {
    id: row.id,
    author: author ? { id: author.id, name: author.name } : null,
    caption: row.caption,
    photoUrl: row.photo_url,
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at,
    reactions: reactionCounts(row.id)
  };
}

// -------------------- route table --------------------
const routes = [];
function route(method, pattern, handler) { routes.push({ method, pattern, handler }); }

function matchRoute(method, pathname) {
  for (const r of routes) {
    if (r.method !== method) continue;
    const parts = r.pattern.split('/').filter(Boolean);
    const segs = pathname.split('/').filter(Boolean);
    if (parts.length !== segs.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(':')) params[parts[i].slice(1)] = decodeURIComponent(segs[i]);
      else if (parts[i] !== segs[i]) { ok = false; break; }
    }
    if (ok) return { handler: r.handler, params };
  }
  return null;
}

// ===================== AUTH =====================
route('POST', '/api/auth/register', async (req, res, params, body) => {
  const { name, email, password, role } = body;
  if (!name || !email || !password || !['prestataire', 'client'].includes(role)) {
    return sendJSON(res, 400, { error: 'name, email, password et role (prestataire|client) sont requis.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return sendJSON(res, 409, { error: 'Un compte existe déjà avec cet email.' });

  const id = generateId('u');
  db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, email, hashPassword(password), role);

  if (role === 'prestataire') {
    db.prepare('INSERT INTO provider_profiles (user_id) VALUES (?)').run(id);
  }

  const token = generateToken();
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, id);

  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(id);
  sendJSON(res, 201, { token, user: publicUser(user) });
});

route('POST', '/api/auth/login', async (req, res, params, body) => {
  const { email, password } = body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email || '');
  if (!user || !verifyPassword(password || '', user.password_hash)) {
    return sendJSON(res, 401, { error: 'Email ou mot de passe incorrect.' });
  }
  const token = generateToken();
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);
  sendJSON(res, 200, { token, user: publicUser(user) });
});

route('GET', '/api/me', async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Non authentifié.' });
  let profile = null;
  if (user.role === 'prestataire') {
    profile = db.prepare('SELECT * FROM provider_profiles WHERE user_id = ?').get(user.id);
  }
  sendJSON(res, 200, { user: publicUser(user), profile: profile ? providerCard(user, profile) : null });
});

route('PUT', '/api/me/profile', async (req, res, params, body) => {
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Non authentifié.' });
  if (user.role !== 'prestataire') return sendJSON(res, 403, { error: 'Réservé aux comptes prestataires.' });

  const { roleLabel, bio, zone, services, avaBg, tags, satisfaction, communes } = body;
  db.prepare(`
    UPDATE provider_profiles SET
      role_label = COALESCE(?, role_label),
      bio = COALESCE(?, bio),
      zone = COALESCE(?, zone),
      services = COALESCE(?, services),
      ava_bg = COALESCE(?, ava_bg),
      tags = COALESCE(?, tags),
      satisfaction = COALESCE(?, satisfaction),
      communes = COALESCE(?, communes)
    WHERE user_id = ?
  `).run(
    roleLabel ?? null, bio ?? null, zone ?? null, services ?? null, avaBg ?? null,
    tags ? JSON.stringify(tags) : null, satisfaction ?? null, communes ?? null, user.id
  );

  const profile = db.prepare('SELECT * FROM provider_profiles WHERE user_id = ?').get(user.id);
  sendJSON(res, 200, { profile: providerCard(user, profile) });
});

// ===================== PROVIDERS =====================
route('GET', '/api/providers', async (req, res) => {
  const rows = db.prepare(`
    SELECT u.*, p.role_label, p.bio, p.zone, p.services, p.ava_bg, p.tags, p.satisfaction, p.communes
    FROM users u JOIN provider_profiles p ON p.user_id = u.id
    WHERE u.role = 'prestataire'
    ORDER BY u.created_at DESC
  `).all();
  const list = rows.map((r) => providerCard(r, {
    role_label: r.role_label, bio: r.bio, zone: r.zone, services: r.services,
    ava_bg: r.ava_bg, tags: r.tags, satisfaction: r.satisfaction, communes: r.communes
  }));
  sendJSON(res, 200, { providers: list });
});

route('GET', '/api/providers/:id', async (req, res, params) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'prestataire'").get(params.id);
  if (!user) return sendJSON(res, 404, { error: 'Prestataire introuvable.' });
  const profile = db.prepare('SELECT * FROM provider_profiles WHERE user_id = ?').get(user.id);
  const posts = db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  sendJSON(res, 200, { provider: providerCard(user, profile), posts: posts.map(postCard) });
});

// ===================== POSTS / FIL D'ACTUALITÉ =====================
route('GET', '/api/posts', async (req, res) => {
  const rows = db.prepare('SELECT * FROM posts ORDER BY created_at DESC LIMIT 100').all();
  sendJSON(res, 200, { posts: rows.map(postCard) });
});

route('POST', '/api/posts', async (req, res, params, body) => {
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Non authentifié.' });
  const { caption, photoUrl, tags } = body;
  if (!caption && !photoUrl) return sendJSON(res, 400, { error: 'caption ou photoUrl requis.' });
  const id = generateId('post');
  db.prepare('INSERT INTO posts (id, user_id, caption, photo_url, tags) VALUES (?, ?, ?, ?, ?)')
    .run(id, user.id, caption || '', photoUrl || null, JSON.stringify(tags || []));
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  sendJSON(res, 201, { post: postCard(row) });
});

route('POST', '/api/posts/:id/react', async (req, res, params, body) => {
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Non authentifié.' });
  const type = body.type;
  if (!['soutien', 'merci', 'coup_de_coeur'].includes(type)) {
    return sendJSON(res, 400, { error: "type doit être 'soutien', 'merci' ou 'coup_de_coeur'." });
  }
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(params.id);
  if (!post) return sendJSON(res, 404, { error: 'Publication introuvable.' });

  const existing = db.prepare('SELECT id FROM reactions WHERE post_id = ? AND user_id = ? AND type = ?')
    .get(params.id, user.id, type);
  if (existing) {
    db.prepare('DELETE FROM reactions WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO reactions (id, post_id, user_id, type) VALUES (?, ?, ?, ?)')
      .run(generateId('react'), params.id, user.id, type);
  }
  sendJSON(res, 200, { reactions: reactionCounts(params.id) });
});

// ===================== MESSAGERIE =====================
function conversationSummary(conv, currentUserId) {
  const otherId = conv.user_a === currentUserId ? conv.user_b : conv.user_a;
  const other = db.prepare('SELECT id, name FROM users WHERE id = ?').get(otherId);
  const last = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1').get(conv.id);
  return {
    id: conv.id,
    with: other ? { id: other.id, name: other.name } : null,
    lastMessage: last ? last.text : null,
    lastAt: last ? last.created_at : conv.created_at
  };
}

route('GET', '/api/conversations', async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Non authentifié.' });
  const rows = db.prepare('SELECT * FROM conversations WHERE user_a = ? OR user_b = ? ORDER BY created_at DESC')
    .all(user.id, user.id);
  sendJSON(res, 200, { conversations: rows.map((c) => conversationSummary(c, user.id)) });
});

route('POST', '/api/conversations', async (req, res, params, body) => {
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Non authentifié.' });
  const otherId = body.withUserId;
  const other = db.prepare('SELECT id FROM users WHERE id = ?').get(otherId || '');
  if (!other) return sendJSON(res, 404, { error: 'Utilisateur cible introuvable.' });

  const [a, b] = [user.id, otherId].sort();
  let conv = db.prepare('SELECT * FROM conversations WHERE user_a = ? AND user_b = ?').get(a, b);
  if (!conv) {
    const id = generateId('conv');
    db.prepare('INSERT INTO conversations (id, user_a, user_b) VALUES (?, ?, ?)').run(id, a, b);
    conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
  }
  sendJSON(res, 200, { conversation: conversationSummary(conv, user.id) });
});

route('GET', '/api/conversations/:id/messages', async (req, res, params) => {
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Non authentifié.' });
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(params.id);
  if (!conv || (conv.user_a !== user.id && conv.user_b !== user.id)) {
    return sendJSON(res, 404, { error: 'Conversation introuvable.' });
  }
  const rows = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(params.id);
  sendJSON(res, 200, {
    messages: rows.map((m) => ({ id: m.id, senderId: m.sender_id, text: m.text, createdAt: m.created_at, mine: m.sender_id === user.id }))
  });
});

route('POST', '/api/conversations/:id/messages', async (req, res, params, body) => {
  const user = getAuthUser(req);
  if (!user) return sendJSON(res, 401, { error: 'Non authentifié.' });
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(params.id);
  if (!conv || (conv.user_a !== user.id && conv.user_b !== user.id)) {
    return sendJSON(res, 404, { error: 'Conversation introuvable.' });
  }
  const text = (body.text || '').trim();
  if (!text) return sendJSON(res, 400, { error: 'text requis.' });
  const id = generateId('msg');
  db.prepare('INSERT INTO messages (id, conversation_id, sender_id, text) VALUES (?, ?, ?, ?)')
    .run(id, params.id, user.id, text);
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  sendJSON(res, 201, { message: { id: row.id, senderId: row.sender_id, text: row.text, createdAt: row.created_at, mine: true } });
});

route('GET', '/api/health', async (req, res) => sendJSON(res, 200, { status: 'ok' }));

// ===================== SERVEUR HTTP =====================
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  const match = matchRoute(req.method, url.pathname);
  if (!match) return sendJSON(res, 404, { error: 'Route inconnue.' });

  try {
    const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : {};
    await match.handler(req, res, match.params, body);
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: 'Erreur serveur.', detail: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`T.Y.S backend — écoute sur http://localhost:${PORT}`);
  console.log("Voir README.md pour la référence complète des routes.");
});
