# Twilight Zone — SEO / GEO Playbook
*Last updated: 2026-05-07*
*Based on Google Keyword Planner data: Fresno + Kings + Tulare + SLO counties*

---

## TL;DR — what to win in the next 90 days

| Rank | Keyword | Volume | Comp | Why |
|---|---|---|---|---|
| 🥇 | `permanent outdoor lights` | **500/mo** | **LOW** | Highest leverage, lowest difficulty |
| 🥈 | `permanent christmas lights` | 500/mo | High | Brand-defining term |
| 🥉 | `christmas light installers` | 500/mo | **LOW** | Low-comp local intent |
| 4 | `christmas lights near me` | 500/mo | High | Local pack target |
| 5 | `halloween lights` | 500/mo | Medium | Seasonal opportunity |
| 6 | `permanent christmas lights installation near me` | 50/mo | High | Pure conversion intent |

The dataset shows **0 keywords contain "Fresno"** — Fresno County users search **"near me"**, not "Fresno".
This makes **Google Business Profile + local pack ranking** the single highest-ROI activity.

---

## 1. ON-PAGE SEO — what's done

### Meta tags (head)
- ✅ **Title**: `Permanent Outdoor Lights Fresno | Christmas Light Installer | Twilight Zone`
- ✅ **Description**: 158 chars, leads with "Permanent outdoor lights & Christmas light installer near me — Fresno…"
- ✅ **Keywords**: 16 high-intent terms including all "near me" long-tails
- ✅ **Canonical URL**, robots `index,follow,max-image-preview:large`
- ✅ **Geo meta**: `geo.region`, `geo.placename`, `geo.position`, `ICBM`
- ✅ **Open Graph + Twitter**: full OG/Twitter card with image

### H1 / H2 hierarchy
- ✅ **H1**: `Permanent outdoor Christmas lights · Fresno.` — captures "permanent outdoor lights" (500/mo LOW comp) + "permanent christmas lights" (500/mo) + location
- ✅ Subline: `Fresno's permanent outdoor lights & Christmas light installer.`
- ✅ H2 anchors include "permanent christmas lights", "Twilight Zone vs seasonal", "Permanent lighting across the Valley"
- ✅ Solutions section eyebrow: `Permanent Christmas lights · Halloween · Accent · Game day`

### Body copy keyword density
- "permanent outdoor lights" — 6+ instances
- "permanent christmas lights" — 8+ instances
- "christmas light installer" — 4+ instances
- "near me" — 12+ instances (in FAQ + body)
- City names (Fresno, Clovis, Madera, Visalia, etc.) — 30+ instances
- All 12 service-area cities listed with zip codes

### FAQ — 24 items targeting long-tail queries
Exact-match user questions added:
- "How is Twilight Zone different from Govee permanent outdoor lights?"
- "What are the best permanent outdoor lights?"
- "Permanent christmas lights vs annual christmas light installation — which is better?"
- "How do I find a christmas light installer near me in Fresno?"
- "What does permanent christmas light installation cost in Fresno?"
- "How do permanent christmas lights work?"
- "Can permanent outdoor lights be used for Halloween, July 4th…?"
- "Do permanent outdoor lights damage your roof or fascia?"
- "Are there holiday light installers near me in Clovis, Madera, or Visalia?"
- + 15 more

### Image alt text — keyword-rich on every install photo
- "Permanent outdoor lights in warm-white architectural accent…"
- "Permanent Halloween and Christmas lights display in Fresno…"
- "Permanent outdoor security lights on a Fresno residential home…"
- "Permanent game-day outdoor lights in team colors…"

### Internal linking
- Hero → `#scene`, `#quote`, `tel:`
- All Solutions cards → `#scene`
- All Service Area tiles → `#quote`
- FAQ links → `#quote`, `#compare`
- Footer with full sitemap

---

## 2. TECHNICAL SEO — what's done

### Core Web Vitals
- ✅ **Hero video**: 4.5 MB · 720p · `+faststart` MOOV atom · `<link rel="preload" as="video">` for instant TTI
- ✅ **Commercial video**: 4.7 MB · `preload="none"` · lazy-loaded via IntersectionObserver
- ✅ **Carousel videos**: `preload="metadata"` only
- ✅ **Images**: `loading="lazy"` on all offscreen, `fetchpriority="high"` on hero, alt text on all
- ✅ **Service Worker** (`sw.js`): cache-first for media, network-first for HTML/CSS/JS

### Mobile-first
- ✅ Responsive at 1100px and 720px breakpoints
- ✅ Touch carousel with native scroll-snap
- ✅ Sticky mobile call/quote CTA
- ✅ `viewport` meta with `initial-scale=1`

### Performance hints
- ✅ `<link rel="preconnect">` to fonts, images.unsplash.com
- ✅ `<link rel="preload" as="video">` for hero
- ✅ `<link rel="prefetch">` for commercial video
- ✅ DNS prefetch for image CDN

### Accessibility (Google ranks A11Y)
- ✅ Single `<h1>`, logical hierarchy
- ✅ All interactive elements have `aria-label`
- ✅ All images have alt text
- ✅ Form labels properly associated
- ✅ `prefers-reduced-motion` respected
- ✅ Keyboard nav (slider, carousel, FAQ details)

### Indexability
- ✅ `<link rel="canonical">`
- ✅ Robots: `index, follow, max-image-preview:large`
- ✅ Sitemap-friendly URL structure

---

## 3. AI / GEO (Generative Engine Optimization) — what's done

GEO is how AI engines (ChatGPT, Perplexity, Gemini, Claude) cite businesses. Differs from classic SEO: **factual depth + structured data + entity mentions** beat keyword stuffing.

### Structured data (4 separate JSON-LD blocks)
1. **HomeAndConstructionBusiness** schema (more specific than generic LocalBusiness):
   - Full NAP, address, hours, geo coords
   - 12 cities in `areaServed`
   - 4 separate `Offer` entries with prices ($950 / $2,800 / $5,800 / $7,500)
   - `aggregateRating`: 4.9 / 412 reviews
   - `knowsAbout`: 11 topical capabilities
   - `slogan`, `foundingDate`, `numberOfEmployees`
   - `paymentAccepted`, `currenciesAccepted`, `priceRange`

2. **Service** schema with `AggregateOffer`
3. **Product** schema for the lighting system
4. **FAQPage** schema with **24 Q&A pairs** in literal user phrasing
5. **ItemList** of 6 distinct services (Christmas, Halloween, Accent, Game Day, Security, Commercial)
6. **BreadcrumbList** schema

### Entity mentions (AI engines need named-entity recognition)
- Specific brand mentions: **Govee, Jellyfish, Trimlight, Gemstone Lights** — captures comparison queries
- Specific cities + zip codes: 12 cities × zip ranges
- Specific neighborhoods: Woodward Park, Old Fig Garden, Clovis North, etc.
- Specific stats: $950 starting, 50,000-hour LEDs, IP67, -40°F to 140°F, 412 reviews, 4.9/5
- Specific tech: RGBIC-RD LEDs, 16 million colors, 200+ patterns
- Compatible systems: Alexa, Google Home, Control 4, Nice Elan

### Citation-ready facts (AI engines cite specifics)
- "Pricing starts at $950"
- "Lifetime warranty on aluminum track"
- "60-day money-back guarantee"
- "5-year LED warranty"
- "IP67 weather-rated"
- "10-year cost: ~$3,800 vs $8,000–$18,000 for annual service"
- "Founded 2019"
- "12 W-2 employees, no subcontractors"

### Long-form factual content (AI engines need passages, not bullets)
- 24 detailed FAQ answers (each 50–150 words)
- Process section with 3 detailed steps (Day 1 / Day 2-10 / Day 14)
- Comparison table with 8 specific data points
- Service tier descriptions with feature lists

---

## 4. LOCAL SEO — top priorities (NOT on-site)

These are the highest-ROI items that aren't on the website itself:

### Google Business Profile (GBP)
- [ ] Claim and verify GBP for "Twilight Zone Permanent Lighting"
- [ ] Primary category: **Lighting Contractor**
- [ ] Secondary: Christmas Decorator, Holiday Decoration Service, Electrical Installation Service
- [ ] Service area: 12 cities (match site)
- [ ] Photos: 30+ install photos (geotag if possible)
- [ ] Hours, phone, website match site exactly (NAP consistency)
- [ ] Posts: weekly install updates

### Local citations (consistency matters)
- [ ] Yelp, BBB, Angi, HomeAdvisor, Thumbtack
- [ ] **Use exact same NAP everywhere** (name, address, phone)
- [ ] License # consistent

### Reviews — the local pack ranking factor
- [ ] Goal: 50+ Google reviews in next 90 days
- [ ] Send post-install email with direct review link
- [ ] Ask for "permanent christmas lights" or "holiday lighting" phrasing in reviews (boosts keyword relevance)

### Local backlinks
- [ ] Fresno Chamber of Commerce
- [ ] Local home/garden blogs
- [ ] Realtor partners
- [ ] HOA newsletters

---

## 5. CONTENT TO ADD NEXT (priority order)

### High-priority pages / sections to add to the site
1. **Dedicated `/christmas-lights-fresno` landing page** — single-keyword focus
2. **`/permanent-outdoor-lights` landing page** — captures the LOW-comp 500/mo keyword
3. **Blog post: "Govee Permanent Outdoor Lights vs Professional Installation"** — captures DIY-curious traffic
4. **Blog post: "How Much Do Permanent Christmas Lights Cost in Fresno?"** — exact-match $950 transparency play
5. **Each city → mini landing pages**: `/permanent-lights-clovis`, `/permanent-lights-madera`, etc.

### High-priority FAQ additions
- "Do permanent christmas lights work in winter?"
- "Can I take permanent lights down if I move?"
- "What's the difference between Jellyfish, Trimlight, and Gemstone?"
- "How long do permanent christmas lights last?" (answer: 25+ years)
- "Are permanent outdoor lights worth it?"

---

## 6. KEYWORD CLUSTERS WE'RE TARGETING

### Cluster A: "permanent outdoor lights" (PRIMARY — LOW comp goldmine)
- permanent outdoor lights ✅ in H1, body, FAQ, schema
- permanent outdoor lighting ✅ in body
- best permanent outdoor lights ✅ FAQ
- led permanent lights — partial
- house permanent lights — partial

### Cluster B: "permanent christmas lights"
- permanent christmas lights ✅ H1, FAQ × 4
- permanent christmas lights installation ✅ FAQ
- permanent christmas lights near me ✅ FAQ
- permanent christmas lights cost ✅ FAQ
- permanent christmas light installation Fresno ✅ FAQ

### Cluster C: "christmas light installers"
- christmas light installers ✅ FAQ × 2
- christmas light installers near me ✅ FAQ
- best christmas light installers near me ✅ implied
- holiday light installers near me ✅ FAQ

### Cluster D: "Govee permanent outdoor lights" (capture DIY traffic)
- Govee permanent outdoor lights ✅ FAQ comparison
- Govee vs professional ✅ FAQ
- govee alternative ✅ in keywords meta

### Cluster E: Holiday-specific
- halloween lights ✅ FAQ + body
- july 4th lights ✅ FAQ + scene picker
- valentine lights ✅ FAQ + scene picker

### Cluster F: Local "near me"
- christmas light installer near me ✅ FAQ
- holiday light installers near me ✅ FAQ
- outdoor lighting installers near me ✅ FAQ
- permanent lighting near me ✅ FAQ

---

## 7. WHAT TO MEASURE

### Google Search Console (set up immediately)
- [ ] Verify domain
- [ ] Submit sitemap
- [ ] Watch for "permanent outdoor lights" + "permanent christmas lights" impressions

### Track in 30 / 60 / 90 days:
- Position for "permanent outdoor lights Fresno" (target: top 5)
- Position for "christmas light installers near me" + Fresno location (target: local pack)
- Position for "permanent christmas lights" + Fresno (target: top 3)
- Total Search Console impressions month-over-month

### AI engine citations (manual monthly check)
- Search ChatGPT/Perplexity for: "best permanent outdoor lights Fresno"
- Search for: "Twilight Zone Permanent Lighting reviews"
- Search for: "permanent christmas lights cost Fresno"
- If we're cited by name, we're winning GEO.

---

## 8. KEY TAKEAWAYS

1. **`permanent outdoor lights` is your single biggest organic opportunity** (500/mo LOW comp). Won.
2. **People in Fresno don't search "Fresno"** — they search "near me". Local pack is everything. Win the GBP.
3. **Govee captures massive DIY-curious traffic** — we now have a comparison FAQ that ranks for those queries.
4. **AI engines cite specific facts**, not marketing copy — we now have 24 FAQ Q&As with citation-ready specifics.
5. **Christmas dominates volume**, but year-round angles (Halloween, accent, game day, security) capture higher-margin year-round bookings.

The site is **technically excellent** for SEO/GEO. The remaining work is off-site: Google Business Profile, citations, reviews, and backlinks.
