function initMobileHonors() {
    // Run on all devices (Desktop & Mobile)
    // if (window.innerWidth > 768) return;

    // Find the "Selected Honors" header
    const headers = document.querySelectorAll('h2');
    let honorsHeader = null;
    for (const h of headers) {
        if (h.textContent.includes('Selected Honors')) {
            honorsHeader = h;
            break;
        }
    }

    if (!honorsHeader) return;

    // The list is immediately after the header
    const honorList = honorsHeader.nextElementSibling;
    if (!honorList || honorList.tagName !== 'UL') return;

    const items = honorList.querySelectorAll('li');
    if (items.length <= 6) return;

    // CSS triggers hiding via :nth-child. 
    // We just rely on that default state, preventing the "flash".

    // Removed the "hide manually" loop here.

    // Create "Show more" button
    const hiddenCount = items.length - 6;
    const btn = document.createElement('li');
    btn.className = 'honors-toggle-btn'; // Identify button
    btn.innerHTML = `[ <span style="color: #999;">Show ${hiddenCount} more honors</span> ]`;

    // Style button to match links (color #999) and left align
    btn.style.cssText = `color: #999; cursor: pointer; list-style: none; margin-top: 5px; margin-bottom: 25px; font-size: 13px; font-style: normal; text-align: left;`;

    // Add click handler
    btn.onclick = function () {
        // Add .expanded class to parent UL -> CSS will reveal items
        honorList.classList.add('expanded');
        btn.remove();
    };

    // Insert button at the end of the list
    honorList.appendChild(btn);
}

// Run on load and resize (optional, but good for rotation)
document.addEventListener('DOMContentLoaded', initMobileHonors);
