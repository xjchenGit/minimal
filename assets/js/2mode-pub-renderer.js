function escapeHtml(str) {
    if (!str) return "";
    return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function renderPubItem(p, num) {
    // 1. 作者底線處理
    let authors = (p.authors_short || p.authors_full || "").replace(/Xuanjun Chen/g, "<u>Xuanjun Chen</u>");

    // 2. 標題與換行：加上 .title-br 類別供 CSS 控制
    let title = p.title ? escapeHtml(p.title) : "";
    title = title.replace(/&lt;br&gt;|\\\\|\\/g, '<br class="title-br">');

    const award = p.award ? ` <span class="pub-award">${p.award}</span>` : "";
    const note = p.note ? ` <span class="pub-note">(${escapeHtml(p.note)})</span>` : "";
    const linksHtml = (p.links && p.links.length > 0)
        ? `[ ${p.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.name)}</a>`).join(" | ")} ]`
        : "";

    // 統一結構：確保 index 和 publications 視覺一致
    return `
        <div class="pub-item-row">
            <div class="pub-num-col">[${num}]</div>
            <div class="pub-info-col">
                <b class="pub-title">${title}</b>${note}<br>
                <span class="pub-authors">${authors}</span>
                <div class="pub-row-meta">
                    <span class="pub-venue">${p.venue}</span>
                    ${linksHtml ? `<span class="pub-links"> ${linksHtml}</span>` : ""}
                    ${award}
                </div>
            </div>
        </div>`;
}

function loadAndRenderPubs(yamlPath, containerId, filterCategory = null, isIndex = false, onlySelected = false, reverseOrder = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(yamlPath).then(res => res.text()).then(text => {
        let data = jsyaml.load(text) || [];

        // 過濾邏輯
        let filtered = data;
        if (onlySelected) filtered = filtered.filter(p => p.selected === true || String(p.selected).toLowerCase() === 'true');
        if (filterCategory) filtered = filtered.filter(p => p.category === filterCategory);

        // 排序邏輯
        // if (reverseOrder) filtered.reverse();
        // 僅根據參數決定編號顯示方式
        const html = filtered.map((p, i) => {
            // 如果 reverseOrder 為 true，則編號從總數往回數：[11], [10], [9]...
            // 如果 reverseOrder 為 false，則編號從 1 開始數：[1], [2], [3]...
            const displayNum = reverseOrder ? (filtered.length - i) : (i + 1);
            return renderPubItem(p, displayNum);
        }).join("");

        container.innerHTML = html;
        // Invoke immediately and with delay for safety
        truncateAuthors(container);
        setTimeout(() => truncateAuthors(container), 200);
        setTimeout(() => truncateAuthors(container), 1000);
        foldLinks(container);
        setTimeout(() => foldLinks(container), 200);
        setTimeout(() => foldLinks(container), 1000);
    }).catch(err => { console.error("YAML Load Error:", err); });
}

function truncateAuthors(container) {
    const authorElems = container.querySelectorAll('.pub-authors');

    authorElems.forEach((el, idx) => {
        // Skip if already processed
        if (el.dataset.fullAuthors) return;

        // Check for wrapping. 
        // Strategy: temporarily switch to inline to check clientRects (lines)
        const originalDisplay = el.style.display;
        el.style.display = 'inline';
        const rects = el.getClientRects();
        const isWrapped = rects.length > 1;
        el.style.display = originalDisplay; // Restore

        // Also check overflow as backup but clientRects is best for "lines"
        const isOverflowing = el.scrollHeight > el.clientHeight + 4;

        if (isWrapped || isOverflowing) {
            const fullHtml = el.innerHTML;
            el.dataset.fullAuthors = fullHtml;

            // Split by comma. Be careful about nested tags. 
            // Assuming format "Name A, Name B, <u>Name C</u>"
            const parts = fullHtml.split(/,\s*/);

            // Responsive limit: 4 for desktop, 1 for mobile (strict 1st author only on mobile)
            const isMobile = window.innerWidth <= 768;
            const keepCount = isMobile ? 1 : 4;

            // If list is not significantly longer than what we keep, don't truncate
            if (parts.length <= keepCount) return;

            // Construct truncated HTML
            let shortHtml = parts.slice(0, keepCount).join(', ');

            // Check for target author
            const targetIdx = parts.findIndex(p => p.includes('Xuanjun Chen'));

            // If target is beyond the kept part, we need to include it
            if (targetIdx >= keepCount) {
                shortHtml += ', ..., ' + parts[targetIdx];
            }
            // Else: target is already in the first N authors. 
            // User requested NO "..." in this case. Just append ", et al." below.

            // Add 'et al.'
            shortHtml += ', et al.';

            // Store short HTML
            // Style: small light gray text, no border/background as requested
            const btnStyle = 'font-size: 0.85em; color: #999; cursor: pointer; margin-left: 6px; vertical-align: middle;';

            const toggleIconOpen = ` <span class="author-toggle" style="${btnStyle}" title="Show all">(more)</span>`;
            const toggleIconClose = ` <span class="author-toggle" style="${btnStyle}" title="Show less">(less)</span>`;

            el.dataset.shortHtml = shortHtml + toggleIconOpen;

            // Set initial state
            el.innerHTML = el.dataset.shortHtml;
            el.classList.add('truncated');

            // Add local onclick handler (simpler than global listener for this specific element)
            el.onclick = (e) => {
                let target = e.target;
                if (target.classList.contains('author-toggle')) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (el.classList.contains('truncated')) {
                        // Expand
                        el.innerHTML = fullHtml + toggleIconClose;
                        el.classList.remove('truncated');
                        el.classList.add('expanded');
                    } else {
                        // Collapse
                        el.innerHTML = el.dataset.shortHtml;
                        el.classList.remove('expanded');
                        el.classList.add('truncated');
                    }
                }
            };
        }
    });
}

function foldLinks(container) {
    if (window.innerWidth > 768) return; // Only for mobile

    const linkContainers = container.querySelectorAll('.pub-links');

    linkContainers.forEach((el) => {
        if (el.dataset.processedLinks) return;
        el.dataset.processedLinks = "true";

        const links = el.querySelectorAll('a');
        if (links.length <= 2) return; // No need to fold if 2 or fewer

        // Store original full HTML
        const fullHtml = el.innerHTML;
        el.dataset.fullHtml = fullHtml;

        // Construct short HTML: [ A | B | +N ]
        const remainingCount = links.length - 2;
        const toggleStyle = 'cursor: pointer; color: #154c79; font-weight: 600; text-decoration: none; margin-left: 2px;';
        const plusBtn = `<span class="link-expand-btn" style="${toggleStyle}">+${remainingCount}</span>`;

        // Reconstruct: [ Link1 | Link2 | +N ]
        // Note: The original structure includes "[ ... ]" text nodes. 
        // We replicate the look: " [ Link1 | Link2 | +N ]"
        const shortHtml = ` [ ${links[0].outerHTML} | ${links[1].outerHTML} | ${plusBtn} ]`;

        // Apply short state
        el.innerHTML = shortHtml;
        // Store short HTML for reverting
        el.dataset.shortHtml = shortHtml;

        // Add handler
        bindExpand(el);
    });
}

function bindExpand(el) {
    const btn = el.querySelector('.link-expand-btn');
    if (btn) {
        btn.onclick = (e) => {
            e.stopPropagation();
            expandLinks(el);
        };
    }
}

function expandLinks(el) {
    // Expand
    el.innerHTML = el.dataset.fullHtml;

    // Add document listener for "click outside" (blur)
    const closeListener = (e) => {
        // If click is NOT inside this element, collapse
        if (!el.contains(e.target)) {
            collapseLinks(el);
            document.removeEventListener('click', closeListener);
        }
    };

    // Slight delay to ensure the current click doesn't trigger immediate close
    setTimeout(() => {
        document.addEventListener('click', closeListener);
    }, 0);
}

function collapseLinks(el) {
    el.innerHTML = el.dataset.shortHtml;
    bindExpand(el);
}