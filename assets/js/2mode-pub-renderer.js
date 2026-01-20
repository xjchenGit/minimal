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
                <span class="pub-venue-row"><i>${p.venue}</i>${award}</span>
                ${linksHtml ? `<span class="pub-links"> - ${linksHtml}</span>` : ""}
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

        // // 渲染
        // const html = filtered.map((p, i) => {
        //     const displayNum = reverseOrder ? (filtered.length - i) : (i + 1);
        //     return renderPubItem(p, displayNum);
        // }).join("");

        container.innerHTML = html;
    }).catch(err => { console.error("YAML Load Error:", err); });
}

// function escapeHtml(str) {
//     if (!str) return "";
//     return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
// }

// function renderPubItem(p, num, isIndex = false) {
//     let authors = (p.authors_short || p.authors_full || "").replace(/Xuanjun Chen/g, "<u>Xuanjun Chen</u>");
    
//     // 標題處理：支援 <br>, \\, \ 並加上 .title-br 類別供 CSS 控制
//     let title = p.title ? escapeHtml(p.title) : "";
//     title = title.replace(/&lt;br&gt;|\\\\|\\/g, '<br class="title-br">');

//     const award = p.award ? ` <span class="pub-award">${p.award}</span>` : "";
//     const linksHtml = (p.links || []).map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.name)}</a>`).join(" / ");

//     if (isIndex) {
//         return `
//             <li class="pub-item">
//                 <div class="pub-num">[${num}]</div>
//                 <div class="pub-text">
//                     <b class="pub-title">${title}</b><br>
//                     <span class="pub-authors">${authors}</span><br>
//                     <i>${p.venue}</i>${award}<br>
//                     <span class="pub-links">${linksHtml}</span>
//                 </div>
//             </li>`;
//     } else {
//         return `
//             <div class="pub-item-row">
//                 <div class="pub-num-col">[${num}]</div>
//                 <div class="pub-info-col">
//                     <b class="pub-title">${title}</b><br>
//                     <span class="pub-authors" style="color: #555;">${authors}</span><br>
//                     <i>${p.venue}</i>${award}<br>
//                     <span class="pub-links" style="font-size: 0.95em;">${linksHtml}</span>
//                 </div>
//             </div>`;
//     }
// }

// function loadAndRenderPubs(yamlPath, containerId, filterCategory = null, isIndex = false, onlySelected = false) {
//     const container = document.getElementById(containerId);
//     if (!container) return;

//     fetch(yamlPath).then(res => res.text()).then(text => {
//         let data = jsyaml.load(text) || [];
//         let filtered = data;

//         // 核心過濾邏輯：onlySelected 與 filterCategory 疊加
//         if (onlySelected) {
//             filtered = filtered.filter(p => p.selected === true || String(p.selected).toLowerCase() === 'true');
//         }
//         if (filterCategory) {
//             filtered = filtered.filter(p => p.category === filterCategory);
//         }

//         const html = filtered.map((p, i) => {
//             const displayNum = isIndex ? (i + 1) : (filtered.length - i);
//             return renderPubItem(p, displayNum, isIndex);
//         }).join("");

//         container.innerHTML = isIndex ? `<div class="pub-list"><ul class="pub-ul">${html}</ul></div>` : html;
//     }).catch(err => { console.error(err); });
// }