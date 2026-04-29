/**
 * Load top nav into #sidebar and highlight current page link.
 * @param {string} currentPage - 'about' | 'publications' | 'blogs'
 */
function initHeader(currentPage) {
    fetch('header.html?v=' + new Date().getTime())
        .then(response => response.text())
        .then(data => {
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) return;
            sidebar.innerHTML = data;

            // Highlight active nav link
            const aboutLink = document.getElementById('nav-about');
            const blogLink = document.getElementById('nav-blogs');
            const pubLink = document.getElementById('nav-pub');

            [aboutLink, blogLink, pubLink].forEach(link => {
                if (link) {
                    link.style.textDecoration = "none";
                    link.style.color = "#888";
                    link.style.fontWeight = "500";
                }
            });

            let activeLink = aboutLink;
            if (currentPage === 'publications') activeLink = pubLink;
            else if (currentPage === 'blogs') activeLink = blogLink;

            if (activeLink) {
                activeLink.style.color = "#222";
                activeLink.style.fontWeight = "600";
                activeLink.style.borderBottom = "2px solid #154c79";
                activeLink.style.paddingBottom = "2px";
            }

            initEmailCopy();
            checkCVVisibility();
        })
        .catch(err => console.error('Error loading header:', err));
}

function checkCVVisibility() {
    const cvLinks = document.querySelectorAll('.cv-link');
    if (cvLinks.length === 0) return;
    const cvUrl = cvLinks[0].getAttribute('href');
    fetch(cvUrl, { method: 'HEAD' })
        .then(res => {
            const ct = res.headers.get('content-type') || '';
            if (res.ok && ct.includes('pdf')) {
                cvLinks.forEach(el => el.classList.remove('cv-hidden'));
            }
        })
        .catch(() => {});
}

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
