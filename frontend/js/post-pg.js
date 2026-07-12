// Backend runs on port 3100; frontend served on http://localhost:5500
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (window.location.port === '5500' ? 'http://localhost:3100/api' : `${window.location.origin}/api`)
    : `${window.location.origin}/api`;

// ─── Helpers ────────────────────────────────────────────────────────────────

function showMessage(text, isError = false) {
    const msg = document.getElementById('postPgMessage');
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? '#e74c3c' : '#27ae60';
}

function setSubmitLoading(isLoading) {
    const btn = document.querySelector('.btn-post-submit');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Submitting...' : 'Submit Listing';
}

// ─── Form submission ─────────────────────────────────────────────────────────

async function handlePostPG(e) {
    e.preventDefault();
    showMessage('');
    setSubmitLoading(true);

    try {
        // Step 1: collect text fields and POST the PG info
        const pgPayload = {
            name:           document.getElementById('pgName').value.trim(),
            contact_phone:  document.getElementById('contactPhone').value.trim(),
            type:           document.getElementById('pgType').value,
            rent:           Number(document.getElementById('pgRent').value),
            deposit:        document.getElementById('pgDeposit').value ? Number(document.getElementById('pgDeposit').value) : null,
            city:           document.getElementById('pgCity').value.trim(),
            area:           document.getElementById('pgArea').value.trim(),
            address:        document.getElementById('pgAddress').value.trim(),
            total_beds:     document.getElementById('pgTotalBeds').value ? Number(document.getElementById('pgTotalBeds').value) : 0,
            vacant_beds:    document.getElementById('pgVacantBeds').value ? Number(document.getElementById('pgVacantBeds').value) : 0,
            accommodations: document.getElementById('accommodations').value.trim(),
            rules:          document.getElementById('pgRules').value.trim(),
            food_available: document.getElementById('pgFoodAvailable').checked,
        };

        // Basic client-side validation
        if (!pgPayload.name) { showMessage('PG name is required.', true); setSubmitLoading(false); return; }
        if (!pgPayload.contact_phone) { showMessage('Contact number is required.', true); setSubmitLoading(false); return; }
        if (!pgPayload.type) { showMessage('Please select a type.', true); setSubmitLoading(false); return; }
        if (!pgPayload.rent || pgPayload.rent <= 0) { showMessage('Please enter a valid rent amount.', true); setSubmitLoading(false); return; }
        if (!pgPayload.city) { showMessage('City is required.', true); setSubmitLoading(false); return; }
        if (!pgPayload.area) { showMessage('Area is required.', true); setSubmitLoading(false); return; }
        if (!pgPayload.address) { showMessage('Address details are required.', true); setSubmitLoading(false); return; }

        const pgResponse = await fetch(`${API_BASE_URL}/pg_info/createPG`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(pgPayload),
        });

        if (!pgResponse.ok) {
            const err = await pgResponse.json().catch(() => ({}));
            throw new Error(err.message || `Server error: ${pgResponse.status}`);
        }

        const newPG = await pgResponse.json();
        const pgId = newPG.id || newPG.pg_id || newPG.listingId;

        // Step 2: if images were selected, upload them sequentially
        const imageFiles = document.getElementById('pgImage').files;
        if (imageFiles.length > 0 && pgId) {
            let uploadFailed = false;
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const formData = new FormData();
                formData.append('image', file);

                const imgResponse = await fetch(`${API_BASE_URL}/pg_info/images/${pgId}/images`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,    // no Content-Type header — browser sets it with boundary automatically
                });

                if (!imgResponse.ok) {
                    console.warn(`Image ${i+1} upload failed:`, await imgResponse.text());
                    uploadFailed = true;
                }
            }
            if (uploadFailed) {
                showMessage('PG listed! (Some image uploads failed.)');
                setSubmitLoading(false);
                return;
            }
        }

        // Success
        showMessage('Your PG has been listed successfully!');
        document.getElementById('postPgForm').reset();

    } catch (error) {
        console.error('Post PG error:', error);
        showMessage(
            error.message.includes('Failed to fetch')
                ? 'Cannot reach the server. Make sure the backend is running on port 3100.'
                : error.message,
            true
        );
    } finally {
        setSubmitLoading(false);
    }
}

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('postPgForm');
    if (form) {
        form.addEventListener('submit', handlePostPG);
    }
});