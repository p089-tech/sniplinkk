// SnipLink Frontend Logic

const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('url-input');
const aliasInput = document.getElementById('alias-input');
const submitBtn = document.getElementById('submit-btn');
const errorMsg = document.getElementById('error-message');
const linksContainer = document.getElementById('links-container');
const emptyState = document.getElementById('empty-state');
const totalLinksSpan = document.getElementById('total-links');

// QR Modal Elements
const qrModal = document.getElementById('qr-modal');
const closeModal = document.getElementById('close-modal');
const qrImage = document.getElementById('qr-image');
const qrUrlText = document.getElementById('qr-url-text');
const downloadQrBtn = document.getElementById('download-qr-btn');

let currentQrDataUrl = '';

// Fetch and display all links
async function fetchLinks() {
  try {
    const res = await fetch('/api/urls');
    const urls = await res.json();
    renderLinks(urls);
  } catch (err) {
    console.error('Failed to fetch URLs:', err);
  }
}

// Render links in dashboard
function renderLinks(urls) {
  linksContainer.innerHTML = '';
  totalLinksSpan.textContent = `${urls.length} link${urls.length === 1 ? '' : 's'}`;

  if (urls.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  urls.forEach(item => {
    const shortUrl = `${window.location.origin}/${item.slug}`;

    const div = document.createElement('div');
    div.className = 'link-item';
    div.innerHTML = `
      <div class="link-details">
        <a href="/${item.slug}" target="_blank" class="short-url">/${item.slug}</a>
        <div class="original-url" title="${escapeHTML(item.originalUrl)}">
          ➔ ${escapeHTML(item.originalUrl)}
        </div>
      </div>
      <div class="link-actions">
        <span class="clicks-badge">${item.clicks || 0} clicks</span>
        <button class="action-btn" onclick="copyToClipboard('${shortUrl}', this)">📋 Copy</button>
        <button class="action-btn" onclick="showQRCode('${shortUrl}')">📱 QR</button>
        <button class="action-btn btn-delete" onclick="deleteLink('${item.id}')">🗑️</button>
      </div>
    `;

    linksContainer.appendChild(div);
  });
}

// Form Submit Handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.style.display = 'none';

  const originalUrl = urlInput.value.trim();
  const customSlug = aliasInput.value.trim();

  if (!originalUrl) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Shortening...';

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl, customSlug })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || 'Failed to shorten URL.';
      errorMsg.style.display = 'block';
    } else {
      urlInput.value = '';
      aliasInput.value = '';
      fetchLinks();
    }
  } catch (err) {
    errorMsg.textContent = 'Server error. Please check your connection.';
    errorMsg.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Shorten Link';
  }
});

// Copy to clipboard with instant feedback
window.copyToClipboard = function(text, buttonElement) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = buttonElement.textContent;
    buttonElement.textContent = '✓ Copied!';
    buttonElement.style.color = '#10b981';
    setTimeout(() => {
      buttonElement.textContent = originalText;
      buttonElement.style.color = '';
    }, 2000);
  });
};

// Show QR Code Modal
window.showQRCode = function(shortUrl) {
  qrUrlText.textContent = shortUrl;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`;
  qrImage.src = qrApiUrl;
  currentQrDataUrl = qrApiUrl;
  qrModal.style.display = 'flex';
};

// Close Modal
closeModal.addEventListener('click', () => {
  qrModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === qrModal) {
    qrModal.style.display = 'none';
  }
});

// Download QR Code image
downloadQrBtn.addEventListener('click', async () => {
  if (!currentQrDataUrl) return;
  try {
    const response = await fetch(currentQrDataUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'sniplink-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    window.open(currentQrDataUrl, '_blank');
  }
});

// Delete Link
window.deleteLink = async function(id) {
  if (!confirm('Are you sure you want to delete this short link?')) return;

  try {
    const res = await fetch(`/api/urls/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchLinks();
    }
  } catch (err) {
    console.error('Failed to delete URL:', err);
  }
};

// Escape HTML utility
function escapeHTML(str) {
  return (str || '').replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Initial Load
fetchLinks();
