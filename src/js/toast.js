// Toast Notification System for Desi Touch (Hardened)
// - Uses textContent by default
// - Optional allowHtml true will sanitize via DOMPurify (if loaded)

export function showToast(message, type = 'success', duration = 3500, { allowHtml = false } = {}) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '🌱',
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️'
  };

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.style.fontSize = '1.2rem';
  icon.textContent = iconMap[type] || '🌱';

  const msg = document.createElement('span');
  msg.className = 'toast-message';

  if (allowHtml && typeof DOMPurify !== 'undefined') {
    // sanitize incoming HTML before inserting
    try {
      msg.innerHTML = DOMPurify.sanitize(message);
    } catch (e) {
      msg.textContent = message;
    }
  } else {
    // safe default: treat message as plain text
    msg.textContent = message;
  }

  toast.appendChild(icon);
  toast.appendChild(msg);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}
