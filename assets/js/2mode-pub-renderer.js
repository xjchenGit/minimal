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
    // 3. BibTeX 處理
    const bibId = `bib-${num}-${Math.floor(Math.random() * 10000)}`;
    const bibLink = p.bibtex
        ? `<a href="javascript:void(0)" onclick="toggleBib('${bibId}')">bib</a>`
        : "";

    // 合併一般連結與 BibTeX 連結
    let allLinksArr = [];
    if (bibLink) allLinksArr.push(bibLink); // BibTeX first

    if (p.links && p.links.length > 0) {
        // Sort links: "arXiv" comes first
        p.links.sort((a, b) => {
            const isArxivA = a.name.toLowerCase() === 'arxiv';
            const isArxivB = b.name.toLowerCase() === 'arxiv';
            if (isArxivA && !isArxivB) return -1;
            if (!isArxivA && isArxivB) return 1;
            return 0;
        });

        p.links.forEach(l => {
            allLinksArr.push(`<a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.name)}</a>`);
        });
    }

    const linksHtml = (allLinksArr.length > 0)
        ? `[ ${allLinksArr.join(" | ")} ]`
        : "";

    // BibTeX 區域 (預設隱藏，滑鼠移開後 3 秒自動緩慢隱藏)
    const bibHtml = p.bibtex ? `
        <div id="${bibId}" class="pub-bibtex" style="display:none; opacity:1;" 
             onmouseenter="cancelHideBib('${bibId}')" 
             onmouseleave="scheduleHideBib('${bibId}')">
            <pre>${highlightBibtex(p.bibtex)}</pre>
            <div class="bib-ctrl">
                <span class="bib-copy-btn" onclick="copyBib('${bibId}')" title="Copy to Clipboard">
                    <i class="fa fa-copy"></i>
                </span>
            </div>
        </div>` : "";

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
                ${bibHtml}
            </div>
        </div>`;
}

// Helper to syntax highlight BibTeX
function highlightBibtex(str) {
    if (!str) return "";
    let high = escapeHtml(str);

    // 1. Strings (Values) -> Blue ("...")
    high = high.replace(/(&quot;.*?&quot;)/g, '<span class="bib-val">$1</span>');

    // 1b. Braced Values -> Blue ({...})
    // Matches field = { content }, assuming single line per field in standard format
    // $1: = and whitespace, $2: content, $3: comma/whitespace at end
    high = high.replace(/(=)(\s*)\{(.*)\}(\s*,?\s*)$/gm, '$1$2<span class="bib-val">{$3}</span>$4');

    // 1c. Numeric Values -> Blue (e.g. year = 2025)
    high = high.replace(/(=)(\s*)(\d+)(\s*,?\s*)$/gm, '$1$2<span class="bib-val">$3</span>$4');

    // 2. Keys -> Dark Gray (Key =)
    // Match start of line keyword followed by =
    high = high.replace(/^(\s*)(\w+)(\s*=)/gm, '$1<span class="bib-key">$2</span><span class="bib-sym">=</span>');

    // 3. Type -> Black Bold (@type)
    high = high.replace(/(@\w+)/g, '<span class="bib-type">$1</span>');

    // 4. Symbols -> Medium Gray ({ } ,)
    // Only replace symbols that are NOT inside our generated span tags
    // Since our spans are <span class="bib-val">...</span>, we can safely replace { or } if we are careful?
    // Actually, step 1b wraps content in <span class="bib-val">{...}</span>.
    // So the { and } ARE inside the span.
    // If we replace { with <span class="bib-sym">{</span>, we break the HTML tag?
    // No, <span class="bib-val"> has no { in attributes.
    // Content is {Text}.
    // If replace { -> span, we get <span class="bib-val"><span class="bib-sym">{</span>Text...
    // This is Valid HTML (nested spans).
    // And logically: Outer span is Blue. Inner span is Gray.
    // CSS: .bib-sym { color: #777; } overrides .bib-val { color: blue; }
    // So the braces { } will turn Gray, content remains Blue.
    // This is actually DESIRABLE (delimiters gray, content blue).
    high = high.replace(/([{},])/g, '<span class="bib-sym">$1</span>');

    return high;
}

// Global helpers for BibTeX
const bibTimers = {};

function toggleBib(id) {
    const el = document.getElementById(id);
    if (el) {
        if (el.style.display === 'none') {
            // Show
            el.style.display = 'block';
            // Use setTimeout to allow display block to apply before opacity transition
            setTimeout(() => el.style.opacity = '1', 10);
            cancelHideBib(id); // Clear any pending hides
        } else {
            // Hide immediately if toggled off manually
            el.style.display = 'none';
        }
    }
}

function scheduleHideBib(id) {
    const el = document.getElementById(id);
    if (!el) return;

    // Clear existing timer if any
    if (bibTimers[id]) clearTimeout(bibTimers[id]);

    // Wait 3 seconds, then fade out
    bibTimers[id] = setTimeout(() => {
        el.style.opacity = '0';
        // After fade transition (0.5s), hide element
        setTimeout(() => {
            // Verify we didn't cancel during fade
            if (el.style.opacity === '0') {
                el.style.display = 'none';
            }
        }, 500);
    }, 3000);
}

function cancelHideBib(id) {
    if (bibTimers[id]) {
        clearTimeout(bibTimers[id]);
        delete bibTimers[id];
    }
    const el = document.getElementById(id);
    if (el) {
        el.style.opacity = '1';
    }
}

function copyBib(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const pre = el.querySelector('pre');
    const text = pre.innerText;

    const showSuccess = () => {
        const btnIcon = el.querySelector('.bib-copy-btn i');
        if (btnIcon) {
            const originalClass = btnIcon.className;
            btnIcon.className = 'fa fa-check';
            setTimeout(() => btnIcon.className = originalClass, 1500);
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showSuccess).catch(err => {
            console.error('Clipboard API failed', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }

    function fallbackCopy(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure it's not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) showSuccess();
        } catch (err) {
            console.error('Fallback copy failed', err);
        }

        document.body.removeChild(textArea);
    }
}

function loadAndRenderPubs(yamlPath, containerId, filterCategory = null, isIndex = false, onlySelected = false, reverseOrder = false, orderYamlPath = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const fetchPubs = fetch(yamlPath + "?v=" + new Date().getTime()).then(res => res.text()).then(text => jsyaml.load(text) || []);
    const fetchOrder = orderYamlPath
        ? fetch(orderYamlPath + "?v=" + new Date().getTime()).then(res => res.text()).then(text => jsyaml.load(text) || {})
        : Promise.resolve({});

    Promise.all([fetchPubs, fetchOrder]).then(([data, orderData]) => {
        let filtered = data;
        let selectedIds = null;

        if (orderYamlPath && orderData && orderData.selected_papers) {
            selectedIds = orderData.selected_papers;
        }

        // Logic A: Use external list for "Selected Publications" (isIndex or onlySelected)
        if (onlySelected && selectedIds) {
            // Filter: Must be in the list
            filtered = filtered.filter(p => p.id && selectedIds.includes(p.id));

            // Sort: Based on index in the list
            filtered.sort((a, b) => {
                return selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id);
            });
        }
        // Logic B: Default behavior (if no external list or not "onlySelected")
        else {
            if (onlySelected) {
                filtered = filtered.filter(p => p.selected === true || typeof p.selected === 'number' || String(p.selected).toLowerCase() === 'true');
                // Fallback Sort if numbers used (though verified we reverted them, keeping for robustness)
                filtered.sort((a, b) => {
                    let valA = typeof a.selected === 'number' ? a.selected : 0;
                    let valB = typeof b.selected === 'number' ? b.selected : 0;
                    return valB - valA;
                });
            }
            if (filterCategory) filtered = filtered.filter(p => p.category === filterCategory);
        }

        // 排序邏輯
        // if (reverseOrder) filtered.reverse();
        const html = filtered.map((p, i) => {
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
                // Only add ellipsis if there are actual authors in between
                if (targetIdx > keepCount) {
                    shortHtml += ', ...';
                }
                shortHtml += ', ' + parts[targetIdx];
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