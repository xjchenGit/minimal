// Honors marked `featured: true` in _data/honors.yml are always visible; the
// rest carry class .honor-more and are hidden by CSS (pubs.css), along with a
// "More Research and Academic Honors" sub-header li that is not counted. This adds a
// right-aligned "Show N more" / "Show less" link that toggles them.

function initMobileHonors() {
    const honorList = document.querySelector('#honors-container .honors-list');
    if (!honorList) return;

    const hiddenCount = honorList.querySelectorAll('li.honor-more:not(.honors-more-header)').length;
    if (hiddenCount <= 0) return;

    const li = document.createElement('li');
    li.className = 'honors-toggle-btn';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.textContent = `Show ${hiddenCount} more`;
    btn.appendChild(label);
    btn.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    btn.addEventListener('click', () => {
        const expanded = honorList.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', String(expanded));
        label.textContent = expanded ? 'Show less' : `Show ${hiddenCount} more`;
    });
    li.appendChild(btn);
    honorList.appendChild(li);
}

document.addEventListener('DOMContentLoaded', initMobileHonors);
