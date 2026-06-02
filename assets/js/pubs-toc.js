(function () {
	const toc = document.querySelector('.pubs-toc');
	if (!toc) return;
	const links = Array.from(toc.querySelectorAll('a[data-target]'));
	const targets = links
		.map(a => document.getElementById(a.dataset.target))
		.filter(Boolean);
	if (!targets.length) return;

	const ul = toc.querySelector('ul');
	const setActive = (id) => {
		links.forEach(a => a.classList.toggle('active', a.dataset.target === id));
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
