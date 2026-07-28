// ============================================================
// VAULTIO MAINTENANCE MODE — Vercel Edge Middleware
// ============================================================
// INERT BY DEFAULT. This file does nothing while it is named
// "middleware.js.disabled". See MAINTENANCE.md for the toggle.
//
// When active, this intercepts EVERY request (including real static
// HTML files — middleware runs before Vercel's filesystem step) and
// returns a 503 Service Unavailable with the Vaultio contact page.
//
// Why 503 and not 404:
//   503 + Retry-After tells Google "temporarily down, keep the URLs
//   indexed, come back later." A 404 tells Google "gone" and it starts
//   dropping the 390 indexed URLs within days. Do NOT add a noindex
//   meta tag or X-Robots-Tag here — that actively requests removal.
// ============================================================

export const config = {
  // Everything EXCEPT:
  //   vaultio-mark.png — so the maintenance page can render its own logo
  //   sw.js            — CRITICAL. Returning visitors have the old service
  //                      worker installed, which serves the homepage from
  //                      cache and never reaches the network. If this path
  //                      were intercepted the browser would download the 503
  //                      HTML instead of the self-destruct script, and the
  //                      stale site would be served forever.
  matcher: '/((?!vaultio-mark\\.png$|sw\\.js$).*)',
};

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Site Temporarily Unavailable</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: #0A0D14;
    color: #E8EAF0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    position: relative;
    overflow: hidden;
  }
  body::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(220, 38, 38, 0.10), transparent 60%),
      radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99, 102, 241, 0.07), transparent 60%);
    pointer-events: none;
  }
  .wrap { position: relative; width: 100%; max-width: 560px; text-align: center; }
  .mark {
    width: 96px; height: auto; margin: 0 auto 32px; display: block; opacity: 0.97;
    filter: drop-shadow(0 6px 24px rgba(220, 38, 38, 0.25));
  }
  h1 {
    font-size: clamp(26px, 5vw, 38px); line-height: 1.2; font-weight: 600;
    letter-spacing: -0.02em; margin: 0 0 18px; color: #fff;
  }
  p {
    font-size: 16px; line-height: 1.65; color: rgba(232, 234, 240, 0.66);
    margin: 0 auto 16px; max-width: 44ch;
  }
  .domain {
    display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px; letter-spacing: 0.02em; color: rgba(232, 234, 240, 0.55);
    background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 999px; padding: 7px 16px; margin-bottom: 28px;
  }
  .divider { width: 40px; height: 1px; background: rgba(255, 255, 255, 0.14); margin: 32px auto; border: 0; }
  .contact-label {
    font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(232, 234, 240, 0.4); margin-bottom: 14px;
  }
  .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 6px; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 13px 26px; border-radius: 999px; font-size: 15px; font-weight: 600;
    text-decoration: none; transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .btn-primary {
    background: linear-gradient(135deg, #DC2626, #B91C1C); color: #fff;
    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 26px rgba(220, 38, 38, 0.42); }
  .btn-ghost {
    background: rgba(255, 255, 255, 0.05); color: rgba(232, 234, 240, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.13);
  }
  .btn-ghost:hover { background: rgba(255, 255, 255, 0.09); transform: translateY(-1px); }
  .foot { margin-top: 38px; font-size: 12px; color: rgba(232, 234, 240, 0.3); letter-spacing: 0.01em; }
  @media (max-width: 420px) { .actions { flex-direction: column; } .btn { width: 100%; } }
</style>
</head>
<body>
  <main class="wrap">
    <img class="mark" src="/vaultio-mark.png" alt="Vaultio" width="96" height="96" />

    <div class="domain">twilightzonepermanentlighting.com</div>

    <h1>This site is temporarily unavailable.</h1>

    <p>Hosting and maintenance for this website are managed by Vaultio. Service is currently paused pending account resolution.</p>

    <p>If you are the site owner, contact us to restore service immediately.</p>

    <hr class="divider" />

    <div class="contact-label">Contact Vaultio</div>
    <div class="actions">
      <a class="btn btn-primary" href="mailto:hello@vaultio.co?subject=Restore%20service%20—%20twilightzonepermanentlighting.com">Email Vaultio</a>
      <a class="btn btn-ghost" href="https://vaultio.co" rel="noopener">vaultio.co</a>
    </div>

    <div class="foot">Vaultio — Web Design &amp; Digital Marketing</div>
  </main>
</body>
</html>`;

export default function middleware() {
  return new Response(HTML, {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Tells crawlers this is temporary. 86400s = check back in 24h.
      'retry-after': '86400',
      // Never let a CDN/browser cache the down page — restoration must be instant.
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
