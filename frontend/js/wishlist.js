const API_BASE_URL = 'http://localhost:3100/api';

let savedPGs = (JSON.parse(localStorage.getItem('savedPGs')) || []).map(id => String(id));

async function fetchWishlistData() {
    const container = document.getElementById('pgContainer');
    if (!container) return;

    if (savedPGs.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666; font-size: 16px;">Your wishlist is empty. Browse PG houses on the <a href="home.html" style="color: #059669; font-weight: 600; text-decoration: none;">Map page</a> to add some!</div>';
        return;
    }

    container.innerHTML = '<div class="loading">Loading your saved PG houses...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/pg_info/PG`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const pgs = await response.json();
        
        // Filter PGs in wishlist
        const wishlistPgs = pgs.filter(pg => savedPGs.includes(String(pg.id)));

        if (wishlistPgs.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666; font-size: 16px;">None of your saved PGs could be found.</div>';
            return;
        }

        container.innerHTML = '';
        wishlistPgs.forEach(pg => {
            const card = createPGCard(pg);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching wishlist:', error);
        container.innerHTML = `<div class="error">Error loading wishlist: ${error.message}</div>`;
    }
}

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
            <div class="address" style="margin-bottom: 10px;">
                <p style="font-weight: 600; color: #4b5563;">📍 ${escapeHtml(pg.area || '')}, ${escapeHtml(pg.city || '')}</p>
                ${formatAddress(pg.address)}
            </div>
            <div class="card-footer-details" style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #6b7280; border-top: 1px solid #eee; padding-top: 10px; margin-top: 5px;">
                <span>🛏️ ${pg.vacant_beds ?? 0} / ${pg.total_beds ?? 0} vacant</span>
                ${pg.food_available ? '<span style="color: #059669; font-weight: 600;">🍲 Food Included</span>' : '<span style="color: #9ca3af;">No Food</span>'}
            </div>
        </div>
        </a>
    `;
    
    return card;
}

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

function formatAddress(address) {
    if (!address) return '<p>Address not available</p>';
    const parts = address.split(',').map(part => part.trim());
    if (parts.length >= 2) {
        return `
            <p>${parts[0]}</p>
            <p>${parts.slice(1).join(', ')}</p>
        `;
    }
    return `<p>${address}</p>`;
}

function toggleSave(pgId, button) {
    const index = savedPGs.indexOf(pgId);
    if (index === -1) {
        savedPGs.push(pgId);
        button.textContent = 'SAVED';
        button.classList.add('saved');
    } else {
        savedPGs.splice(index, 1);
        button.textContent = 'SAVE';
        button.classList.remove('saved');
        // Instantly reload wishlist container if item removed
        setTimeout(fetchWishlistData, 300);
    }
    localStorage.setItem('savedPGs', JSON.stringify(savedPGs));
}

document.addEventListener('DOMContentLoaded', fetchWishlistData);
