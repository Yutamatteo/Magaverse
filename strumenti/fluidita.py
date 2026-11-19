"""Misura la fluidità dello scorrimento su un telefono simulato (CPU rallentata 4x).
uso: fluidita.py <path> [porta]  (SENZA_GPU=1 per la grafica emulata, PC=1 per lo schermo da PC)"""
import asyncio, sys, os
from playwright.async_api import async_playwright
PATH = sys.argv[1] if len(sys.argv) > 1 else ''
PORTA = sys.argv[2] if len(sys.argv) > 2 else '8080'
async def main():
    async with async_playwright() as p:
        # con la scheda grafica vera: senza queste opzioni Chromium senza finestra disegna in
        # software (SwiftShader) e Commit e WebGL sembrano molto più pesanti di quanto siano
        gpu = [] if os.environ.get("SENZA_GPU") else ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"]
        b = await p.chromium.launch(args=["--no-sandbox"] + gpu)
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}) if os.environ.get("PC") else await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        await pg.goto(f"http://localhost:{PORTA}/{PATH}", wait_until="networkidle")
        if len(sys.argv) > 3: await pg.add_style_tag(content=sys.argv[3])
        cdp = await ctx.new_cdp_session(pg)
        await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        r = await pg.evaluate("""async () => {
          const tot = document.documentElement.scrollHeight - innerHeight;
          const t = []; let last = performance.now(), on = true;
          const loop = (n) => { t.push(n - last); last = n; if (on) requestAnimationFrame(loop); };
          requestAnimationFrame(loop);
          for (let y = 0; y < tot * .85; y += 28) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); }
          on = false;
          t.sort((a, b) => a - b);
          const media = t.reduce((a, b) => a + b, 0) / t.length;
          return { fotogrammi: t.length, media_ms: +media.toFixed(1), p95_ms: +t[Math.floor(t.length * .95)].toFixed(1), lenti_oltre_50ms: t.filter(x => x > 50).length };
        }""")
        print(PATH or 'hub', r)
        await b.close()
asyncio.run(main())
