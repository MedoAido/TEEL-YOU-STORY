/* =========================================================
   MEDOinfo — prototype cliquable
   Chaque pilier a sa propre voix éditoriale :
   Actu = neutre · Sport = rythmée · Passion = narrative
   ========================================================= */

const HEART_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7.5-4.7-10-9.3C.4 8 2 4 6 4c2.2 0 3.7 1.2 6 3.5C14.3 5.2 15.8 4 18 4c4 0 5.6 4 4 7.7C19.5 16.3 12 21 12 21z"/></svg>`;

const PILLAR_LABEL = { actu: 'Actu', sport: 'Sport', passion: 'Passion' };

const ARTICLES = [
  {
    id: 'actu-1',
    pillar: 'actu',
    title: "Le Sénat entame l'examen de la réforme du système de santé",
    excerpt: "Le texte, déjà voté par l'Assemblée, doit être débattu pendant deux semaines avant un vote solennel prévu fin septembre.",
    time: 'Il y a 2h',
    reactions: 14,
    body: [
      "Le Sénat a ouvert ce lundi l'examen du projet de loi portant réforme du système de santé, un texte déjà adopté en première lecture par l'Assemblée nationale au mois de juin.",
      "Les débats, qui s'annoncent denses, devraient s'étaler sur deux semaines. Plusieurs groupes ont d'ores et déjà annoncé le dépôt d'amendements sur le volet consacré aux déserts médicaux.",
      "Le gouvernement espère un vote solennel avant la fin du mois de septembre, afin que le texte puisse entrer en application au premier trimestre de l'année prochaine.",
    ],
  },
  {
    id: 'actu-2',
    pillar: 'actu',
    title: "Nouvelle station de métro : mise en service annoncée pour septembre",
    excerpt: "La ligne 15 comptera une station supplémentaire, portant à douze le nombre d'arrêts entre les deux terminus.",
    time: 'Il y a 5h',
    reactions: 6,
    body: [
      "La régie des transports a confirmé la date de mise en service de la nouvelle station, initialement prévue au printemps puis repoussée pour des raisons techniques.",
      "Les travaux de finition, notamment l'installation des équipements d'accessibilité, se poursuivront jusqu'à la dernière semaine du mois d'août.",
      "Un nombre exact de voyageurs quotidiens attendus n'a pas été communiqué, mais la régie évoque une fréquentation comparable aux stations avoisinantes.",
    ],
  },
  {
    id: 'sport-1',
    pillar: 'sport',
    title: "Mercato éclair : l'OM boucle un renfort offensif à quelques heures du gong",
    excerpt: "Rebondissement total en fin de journée : le club phocéen accélère et signe son buteur dans le money-time du mercato.",
    time: 'Il y a 40min',
    reactions: 132,
    body: [
      "Il en fallait, du sang-froid. À une heure de la clôture, tout semblait bloqué. Et puis, coup de tonnerre : l'accord tombe, les forms sont signés, l'attaquant s'envole pour la Canebière.",
      "Un renfort qui change tout sur le papier. Vitesse, sens du but, expérience du très haut niveau — l'OM tenait sa priorité depuis des semaines, et l'a obtenue dans le money-time.",
      "Reste maintenant à transformer l'essai sur le terrain. Rendez-vous samedi pour la première, et déjà, le Vélodrome s'impatiente.",
    ],
  },
  {
    id: 'sport-2',
    pillar: 'sport',
    title: "Qualifs' : les Bleus arrachent leur billet pour l'Euro dans le money-time",
    excerpt: "Menée à la pause, l'équipe de France renverse tout en seconde période et valide sa qualification sur le fil.",
    time: 'Hier',
    reactions: 289,
    body: [
      "Ça sentait le piège. Menés au score à la pause, sifflés par leur propre public, les Bleus avaient tout du mauvais soir. Et puis, d'un coup, tout bascule.",
      "Deux buts en sept minutes, un stade qui se relève, un banc qui explose. La qualification était sur le fil du rasoir, elle est désormais actée.",
      "Direction l'Euro, donc. Avec cette question qui brûle déjà toutes les lèvres : cette équipe a-t-elle le supplément d'âme pour aller au bout ?",
    ],
  },
  {
    id: 'passion-1',
    pillar: 'passion',
    title: "Il a traversé la France à vélo pour retrouver le café de son enfance",
    excerpt: "Trois semaines, onze cents kilomètres, et un seul but : s'asseoir de nouveau à la table où son grand-père l'attendait chaque été.",
    time: 'Il y a 1j',
    reactions: 58,
    body: [
      "Il y a des voyages qu'on ne fait pas pour arriver quelque part, mais pour retrouver quelqu'un — même quand ce quelqu'un n'est plus là. Le sien a commencé un matin de juillet, sac au dos, vélo chargé, et une seule adresse en tête.",
      "Onze cents kilomètres plus tard, les mains couvertes d'ampoules, il a poussé la porte du même café, commandé le même café noir que son grand-père commandait chaque été, et s'est assis à la même table, près de la fenêtre.",
      "\"Je ne cherchais pas un souvenir, dit-il. Je cherchais à sentir, une dernière fois, ce que ça faisait d'être attendu quelque part.\" Le patron, qui ne l'avait jamais vu, lui a offert la tournée.",
    ],
  },
  {
    id: 'passion-2',
    pillar: 'passion',
    title: "Dans l'atelier où renaissent les vieux vinyles",
    excerpt: "Chaque semaine, une poignée de passionnés redonne vie à des disques qu'on croyait perdus. Reportage au cœur d'un artisanat presque oublié.",
    time: 'Il y a 2j',
    reactions: 41,
    body: [
      "L'atelier sent la colle chaude et le carton vieilli. Sur l'établi, une trentaine de pochettes attendent leur tour, certaines mangées par l'humidité, d'autres simplement fatiguées d'avoir trop voyagé.",
      "Ici, on ne jette rien. Une rayure se ponce, un sillon s'écoute au microscope, une pochette déchirée se recoud presque comme un vêtement. \"Chaque disque a une histoire avant même qu'on le pose sur la platine\", glisse l'un des restaurateurs.",
      "Le résultat, souvent, tient du miracle : un morceau qu'on croyait perdu ressort net, chaud, presque intact. Et dans la pièce, à chaque fois, le même silence recueilli avant les premiers applaudissements.",
    ],
  },
];

const DIRECT_SCRIPT = [
  { minute: "78'", icon: '⚽', text: "BUUUT ! Une frappe croisée imparable, le gardien n'a rien pu faire.", scoreDelta: [1, 0] },
  { minute: "82'", icon: '🟨', text: "Carton jaune pour un tacle un peu appuyé au milieu de terrain." },
  { minute: "85'", icon: '🔄', text: "Double changement pour resserrer le jeu en fin de rencontre." },
  { minute: "88'", icon: '⚽', text: "ÉGALISATION ! Une tête plongeante au second poteau, le stade explose.", scoreDelta: [0, 1] },
  { minute: "90+2'", icon: '🔺', text: "Occasion nette, mais la barre transversale sauve le score." },
  { minute: "90+4'", icon: '🟥', text: "Exclusion en toute fin de match, dixième homme jusqu'au coup de sifflet." },
];

const state = {
  activeTab: 'flux',
  activePillars: { actu: true, sport: true, passion: true },
  weights: loadWeights(),
  reactions: {},
  articleHearted: {},
  currentArticleId: null,
  direct: {
    teamA: 'OM',
    teamB: 'PSG',
    scoreA: 1,
    scoreB: 1,
    minuteIndex: 3,
    events: DIRECT_SCRIPT.slice(0, 3).reverse(),
    scriptCursor: 3,
  },
};

ARTICLES.forEach(a => { state.reactions[a.id] = a.reactions; });

function loadWeights() {
  try {
    const raw = localStorage.getItem('medoinfo-weights');
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { actu: 50, sport: 50, passion: 50 };
}

function saveWeights() {
  try {
    localStorage.setItem('medoinfo-weights', JSON.stringify(state.weights));
  } catch (e) { /* ignore */ }
}

/* ---------- navigation ---------- */

function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('is-visible', v.dataset.view === tab || (tab === 'flux' && v.dataset.view === 'article' && false));
  });
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('is-active', t.dataset.tab === tab);
  });
}

function openArticle(id) {
  state.currentArticleId = id;
  renderArticle(id);
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('is-visible', v.dataset.view === 'article');
  });
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('is-active'));
}

function closeArticle() {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('is-visible', v.dataset.view === state.activeTab);
  });
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('is-active', t.dataset.tab === state.activeTab);
  });
}

/* ---------- FLUX ---------- */

function sortedArticles() {
  return [...ARTICLES].sort((a, b) => state.weights[b.pillar] - state.weights[a.pillar]);
}

function renderFlux() {
  const list = document.getElementById('card-list');
  list.innerHTML = '';
  sortedArticles().forEach(article => {
    const isNeutral = !state.activePillars[article.pillar];
    const card = document.createElement('article');
    card.className = 'card' + (isNeutral ? ' is-neutral' : '');
    card.dataset.id = article.id;
    card.innerHTML = `
      <span class="card-tag card-tag--${article.pillar}">${PILLAR_LABEL[article.pillar]}</span>
      <h3 class="card-title">${article.title}</h3>
      <p class="card-excerpt">${article.excerpt}</p>
      <div class="card-meta">
        <span>${article.time}</span>
        <span class="dot"></span>
        <span class="reactions">${HEART_ICON} ${state.reactions[article.id]}</span>
      </div>
    `;
    card.addEventListener('click', () => openArticle(article.id));
    list.appendChild(card);
  });
}

function renderChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    const pillar = chip.dataset.pillar;
    const active = state.activePillars[pillar];
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
}

function togglePillar(pillar) {
  state.activePillars[pillar] = !state.activePillars[pillar];
  renderChips();
  renderFlux();
}

/* ---------- ARTICLE ---------- */

function renderArticle(id) {
  const article = ARTICLES.find(a => a.id === id);
  if (!article) return;
  const body = document.getElementById('article-body');
  const hearted = !!state.articleHearted[id];
  body.innerHTML = `
    <span class="article-tag article-tag--${article.pillar}">${PILLAR_LABEL[article.pillar]}</span>
    <h1 class="article-title">${article.title}</h1>
    <div class="article-byline">Rédaction MEDOinfo · ${article.time}</div>
    <div class="article-text">
      ${article.body.map(p => `<p>${p}</p>`).join('')}
    </div>
    <div class="react-bar">
      <button class="btn-heart ${hearted ? 'is-active' : ''}" id="btn-heart">
        ${HEART_ICON}
        <span id="heart-count">${state.reactions[id]}</span>
      </button>
    </div>
  `;
  document.getElementById('btn-heart').addEventListener('click', () => toggleHeart(id));
}

function toggleHeart(id) {
  const wasHearted = !!state.articleHearted[id];
  state.articleHearted[id] = !wasHearted;
  state.reactions[id] += wasHearted ? -1 : 1;

  const btn = document.getElementById('btn-heart');
  const count = document.getElementById('heart-count');
  btn.classList.toggle('is-active', !wasHearted);
  count.textContent = state.reactions[id];

  btn.classList.remove('is-pulsing');
  void btn.offsetWidth;
  if (!wasHearted) btn.classList.add('is-pulsing');
}

/* ---------- DIRECT ---------- */

function renderScoreboard() {
  const d = state.direct;
  const board = document.getElementById('scoreboard');
  board.innerHTML = `
    <div class="scoreboard-team">
      <div class="scoreboard-crest" style="background:var(--color-actu)">${d.teamA}</div>
      <span class="scoreboard-team-name">${d.teamA === 'OM' ? 'Marseille' : d.teamA}</span>
    </div>
    <div class="scoreboard-center">
      <span class="scoreboard-score">${d.scoreA} – ${d.scoreB}</span>
      <span class="scoreboard-minute"><span class="live-dot"></span>${DIRECT_SCRIPT[Math.min(d.scriptCursor, DIRECT_SCRIPT.length) - 1]?.minute || "76'"}</span>
    </div>
    <div class="scoreboard-team">
      <div class="scoreboard-crest" style="background:var(--color-passion)">${d.teamB}</div>
      <span class="scoreboard-team-name">${d.teamB === 'PSG' ? 'Paris' : d.teamB}</span>
    </div>
  `;
}

function renderEventFeed() {
  const feed = document.getElementById('event-feed');
  feed.innerHTML = '';
  state.direct.events.forEach(ev => {
    const row = document.createElement('div');
    row.className = 'event-row';
    row.innerHTML = `
      <span class="event-minute">${ev.minute}</span>
      <span class="event-icon">${ev.icon}</span>
      <span class="event-text">${ev.text}</span>
    `;
    feed.appendChild(row);
  });
}

function refreshDirect() {
  const d = state.direct;
  if (d.scriptCursor >= DIRECT_SCRIPT.length) {
    const idle = { minute: d.events[0]?.minute || "90+", icon: '⏱️', text: "Fin de la rencontre, merci d'avoir suivi ce direct." };
    d.events.unshift(idle);
    renderEventFeed();
    return;
  }
  const next = DIRECT_SCRIPT[d.scriptCursor];
  d.scriptCursor += 1;
  if (next.scoreDelta) {
    d.scoreA += next.scoreDelta[0];
    d.scoreB += next.scoreDelta[1];
  }
  d.events.unshift(next);
  renderScoreboard();
  renderEventFeed();
}

/* ---------- PROFIL ---------- */

function renderSliders() {
  const group = document.getElementById('slider-group');
  group.innerHTML = '';
  ['actu', 'sport', 'passion'].forEach(pillar => {
    const row = document.createElement('div');
    row.className = 'slider-row';
    row.innerHTML = `
      <div class="slider-head">
        <span class="slider-label">
          <span class="slider-swatch slider-swatch--${pillar}"></span>
          ${PILLAR_LABEL[pillar]}
        </span>
        <span class="slider-value" id="value-${pillar}">${state.weights[pillar]}%</span>
      </div>
      <input type="range" min="0" max="100" step="5" value="${state.weights[pillar]}"
             class="accent-${pillar}" id="slider-${pillar}" data-pillar="${pillar}">
    `;
    group.appendChild(row);
  });

  ['actu', 'sport', 'passion'].forEach(pillar => {
    document.getElementById(`slider-${pillar}`).addEventListener('input', (e) => {
      state.weights[pillar] = Number(e.target.value);
      document.getElementById(`value-${pillar}`).textContent = `${state.weights[pillar]}%`;
      saveWeights();
      renderFlux();
    });
  });
}

function resetWeights() {
  state.weights = { actu: 50, sport: 50, passion: 50 };
  saveWeights();
  renderSliders();
  renderFlux();
}

/* ---------- wiring ---------- */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  document.querySelectorAll('[data-back-to]').forEach(btn => {
    btn.addEventListener('click', () => closeArticle());
  });

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => togglePillar(chip.dataset.pillar));
  });

  document.getElementById('btn-refresh').addEventListener('click', refreshDirect);
  document.getElementById('btn-reset-weights').addEventListener('click', resetWeights);

  renderFlux();
  renderChips();
  renderScoreboard();
  renderEventFeed();
  renderSliders();
  switchTab('flux');
});
