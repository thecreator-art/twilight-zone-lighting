# Maintenance Mode (Vaultio kill switch)

Serves a Vaultio-branded **503 Service Unavailable** page on every URL of the site.
Currently **OFF**. Nothing changes until you run the commands below.

---

## Turn it ON

```bash
git mv middleware.js.disabled middleware.js && git commit -m "Enable maintenance mode" && git push origin HEAD:main
```

Vercel redeploys in ~60s. Every URL — homepage, all 156 service×city pages, all 60 blog
posts, sitemap.xml, everything — returns the Vaultio contact page with a 503 status.

## Turn it OFF

```bash
git mv middleware.js middleware.js.disabled && git commit -m "Restore site" && git push origin HEAD:main
```

Site is fully back in ~60s. No SEO loss if it was under ~2 weeks.

---

## Verify it's working

```bash
curl -I https://twilightzonepermanentlighting.com
```

Look for `HTTP/2 503` and `retry-after: 86400`. Check a deep page too:

```bash
curl -I https://twilightzonepermanentlighting.com/accent-lighting-fresno
```

If you see `200` instead of `503`, Vercel didn't pick up the middleware — see Fallback below.

---

## Why 503 and not 404

| Status | Google's interpretation | Cost to you |
|---|---|---|
| **404** | "Page is permanently gone" | Starts dropping the 390 indexed URLs within days. Weeks–months to recover. |
| **503 + Retry-After** | "Temporarily down, check back" | URLs stay indexed. Rankings hold. Flip it off and nothing was lost. |

**Timeline on 503:** rankings hold roughly the first 1–2 weeks. Past ~3–4 weeks Google
starts treating prolonged 503s as permanent anyway, so the protection is not indefinite.

**Do not** add `noindex` (meta tag or `X-Robots-Tag`) to the maintenance page — that
actively requests removal from the index and compounds the damage. The 503 alone is
the correct and sufficient signal.

**Do not** change nameservers or DNS to take the site down. DNS propagation is slow in
both directions, Google sees a hard-unreachable domain (worse than 503), and restoring
takes hours instead of 60 seconds.

---

## Notes

- `/vaultio-mark.png` is exempted in the middleware `matcher` so the logo renders.
  Everything else on the domain is intercepted.
- The page has no links back into the client's site — only `mailto:` and `vaultio.co`.
- Copy is deliberately neutral ("pending account resolution"). The client's own
  customers will see this page, so it stays professional rather than airing the dispute.
- `Cache-Control: no-store` means no CDN or browser caches the down page — restoration
  is immediate for everyone.

## Fallback if Vercel doesn't pick up the middleware

Standalone Edge Middleware works on framework-less Vercel projects, but if `curl -I`
still shows `200` after deploying, use Vercel's legacy `routes` instead — it runs
before the filesystem too:

1. Create `api/maintenance.js` exporting a handler that returns the same HTML with
   `res.status(503)`.
2. Replace `vercel.json` with (note: `routes` cannot coexist with `headers`/`rewrites`/
   `cleanUrls`, so this temporarily replaces the whole config):

```json
{
  "routes": [
    { "src": "/vaultio-mark.png", "dest": "/vaultio-mark.png" },
    { "src": "/(.*)", "dest": "/api/maintenance" }
  ]
}
```

Restore by reverting that commit.
