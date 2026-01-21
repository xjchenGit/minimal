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

    // Hide items > 6
    for (let i = 6; i < items.length; i++) {
        items[i].style.display = 'none';
        items[i].classList.add('hidden-honor');
    }

    // Create "Show more" button
    const hiddenCount = items.length - 6;
    const btn = document.createElement('li'); // Change to li
    btn.innerHTML = `[ <span style="color: #2b5797;">Show ${hiddenCount} more honors</span> ]`;

    // Style as a list item without bullet, left aligned by default
    btn.style.cssText = `color: #666; cursor: pointer; list-style: none; margin-top: 5px; margin-bottom: 25px; font-size: 13px; font-style: normal;`;

    // Add click handler
    btn.onclick = function () {
        const hiddenItems = honorList.querySelectorAll('.hidden-honor');
        hiddenItems.forEach(item => {
            item.style.display = 'list-item';
        });
        btn.remove(); // Remove button after expanding
    };

    // Insert button at the end of the list
    honorList.appendChild(btn);
}

// Run on load and resize (optional, but good for rotation)
document.addEventListener('DOMContentLoaded', initMobileHonors);
