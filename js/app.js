// ==========================================================================
// CONFIGURACIÓN DE FIREBASE (PEGA AQUÍ TUS CLAVES REALES DE FIREBASE)
// ==========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBmYSgUb3eWOFBw1rvbJKMG210Oy3RtEH8",
  authDomain: "liga-cervezas.firebaseapp.com",
  databaseURL: "https://liga-cervezas-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "liga-cervezas",
  storageBucket: "liga-cervezas.firebasestorage.app",
  messagingSenderId: "217652660957",
  appId: "1:217652660957:web:bc5f615e2932a57b1aa934"
};

// Inicializar Firebase Realtime Database
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const dbRef = db.ref('liga-cervezas');

// ==========================================================================
// ESTADO LOCAL Y DATOS
// ==========================================================================
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

let players = [];
let historyLog = [];
let currentBarSession = null;
let evaluatedBars = [];

// Escuchar cambios de la nube en TIEMPO REAL
dbRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    const statusBox = document.getElementById('sync-status');
    if (statusBox) {
        statusBox.textContent = '🟢 Liga conectada en tiempo real con la nube';
        statusBox.classList.add('online');
    }

    const localPlayers = JSON.parse(localStorage.getItem('beer_league_players')) || [];
    const localHistory = JSON.parse(localStorage.getItem('beer_league_history')) || [];

    if (data && data.players && data.players.length > 0) {
        players = data.players;
        historyLog = data.historyLog || [];
        currentBarSession = data.currentBarSession || null;
        evaluatedBars = data.evaluatedBars || [];
    } else if (localPlayers.length > 0) {
        players = localPlayers;
        historyLog = localHistory;
        currentBarSession = (data && data.currentBarSession) ? data.currentBarSession : null;
        evaluatedBars = (data && data.evaluatedBars) ? data.evaluatedBars : [];
        saveDataToCloud();
    } else {
        players = [
            { id: 1, name: 'Carlos', nickname: 'El Tanque', points: 15, moves: 4, beer: 'Voll-Damm', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
            { id: 2, name: 'Dani', nickname: 'El Caliente', points: 8, moves: 3, beer: 'Mahou Cinco Estrellas', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
            { id: 3, name: 'Laura', nickname: 'La Cañera', points: 22, moves: 6, beer: 'Alhambra 1925', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
        ];
        historyLog = [];
        currentBarSession = null;
        evaluatedBars = [];
        saveDataToCloud();
    }

    localStorage.setItem('beer_league_players', JSON.stringify(players));
    localStorage.setItem('beer_league_history', JSON.stringify(historyLog));

    renderAll();
}, (error) => {
    console.error("Error al conectar con la nube:", error);
    const statusBox = document.getElementById('sync-status');
    if (statusBox) {
        statusBox.textContent = '⚠️ Revisa la configuración de Firebase en app.js';
    }
});

function saveDataToCloud() {
    dbRef.set({
        players: players,
        historyLog: historyLog,
        currentBarSession: currentBarSession,
        evaluatedBars: evaluatedBars
    });
    localStorage.setItem('beer_league_players', JSON.stringify(players));
    localStorage.setItem('beer_league_history', JSON.stringify(historyLog));
}

// ==========================================================================
// CONTROL DE NAVEGACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    setupFormListeners();
});

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ==========================================================================
// RENDERIZADO GENERAL
// ==========================================================================
function renderAll() {
    renderLeaderboard();
    renderPodium();
    renderPlayerSelect();
    renderPlayerCards();
    renderHistory();
    renderBarEvaluationSection();
}

// 1. Podio Top 3
function renderPodium() {
    const podiumContainer = document.getElementById('podium-container');
    const sorted = [...players].sort((a, b) => b.points - a.points);

    if (sorted.length < 1) {
        podiumContainer.innerHTML = '<p style="color:var(--text-secondary)">No hay integrantes registrados.</p>';
        return;
    }

    const top1 = sorted[0] || { name: '-', points: 0, avatar: DEFAULT_AVATAR };
    const top2 = sorted[1] || { name: '-', points: 0, avatar: DEFAULT_AVATAR };
    const top3 = sorted[2] || { name: '-', points: 0, avatar: DEFAULT_AVATAR };

    podiumContainer.innerHTML = `
        <div class="podium-item second">
            <div class="podium-avatar">
                <img src="${top2.avatar}" alt="${top2.name}" class="avatar-img" onerror="this.src='${DEFAULT_AVATAR}'">
            </div>
            <h4>${top2.name}</h4>
            <p>${Number(top2.points).toFixed(2)} pts</p>
            <span class="podium-badge">🥈 2º Lugar</span>
        </div>
        <div class="podium-item first">
            <div class="podium-avatar">
                <img src="${top1.avatar}" alt="${top1.name}" class="avatar-img" onerror="this.src='${DEFAULT_AVATAR}'">
            </div>
            <h4>${top1.name}</h4>
            <p>${Number(top1.points).toFixed(2)} pts</p>
            <span class="podium-badge">🏆 1º Líder</span>
        </div>
        <div class="podium-item third">
            <div class="podium-avatar">
                <img src="${top3.avatar}" alt="${top3.name}" class="avatar-img" onerror="this.src='${DEFAULT_AVATAR}'">
            </div>
            <h4>${top3.name}</h4>
            <p>${Number(top3.points).toFixed(2)} pts</p>
            <span class="podium-badge">🥉 3º Lugar</span>
        </div>
    `;
}

// 2. Tabla de Clasificación
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    const sorted = [...players].sort((a, b) => b.points - a.points);

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No hay integrantes en la liga.</td></tr>`;
        return;
    }

    tbody.innerHTML = sorted.map((p, index) => `
        <tr>
            <td><strong>#${index + 1}</strong></td>
            <td>
                <div class="player-info-cell">
                    <img src="${p.avatar}" alt="${p.name}" class="table-avatar" onerror="this.src='${DEFAULT_AVATAR}'">
                    <div>
                        <strong>${p.name}</strong> 
                        <small style="color:var(--text-secondary); display:block;">("${p.nickname}")</small>
                    </div>
                </div>
            </td>
            <td>🍺 ${p.beer}</td>
            <td>${p.moves} acciones</td>
            <td><strong style="color:var(--accent-gold); font-size:1.1rem;">${Number(p.points).toFixed(2)} pts</strong></td>
        </tr>
    `).join('');
}

// 3. Desplegables de Selección (Puntos, Promotor y Evaluador/a)
function renderPlayerSelect() {
    const select = document.getElementById('select-player');
    const selectPromoter = document.getElementById('session-promoter');
    const selectEvaluator = document.getElementById('evaluator-name');

    if (players.length === 0) {
        if (select) select.innerHTML = '<option value="">No hay integrantes</option>';
        if (selectPromoter) selectPromoter.innerHTML = '<option value="">No hay integrantes</option>';
        if (selectEvaluator) selectEvaluator.innerHTML = '<option value="">No hay integrantes</option>';
        return;
    }

    const sortedByName = [...players].sort((a, b) => a.name.localeCompare(b.name));

    const optionsHTML = sortedByName.map(p => `
        <option value="${p.id}">${p.name} "${p.nickname}" (${Number(p.points).toFixed(2)} pts)</option>
    `).join('');

    const evaluatorOptionsHTML = sortedByName.map(p => `
        <option value="${p.name}">${p.name} "${p.nickname}"</option>
    `).join('');

    if (select) select.innerHTML = optionsHTML;
    if (selectPromoter) selectPromoter.innerHTML = optionsHTML;
    if (selectEvaluator) selectEvaluator.innerHTML = evaluatorOptionsHTML;
}

// 4. Cromos de Jugadores
function renderPlayerCards() {
    const grid = document.getElementById('player-cards-grid');

    if (players.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:var(--text-secondary)">No hay integrantes registrados.</p>';
        return;
    }

    grid.innerHTML = players.map(p => `
        <div class="player-card">
            <div class="card-actions">
                <button class="action-btn edit-player-btn" onclick="openEditModal(${p.id})" title="Editar perfil">✏️</button>
                <button class="action-btn delete-player-btn" onclick="deletePlayer(${p.id})" title="Eliminar integrante">🗑️</button>
            </div>
            <div class="player-avatar-box">
                <img src="${p.avatar}" alt="${p.name}" class="avatar-img" onerror="this.src='${DEFAULT_AVATAR}'">
            </div>
            <h4>${p.name}</h4>
            <div class="player-nickname">"${p.nickname}"</div>
            <div class="player-score">${Number(p.points).toFixed(2)} <span style="font-size:1rem">PTS</span></div>
            <div class="player-beer">Fav: <strong>${p.beer}</strong></div>
        </div>
    `).join('');
}

// ==========================================================================
// SECCIÓN DE VALORACIÓN DE BAR DEL JUEVES
// ==========================================================================
function renderBarEvaluationSection() {
    const setupCard = document.getElementById('session-setup-card');
    const activePanel = document.getElementById('active-session-panel');

    if (currentBarSession && currentBarSession.active) {
        setupCard.style.display = 'none';
        activePanel.style.display = 'block';

        document.getElementById('active-bar-title').textContent = currentBarSession.barName;
        document.getElementById('active-promoter-name').textContent = `Promotor: ${currentBarSession.promoterName}`;

        const ratings = currentBarSession.ratings || [];
        document.getElementById('votes-count').textContent = `${ratings.length} formulario(s) enviado(s)`;

        if (ratings.length > 0) {
            // Media de cada formulario (7 categorías)
            const formAverages = ratings.map(r => 
                (r.originalidad + r.formato + r.gelibilidad + r.idiosincrasia + r.papeo + r.precio + (r.parcabilidad !== undefined ? r.parcabilidad : 7)) / 7
            );
            const totalAvg = formAverages.reduce((acc, val) => acc + val, 0) / formAverages.length;
            document.getElementById('live-average-score').textContent = totalAvg.toFixed(2);
        } else {
            document.getElementById('live-average-score').textContent = '0.00';
        }

    } else {
        setupCard.style.display = 'block';
        activePanel.style.display = 'none';
    }

    renderEvaluatedBarsHistory();
}

// Renderizar las tascas puntuadas con DESGLOSE INDIVIDUAL DE VOTOS (7 CATEGORÍAS)
function renderEvaluatedBarsHistory() {
    const listContainer = document.getElementById('evaluated-bars-list');

    if (!evaluatedBars || evaluatedBars.length === 0) {
        listContainer.innerHTML = '<p style="color:var(--text-secondary); text-align:center; grid-column:1/-1;">Aún no se ha completado ninguna evaluación de bar esta temporada.</p>';
        return;
    }

    const reversed = [...evaluatedBars].reverse();

    listContainer.innerHTML = reversed.map(bar => {
        const individualVotesHTML = (bar.ratings && bar.ratings.length > 0)
            ? `<details class="individual-votes-accordion">
                <summary>🔍 Ver votaciones individuales (${bar.ratings.length} integrantes)</summary>
                <div class="individual-votes-list">
                    ${bar.ratings.map(r => {
                        const parcVal = r.parcabilidad !== undefined ? r.parcabilidad : 7;
                        const userAvg = ((r.originalidad + r.formato + r.gelibilidad + r.idiosincrasia + r.papeo + r.precio + parcVal) / 7).toFixed(1);
                        return `
                            <div class="user-vote-card">
                                <div class="user-vote-header">
                                    <strong>👤 ${r.evaluatorName}</strong>
                                    <span class="user-avg-badge">${userAvg} / 10</span>
                                </div>
                                <div class="user-vote-details">
                                    <span>Orig: <strong>${r.originalidad}</strong></span>
                                    <span>Form: <strong>${r.formato}</strong></span>
                                    <span>Geli: <strong>${r.gelibilidad}</strong></span>
                                    <span>Idio: <strong>${r.idiosincrasia}</strong></span>
                                    <span>Papeo: <strong>${r.papeo}</strong></span>
                                    <span>Prec: <strong>${r.precio}</strong></span>
                                    <span>Parc: <strong>${r.parcabilidad !== undefined ? r.parcabilidad : '-'}</strong></span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
               </details>`
            : '<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">Sin desglose de votos guardado.</p>';

        return `
            <div class="bar-history-card">
                <div class="bar-history-header">
                    <div>
                        <h4>🍻 ${bar.barName}</h4>
                        <small style="color:var(--text-secondary)">Promotor: <strong>${bar.promoterName}</strong> | 📅 ${bar.date}</small>
                    </div>
                    <div class="bar-score-badge">+${Number(bar.finalScore).toFixed(2)} pts</div>
                </div>
                
                <div class="category-scores-list">
                    <span>Originalidad: <strong>${bar.catAvg.originalidad}</strong></span>
                    <span>Formato: <strong>${bar.catAvg.formato}</strong></span>
                    <span>Gelibilidad: <strong>${bar.catAvg.gelibilidad}</strong></span>
                    <span>Idiosincrasia: <strong>${bar.catAvg.idiosincrasia}</strong></span>
                    <span>Papeo: <strong>${bar.catAvg.papeo}</strong></span>
                    <span>Precio: <strong>${bar.catAvg.precio}</strong></span>
                    <span>Parcabilidad: <strong>${bar.catAvg.parcabilidad || '-'}</strong></span>
                </div>

                ${individualVotesHTML}
            </div>
        `;
    }).join('');
}

// 5. Eliminar Integrante
window.deletePlayer = function(id) {
    const player = players.find(p => p.id === id);
    if (!player) return;

    const confirmed = confirm(`⚠️ ¿Estás seguro de que deseas eliminar a "${player.name} (${player.nickname})" de la nube?`);
    
    if (confirmed) {
        players = players.filter(p => p.id !== id);
        saveDataToCloud();
    }
};

// 6. Modal de Edición
window.openEditModal = function(id) {
    const player = players.find(p => p.id === id);
    if (!player) return;

    document.getElementById('edit-player-id').value = player.id;
    document.getElementById('edit-name').value = player.name;
    document.getElementById('edit-nickname').value = player.nickname;
    document.getElementById('edit-beer').value = player.beer;
    document.getElementById('edit-avatar-url').value = '';
    document.getElementById('edit-avatar-file').value = '';

    document.getElementById('edit-modal').classList.add('active');
};

window.closeEditModal = function() {
    document.getElementById('edit-modal').classList.remove('active');
};

// 7. Historial VAR
function renderHistory() {
    const historyContainer = document.getElementById('history-list');

    if (historyLog.length === 0) {
        historyContainer.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">No hay registros en la bitácora todavía.</p>';
        return;
    }

    const reversedHistory = [...historyLog].reverse();

    historyContainer.innerHTML = reversedHistory.map(item => {
        const isPositive = item.action === 'add';
        const sign = isPositive ? '+' : '-';
        const cssClass = isPositive ? 'positive' : 'negative';

        return `
            <div class="history-item ${cssClass}">
                <div class="history-details">
                    <h5>👤 ${item.playerName}</h5>
                    <p class="history-reason">💬 "${item.reason}"</p>
                </div>
                <div class="history-meta">
                    <span class="history-badge ${cssClass}">${sign}${Number(item.points).toFixed(2)} PTS</span>
                    <span class="history-date">📅 ${item.date}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Compresor de fotos
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ==========================================================================
// FORMULARIOS Y EVENTOS
// ==========================================================================
function setupFormListeners() {
    const startSessionForm = document.getElementById('start-session-form');
    if (startSessionForm) {
        startSessionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const promoterId = parseInt(document.getElementById('session-promoter').value);
            const barName = document.getElementById('session-bar-name').value.trim();

            const promoter = players.find(p => p.id === promoterId);
            if (!promoter) return;

            currentBarSession = {
                active: true,
                promoterId: promoter.id,
                promoterName: promoter.name,
                barName: barName,
                ratings: []
            };

            saveDataToCloud();
            alert(`🍻 ¡Jornada abierta para "${barName}"! Los integrantes ya pueden votar.`);
        });
    }

    const barRatingForm = document.getElementById('bar-rating-form');
    if (barRatingForm) {
        barRatingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentBarSession || !currentBarSession.active) return;

            const evaluatorName = document.getElementById('evaluator-name').value;
            const originalidad = parseFloat(document.getElementById('rate-originalidad').value);
            const formato = parseFloat(document.getElementById('rate-formato').value);
            const gelibilidad = parseFloat(document.getElementById('rate-gelibilidad').value);
            const idiosincrasia = parseFloat(document.getElementById('rate-idiosincrasia').value);
            const papeo = parseFloat(document.getElementById('rate-papeo').value);
            const precio = parseFloat(document.getElementById('rate-precio').value);
            const parcabilidad = parseFloat(document.getElementById('rate-parcabilidad').value);

            const rating = {
                evaluatorName,
                originalidad,
                formato,
                gelibilidad,
                idiosincrasia,
                papeo,
                precio,
                parcabilidad
            };

            if (!currentBarSession.ratings) currentBarSession.ratings = [];
            currentBarSession.ratings.push(rating);

            saveDataToCloud();
            alert(`✅ ¡Gracias ${evaluatorName}! Tu valoración ha sido enviada.`);
            barRatingForm.reset();
        });
    }

    const closeSessionBtn = document.getElementById('close-session-btn');
    if (closeSessionBtn) {
        closeSessionBtn.addEventListener('click', () => {
            if (!currentBarSession || !currentBarSession.active) return;
            const ratings = currentBarSession.ratings || [];

            if (ratings.length === 0) {
                alert("⚠️ Debe haber al menos un formulario de valoración enviado para poder cerrar la jornada.");
                return;
            }

            // Media de las 7 categorías por formulario
            const formAverages = ratings.map(r => 
                (r.originalidad + r.formato + r.gelibilidad + r.idiosincrasia + r.papeo + r.precio + (r.parcabilidad !== undefined ? r.parcabilidad : 7)) / 7
            );

            const finalScore = formAverages.reduce((acc, v) => acc + v, 0) / formAverages.length;
            const roundedScore = parseFloat(finalScore.toFixed(2));

            const catAvg = {
                originalidad: (ratings.reduce((acc, r) => acc + r.originalidad, 0) / ratings.length).toFixed(1),
                formato: (ratings.reduce((acc, r) => acc + r.formato, 0) / ratings.length).toFixed(1),
                gelibilidad: (ratings.reduce((acc, r) => acc + r.gelibilidad, 0) / ratings.length).toFixed(1),
                idiosincrasia: (ratings.reduce((acc, r) => acc + r.idiosincrasia, 0) / ratings.length).toFixed(1),
                papeo: (ratings.reduce((acc, r) => acc + r.papeo, 0) / ratings.length).toFixed(1),
                precio: (ratings.reduce((acc, r) => acc + r.precio, 0) / ratings.length).toFixed(1),
                parcabilidad: (ratings.reduce((acc, r) => acc + (r.parcabilidad !== undefined ? r.parcabilidad : 7), 0) / ratings.length).toFixed(1)
            };

            const promoter = players.find(p => p.id === currentBarSession.promoterId);
            if (promoter) {
                promoter.points = (parseFloat(promoter.points) || 0) + roundedScore;
                promoter.moves = (promoter.moves || 0) + 1;
            }

            const now = new Date();
            const dateStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            historyLog.push({
                id: Date.now(),
                playerId: currentBarSession.promoterId,
                playerName: currentBarSession.promoterName,
                action: 'add',
                points: roundedScore,
                reason: `Valoración oficial del bar "${currentBarSession.barName}" (${ratings.length} votos, Nota: ${roundedScore}/10)`,
                date: dateStr
            });

            if (!evaluatedBars) evaluatedBars = [];
            evaluatedBars.push({
                barName: currentBarSession.barName,
                promoterName: currentBarSession.promoterName,
                finalScore: roundedScore,
                catAvg: catAvg,
                ratings: ratings,
                date: now.toLocaleDateString()
            });

            currentBarSession = { active: false };

            saveDataToCloud();
            alert(`🎉 ¡Jornada cerrada! Se le han sumado +${roundedScore} puntos a ${promoter ? promoter.name : 'Promotor'}.`);
        });
    }

    const pointsForm = document.getElementById('points-form');
    if (pointsForm) {
        pointsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const playerId = parseInt(document.getElementById('select-player').value);
            if (!playerId) return;

            const action = document.getElementById('point-action').value;
            const amount = parseFloat(document.getElementById('point-amount').value);
            const reason = document.getElementById('point-reason').value.trim();

            const player = players.find(p => p.id === playerId);
            if (!player) return;

            if (action === 'add') {
                player.points = (parseFloat(player.points) || 0) + amount;
            } else {
                player.points = (parseFloat(player.points) || 0) - amount;
            }
            player.moves = (player.moves || 0) + 1;

            const now = new Date();
            const dateStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            historyLog.push({
                id: Date.now(),
                playerId: player.id,
                playerName: player.name,
                action: action,
                points: amount,
                reason: reason,
                date: dateStr
            });

            saveDataToCloud();
            document.getElementById('point-reason').value = '';
            alert(`✅ ¡Acción registrada para ${player.name}!`);
        });
    }

    const registerForm = document.getElementById('register-player-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('new-name').value.trim();
            const nickname = document.getElementById('new-nickname').value.trim();
            const beer = document.getElementById('new-beer').value.trim();
            
            const avatarFile = document.getElementById('new-avatar-file').files[0];
            const avatarUrl = document.getElementById('new-avatar-url').value.trim();

            const createPlayer = (photoSrc) => {
                const newPlayer = {
                    id: Date.now(),
                    name,
                    nickname,
                    points: 0,
                    moves: 0,
                    beer,
                    avatar: photoSrc || DEFAULT_AVATAR
                };

                players.push(newPlayer);
                saveDataToCloud();
                registerForm.reset();
                alert(`🎉 ¡Bienvenido/a a la Liga, ${name}!`);
            };

            if (avatarFile) {
                compressImage(avatarFile, (compressedBase64) => {
                    createPlayer(compressedBase64);
                });
            } else if (avatarUrl !== '') {
                createPlayer(avatarUrl);
            } else {
                createPlayer(DEFAULT_AVATAR);
            }
        });
    }

    const editForm = document.getElementById('edit-player-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const id = parseInt(document.getElementById('edit-player-id').value);
            const player = players.find(p => p.id === id);
            if (!player) return;

            const oldName = player.name;
            const newName = document.getElementById('edit-name').value.trim();
            const newNickname = document.getElementById('edit-nickname').value.trim();
            const newBeer = document.getElementById('edit-beer').value.trim();
            
            const avatarFile = document.getElementById('edit-avatar-file').files[0];
            const avatarUrl = document.getElementById('edit-avatar-url').value.trim();

            const updatePlayer = (photoSrc) => {
                player.name = newName;
                player.nickname = newNickname;
                player.beer = newBeer;
                if (photoSrc) {
                    player.avatar = photoSrc;
                }

                if (oldName !== newName) {
                    historyLog.forEach(item => {
                        if (item.playerId === player.id) {
                            item.playerName = newName;
                        }
                    });
                }

                saveDataToCloud();
                closeEditModal();
                alert(`✏️ ¡Perfil actualizado!`);
            };

            if (avatarFile) {
                compressImage(avatarFile, (compressedBase64) => {
                    updatePlayer(compressedBase64);
                });
            } else if (avatarUrl !== '') {
                updatePlayer(avatarUrl);
            } else {
                updatePlayer(null);
            }
        });
    }
}