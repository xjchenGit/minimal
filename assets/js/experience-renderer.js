function loadAndRenderExperience(yamlPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath + "?v=" + new Date().getTime())
        .then(res => res.text())
        .then(text => jsyaml.load(text) || [])
        .then(data => {
            const filteredData = data.filter(item => item.selected === true);
            const html = filteredData.map(item => {
                let body = `<b>${item.role}</b>`;

                if (item.major_desk) {
                    body += ` in <span class="desk-text">${item.major_desk}</span>`;
                    if (item.major_mob) {
                        body += `<span class="mob-text">${item.major_mob}</span>`;
                    }
                    body += `, ${item.institution}`;
                } else {
                    body += `, ${item.institution}`;
                }

                const date = `<span class="desk-text">${item.time_desk}</span><span class="mob-text">${item.time_mob}</span>`;

                return `<li><span class="entry-row"><span class="entry-date">${date}</span><span class="entry-sep">: </span><span class="entry-body">${body}</span></span></li>`;
            }).join("");

            container.innerHTML = `<ul>${html}</ul>`;
        })
        .catch(err => {
            console.error("YAML Load Error (Experience):", err);
        });
}
