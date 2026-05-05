// Header markup is now inlined in each page; this file only wires interactive
// behaviour (mailto -> clipboard copy + toast, external about-bio links).
document.addEventListener('DOMContentLoaded', () => {
    initEmailCopy();
    // Force markdown-rendered links inside the about bio to open in a new tab,
    // matching the previous client-side renderer's behaviour.
    document.querySelectorAll('#about-container a').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
    });
});

function initEmailCopy() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const email = this.getAttribute('href').replace('mailto:', '');
            navigator.clipboard.writeText(email).then(() => {
                showToast('Email copied to clipboard: ' + email);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });
}

function showToast(message) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
