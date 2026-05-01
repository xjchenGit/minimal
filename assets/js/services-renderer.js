function loadAndRenderServices(yamlPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath + "?v=" + new Date().getTime())
        .then(res => res.text())
        .then(text => jsyaml.load(text) || [])
        .then(data => {
            const filteredData = data.filter(item => item.selected === true);
            const html = filteredData.map(item => {
                let body = `<b>${item.role}</b>`;

                if (item.role === 'Reviewer') {
                    body += `: ${item.event}`;
                } else {
                    body += `, `;
                    if (item.link) {
                        body += `<a href="${item.link}">${item.event}</a>`;
                    } else {
                        body += item.event;
                    }

                    if (item.context) {
                        body += `, ${item.context}`;
                    }
                }

                return `<li><span class="entry-row"><span class="entry-date">${item.year}</span><span class="entry-sep">: </span><span class="entry-body">${body}</span></span></li>`;
            }).join("");

            container.innerHTML = `<ul>${html}</ul>`;
        })
        .catch(err => {
            console.error("YAML Load Error (Services):", err);
        });
}
