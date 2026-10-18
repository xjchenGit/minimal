(function () {
	const toc = document.querySelector('.pubs-toc');
	if (!toc) return;
	const links = Array.from(toc.querySelectorAll('a[data-target]'));
	const targets = links
		.map(a => document.getElementById(a.dataset.target))
		.filter(Boolean);
	if (!targets.length) return;

	const ul = toc.querySelector('ul');

	// Phone: section menu in the top nav bar (shown by CSS at <=480px)
	const navBar = document.getElementById('topnav-content');
	const menuLinks = [];
	if (navBar) {
		const menu = document.createElement('div');
		menu.className = 'pubs-toc-menu';
		const toggle = document.createElement('button');
		toggle.type = 'button';
		toggle.className = 'pubs-toc-toggle';
		toggle.setAttribute('aria-expanded', 'false');
		toggle.setAttribute('aria-label', 'Topics');
		toggle.innerHTML = '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
		const list = document.createElement('ul');
		list.className = 'pubs-toc-panel';
		links.forEach(a => {
			const li = document.createElement('li');
			const clone = a.cloneNode(true);
			li.appendChild(clone);
			list.appendChild(li);
			menuLinks.push(clone);
		});
		menu.appendChild(toggle);
		navBar.appendChild(menu);
		// Lives under <body>: the header's backdrop-filter would otherwise become
		// the containing block for this fixed panel.
		document.body.appendChild(list);

		// The panel is fixed and spans the header, opening from its bottom edge;
		// its right padding lines the labels up with the toggle icon.
		const header = document.getElementById('sidebar');
		const placePanel = () => {
			const hr = header.getBoundingClientRect();
			const tr = toggle.getBoundingClientRect();
			list.style.top = hr.bottom + 'px';
			list.style.left = hr.left + 'px';
			list.style.width = hr.width + 'px';
			list.style.paddingRight = (hr.right - tr.right + 8) + 'px';
		};
		const setOpen = (open) => {
			if (open) placePanel();
			list.classList.toggle('is-open', open);
			toggle.setAttribute('aria-expanded', String(open));
		};
		window.addEventListener('scroll', () => {
			if (list.classList.contains('is-open')) placePanel();
		}, { passive: true });
		window.addEventListener('resize', () => setOpen(false));
		toggle.addEventListener('click', () => setOpen(!list.classList.contains('is-open')));
		menuLinks.forEach(a => a.addEventListener('click', () => setOpen(false)));
		document.addEventListener('click', (e) => {
			if (!menu.contains(e.target) && !list.contains(e.target)) setOpen(false);
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') setOpen(false);
		});
	}

	const setActive = (id) => {
		links.concat(menuLinks).forEach(a => a.classList.toggle('active', a.dataset.target === id));
	};

	const updateActive = () => {
		const viewportH = window.innerHeight;
		const scrollTop = window.scrollY || document.documentElement.scrollTop;
		const docH = document.documentElement.scrollHeight;
		if (scrollTop + viewportH >= docH - 2) {
			setActive(targets[targets.length - 1].id);
			return;
		}
		const triggerY = scrollTop + viewportH * 0.25;
		let current = targets[0];
		for (const t of targets) {
			const top = t.getBoundingClientRect().top + scrollTop;
			if (top <= triggerY) current = t;
			else break;
		}
		setActive(current.id);
	};
	window.addEventListener('scroll', updateActive, { passive: true });
	window.addEventListener('resize', updateActive);
	updateActive();

	const sentinel = document.createElement('div');
	sentinel.style.cssText = 'position:absolute;top:0;left:0;height:1px;width:1px;pointer-events:none;';
	toc.parentElement.style.position = toc.parentElement.style.position || 'relative';
	toc.parentElement.insertBefore(sentinel, toc);
	const stickyObserver = new IntersectionObserver(([entry]) => {
		toc.classList.toggle('is-stuck', !entry.isIntersecting);
	}, { rootMargin: '-61px 0px 0px 0px', threshold: 0 });
	stickyObserver.observe(sentinel);

	const TOC_TOP_KEY = 'pubs-toc-top';
	const photo = document.querySelector('.hero-photo');
	if (photo) {
		const alignTocToPhoto = () => {
			if (window.innerWidth <= 1620) return;
			const rect = photo.getBoundingClientRect();
			const photoCenterAbs = rect.top + window.scrollY + rect.height / 2;
			const newTop = photoCenterAbs - toc.offsetHeight / 2;
			toc.style.top = newTop + 'px';
			try { localStorage.setItem(TOC_TOP_KEY, newTop); } catch (e) { }
		};
		alignTocToPhoto();
		if (!photo.complete) photo.addEventListener('load', alignTocToPhoto, { once: true });
		window.addEventListener('resize', alignTocToPhoto);
	} else if (window.innerWidth > 1620) {
		try {
			const stored = localStorage.getItem(TOC_TOP_KEY);
			if (stored !== null) toc.style.top = parseFloat(stored) + 'px';
		} catch (e) { }
	}

	const updateProgress = () => {
		const startY = targets[0].offsetTop;
		const endY = targets[targets.length - 1].offsetTop;
		const scrollY = window.scrollY + window.innerHeight * 0.35;
		const range = endY - startY;
		const progress = range > 0
			? Math.max(0, Math.min(1, (scrollY - startY) / range))
			: 0;
		if (ul) ul.style.setProperty('--pubs-progress', progress.toFixed(3));
	};
	window.addEventListener('scroll', updateProgress, { passive: true });
	window.addEventListener('resize', updateProgress);
	updateProgress();
})();
