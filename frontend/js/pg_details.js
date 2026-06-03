// pg_details.js — paste this basic version to start
const API_BASE_URL = 'http://localhost:3100/api';

const params = new URLSearchParams(window.location.search);
const pgId = params.get('id');

async function fetchPGDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}/pg_info/PG/${pgId}`, {
            credentials: 'include'
        });
        const pg = await response.json();
        displayDetails(pg);
    } catch (err) {
        document.body.innerHTML = `<p>Error loading PG: ${err.message}</p>`;
    }
}

function displayDetails(pg) {
    // populate your HTML elements here
    document.getElementById('pgName').textContent = pg.name;
    document.getElementById('pgRent').textContent = `₹${pg.rent}/month`;
    // add more fields as needed
}

document.addEventListener('DOMContentLoaded', fetchPGDetails);