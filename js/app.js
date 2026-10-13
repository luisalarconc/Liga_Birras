// ==========================================================================
// ESTADO Y DATOS INICIALES DE LA LIGA DE CERVEZAS
// ==========================================================================

// Imagen por defecto si un usuario no sube foto
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

// Cargar o inicializar jugadores en LocalStorage
let players = JSON.parse(localStorage.getItem('beer_league_players')) || [
    { id: 1, name: 'Carlos', nickname: 'El Tanque', points: 15, moves: 4, beer: 'Voll-Damm', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
    { id: 2, name: 'Laura', nickname: 'La Cañera', points: 22, moves: 6, beer: 'Alhambra 1925', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
    { id: 3, name: 'Dani', nickname: 'El Caliente', points: 8, moves: 3, beer: 'Mahou Cinco Estrellas', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }
];

// Cargar o inicializar historial VAR
let historyLog = JSON.parse(localStorage.getItem('beer_league_history')) || [
    {
        id: 1,
        playerId: 2,
        playerName: 'Laura',
        action: 'add',
        points: 5,
        reason: 'Pagó una ronda completa de cañas en el bar central',
        date: '10/10/2024 21:30'
    },
    {
        id: 2,
        playerId: 3,
        playerName: 'Dani',
        action: 'subtract',
        points: 3,
        reason: 'Dejó calentar media jarra de cerveza',
        date: '11/10/2024 22:15'
    }
];

// Guardar datos en el almacenamiento local del navegador
function saveData() {
    localStorage.setItem('beer_league_players', JSON.stringify(players));
    localStorage.setItem('beer_league_history', JSON.stringify(historyLog));
}

// ==========================================================================
// CONTROL DE NAVEGACIÓN (Pestañas)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderAll();
    setupFormListeners();
});

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Cambiar clase activa en botones
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Cambiar visibilidad de pestañas
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

// 1. Renderizar Podio (Top 3)
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

// 2. Renderizar Tabla de Clasificación
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    const sorted = [...players].sort((a, b) => b.points - a.points);

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No hay integrantes en la liga. ¡Añade algunos desde la pestaña Integrantes!</td></tr>`;
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

// 3. Renderizar Desplegable de Selección para Puntos
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

// 4. Renderizar Cromos de Integrantes
function renderPlayerCards() {
    const grid = document.getElementById('player-cards-grid');

    if (players.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:var(--text-secondary)">No hay integrantes registrados.</p>';
        return;
    }

    grid.innerHTML = players.map(p => `
        <div class="player-card">
            <div class="card-actions">
                <button class="action-btn edit-player-btn" onclick="openEditModal(${p.id})" title="Editar perfil de ${p.name}">✏️</button>
                <button class="action-btn delete-player-btn" onclick="deletePlayer(${p.id})" title="Eliminar a ${p.name}">🗑️</button>
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

// 5. Función para Eliminar Integrante
window.deletePlayer = function(id) {
    const player = players.find(p => p.id === id);
    if (!player) return;

    const confirmed = confirm(`⚠️ ¿Estás seguro de que deseas eliminar a "${player.name} (${player.nickname})" de la liga?`);
    
    if (confirmed) {
        players = players.filter(p => p.id !== id);
        saveData();
        renderAll();
        alert(`🗑️ "${player.name}" ha sido eliminado de la liga.`);
    }
};

// 6. Funciones del Modal de Edición de Perfil
window.openEditModal = function(id) {
    const player = players.find(p => p.id === id);
    if (!player) return;

    document.getElementById('edit-player-id').value = player.id;
    document.getElementById('edit-name').value = player.name;
    document.getElementById('edit-nickname').value = player.nickname;
    document.getElementById('edit-beer').value = player.beer;
    document.getElementById('edit-avatar-url').value = '';
    document.getElementById('edit-avatar-file').value = '';

    const modal = document.getElementById('edit-modal');
    modal.classList.add('active');
};

window.closeEditModal = function() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('active');
};

// 7. Renderizar Historial VAR
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

// ==========================================================================
// PROCESAMIENTO DE FORMULARIOS
// ==========================================================================

function setupFormListeners() {
    // Formulario de Sumar / Restar Puntos
    const pointsForm = document.getElementById('points-form');
    pointsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const playerId = parseInt(document.getElementById('select-player').value);
        if (!playerId) {
            alert("Selecciona un integrante válido.");
            return;
        }

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

        saveData();
        renderAll();

        document.getElementById('point-reason').value = '';
        alert(`✅ ¡Acción registrada correctamente para ${player.name}!`);
    });

    // Formulario de Registrar Nuevo Integrante
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
            saveData();
            renderAll();

            registerForm.reset();
            alert(`🎉 ¡Bienvenido a la Liga, ${name} "${nickname}"!`);
        };

        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                createPlayer(event.target.result);
            };
            reader.readAsDataURL(avatarFile);
        } else if (avatarUrl !== '') {
            createPlayer(avatarUrl);
        } else {
            createPlayer(DEFAULT_AVATAR);
        }
    });

    // Formulario de Editar Integrante
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

            // Actualizar nombre en el historial antiguo si ha cambiado
            if (oldName !== newName) {
                historyLog.forEach(item => {
                    if (item.playerId === player.id) {
                        item.playerName = newName;
                    }
                });
            }

            saveData();
            renderAll();
            closeEditModal();
            alert(`✏️ ¡Perfil de "${newName}" actualizado correctamente!`);
        };

        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                updatePlayer(event.target.result);
            };
            reader.readAsDataURL(avatarFile);
        } else if (avatarUrl !== '') {
            updatePlayer(avatarUrl);
        } else {
            updatePlayer(null); // Mantiene la foto anterior
        }
    });
}