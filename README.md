## Rollout status

Temporary deployment uses `build-transition.mjs`: root -> maxday.ai, existing `/rest/` Bible page retained. The new subdomain is deployed but awaiting GitHub certificate issuance. Once `bible.getmaxday.com` passes TLS verification, enable HTTPS in its Pages settings and change the deploy workflow to `node scripts/build-forwarding.mjs`. That final build migrates legacy links to the new domain.

# getmaxday.com forwarding

This deployment now forwards the main domain to https://maxday.ai/. The Bible site lives at https://bible.getmaxday.com/ and is maintained in https://github.com/truffle-ramp-king/bible-getmaxday (local ../bible-website).

GitHub Pages serves browser-side redirects with JavaScript and no-JavaScript meta-refresh fallbacks, not HTTP 301 responses. Old /rest/ links, about/privacy pages, printable cards, and root URLs tagged utm_campaign=rest_v1 go to the Bible site. JavaScript preserves query parameters and fragments; the no-JavaScript fallback cannot preserve arbitrary query parameters. Existing card image URLs remain available. No Umami is loaded on forwarding pages; the Bible site retains the existing Umami website ID.

Build with `node scripts/build-forwarding.mjs`. Deployment uploads only forwarding-public. The original public/ source is retained for rollback; do not edit it to update the Bible site. Roll back the forwarding deployment by restoring the previous workflow (af0f140) and redeploying.

Latest routing requirement: the final Bible destination is always the homepage for /rest legacy entries, with explicit UTM tags preserved. There are no implicit Facebook attribution defaults. The temporary old-domain fallback retains /rest only until the new HTTPS certificate is valid.
