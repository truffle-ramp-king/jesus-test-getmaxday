# MaxDay visual direction

Warm paper, deep olive, Georgia serif, system sans, generous but purposeful spacing. The Scripture card is the product preview. The page keeps the promise and primary action close together on mobile; the sticky action only appears after the first download button has scrolled past.

## Illustration

Created with the built-in image generation tool. Original: `olive-hills-original.png`. Web asset: `../public/assets/olive-hills.jpg`. The image is an illustration, not a representation of an identified biblical location. The exact prompt:

> Use case: illustration-story. Asset type: full-bleed illustration for a tasteful Scripture and prayer website and a free verse card. Create one landscape image, 1536 by 1024 composition. A serene, hand-painted gouache and watercolor landscape: soft green rolling hills, a quiet narrow winding path through an olive grove, hazy distant mountains, warm pale ivory sky with muted morning light. A few olive branches frame the foreground at the lower corners, with the path receding naturally toward the middle. A restrained palette of dusty sage, deep olive, oat, and warm stone. Fine paper grain, painterly brush edges, natural understated detail; premium editorial illustration, peaceful and welcoming to adults of many ages. Leave the upper sky spacious. No people, no buildings, no religious figures, no crosses, no objects symbolizing commerce. No text, no lettering, no border, no watermark. Avoid oversaturated colors, glowing light beams, plastic digital rendering, gradients, fantasy scenery, cartoon styling, and decorative clutter.

The card and social preview are deterministic HTML compositions rendered by `scripts/build-assets.mjs`. Bible text is real text, not generated image lettering. Rebuild on a system with Georgia installed for the same typography. No asset build is required for deployment.
