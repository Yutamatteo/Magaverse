/* JUNGLE NIGHT – Shared JS
 * Inietta sidebar/header/mobile-tabs/modal/bottom-cta in ogni pagina
 * + Countdown, Modale, Cloudinary upload, Condivisione, Calendario
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────
    // Nav config — la pagina attiva è letta da document.body.dataset.page
    // ─────────────────────────────────────────────────────────
    const NAV = [
        { id: 'info',       href: 'index.html#info',     icon: 'fa-circle-info',  label: 'INFO',       mobileIcon: 'fa-sun' },
        { id: 'lineup',     href: 'index.html#lineup',   icon: 'fa-compact-disc', label: 'LINE-UP' },
        { id: 'orari',      href: 'index.html#orari',    icon: 'fa-regular fa-clock', label: 'ORARI' },
        { id: 'bar',        href: 'bar.html',            icon: 'fa-martini-glass', label: 'BAR' },
        { id: 'galleria',   href: 'galleria.html',       icon: 'fa-camera',       label: 'GALLERIA' },
        { id: 'tickets',    href: 'index.html#tickets',  icon: 'fa-ticket',       label: 'TICKETS' },
        { id: 'social',     href: 'index.html#social',   icon: 'fa-hashtag',      label: 'SOCIAL' }
    ];

    function currentPage() {
        return (document.body && document.body.dataset.page) || 'info';
    }

    function logoMarkup(extraStyle) {
        // Tenta di caricare logo_maga.jpg; fallback elegante a placeholder
        return `<img src="logo_maga.jpg" alt="JUNGLE NIGHT" class="logo-image"${extraStyle ? ' style="' + extraStyle + '"' : ''}
                     onerror="this.outerHTML='<div class=\\'logo-placeholder\\'><i class=\\'fa-solid fa-image\\'></i><span>logo_maga.jpg</span></div>'">`;
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
                    <span style="font-size:9px;text-transform:uppercase;letter-spacing:0.2em;color:#6b7280">Magaparty.eventi</span>
                    <div style="display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:0.15em;font-weight:700;text-transform:uppercase;color:var(--sunset-orange)">
                        <span style="width:8px;height:8px;border-radius:9999px;background:var(--sunset-orange);animation:pulse 1.5s infinite"></span> 8 Luglio 2026
                    </div>
                </div>
                ${logoMarkup()}
                <p class="brutalist" style="font-size:14px;letter-spacing:0.2em;margin-top:8px;color:var(--sunset-gold)">JUNGLE NIGHT</p>
                <p style="font-size:9px;text-transform:uppercase;letter-spacing:0.2em;opacity:0.4;margin-top:4px">Una notte nella giungla</p>
            </div>

            <nav class="sidebar-nav">${items}</nav>

            <a href="/" class="maga-back-link" style="margin:16px 0 4px;">&#8592; Magaverse</a>

            <div class="sidebar-cta">
                <button data-testid="sidebar-cta-lista" onclick="MAGA.openModal()" style="width:100%;color:var(--night-surface);font-weight:900;padding:12px;border-radius:var(--radius-pill);font-family:'Archivo Black',sans-serif;font-size:12px;letter-spacing:0.2em;border:none;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:12px;background:var(--sunset-orange);box-shadow:0 0 20px rgba(154,216,47,0.35)">
                    <i class="fa-solid fa-list-check"></i> METTITI IN LISTA
                </button>
                <div style="display:flex;gap:8px">
                    <button data-testid="sidebar-share" onclick="MAGA.share()" class="glass-card" style="flex:1;padding:8px;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;display:flex;justify-content:center;align-items:center;gap:4px;color:#fff;border:1px solid rgba(240,255,232,0.08);cursor:pointer">
                        <i class="fa-solid fa-share-nodes"></i> Condividi
                    </button>
                    <button data-testid="sidebar-calendar" onclick="MAGA.addToCalendar()" class="glass-card" style="flex:1;padding:8px;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;display:flex;justify-content:center;align-items:center;gap:4px;color:#fff;border:1px solid rgba(240,255,232,0.08);cursor:pointer">
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
                    <span style="font-size:9px;text-transform:uppercase;letter-spacing:0.2em;color:#6b7280">Magaparty.eventi</span>
                    <div style="display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:0.15em;font-weight:700;text-transform:uppercase;color:var(--sunset-orange)">
                        <span style="width:8px;height:8px;border-radius:9999px;background:var(--sunset-orange);animation:pulse 1.5s infinite"></span> 8 Luglio 2026
                    </div>
                </div>
                ${logoMarkup('max-width:150px')}
                <p class="brutalist sunset-title" style="font-size:22px;letter-spacing:0.2em;margin-top:8px">JUNGLE NIGHT</p>
                <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.3em;opacity:0.5;margin-top:4px">Una notte nella giungla</p>
                <a href="/oceanbeach/" class="maga-back-link" style="justify-content:center;margin-top:12px;">&#8592; Nello Ocean Beach</a>
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
        <div class="mobile-sticky-tabs" style="position:sticky;top:0;z-index:40;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(240,255,232,0.05);box-shadow:0 10px 20px rgba(0,0,0,0.5);background:rgba(10,31,14,0.95)">
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
        <div class="bottom-cta-mobile" style="position:fixed;bottom:0;left:0;right:0;padding:16px;z-index:50;background:linear-gradient(to top, var(--night-surface), rgba(10,31,14,0.9), transparent)">
            <button data-testid="bottom-cta-lista" onclick="MAGA.openModal()" style="width:100%;color:#000;font-weight:900;padding:16px;border-radius:var(--radius-pill);font-family:'Archivo Black',sans-serif;font-size:18px;letter-spacing:0.2em;border:none;cursor:pointer;display:flex;justify-content:center;align-items:center;gap:8px;background:var(--sunset-orange);box-shadow:0 0 20px rgba(154,216,47,0.35)">
                <i class="fa-solid fa-list-check"></i> METTITI IN LISTA
            </button>
        </div>`;
    }

    // ─────────────────────────────────────────────────────────
    // MODAL
    // ─────────────────────────────────────────────────────────
    function buildModal() {
        return `
        <div id="listModal" data-testid="list-modal" style="position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(10,31,14,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
            <div class="glass-card modal-enter neon-border-orange" style="width:100%;max-width:24rem;padding:24px;position:relative;background:var(--night-surface)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
                    <h3 class="brutalist" style="font-size:24px;color:#fff;margin:0">LISTA INGRESSO</h3>
                    <button data-testid="modal-close" onclick="MAGA.closeModal()" style="width:32px;height:32px;display:flex;justify-content:center;align-items:center;border-radius:14px;background:rgba(255,255,255,0.1);color:#fff;border:none;cursor:pointer">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div style="border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;margin-bottom:20px;text-align:center;background:rgba(255,255,255,0.03)">
                    <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 8px;color:var(--sunset-orange)"><i class="fa-solid fa-bolt"></i> Metodo Veloce</p>
                    <p style="font-size:11px;color:#9ca3af;margin:0 0 16px">Compila il form per salvare il posto. Riceverai conferma via messaggio.</p>
                    <a data-testid="modal-google-form" href="https://forms.gle/wucbmT1SKuhXpRbH8" target="_blank"
                       style="display:block;width:100%;padding:12px;background:#fff;color:#000;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;border-radius:14px;text-decoration:none">
                        <i class="fa-brands fa-google" style="margin-right:4px"></i> Compila Google Form
                    </a>
                </div>
                <div style="text-align:center;position:relative;margin:24px 0">
                    <hr style="border-color:rgba(255,255,255,0.1)">
                    <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);padding:0 12px;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;color:#6b7280;background:var(--night-surface)">Oppure contatta i PR</span>
                </div>
                <button data-testid="modal-wa-info" onclick="MAGA.wa('Informazioni Generali')" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:transparent;border:1px solid var(--sunset-orange);color:var(--sunset-orange);border-radius:14px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;margin-top:8px;cursor:pointer;box-shadow:0 0 12px rgba(154,216,47,0.2)">
                    <i class="fa-brands fa-whatsapp" style="font-size:18px"></i> Infoline Magaparty
                </button>
            </div>
        </div>`;
    }

    // ─────────────────────────────────────────────────────────
    // CARD DINAMICA — Countdown ingresso → Countdown fascia → Festa in corso → Dopo evento
    // Evento: 8 Luglio 2026 — Free entry 19:00–21:00 · DJ set / tariffa dalle 21:00 · Chiusura ~02:00
    // ─────────────────────────────────────────────────────────
    function showState(id) {
        ['state-countdown', 'state-live', 'state-after'].forEach(s => {
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
        const entryStart = new Date('2026-07-08T19:00:00+02:00'); // inizio evento / free entry
        const entryEnd    = new Date('2026-07-08T21:00:00+02:00'); // fine free entry / dalle 21 tariffa+DJ set
        const eventEnd    = new Date('2026-07-09T02:00:00+02:00'); // chiusura serata
        const pad = n => n.toString().padStart(2, '0');

        function renderCountdown(target) {
            const diff = target - now;
            setText('cd', pad(Math.floor(diff / 86400000)));
            setText('ch', pad(Math.floor(diff / 3600000) % 24));
            setText('cm', pad(Math.floor(diff / 60000) % 60));
            setText('cs', pad(Math.floor(diff / 1000) % 60));
        }

        if (now < entryStart) {
            // Countdown 1: verso l'inizio dell'evento
            showState('state-countdown');
            setText('countdown-label', 'ALLA GIUNGLA MANCANO');
            renderCountdown(entryStart);
        } else if (now < entryEnd) {
            // Countdown 2: verso la fine della free entry
            showState('state-countdown');
            setText('countdown-label', 'FREE ENTRY ANCORA PER');
            renderCountdown(entryEnd);
        } else if (now < eventEnd) {
            // Festa in corso
            showState('state-live');
        } else {
            showState('state-after');
        }
    }

    // ─────────────────────────────────────────────────────────
    // MODAL handlers
    // ─────────────────────────────────────────────────────────
    function openModal() {
        const m = document.getElementById('listModal');
        if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
    }
    function closeModal() {
        const m = document.getElementById('listModal');
        if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
    }

    // ─────────────────────────────────────────────────────────
    // WHATSAPP / SHARE / CALENDAR
    // ─────────────────────────────────────────────────────────
    function wa(lista) {
        const msg = encodeURIComponent(`Ciao! Vorrei registrarmi per il Jungle Night (8 Luglio 2026).\nRichiesta per: ${lista}`);
        window.open(`https://wa.me/393454237269?text=${msg}`, '_blank');
    }
    function share() {
        if (navigator.share) {
            navigator.share({ title: 'JUNGLE NIGHT – 8 Luglio | Magaparty', text: 'Una notte nella giungla', url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => showToast('Link copiato!'));
        }
    }
    function addToCalendar() {
        const t = encodeURIComponent('JUNGLE NIGHT – Magaparty');
        const l = encodeURIComponent('Nello Ocean Beach, Magazzeno Salerno');
        const det = encodeURIComponent('Una notte nella giungla. 2 DJ. Dalle 19:00 alle 2:00.');
        window.open(`https://calendar.google.com/calendar/r/eventedit?text=${t}&dates=20260708T190000/20260709T020000&location=${l}&details=${det}`, '_blank');
    }

    // ─────────────────────────────────────────────────────────
    // CLOUDINARY UPLOAD (galleria)
    // ─────────────────────────────────────────────────────────
    const CLOUD_NAME = 'dthvzhohr';
    const UPLOAD_PRESET = 'ml_JungleNight';
    let filesToUpload = [];

    function handleDragOver(e) {
        e.preventDefault();
        const z = document.getElementById('dropZone');
        if (z) z.style.borderColor = 'var(--sunset-orange)';
    }
    function handleDragLeave() {
        const z = document.getElementById('dropZone');
        if (z) z.style.borderColor = 'rgba(154,216,47,0.3)';
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
                fd.append('folder', 'maga_republic');
                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: fd });
                const data = await res.json();
                if (data.secure_url) {
                    if (statusEl) statusEl.innerHTML = '<span style="color:var(--sunset-teal)">✓ OK</span>';
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
                <div class="glass-card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(224,25,53,0.2);background:rgba(224,25,53,0.05)">
                    <i class="fa-solid ${r.type.startsWith('video') ? 'fa-film' : 'fa-image'}" style="font-size:14px;color:var(--sunset-orange)"></i>
                    <p style="font-size:11px;color:#fff;flex:1;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.name}</p>
                    <span style="font-size:12px;font-weight:700;color:var(--sunset-teal)">✓ Caricato</span>
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

    function showToast(msg) {
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:8rem;left:50%;transform:translateX(-50%);z-index:200;color:#fff;font-size:11px;padding:8px 16px;border-radius:9999px;box-shadow:0 10px 30px rgba(0,0,0,0.5);white-space:nowrap;background:#111;border:1px solid rgba(255,255,255,0.1)';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3500);
    }

    // ─────────────────────────────────────────────────────────
    // BOOT
    // ─────────────────────────────────────────────────────────
    function boot() {
        // Inietta layout shell
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

        // Sposta il contenuto della <main id="page-main"> dentro lo shell
        document.body.insertBefore(shell, main);
        const contentArea = shell.querySelector('#content-area');
        while (main.firstChild) contentArea.appendChild(main.firstChild);
        main.remove();

        // Aggiungi modale
        const modalWrap = document.createElement('div');
        modalWrap.innerHTML = buildModal();
        document.body.appendChild(modalWrap.firstElementChild);
        const m = document.getElementById('listModal');
        if (m) m.addEventListener('click', e => { if (e.target === m) closeModal(); });

        // Card dinamica (countdown/live/dopo) — solo su pagina Info
        if (document.getElementById('dynamic-card')) {
            updateDynamicCard();
            setInterval(updateDynamicCard, 1000);
        }

        // Active section tracking (solo su index.html con sezioni anchor)
        setupActiveSectionTracking();
    }

    // ─────────────────────────────────────────────────────────
    // ACTIVE SECTION TRACKING — aggiorna sidebar in base allo scroll
    // ─────────────────────────────────────────────────────────
    function setupActiveSectionTracking() {
        const sections = document.querySelectorAll('main #info, main #lineup, main #orari, main #tickets, main #social');
        if (sections.length === 0) return; // pagine separate (bar.html / galleria.html) non hanno sezioni

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

        // IntersectionObserver: traccia la sezione attualmente visibile
        const observer = new IntersectionObserver(entries => {
            // Trova l'intersezione con il maggior ratio
            let best = null;
            entries.forEach(e => {
                if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) {
                    best = e;
                }
            });
            if (best) setActive(best.target.id);
        }, {
            rootMargin: '-30% 0px -50% 0px', // sezione attiva quando è circa al centro
            threshold: [0, 0.25, 0.5, 0.75, 1]
        });

        sections.forEach(s => observer.observe(s));

        // Stato iniziale dal hash o info di default
        const initialHash = window.location.hash.replace('#', '');
        if (initialHash && document.getElementById(initialHash)) {
            setActive(initialHash);
            setTimeout(() => document.getElementById(initialHash).scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        } else {
            setActive('info');
        }

        // Aggiornamento istantaneo al click su un link sidebar/tab
        document.querySelectorAll('[data-testid^="sidebar-nav-"], [data-testid^="tab-"]').forEach(el => {
            el.addEventListener('click', () => {
                const testid = el.getAttribute('data-testid');
                const navId = testid.replace('sidebar-nav-', '').replace('tab-', '');
                if (document.getElementById(navId)) {
                    setActive(navId);
                }
            });
        });
    }

    // Espone API globale
    window.MAGA = {
        openModal, closeModal, wa, share, addToCalendar,
        handleDragOver, handleDragLeave, handleDrop, handleFiles, uploadAll
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
