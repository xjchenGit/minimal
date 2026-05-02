function loadAndRenderAbout(yamlPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath + "?v=" + new Date().getTime())
        .then(res => res.text())
        .then(text => jsyaml.load(text) || {})
    // Define icon path assuming it's in the same directory as fetched yaml, or default to ymls/icons.yml
    const iconPath = "ymls/icons.yml";

    const fetchContent = fetch(yamlPath + "?v=" + new Date().getTime()).then(res => res.text()).then(text => jsyaml.load(text) || {});
    const fetchIcons = fetch(iconPath + "?v=" + new Date().getTime()).then(res => res.text()).then(text => jsyaml.load(text) || {});

    Promise.all([fetchContent, fetchIcons])
        .then(([data, icons]) => {
            const processText = (text) => {
                if (!text) return "";
                // Replace {{icon:key}} with SVG from loaded icons
                return text.replace(/{{icon:(\w+)}}/g, (match, key) => icons[key] || "");
            };

            let html = "";
            if (data.bio) {
                // Ensure links open in new tab
                const bioHtml = marked.parse(processText(data.bio));
                // marked wraps in <p>, effectively replacing the original structure
                html += bioHtml;
            }
            if (data.intro) {
                const introHtml = marked.parse(processText(data.intro));
                html += introHtml;
            }

            // Desktop-only text-style contact links (visibility controlled by CSS)
            html += `<p class="hero-contact-text">[<a href="mailto:D12942018@ntu.edu.tw">Email</a> | <a href="https://www.linkedin.com/in/jun-ntu/" target="_blank" rel="noopener noreferrer">Linkedin</a> | <a href="https://x.com/xjchen_ntu" target="_blank" rel="noopener noreferrer">Twitter</a> | <a href="https://github.com/xjchenGit" target="_blank" rel="noopener noreferrer">Github</a> | <a href="https://scholar.google.com/citations?user=ZDVOXd4AAAAJ&hl=en" target="_blank" rel="noopener noreferrer">Google Scholar</a>]</p>`;

            container.innerHTML = html;

            // Add justify alignment to paragraphs to match original design
            const paragraphs = container.querySelectorAll('p');
            paragraphs.forEach(p => {
                p.style.textAlign = 'justify';
            });

            // Enforce target="_blank" for all links in this container
            const links = container.querySelectorAll('a');
            links.forEach(a => {
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
            });

            // Re-render SVG icons if necessary (they are part of HTML string so should be fine)
            // But verify if marked escapes them. 
            // marked default does NOT escape HTML, so <svg> should pass through.
        })
        .catch(err => {
            console.error("YAML Load Error (About):", err);
        });
}
