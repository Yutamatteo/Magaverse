/* MAREA – Shell JS
 * Inietta sidebar/header/mobile-tabs/bottom-cta nella pagina marea.html.
 * Countdown ricorrente (ogni domenica 17:00 -> 00:00), share, calendario.
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────
    // NAV — pagina singola con sezioni ancora, + Bar/Galleria (pagine autonome)
    // ─────────────────────────────────────────────────────────
    const NAV = [
        { id: 'info',      href: '#info',      icon: 'fa-circle-info',   label: 'INFO',      mobileIcon: 'fa-sun' },
        { id: 'attivita',  href: '#attivita',   icon: 'fa-volleyball',   label: 'ATTIVITÀ' },
        { id: 'lineup',    href: '#lineup',     icon: 'fa-compact-disc', label: 'LINE-UP' },
        { id: 'prezzi',    href: '#prezzi',     icon: 'fa-ticket',       label: 'PREZZI' },
        { id: 'bar',       href: '#bar',        icon: 'fa-martini-glass', label: 'BAR' },
        { id: 'galleria',  href: '#galleria',   icon: 'fa-camera',      label: 'GALLERIA' },
        { id: 'form',      href: '#form',       icon: 'fa-list-check',   label: 'PRENOTA' }
    ];

    function currentPage() {
        return (document.body && document.body.dataset.page) || 'info';
    }

    function logoMarkup(extraStyle) {
        return `<img src="assets/img/marea-locandina.jpg" alt="MAREA" class="logo-image"${extraStyle ? ' style="' + extraStyle + '"' : ''}
                     onerror="this.outerHTML='<div class=\\'logo-placeholder\\'><i class=\\'fa-solid fa-image\\'></i><span>marea-locandina.jpg</span></div>'">`;
    }

    // ─────────────────────────────────────────────────────────
    // SIDEBAR DESKTOP
    // ─────────────────────────────────────────────────────────
    function buildSidebar() {
        const active = currentPage();
        const items = NAV.map(n => {
            const isActive = n.id === active ? ' active' : '';
            const iconCls = n.icon.startsWith('fa-regular') ? n.icon : 'fa-solid ' + n.icon;
            return `<a href="${n.href}" data-testid="sidebar-nav-${n.id}" class="sidebar-nav-btn${isActive}">
                        <span class="nav-icon"><i class="${iconCls}"></i></span> ${n.label}
                    </a>`;
        }).join('');

        return `
        <aside class="desktop-sidebar">
            <div class="sidebar-logo-section">
                <div class="sidebar-meta">
                    <span style="font-size:9px;text-transform:uppercase;letter-spacing:0.2em;color:#6b7280">Magaparty.marea</span>
                    <div style="display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:0.15em;font-weight:700;text-transform:uppercase;color:var(--sunset-orange)">
                        <span style="width:8px;height:8px;border-radius:9999px;background:var(--sunset-orange);animation:pulse 1.5s infinite"></span> Ogni domenica
                    </div>
                </div>
                ${logoMarkup()}
                <p class="brutalist" style="font-size:14px;letter-spacing:0.2em;margin-top:8px;color:var(--sunset-gold)">MAREA</p>
                <p style="font-size:9px;text-transform:uppercase;letter-spacing:0.2em;opacity:0.55;margin-top:4px">L'happy hour della domenica</p>
            </div>

            <nav class="sidebar-nav">${items}</nav>

            <a href="index.html" class="maga-back-link" style="margin:16px 0 4px;">&#8592; Magaparty</a>

            <div class="sidebar-cta">
                <button data-testid="sidebar-cta-lista" onclick="MAREA.goToForm()" style="width:100%;color:var(--night-bg);font-weight:900;padding:12px;border-radius:var(--radius-pill);font-family:'Archivo Black',sans-serif;font-size:12px;letter-spacing:0.2em;border:none;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:12px;background:var(--sunset-orange);box-shadow:0 0 20px rgba(226,84,14,0.35)">
                    <i class="fa-solid fa-list-check"></i> METTITI IN LISTA
                </button>
                <div style="display:flex;gap:8px">
                    <button data-testid="sidebar-share" onclick="MAREA.share()" class="glass-card" style="flex:1;padding:8px;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;display:flex;justify-content:center;align-items:center;gap:4px;color:#fff;border:1px solid rgba(240,255,232,0.08);cursor:pointer">
                        <i class="fa-solid fa-share-nodes"></i> Condividi
                    </button>
                    <button data-testid="sidebar-calendar" onclick="MAREA.addToCalendar()" class="glass-card" style="flex:1;padding:8px;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;display:flex;justify-content:center;align-items:center;gap:4px;color:#fff;border:1px solid rgba(240,255,232,0.08);cursor:pointer">
                        <i class="fa-regular fa-calendar-plus"></i> Calendario
                    </button>
                </div>
            </div>
        </aside>`;
    }

    // ─────────────────────────────────────────────────────────
    // HEADER + TABS MOBILE
    // ─────────────────────────────────────────────────────────
    function buildMobileHeader() {
        return `
        <div class="mobile-header-wrapper">
            <header style="padding:40px 24px 24px;text-align:center">
                <div style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:24px">
                    <span style="font-size:9px;text-transform:uppercase;letter-spacing:0.2em;color:#6b7280">Magaparty.marea</span>
                    <div style="display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:0.15em;font-weight:700;text-transform:uppercase;color:var(--sunset-orange)">
                        <span style="width:8px;height:8px;border-radius:9999px;background:var(--sunset-orange);animation:pulse 1.5s infinite"></span> Ogni domenica
                    </div>
                </div>
                ${logoMarkup('max-width:150px')}
                <p class="brutalist sunset-title" style="font-size:22px;letter-spacing:0.2em;margin-top:8px">MAREA</p>
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.3em;opacity:0.55;margin-top:4px">L'happy hour della domenica</p>
                <a href="index.html" class="maga-back-link" style="justify-content:center;margin-top:12px;">&#8592; Magaparty</a>
            </header>
        </div>`;
    }

    function buildMobileTabs() {
        const active = currentPage();
        const items = NAV.map(n => {
            const isActive = n.id === active;
            const iconCls = n.mobileIcon ? 'fa-solid ' + n.mobileIcon
                : (n.icon.startsWith('fa-regular') ? n.icon : 'fa-solid ' + n.icon);
            return `<a href="${n.href}" data-testid="tab-${n.id}" class="pill-tab ${isActive ? 'active-tab' : 'inactive-tab'}">
                        <i class="${iconCls}" style="margin-right:4px"></i> ${n.label}
                    </a>`;
        }).join('');

        return `
        <div class="mobile-sticky-tabs" style="position:sticky;top:0;z-index:40;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(240,255,232,0.05);box-shadow:0 10px 20px rgba(0,0,0,0.5);background:rgba(23,9,5,0.95)">
            <div class="scroll-hide" style="display:flex;justify-content:flex-start;gap:12px;padding:12px 24px;overflow-x:auto">
                ${items}
            </div>
        </div>`;
    }

    // ─────────────────────────────────────────────────────────
    // BOTTOM CTA MOBILE
    // ─────────────────────────────────────────────────────────
    function buildBottomCta() {
        return `
        <div class="bottom-cta-mobile" style="position:fixed;bottom:0;left:0;right:0;padding:16px;z-index:50;background:linear-gradient(to top, var(--night-bg), rgba(23,9,5,0.9), transparent)">
            <button data-testid="bottom-cta-lista" onclick="MAREA.goToForm()" style="width:100%;color:var(--night-bg);font-weight:900;padding:16px;border-radius:var(--radius-pill);font-family:'Archivo Black',sans-serif;font-size:18px;letter-spacing:0.2em;border:none;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;background:var(--sunset-orange);box-shadow:0 0 20px rgba(226,84,14,0.35)">
                <i class="fa-solid fa-list-check"></i> METTITI IN LISTA
            </button>
        </div>`;
    }

    // ─────────────────────────────────────────────────────────
    // CARD DINAMICA — Countdown -> Festa in corso -> torna al countdown (ricorrente ogni domenica)
    // ─────────────────────────────────────────────────────────
    function sundayWindow() {
        const now = new Date();
        const day = now.getDay(); // 0 = domenica
        let start = new Date(now);
        start.setHours(17, 0, 0, 0);
        start.setDate(now.getDate() - day); // torna alla domenica di questa settimana
        let end = new Date(start);
        end.setHours(end.getHours() + 7); // 17:00 -> 00:00 (7 ore)
        if (now >= end) {
            start = new Date(start);
            start.setDate(start.getDate() + 7);
            end = new Date(start);
            end.setHours(end.getHours() + 7);
        }
        return { start, end };
    }

    function showState(id) {
        ['state-countdown', 'state-live'].forEach(s => {
            const el = document.getElementById(s);
            if (el) el.style.display = (s === id) ? '' : 'none';
        });
    }
    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    }

    function updateDynamicCard() {
        const now = new Date();
        const { start, end } = sundayWindow();
        const pad = n => n.toString().padStart(2, '0');

        if (now < start) {
            showState('state-countdown');
            const diff = start - now;
            setText('cd', pad(Math.floor(diff / 86400000)));
            setText('ch', pad(Math.floor(diff / 3600000) % 24));
            setText('cm', pad(Math.floor(diff / 60000) % 60));
            setText('cs', pad(Math.floor(diff / 1000) % 60));
        } else if (now < end) {
            showState('state-live');
        }
    }

    // ─────────────────────────────────────────────────────────
    // AZIONI
    // ─────────────────────────────────────────────────────────
    function goToForm() {
        const el = document.getElementById('form');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function share() {
        if (navigator.share) {
            navigator.share({ title: 'MAREA – La Domenica di Magaparty', text: "L'happy hour della domenica @ Nello Ocean Beach", url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copiato!'));
        }
    }
    function addToCalendar() {
        const { start, end } = sundayWindow();
        const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const t = encodeURIComponent('MAREA – La Domenica di Magaparty');
        const l = encodeURIComponent('Nello Ocean Beach, Magazzeno Salerno');
        const det = encodeURIComponent("L'happy hour della domenica. Dalle 17:00 a mezzanotte.");
        window.open(`https://calendar.google.com/calendar/r/eventedit?text=${t}&dates=${fmt(start)}/${fmt(end)}&location=${l}&details=${det}`, '_blank');
    }
    function showToast(msg) {
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:8rem;left:50%;transform:translateX(-50%);z-index:200;color:#fff;font-size:11px;padding:8px 16px;border-radius:9999px;box-shadow:0 10px 30px rgba(0,0,0,0.5);white-space:nowrap;background:#111;border:1px solid rgba(255,255,255,0.1)';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    }

    // ─────────────────────────────────────────────────────────
    // ACTIVE SECTION TRACKING
    // ─────────────────────────────────────────────────────────
    function setupActiveSectionTracking() {
        const sections = document.querySelectorAll('main #info, main #attivita, main #lineup, main #prezzi, main #bar, main #galleria, main #form');
        if (sections.length === 0) return;

        function setActive(id) {
            document.querySelectorAll('[data-testid^="sidebar-nav-"], [data-testid^="tab-"]').forEach(el => {
                const testid = el.getAttribute('data-testid');
                const navId = testid.replace('sidebar-nav-', '').replace('tab-', '');
                if (navId === id) {
                    el.classList.add('active');
                    if (el.classList.contains('pill-tab')) {
                        el.classList.remove('inactive-tab');
                        el.classList.add('active-tab');
                    }
                } else {
                    el.classList.remove('active');
                    if (el.classList.contains('pill-tab')) {
                        el.classList.add('inactive-tab');
                        el.classList.remove('active-tab');
                    }
                }
            });
        }

        const observer = new IntersectionObserver(entries => {
            let best = null;
            entries.forEach(e => {
                if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
            });
            if (best) setActive(best.target.id);
        }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

        sections.forEach(s => observer.observe(s));

        const initialHash = window.location.hash.replace('#', '');
        if (initialHash && document.getElementById(initialHash)) {
            setActive(initialHash);
            setTimeout(() => document.getElementById(initialHash).scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        } else {
            setActive('info');
        }

        document.querySelectorAll('[data-testid^="sidebar-nav-"], [data-testid^="tab-"]').forEach(el => {
            el.addEventListener('click', () => {
                const testid = el.getAttribute('data-testid');
                const navId = testid.replace('sidebar-nav-', '').replace('tab-', '');
                if (document.getElementById(navId)) setActive(navId);
            });
        });
    }

    // ─────────────────────────────────────────────────────────
    // CLOUDINARY UPLOAD (galleria) — stesso account usato finora dal brand
    // ─────────────────────────────────────────────────────────
    const CLOUD_NAME = 'dthvzhohr';
    const UPLOAD_PRESET = 'ml_JungleNight'; // preset esistente su Cloudinary — rinominalo lì se vuoi un nome più generico
    let filesToUpload = [];

    function handleDragOver(e) {
        e.preventDefault();
        const z = document.getElementById('dropZone');
        if (z) z.style.borderColor = 'var(--sunset-orange)';
    }
    function handleDragLeave() {
        const z = document.getElementById('dropZone');
        if (z) z.style.borderColor = 'rgba(226,84,14,0.3)';
    }
    function handleDrop(e) {
        e.preventDefault();
        handleDragLeave();
        handleFiles(e.dataTransfer.files);
    }
    function handleFiles(files) {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
        const maxSize = 100 * 1024 * 1024;
        const newFiles = Array.from(files).filter(f => {
            if (!allowed.includes(f.type)) { showToast(`Formato non supportato: ${f.name}`); return false; }
            if (f.size > maxSize) { showToast(`File troppo grande (max 100MB): ${f.name}`); return false; }
            return true;
        });
        if (!newFiles.length) return;
        filesToUpload = [...filesToUpload, ...newFiles];
        renderQueue();
    }
    function renderQueue() {
        const queue = document.getElementById('uploadQueue');
        const list = document.getElementById('queueList');
        if (!queue || !list) return;
        if (!filesToUpload.length) { queue.style.display = 'none'; return; }
        queue.style.display = '';
        list.innerHTML = filesToUpload.map((f, i) => `
            <div id="qitem-${i}" class="glass-card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,0.1)">
                <i class="fa-solid ${f.type.startsWith('video') ? 'fa-film' : 'fa-image'}" style="font-size:14px;color:var(--sunset-orange)"></i>
                <div style="flex:1;min-width:0">
                    <p style="font-size:11px;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</p>
                    <p style="font-size:9px;color:#6b7280;margin:0">${(f.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <div id="qstatus-${i}" style="font-size:10px;color:#6b7280;flex-shrink:0">In attesa</div>
            </div>
        `).join('');
    }
    async function uploadAll() {
        const btn = document.getElementById('uploadAllBtn');
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> CARICAMENTO IN CORSO...';
        const results = [];
        for (let i = 0; i < filesToUpload.length; i++) {
            const f = filesToUpload[i];
            const statusEl = document.getElementById(`qstatus-${i}`);
            if (statusEl) statusEl.innerHTML = '<span style="color:var(--sunset-orange)" class="animate-pulse">↑ Upload...</span>';
            try {
                const fd = new FormData();
                fd.append('file', f);
                fd.append('upload_preset', UPLOAD_PRESET);
                fd.append('folder', 'magaparty');
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: fd });
                const data = await res.json();
                if (data.secure_url) {
                    if (statusEl) statusEl.innerHTML = '<span style="color:var(--sunset-gold)">✓ OK</span>';
                    results.push({ name: f.name, type: f.type });
                } else { throw new Error(); }
            } catch (_) {
                if (statusEl) statusEl.innerHTML = '<span style="color:#f87171">✗ Errore</span>';
            }
        }
        if (results.length) {
            const resList = document.getElementById('resultsList');
            const ur = document.getElementById('uploadResults');
            if (ur) ur.style.display = '';
            if (resList) resList.innerHTML = results.map(r => `
                <div class="glass-card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(226,84,14,0.2);background:rgba(226,84,14,0.05)">
                    <i class="fa-solid ${r.type.startsWith('video') ? 'fa-film' : 'fa-image'}" style="font-size:14px;color:var(--sunset-orange)"></i>
                    <p style="font-size:11px;color:#fff;flex:1;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.name}</p>
                    <span style="font-size:12px;font-weight:700;color:var(--sunset-gold)">✓ Caricato</span>
                </div>
            `).join('');
            showToast(`${results.length} file caricati con successo!`);
        }
        filesToUpload = [];
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> AVVIA CARICAMENTO';
        const uq = document.getElementById('uploadQueue');
        const ql = document.getElementById('queueList');
        if (uq) uq.style.display = 'none';
        if (ql) ql.innerHTML = '';
    }

    // ─────────────────────────────────────────────────────────
    // BOOT
    // ─────────────────────────────────────────────────────────
    function boot() {
        const main = document.getElementById('page-main');
        if (!main) return;

        const shell = document.createElement('div');
        shell.className = 'app-shell';
        shell.innerHTML = `
            ${buildSidebar()}
            <div class="content-column">
                ${buildMobileHeader()}
                ${buildMobileTabs()}
                <main class="content-area" id="content-area"></main>
                ${buildBottomCta()}
            </div>
        `;

        document.body.insertBefore(shell, main);
        const contentArea = shell.querySelector('#content-area');
        while (main.firstChild) contentArea.appendChild(main.firstChild);
        main.remove();

        if (document.getElementById('dynamic-card')) {
            updateDynamicCard();
            setInterval(updateDynamicCard, 1000);
        }

        setupActiveSectionTracking();
    }

    window.MAREA = {
        goToForm, share, addToCalendar, showToast,
        handleDragOver, handleDragLeave, handleDrop, handleFiles, uploadAll
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
