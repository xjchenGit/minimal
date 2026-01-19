/**
 * 渲染論文列表
 * @param {string} yamlPath - YAML 路徑
 * @param {string} containerId - 容器 ID
 * @param {string} filterCategory - (選填) 篩選類別，不傳則顯示全部
 * @param {boolean} isIndex - (選填) 是否為首頁樣式
 */
function loadAndRenderPubs(yamlPath, containerId, filterCategory = null, isIndex = false) {
    fetch(yamlPath)
        .then(res => res.text())
        .then(text => {
            let data = jsyaml.load(text) || [];
            const container = document.getElementById(containerId);
            if (!container) return;

            // 1. 篩選資料
            let filtered = filterCategory 
                ? data.filter(p => p.category === filterCategory)
                : data;

            // 2. 渲染 (逆序編號)
            const html = filtered.map((p, i) => {
                // 如果是分類頁面，通常編號是從大到小 (例如 5, 4, 3...)
                const displayNum = isIndex ? (i + 1) : (filtered.length - i);
                return renderPubItem(p, displayNum, isIndex);
            }).join("");

            container.innerHTML = html;
        })
        .catch(err => console.error('Error:', err));
}

/** * 修正 renderPubItem 支援外部傳入 isIndex 
 * (請確保此 Function 包含你之前的 title.replace 邏輯)
 */
function renderPubItem(p, num, isIndex = false) {
    // ... 保持你之前的作者底線、title <br> 替換邏輯 ...
    // ... 根據 isIndex 決定回傳 <li> (首頁) 還是 <div> (列表頁) ...
    const containerClass = isIndex ? "pub-item" : "pub-item-row";
    
    // 如果是列表頁 (publications.html)，使用 div 結構
    if (!isIndex) {
        return `
            <div class="pub-item-row">
                <div class="pub-num-col">[${num}]</div>
                <div class="pub-info-col">
                    <b>${p.title.replace(/\\\\|\\n|<br>/g, '<br>')}</b><br>
                    <span style="color: #555;">${p.authors_short.replace(/Xuanjun Chen/g, "<u>Xuanjun Chen</u>")}</span><br>
                    <i>${p.venue}</i>${p.award ? ` <span class="pub-award">${p.award}</span>` : ""}<br>
                    <span style="font-size: 0.95em;">${(p.links || []).map(l => `<a href="${l.url}" target="_blank">${l.name}</a>`).join(" / ")}</span>
                </div>
            </div>`;
    }
    // ... 否則回傳首頁的 <li> 結構 ...
}
