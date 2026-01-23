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
                // Handling special case for "Ranked 3rd..." where "2021" is followed by ": Ranked "
                // In my YAML, I put "Ranked " in year_prefix if needed, or I can just handle it here.
                // Current YAML: year: "2021", year_prefix: "Ranked ", title: "3rd/42...", details: "..."

                let line = `<li>`;

                if (item.year_prefix) {
                    line += `${item.year}: ${item.year_prefix}<b>${item.title}</b>`;
                } else {
                    line += `${item.year}: <b>${item.title}</b>`;
                }

                if (item.details) {
                    if (item.mobile_hide_suffix) {
                        line += `<span class="mobile-hide-suffix">${item.details}</span>`;
                    } else {
                        // For normal items, details usually follow a comma if it's not a "Ranked" type or if it's not "awarded by..." directly?
                        // Original HTML consistency check:
                        // "2026: <b>Title</b>, details"
                        // "2025: <b>Title</b>, details"
                        // "2021: Ranked <b>Title</b> on details" (Note: 'on' is part of details in my YAML)

                        // If details starts with "," or " " or "." lets just append. 
                        // But my YAML has cleaned strings. 
                        // "one of only..." -> needs comma?
                        // "The IEEE..." -> needs comma?
                        // "awarded by..." -> needs comma?
                        // "on the LA track..." -> needs space?

                        // Let's refine the separator logic based on my YAML content.
                        // Most need ", " separator.
                        // "Ranked ... on ..." needs space separator.

                        // Simpler approach: check if details start with punctuation.
                        const separator = (item.details.startsWith(',') || item.details.startsWith('.') || item.year_prefix) ? " " : ", ";
                        line += `${separator}${item.details}`;
                    }
                }

                line += `</li>`;
                return line;
            }).join("");

            // The original list had class "honors-list", let's keep it for CSS if needed
            // But wait, the container might be a div, so we should put the ul inside.
            container.innerHTML = `<ul class="honors-list">${html}</ul>`;

            // Add "Show more" logic directly here
            const ul = container.querySelector('ul.honors-list');
            if (ul) {
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
            }
        })
        .catch(err => {
            console.error("YAML Load Error (Honors):", err);
        });
}
