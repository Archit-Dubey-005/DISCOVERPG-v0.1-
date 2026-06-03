// Backend runs on port 3100; frontend served on http://localhost:5500
const API_BASE_URL = 'http://localhost:3100/api';

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
            details:        document.getElementById('pgDetails').value.trim(),
            accommodations: document.getElementById('accommodations').value.trim(),
            type:           document.getElementById('pgType').value,
            rent:           Number(document.getElementById('pgRent').value),
            contact_phone:  document.getElementById('contactPhone').value.trim(),
            owner_name:     document.getElementById('ownerName').value.trim() || null,
        };

        // Basic client-side validation
        if (!pgPayload.name) { showMessage('PG name is required.', true); setSubmitLoading(false); return; }
        if (!pgPayload.contact_phone) { showMessage('Contact number is required.', true); setSubmitLoading(false); return; }
        if (!pgPayload.type) { showMessage('Please select a type.', true); setSubmitLoading(false); return; }
        if (!pgPayload.rent || pgPayload.rent <= 0) { showMessage('Please enter a valid rent amount.', true); setSubmitLoading(false); return; }

        const pgResponse = await fetch(`${API_BASE_URL}/pg_info/PG`, {
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
        const pgId = newPG.id || newPG.pg_id;

        // Step 2: if an image was selected, upload it separately
        const imageFile = document.getElementById('pgImage').files[0];
        if (imageFile && pgId) {
            const formData = new FormData();
            formData.append('image', imageFile);

            const imgResponse = await fetch(`${API_BASE_URL}/pg_info/images/${pgId}`, {
                method: 'POST',
                credentials: 'include',
                body: formData,    // no Content-Type header — browser sets it with boundary automatically
            });

            if (!imgResponse.ok) {
                // PG was created but image failed — warn but don't block
                console.warn('Image upload failed:', await imgResponse.text());
                showMessage('PG listed! (Image upload failed — you can add it later.)');
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