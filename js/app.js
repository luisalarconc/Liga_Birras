// ==========================================================================
// CONFIGURACIÓN DE FIREBASE (PEGA TUS CLAVES OBTENIDAS EN EL PASO 1 AQUÍ)
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
const dbRef = db.ref('beer_league');

// ==========================================================================
// ESTADO LOCAL Y DATOS
// ==========================================================================
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

let players = [];
let historyLog = [];

// Escuchar cambios de la nube en TIEMPO REAL
dbRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    // Actualizar indicador de conexión
    const statusBox = document.getElementById('sync-status');
    if (statusBox) {
        statusBox.textContent = '🟢 Liga conectada en tiempo real con la nube';
        statusBox.classList.add('online');
    }

    if (data) {
        players = data.players || [];
        historyLog = data.historyLog || [];
    } else {
        // Si la base de datos está totalmente vacía, cargamos datos por defecto iniciales
        players = [
            { id: 1, name: 'Carlos', nickname: 'El Tanque', points: 15, moves: 4, beer: 'Voll-Damm', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
            { id: 2, name: 'Laura', nickname: 'La Cañera', points: 22, moves: 6, beer: 'Alhambra 1925', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
            { id: 3, name: 'Dani', nickname: 'El Caliente', points: 8, moves: 3, beer: 'Mahou Cinco Estrellas', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }
        ];
        historyLog = [];
        saveDataToCloud();
    }
    renderAll();
}, (error) => {
    console.error("Error al conectar con la nube:", error);
    const statusBox = document.getElementById('sync-status');
    if (statusBox) {
        statusBox.textContent = '⚠️ Revisa la configuración de Firebase en app.js';
    }
});

// Guardar datos en la nube (Sincroniza automáticamente con todos los dispositivos)
function saveDataToCloud() {
    dbRef.set({
        players: players,
        historyLog: historyLog
    });
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
            <p>${top2.points} pts</p>
            <span class="podium-badge">🥈 2º Lugar</span>
        </div>
        <div class="podium-item first">
            <div class="podium-avatar">
                <img src="${top1.avatar}" alt="${top1.name}" class="avatar-img" onerror="this.src='${DEFAULT_AVATAR}'">
            </div>
            <h4>${top1.name}</h4>
            <p>${top1.points} pts</p>
            <span class="podium-badge">🏆 1º Líder</span>
        </div>
        <div class="podium-item third">
            <div class="podium-avatar">
                <img src="${top3.avatar}" alt="${top3.name}" class="avatar-img" onerror="this.src='${DEFAULT_AVATAR}'">
            </div>
            <h4>${top3.name}</h4>
            <p>${top3.points} pts</p>
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
            <td><strong style="color:var(--accent-gold); font-size:1.1rem;">${p.points} pts</strong></td>
        </tr>
    `).join('');
}

// 3. Desplegable de Integrantes
function renderPlayerSelect() {
    const select = document.getElementById('select-player');
    if (players.length === 0) {
        select.innerHTML = '<option value="">No hay integrantes disponibles</option>';
        return;
    }

    select.innerHTML = players.map(p => `
        <option value="${p.id}">${p.name} "${p.nickname}" (${p.points} pts)</option>
    `).join('');
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
            <div class="player-score">${p.points} <span style="font-size:1rem">PTS</span></div>
            <div class="player-beer">Fav: <strong>${p.beer}</strong></div>
        </div>
    `).join('');
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
                    <span class="history-badge ${cssClass}">${sign}${item.points} PTS</span>
                    <span class="history-date">📅 ${item.date}</span>
                </div>
            </div>
        `;
    }).join('');
}

// COMPRESOR / REDIMENSIONADOR DE IMÁGENES
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 200; // Redimensiona a un máximo de 200px para carga ultrarrápida
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
// FORMULARIOS DE ACCIÓN
// ==========================================================================
function setupFormListeners() {
    // Formulario de Puntos
    const pointsForm = document.getElementById('points-form');
    pointsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const playerId = parseInt(document.getElementById('select-player').value);
        if (!playerId) return;

        const action = document.getElementById('point-action').value;
        const amount = parseInt(document.getElementById('point-amount').value);
        const reason = document.getElementById('point-reason').value.trim();

        const player = players.find(p => p.id === playerId);
        if (!player) return;

        if (action === 'add') {
            player.points += amount;
        } else {
            player.points -= amount;
        }
        player.moves += 1;

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
    });

    // Registrar Nuevo Integrante
    const registerForm = document.getElementById('register-player-form');
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

    // Editar Integrante
    const editForm = document.getElementById('edit-player-form');
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