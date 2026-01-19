// 預防 XSS 的安全過濾
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/**
 * 渲染單篇論文的 HTML
 * @param {Object} p - 論文資料物件
 * @param {number} index - 索引序號
 */
function renderPubItem(p, index) {
    const num = index + 1;
    
    // 1. 處理作者：自動加上底線
    let authors = p.authors_short || p.authors_full || "";
    authors = authors.replace(/Xuanjun Chen/g, "<u>Xuanjun Chen</u>");

    // 2. 處理標題：先 escape 再還原特定的 HTML 標籤（如 <br>）
    let title = p.title ? escapeHtml(p.title) : "";
    title = title.replace(/&lt;br&gt;/g, '<br class="title-br">') 
                .replace(/\\\\/g, '<br class="title-br">')       
                .replace(/\\/g, '<br class="title-br">');

    const venue = p.venue ? escapeHtml(p.venue) : "";
    const award = p.award ? ` <span class="pub-award" style="font-weight: 600; color: #000; margin-left: 5px;">${p.award}</span>` : "";
    const note = p.note ? ` <span class="pub-note">(${escapeHtml(p.note)})</span>` : "";

    // 3. 處理連結
    const linksHtml = (p.links || [])
        .map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.name)}</a>`)
        .join(" / ");

    return `
        <li class="pub-item" style="display: flex; margin-bottom: 15px; list-style: none;">
            <div class="pub-num" style="min-width: 35px; font-weight: 600;">[${num}]</div>
            <div class="pub-text" style="text-align: justify;">
                <b class="pub-title">${title}</b>${note}<br>
                ${authors ? `<span class="pub-authors" style="display: block; color: #555; margin-bottom: 2px;">${authors}</span>` : ""}
                <span class="pub-venue-row">
                    ${venue ? `<i>${venue}</i>` : ""}${award}
                </span>
                <br>
                ${linksHtml ? `<span class="pub-links" style="font-size: 0.9em;">${linksHtml}</span>` : ""}
            </div>
        </li>`;
}

/**
 * 從 YAML 抓取資料並渲染到指定的容器
 * @param {string} yamlPath - YAML 檔案路徑
 * @param {string} containerId - HTML 容器 ID
 */
function loadAndRenderPubs(yamlPath, containerId) {
    fetch(yamlPath)
        .then(res => res.text())
        .then(text => {
            const data = jsyaml.load(text);
            const pubs = Array.isArray(data) ? data : [];
            const container = document.getElementById(containerId);
            
            if (container) {
                container.innerHTML = `
                    <div class="pub-list">
                        <ul class="pub-ul" style="list-style: none; padding-left: 0;">
                            ${pubs.map((p, i) => renderPubItem(p, i)).join("")}
                        </ul>
                    </div>
                `;
            }
        })
        .catch(err => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `<p style="color:#b00;">Failed to load publications: ${escapeHtml(err)}</p>`;
            }
        });
}
