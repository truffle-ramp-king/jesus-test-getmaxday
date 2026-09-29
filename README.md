# MaxDay · getmaxday.com

A static Bible verse, reflection, prayer, and free Scripture card. First conversion experiment for organic Facebook traffic. There is no purchase, signup form, runtime Bible API, production application server, or frontend secret.

## Website

Deploy only `public/`. All assets are committed. GitHub Actions publishes that folder to GitHub Pages on pushes to `main`.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4173. Development dependencies are not loaded by the production site. The asset generator uses Playwright and Georgia; `npm run build:assets` is optional, only for changing the committed card artwork.

## Analytics

The supplied Umami Cloud script and website ID are in `public/index.html`. Its `data-domains` setting limits tracking to getmaxday.com and www.getmaxday.com, so localhost and the temporary GitHub preview do not add traffic to the live account. The before-send hook preserves UTM parameters and removes Facebook click IDs, arbitrary query parameters, and hash fragments from the tracked page URL.

| Event | Meaning |
| --- | --- |
| `card_requested` | Visitor deliberately requests the available static PNG card. Once per browser-tab session. `placement` identifies hero, after_reflection, or mobile_bar. |
| `print_requested` | Visitor opens the separate printable resource. This is not proof of a completed print. |
| `passage_opened` | Visitor expands Matthew 11:28–30. Supporting engagement, not a conversion. |
| `share_opened` | Visitor requests the device share interface. This is not proof of sending a message. |
| `share_link_copied` | Browser clipboard confirms copying the share link. |

No event fires automatically as a conversion on arrival, scrolling, or elapsed time. Resource links work if JavaScript, session storage, or Umami is blocked. Analytics calls never block a download. No names, emails, prayer text, or belief responses are collected by this frontend. Pageviews and properties consume Umami's event allowance too.

### Dashboard setup

1. Confirm the Umami website accepts the production hostname.
2. Create an ordered funnel: viewed page `/` -> triggered event `card_requested`, maximum 30 minutes between steps.
3. Use the same date range and source filters for both steps. Umami reports users in this funnel; do not call them sessions or derive conversion from raw clicks.
4. View US-classified and all-country results separately. Use UTM reports for campaign attribution.
5. Record Facebook impressions and website outbound clicks separately. The site cannot measure people who never leave Facebook. Missing organic outbound metrics must be reported as missing.

Example Facebook link:

`https://getmaxday.com/?utm_source=facebook&utm_medium=organic_social&utm_campaign=rest_v1&utm_content=page01_post01`

Use generic page/post IDs, not personal information. A shared link replaces the original acquisition parameters with `utm_source=share&utm_medium=referral&utm_campaign=rest_v1`.

Main report: observed arrivals, funnel visitors requesting a card / landing visitors, and card-request visitor yield per 1,000 Facebook impressions. The cross-platform arrival ratio is diagnostic, not a person-matched probability. A request is not proof of reading, saving, prayer, sharing, future email interest, or commercial demand.

## Domain

GitHub Pages must be enabled with **GitHub Actions** as the build source. Add getmaxday.com in Pages settings before pointing DNS to GitHub. Preserve existing MX, SPF, DKIM, DMARC, and verification TXT records.

GitHub's standard apex A records:

```
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
www  CNAME  truffle-ramp-king.github.io
```

Remove conflicting apex URL redirects / parking A records when switching the website. Do not change the domain's nameservers or mail records. If existing apex AAAA records point elsewhere, update or remove those website records as well. Enable HTTPS after GitHub provisions the certificate.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Content and indexing

- Scripture quotation and context: Matthew 11:28–30, World English Bible, public domain; exact wording checked through bible-api.com on September 29, 2026. Runtime content is bundled.
- Reflection and prayer are original MaxDay text. The surrounding passage is available through an accessible native `<details>` element.
- “For today” is an evergreen reading, not a promise of new daily publication.
- All HTML pages use `noindex, nofollow`. robots.txt allows retrieval so crawlers can see that instruction. GitHub Pages does not let this repository set arbitrary response headers on PNG/JPG files; direct image indexing is not guaranteed to be excluded. These directives do not isolate or protect email reputation.
- Source illustration and prompt are in `design/`; only compressed production assets are deployed.

## Verification

```sh
npm test
```

Browser checks cover the actual card download, event deduplication, blocked analytics, no-JavaScript resources, narrow mobile layouts, passage access, metadata, and static navigation. Tests intercept analytics so test traffic is not written to the live Umami account. Install Playwright's Chromium with `npx playwright install chromium` if Chrome is not installed locally.
