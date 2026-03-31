// State Management
let currentTeam = null;
let squad = [];
let playingXI = new Array(12).fill(null);

// DOM Elements
const teamSelector = document.getElementById('team-selector');
const headerIcon = document.querySelector('.header-icon');
const availablePlayersContainer = document.getElementById('available-players');
const playingXiContainer = document.getElementById('playing-xi');
const squadEmptyState = document.getElementById('squad-empty-state');
const pitchEmptyState = document.getElementById('pitch-empty-state');
const toastContainer = document.getElementById('toast-container');
const playerSearch = document.getElementById('player-search');

const squadCountSpan = document.getElementById('squad-count');
const xiCountSpan = document.getElementById('xi-count');
const osCountSpan = document.getElementById('os-count');
const playerCountBadge = document.getElementById('player-count');
const osCountBadge = document.getElementById('overseas-count');
const clearXiBtn = document.getElementById('clear-xi-btn');
const saveXiBtn = document.getElementById('save-xi-btn');
const loadXiBtn = document.getElementById('load-xi-btn');
const compareBtn = document.getElementById('compare-btn');
const comparePanel = document.getElementById('compare-panel');
const viewToggleBtn = document.getElementById('view-toggle-btn');

// Upstash Redis Credentials
const UPSTASH_URL = "https://legal-quail-68667.upstash.io";
const UPSTASH_TOKEN = "gQAAAAAAAQw7AAIncDE0OTRkN2Y3ZDE5YWM0YzYxOWQyNWI4YzViMjgzNjRjYnAxNjg2Njc";

let isCompareMode = false;
let isPitchListView = false;

// Initialization
function init() {
    populateTeamSelector();
    teamSelector.addEventListener('change', handleTeamSelection);
    playerSearch.addEventListener('input', handleSearch);
    clearXiBtn.addEventListener('click', clearXI);
    saveXiBtn.addEventListener('click', saveXI);
    loadXiBtn.addEventListener('click', loadXI);
    if(compareBtn) compareBtn.addEventListener('click', toggleCompareMode);
    if(viewToggleBtn) viewToggleBtn.addEventListener('click', togglePitchView);
}

function togglePitchView() {
    isPitchListView = !isPitchListView;
    const playingXi = document.getElementById('playing-xi');
    const compareXi = document.getElementById('compare-playing-xi');
    
    if (isPitchListView) {
        if(playingXi) playingXi.classList.add('list-view');
        if(compareXi) compareXi.classList.add('list-view');
        viewToggleBtn.innerHTML = '<i class="fa-solid fa-grip"></i>';
    } else {
        if(playingXi) playingXi.classList.remove('list-view');
        if(compareXi) compareXi.classList.remove('list-view');
        viewToggleBtn.innerHTML = '<i class="fa-solid fa-list"></i>';
    }
}


// Map Role strings to local PNGs
function getRoleIcon(role) {
    const iconClass = "role-png";
    switch (role) {
        case 'Batter':
            return `<img src="PNGs/BAT.png" class="${iconClass}" title="Batter" alt="Batter" />`;
        case 'Fast Bowler':
            return `<img src="PNGs/PACE.png" class="${iconClass}" title="Fast Bowler" alt="Fast" />`;
        case 'Spin Bowler':
            return `<img src="PNGs/SPIN.png" class="${iconClass}" title="Spin Bowler" alt="Spin" />`;
        case 'Spin All-rounder':
            return `<img src="PNGs/BAT.png" class="${iconClass}" title="Spin All-rounder" alt="Bat" /> <img src="PNGs/SPIN.png" class="${iconClass}" title="Spin All-rounder" alt="Spin" />`;
        case 'All-rounder':
            return `<img src="PNGs/BAT.png" class="${iconClass}" title="All-rounder" alt="Bat" /> <img src="PNGs/PACE.png" class="${iconClass}" title="All-rounder" alt="Pace" />`;
        case 'Wicketkeeper':
            return `<img src="PNGs/WK.png" class="${iconClass}" title="Wicketkeeper" alt="WK" />`;
        default:
            return '<span title="Player">👤</span>';
    }
}

// Populate Dropdown
function populateTeamSelector() {
    teamsData.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        option.style.backgroundColor = team.color;
        // If color is too dark, we can just enforce white text. (All these team colors are relatively dark/colorful)
        option.style.color = '#ffffff';
        teamSelector.appendChild(option);
    });
}

// Handle Team Selection
function handleTeamSelection(e) {
    const teamId = e.target.value;
    currentTeam = teamsData.find(t => t.id === teamId);
    
    // Set Theme CSS Variable
    document.documentElement.style.setProperty('--team-theme', currentTeam.color);
    document.documentElement.style.setProperty('--team-theme-glow', currentTeam.color + '33');
    headerIcon.style.color = currentTeam.color;

    const activeTeamName = document.getElementById('active-team-name');
    if (activeTeamName) {
        activeTeamName.textContent = `${currentTeam.name} XI`;
    }

    // Reset State
    squad = [...currentTeam.players];
    playingXI = new Array(12).fill(null);
    playerSearch.value = '';
    
    renderSquad();
    renderPlayingXI();
    updateStats();
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    renderSquad(query);
}

// Create Player Card Element
function createPlayerCard(player, isPitchCard = false, overrideColor = null) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.draggable = true;
    card.id = `player-${player.id}`;
    card.dataset.id = player.id;
    
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);

    // Build the inner HTML
    const overseasIcon = player.isOverseas ? '<span class="globe-icon" title="Overseas Player">✈️</span>' : '';
    const captainIcon = player.isCaptain ? '<span class="captain-icon" title="Captain" style="color: var(--warning-color); font-weight: bold; margin-left: 5px;">(C)</span>' : '';
    const roleIcons = getRoleIcon(player.role);
    
    const accentColor = overrideColor || 'var(--team-theme)';
    const removeBtn = isPitchCard ? `<button class="remove-player-btn" onclick="removePlayerFromXI('${player.id}')" title="Remove Player"><i class="fa-solid fa-xmark"></i></button>` : '';

    card.innerHTML = `
        <div class="card-accent" style="background: ${accentColor};"></div>
        ${removeBtn}
        <div class="player-info">
            <div class="player-name">
                ${player.name}
                ${captainIcon}
                ${overseasIcon}
            </div>
            <div class="player-role-text">${player.role}</div>
        </div>
        <div style="display: flex; align-items: center;">
            <div class="player-icons">
                ${roleIcons}
            </div>
        </div>
    `;

    return card;
}

function renderSquad(searchQuery = '') {
    availablePlayersContainer.innerHTML = '';
    
    if (!currentTeam) {
        availablePlayersContainer.appendChild(squadEmptyState);
        squadCountSpan.textContent = "0 Players";
        return;
    }

    // Filter out players already in playing XI
    let availableSquad = squad.filter(p => !playingXI.find(xi => xi && xi.id === p.id));
    
    // Apply search filter
    if (searchQuery) {
        availableSquad = availableSquad.filter(p => p.name.toLowerCase().includes(searchQuery));
    }

    squadCountSpan.textContent = `${availableSquad.length} Players`;

    if (availableSquad.length === 0 && !searchQuery) {
        availablePlayersContainer.innerHTML = `<div class="empty-state"><p>All players moved to XI.</p></div>`;
    } else {
        const groups = {
            'Batters': availableSquad.filter(p => p.role.includes('Batter')),
            'Wicketkeepers': availableSquad.filter(p => p.role.includes('Wicketkeeper')),
            'All-Rounders': availableSquad.filter(p => p.role.includes('All-rounder')),
            'Bowlers': availableSquad.filter(p => p.role.includes('Bowler'))
        };
        
        for (const [groupName, players] of Object.entries(groups)) {
            if (players.length > 0) {
                const header = document.createElement('h3');
                header.className = 'role-group-header';
                header.textContent = groupName;
                availablePlayersContainer.appendChild(header);
                
                players.forEach(player => {
                    const card = createPlayerCard(player, false);
                    availablePlayersContainer.appendChild(card);
                });
            }
        }
    }
}

function renderPlayingXI() {
    playingXiContainer.innerHTML = '';
    
    // Create rows to match 4-5-3 layout (where 3rd row has 2 players + 1 empty space typically, or 3 players)
    const row1 = document.createElement('div'); row1.className = 'pitch-row';
    const row2 = document.createElement('div'); row2.className = 'pitch-row';
    const row3 = document.createElement('div'); row3.className = 'pitch-row';
    
    for (let i = 0; i < 12; i++) {
        const slot = document.createElement('div');
        slot.className = 'pitch-slot';
        
        let label = '';
        if (i === 11) {
            slot.classList.add('impact-slot');
            label = '<div class="slot-label">Impact</div>';
        }

        if (playingXI[i]) {
            const card = createPlayerCard(playingXI[i], true);
            slot.innerHTML = label; 
            slot.appendChild(card);
        } else {
            slot.innerHTML = label;
        }
        
        if (i < 4) row1.appendChild(slot);
        else if (i < 9) row2.appendChild(slot);
        else row3.appendChild(slot);
    }
    
    playingXiContainer.appendChild(row1);
    playingXiContainer.appendChild(row2);
    playingXiContainer.appendChild(row3);
}

// Updating stats and applying validations
function updateStats() {
    const activePlayers = playingXI.filter(p => p !== null);
    const totalCount = activePlayers.length;
    const osCount = activePlayers.filter(p => p.isOverseas).length;

    xiCountSpan.textContent = totalCount;
    osCountSpan.textContent = osCount;

    // Total Count Badge styling
    if (totalCount === 12) {
        playerCountBadge.className = 'stat-badge success';
    } else if (totalCount > 12) {
        playerCountBadge.className = 'stat-badge error';
    } else {
        playerCountBadge.className = 'stat-badge';
    }

    // OS Count Badge styling
    if (osCount > 4) {
        osCountBadge.className = 'stat-badge error';
    } else {
        osCountBadge.className = 'stat-badge';
    }
}

/* Drag and Drop API Functions */
let draggedPlayerId = null;
let sourceContainerId = null;

function dragStart(e) {
    draggedPlayerId = e.currentTarget.dataset.id;
    const inPitch = e.currentTarget.closest('.pitch');
    sourceContainerId = inPitch ? 'playing-xi' : 'available-players';
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function dragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.getElementById('playing-xi').classList.remove('drag-over');
    document.getElementById('available-players').classList.remove('drag-over');
}

function allowDrop(e) {
    e.preventDefault();
    if(e.currentTarget.classList) {
        e.currentTarget.classList.add('drag-over');
    }
}

function drop(e) {
    e.preventDefault();
    const targetNode = e.currentTarget;
    const isTargetPitch = e.currentTarget.closest('.pitch') !== null || e.target.closest('.pitch') !== null;
    const isTargetSquad = e.currentTarget.closest('.squad-panel') !== null || e.target.closest('.squad-panel') !== null;
    
    // Normalize target container id to match our logic
    const targetContainerId = isTargetPitch ? 'playing-xi' : (isTargetSquad ? 'available-players' : e.currentTarget.id);
    if (!targetContainerId) return; // If we dropped somewhere weird, just reset class.

    // Remove old hover style depending on where you drop
    const pitch = document.getElementById('playing-xi');
    const squadPanel = document.getElementById('available-players');
    if (pitch) pitch.classList.remove('drag-over');
    if (squadPanel) squadPanel.classList.remove('drag-over');

    if (!draggedPlayerId) return;

    // Handle swapping WITHIN the playing XI
    if (sourceContainerId === 'playing-xi' && targetContainerId === 'playing-xi') {
        const targetSlot = e.target.closest('.pitch-slot');
        if (targetSlot) {
            const targetIndex = parseInt(targetSlot.dataset.index, 10);
            const draggedIndex = playingXI.findIndex(p => p && p.id === draggedPlayerId);
            if (draggedIndex !== -1 && !isNaN(targetIndex) && targetIndex >= 0 && targetIndex < 12) {
                // Swap in array
                const temp = playingXI[draggedIndex];
                playingXI[draggedIndex] = playingXI[targetIndex];
                playingXI[targetIndex] = temp;
                renderPlayingXI();
            }
        }
        return;
    }

    if (sourceContainerId === targetContainerId) return;

    // Moving from Squad to Pitch
    if (targetContainerId === 'playing-xi' && sourceContainerId === 'available-players') {
        const player = squad.find(p => p.id === draggedPlayerId);
        if (canAddToXI(player)) {
            let targetIndex = -1;
            const targetSlot = e.target.closest('.pitch-slot');
            if (targetSlot && targetSlot.dataset.index !== undefined) {
                targetIndex = parseInt(targetSlot.dataset.index, 10);
            }

            if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < 12 && !playingXI[targetIndex]) {
                playingXI[targetIndex] = player;
            } else {
                const emptyIdx = playingXI.findIndex(p => p === null);
                if (emptyIdx !== -1) playingXI[emptyIdx] = player;
            }

            renderSquad(playerSearch.value);
            renderPlayingXI();
            updateStats();
        }
    } 
    // Moving from Pitch to Squad
    else if (targetContainerId === 'available-players' && sourceContainerId === 'playing-xi') {
        const idx = playingXI.findIndex(p => p && p.id === draggedPlayerId);
        if (idx !== -1) playingXI[idx] = null;
        renderSquad(playerSearch.value);
        renderPlayingXI();
        updateStats();
    }
}

// Logic Validation
function canAddToXI(player) {
    const activePlayers = playingXI.filter(p => p !== null);
    if (activePlayers.length >= 12) {
        showToast("Maximum 12 players allowed (11 Playing XI + 1 Impact).");
        return false;
    }
    
    if (player.isOverseas) {
        const osCount = activePlayers.filter(p => p.isOverseas).length;
        if (osCount >= 4) {
            showToast("Maximum 4 overseas players allowed.");
            return false;
        }
    }
    
    return true;
}

// Toast Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Roles toggle logic removed

function clearXI() {
    playingXI = new Array(12).fill(null);
    renderSquad(playerSearch.value);
    renderPlayingXI();
    updateStats();
}

async function saveXI() {
    const activePlayers = playingXI.filter(p => p !== null);
    if (!currentTeam || activePlayers.length === 0) {
        showToast("Nothing to save!");
        return;
    }
    
    // We want to save the exact structure including nulls so order is preserved
    // so we map over all of playingXI
    const playerIds = playingXI.map(p => p ? p.id : null);
    const key = `ipl_xi_builder_${currentTeam.id}`;
    
    try {
        saveXiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        
        const response = await fetch(`${UPSTASH_URL}/set/${key}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${UPSTASH_TOKEN}`,
            },
            body: JSON.stringify(playerIds)
        });
        
        if (response.ok) {
            showToast(`Saved ${currentTeam.name} XI to Cloud ☁️!`);
        } else {
            showToast("Failed to connect to Cloud Database.");
        }
    } catch (error) {
        console.error("Upstash Save Error:", error);
        showToast("Network error saving to Cloud.");
    } finally {
        // Reset icon back to floppy disk
        saveXiBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';
    }
}

async function loadXI() {
    if (!currentTeam) return;
    const key = `ipl_xi_builder_${currentTeam.id}`;
    
    try {
        loadXiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        
        const response = await fetch(`${UPSTASH_URL}/get/${key}`, {
            headers: {
                Authorization: `Bearer ${UPSTASH_TOKEN}`
            }
        });
        const data = await response.json();
        
        if (data.result) {
            let playerIds;
            try {
                playerIds = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
            } catch (e) {
                playerIds = null;
            }
            
            if (playerIds && Array.isArray(playerIds)) {
                playingXI = new Array(12).fill(null);
                playerIds.forEach((id, index) => {
                    if (id && index < 12) {
                        const p = squad.find(player => player.id === id);
                        if (p) playingXI[index] = p;
                    }
                });
                renderSquad(playerSearch.value);
                renderPlayingXI();
                updateStats();
                showToast(`Loaded ${currentTeam.name} XI from Cloud ☁️!`);
            } else {
                showToast("Corrupted XI found in Cloud.");
            }
        } else {
            showToast("No saved XI found in Cloud.");
        }
    } catch (error) {
        console.error("Upstash Load Error:", error);
        showToast("Network error loading from Cloud.");
    } finally {
        loadXiBtn.innerHTML = '<i class="fa-solid fa-folder-open"></i>';
    }
}

function toggleCompareMode() {
    isCompareMode = !isCompareMode;
    const workspace = document.querySelector('.workspace');
    if (isCompareMode) {
        workspace.classList.add('compare-active');
        comparePanel.style.display = 'flex';
        if (currentTeam && playingXI.filter(p => p !== null).length > 0) saveXI();
        renderCompareXI();
        compareBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        showToast("Compare mode active! Select another team to build.");
    } else {
        workspace.classList.remove('compare-active');
        comparePanel.style.display = 'none';
        compareBtn.innerHTML = '<i class="fa-solid fa-code-compare"></i>';
    }
}

function renderCompareXI() {
    const compareContainer = document.getElementById('compare-playing-xi');
    const compareName = document.getElementById('compare-team-name');
    
    if (!currentTeam || playingXI.filter(p => p !== null).length === 0) {
        compareContainer.innerHTML = '<div class="empty-pitch-state"><i class="fa-solid fa-code-compare icon-large"></i><p>No XI frozen.</p></div>';
        compareName.textContent = "Compare XI";
        return;
    }

    compareName.textContent = `${currentTeam.name} XI`;
    compareContainer.innerHTML = '';
    
    const row1 = document.createElement('div'); row1.className = 'pitch-row';
    const row2 = document.createElement('div'); row2.className = 'pitch-row';
    const row3 = document.createElement('div'); row3.className = 'pitch-row';
    
    for (let i = 0; i < 12; i++) {
        const slot = document.createElement('div');
        slot.className = 'pitch-slot';
        
        let label = '';
        if (i === 11) {
            slot.classList.add('impact-slot');
            label = '<div class="slot-label">Impact</div>';
        }

        if (playingXI[i]) {
            // Re-render specifically for compare view, overriding color
            const card = createPlayerCard(playingXI[i], true, currentTeam.color);
            card.draggable = false;
            // Remove dragging handlers from cloned cards
            card.removeEventListener('dragstart', dragStart);
            card.removeEventListener('dragend', dragEnd);
            slot.innerHTML = label;
            slot.appendChild(card);
        } else {
            slot.innerHTML = label;
        }
        
        if (i < 4) row1.appendChild(slot);
        else if (i < 9) row2.appendChild(slot);
        else row3.appendChild(slot);
    }
    
    compareContainer.appendChild(row1);
    compareContainer.appendChild(row2);
    compareContainer.appendChild(row3);
}

window.removePlayerFromXI = function(playerId) {
    const idx = playingXI.findIndex(p => p && p.id === String(playerId));
    if (idx !== -1) {
        playingXI[idx] = null;
        renderSquad(playerSearch.value);
        renderPlayingXI();
        updateStats();
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', init);
