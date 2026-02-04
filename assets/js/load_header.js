/**
 * 加載 Header 並初始化導覽列高亮與 Follow 按鈕邏輯
 * @param {string} currentPage - 目前頁面識別碼 ('about' 或 'pub')
 */
function initHeader(currentPage) {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) return;
            sidebar.innerHTML = data;

            // 1. 處理導航列高亮邏輯
            // 1. 處理導航列高亮邏輯
            const aboutLink = document.getElementById('nav-about');
            const blogLink = document.getElementById('nav-blogs');
            const pubLink = document.getElementById('nav-pub');

            if (aboutLink && pubLink) {
                // 重置所有連結樣式
                [aboutLink, blogLink, pubLink].forEach(link => {
                    if (link) {
                        link.style.textDecoration = "none";
                        link.style.color = "#888";
                        link.style.fontWeight = "500";
                    }
                });

                // 設定當前 active 頁面樣式
                let activeLink = aboutLink;
                if (currentPage === 'publications') activeLink = pubLink;
                else if (currentPage === 'blogs') activeLink = blogLink;

                if (activeLink) {
                    activeLink.style.textDecoration = "underline";
                    activeLink.style.textUnderlineOffset = "6px";
                    activeLink.style.color = "#000";
                    activeLink.style.fontWeight = "600";
                }
            }

            // 2. 綁定 Follow 按鈕事件
            const followBtn = document.getElementById('follow-btn');
            const socialList = document.getElementById('social-list');

            if (followBtn && socialList) {
                followBtn.addEventListener('click', function (e) {
                    e.stopPropagation(); // 防止點擊按鈕時觸發 window 的關閉事件
                    socialList.classList.toggle('show');
                });
            }
        })
        .catch(err => console.error('Error loading header:', err));
}

// 3. 全域點擊監聽 (只需註冊一次，放在函式外)
// 3. 全域點擊監聽 (只需註冊一次，放在函式外)
function closeSocialMenu(event) {
    const socialList = document.getElementById('social-list');
    // 如果選單是開啟狀態，且點擊的不是按鈕本身，則關閉選單
    if (socialList && socialList.classList.contains('show')) {
        if (!event.target.closest('#follow-btn') && !event.target.closest('#social-list')) {
            socialList.classList.remove('show');
        }
    }
}

window.addEventListener('click', closeSocialMenu);
window.addEventListener('touchstart', closeSocialMenu);
