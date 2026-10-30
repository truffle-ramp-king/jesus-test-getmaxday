# getmaxday.com forwarding

This deployment now forwards the main domain to https://maxday.ai/. The Bible site lives at https://bible.getmaxday.com/ and is maintained in https://github.com/truffle-ramp-king/bible-getmaxday (local ../bible-website).

GitHub Pages serves browser-side redirects with JavaScript and no-JavaScript meta-refresh fallbacks, not HTTP 301 responses. Old /rest/ links, about/privacy pages, printable cards, and root URLs tagged utm_campaign=rest_v1 go to the Bible site. JavaScript preserves query parameters and fragments; the no-JavaScript fallback cannot preserve arbitrary query parameters. Existing card image URLs remain available. No Umami is loaded on forwarding pages; the Bible site retains the existing Umami website ID.

Build with `node scripts/build-forwarding.mjs`. Deployment uploads only forwarding-public. The original public/ source is retained for rollback; do not edit it to update the Bible site. Roll back the forwarding deployment by restoring the previous workflow (af0f140) and redeploying.
