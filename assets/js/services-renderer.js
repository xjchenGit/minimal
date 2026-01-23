function loadAndRenderServices(yamlPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath + "?v=" + new Date().getTime())
        .then(res => res.text())
        .then(text => jsyaml.load(text) || [])
        .then(data => {
            const filteredData = data.filter(item => item.selected === true);
            const html = filteredData.map(item => {
                let content = `<li>${item.year}: <b>${item.role}</b>`;

                // Add separator based on role or presence of link
                // If it looks like the Reviewer entry (no link, no context), use colon if appropriate, 
                // but standardizing on what was observed:
                // Organizer/Committee had comma. Reviewer had colon.

                if (item.role === 'Reviewer') {
                    content += `: ${item.event}`;
                } else {
                    content += `, `;
                    if (item.link) {
                        content += `<a href="${item.link}">${item.event}</a>`;
                    } else {
                        content += item.event;
                    }

                    if (item.context) {
                        content += `, ${item.context}`;
                    }
                }

                content += `</li>`;
                return content;
            }).join("");

            container.innerHTML = `<ul>${html}</ul>`;
        })
        .catch(err => {
            console.error("YAML Load Error (Services):", err);
        });
}
