function loadAndRenderExperience(yamlPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath + "?v=" + new Date().getTime())
        .then(res => res.text())
        .then(text => jsyaml.load(text) || [])
        .then(data => {
            const filteredData = data.filter(item => item.selected === true);
            const html = filteredData.map(item => {
                let content = `<li>`;

                // Time
                content += `<span class="desk-text">${item.time_desk}:</span><span class="mob-text">${item.time_mob}:</span> `;

                // Role
                content += `<b>${item.role}</b>`;

                // Major (Academic) vs Location (Industry/Intern)
                if (item.major_desk) {
                    content += ` in <span class="desk-text">${item.major_desk}</span>`;
                    if (item.major_mob) {
                        content += `<span class="mob-text">${item.major_mob}</span>`;
                    }
                    content += `, ${item.institution}`;
                } else {
                    content += `, ${item.institution}`;
                }

                content += `</li>`;
                return content;
            }).join("");

            container.innerHTML = `<ul>${html}</ul>`;
        })
        .catch(err => {
            console.error("YAML Load Error (Experience):", err);
        });
}
