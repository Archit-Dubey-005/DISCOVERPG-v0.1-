// Backend API (server runs on port 3100; serve frontend on http://localhost:3000 for CORS)
const API_BASE_URL = 'http://localhost:3100/api';
let savedPGs = (JSON.parse(localStorage.getItem('savedPGs')) || []).map(function (id) { return String(id); });


async function fetchPGData() {
    try {
        showLoading();

        const city = document.getElementById('filterCity')?.value?.trim();
        const area = document.getElementById('filterArea')?.value?.trim();
        const type = document.getElementById('filterType')?.value?.trim();
        const minRent = document.getElementById('filterMinRent')?.value?.trim();
        const maxRent = document.getElementById('filterMaxRent')?.value?.trim();

        const hasFilters = city || area || type || minRent || maxRent;
        let url;

        if (hasFilters) {
            const params = new URLSearchParams();
            if (city) params.set('city', city);
            if (area) params.set('area', area);
            if (type) params.set('type', type);
            if (minRent) params.set('minRent', minRent);
            if (maxRent) params.set('maxRent', maxRent);
            url = `${API_BASE_URL}/filter/pgs?${params.toString()}`;
        } else {
            url = `${API_BASE_URL}/pg_info/PG`;
        }

        const response = await fetch(url, { credentials: 'include' });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        displayPGHouses(Array.isArray(data) ? data : []);
    } catch (error) {
        showError(error.message);
    }
}

// Display PG houses
function displayPGHouses(pgList) {
    const container = document.getElementById('pgContainer');
    container.innerHTML = '';
    
    pgList.forEach(pg => {
        const card = createPGCard(pg);
        container.appendChild(card);
    });
}

// Backend returns: id, name, address, city, area, type (boys/girls/flat), rent, deposit, ...
// type is used as gender for badge; rent is price
function createPGCard(pg) {
    const card = document.createElement('div');
    card.className = 'pg-card';

    const isSaved = savedPGs.includes(String(pg.id));

    const detailsUrl = 'PG_DETAILS.html?id=' + encodeURIComponent(pg.id);
    const price = pg.rent != null ? Number(pg.rent) : 0;
    const typeLabel = pg.type ? String(pg.type).charAt(0).toUpperCase() + String(pg.type).slice(1) : 'Mixed';
    card.innerHTML = `
        <a href="${detailsUrl}" style="text-decoration: none; color: inherit; display: block;">
        <div class="card-image">
            ${getImageHTML(pg)}
        </div>
        <div class="card-content">
            <div class="card-header">
                <span class="pg-name">${escapeHtml(pg.name || 'PG House ' + pg.id)}</span>
                <span class="gender-badge ${getGenderClass(pg.type)}">
                    ${escapeHtml(typeLabel)}
                </span>
            </div>
            <div class="price-section">
                <span class="price">₹${price.toLocaleString()}/month</span>
                <button type="button" class="save-btn ${isSaved ? 'saved' : ''}" 
                        onclick="event.preventDefault(); event.stopPropagation(); toggleSave('${escapeHtml(String(pg.id))}', this)">
                    ${isSaved ? 'SAVED' : 'SAVE'}
                </button>
            </div>
            <div class="address">
                ${formatAddress(pg.address)}
            </div>
        </div>
        </a>
    `;
    
    return card;
}

// Helper function for image handling (list API does not include images; use placeholder or first image_url if present)
function getImageHTML(pg) {
    if (pg.image_url) {
        return `<img src="${escapeHtml(pg.image_url)}" alt="${escapeHtml(pg.name || '')}" loading="lazy">`;
    }
    if (pg.imageUrl) {
        return `<img src="${escapeHtml(pg.imageUrl)}" alt="${escapeHtml(pg.name || '')}" loading="lazy">`;
    }
    const initial = pg.name ? pg.name.charAt(0).toUpperCase() : 'P';
    return `<div class="image-placeholder">${initial}</div>`;
}

// Get gender/type class for styling (backend: type = boys | girls | flat)
function getGenderClass(type) {
    if (!type) return 'mixed';
    return String(type).toLowerCase();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format address with line breaks
function formatAddress(address) {
    if (!address) return '<p>Address not available</p>';
    
    // Split address into parts (you can customize this based on your data structure)
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
        return `
            <p>${parts[0]}</p>
            <p>${parts.slice(1).join(', ')}</p>
        `;
    }
    
    return `<p>${address}</p>`;
}

// Toggle save functionality
function toggleSave(pgId, button) {
    const index = savedPGs.indexOf(pgId);
    
    if (index === -1) {
        // Save PG
        savedPGs.push(pgId);
        button.textContent = 'SAVED';
        button.classList.add('saved');
        showNotification('PG saved successfully!');
    } else {
        // Unsave PG
        savedPGs.splice(index, 1);
        button.textContent = 'SAVE';
        button.classList.remove('saved');
        showNotification('PG removed from saved!');
    }
    
    // Save to localStorage
    localStorage.setItem('savedPGs', JSON.stringify(savedPGs));
}

// Show loading state
function showLoading() {
    const container = document.getElementById('pgContainer');
    container.innerHTML = '<div class="loading">Loading PG houses...</div>';
}

// Show error state
function showError(message) {
    const container = document.getElementById('pgContainer');
    container.innerHTML = `<div class="error">Error: ${message}</div>`;
}

// Show notification (you can implement a toast notification system)
function showNotification(message) {
    // Simple alert for now - you can enhance this with a better UI
    console.log(message);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    fetchPGData();

    var applyBtn = document.getElementById('filterApply');
    var clearBtn = document.getElementById('filterClear');
    if (applyBtn) applyBtn.addEventListener('click', fetchPGData);
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            var city = document.getElementById('filterCity');
            var area = document.getElementById('filterArea');
            var type = document.getElementById('filterType');
            var minRent = document.getElementById('filterMinRent');
            var maxRent = document.getElementById('filterMaxRent');
            if (city) city.value = '';
            if (area) area.value = '';
            if (type) type.value = '';
            if (minRent) minRent.value = '';
            if (maxRent) maxRent.value = '';
            fetchPGData();
        });
    }

    setInterval(fetchPGData, 300000);
});