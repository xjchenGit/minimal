function loadAndRenderHonors(yamlPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath + "?v=" + new Date().getTime())
        .then(res => res.text())
        .then(text => jsyaml.load(text) || [])
        .then(data => {
            // Filter: only show items where selected is explicitly true (or check truthiness if desired, but user said selected: true/false)
            // Let's implement robust check: item.selected === true
            const filteredData = data.filter(item => item.selected === true);

            const html = filteredData.map(item => {
                let body = item.year_prefix ? `${item.year_prefix}<b>${item.title}</b>` : `<b>${item.title}</b>`;

                if (item.details) {
                    if (item.mobile_hide_suffix) {
                        body += `<span class="mobile-hide-suffix">${item.details}</span>`;
                    } else {
                        const separator = (item.details.startsWith(',') || item.details.startsWith('.') || item.year_prefix) ? " " : ", ";
                        body += `${separator}${item.details}`;
                    }
                }

                return `<li><span class="entry-row"><span class="entry-date">${item.year}</span><span class="entry-sep">: </span><span class="entry-body">${body}</span></span></li>`;
            }).join("");

            // The original list had class "honors-list", let's keep it for CSS if needed
            // But wait, the container might be a div, so we should put the ul inside.
            container.innerHTML = `<ul class="honors-list">${html}</ul>`;

            // Add "Show more" logic directly here
            const ul = container.querySelector('ul.honors-list');
            if (ul) {
                // TEMPORARILY DISABLED: Show more honors feature
                ul.classList.add('expanded'); // Force expand to show all items
                /*
                const items = ul.querySelectorAll('li');
                if (items.length > 6) {
                    const hiddenCount = items.length - 6;
                    const btn = document.createElement('li');
                    btn.className = 'honors-toggle-btn';
                    btn.innerHTML = `[ <span style="color: #999;">Show ${hiddenCount} more honors</span> ]`;
                    // Style matches original script
                    btn.style.cssText = `color: #999; cursor: pointer; list-style: none; margin-top: 5px; margin-bottom: 25px; font-size: 13px; font-style: normal; text-align: left;`;

                    btn.onclick = function () {
                        ul.classList.add('expanded');
                        btn.remove();
                    };

                    ul.appendChild(btn);
                }
                */
            }
        })
        .catch(err => {
            console.error("YAML Load Error (Honors):", err);
        });
}
