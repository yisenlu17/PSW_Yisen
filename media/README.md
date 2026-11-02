# media

Every picture on the site, as a file — so what is published is something you can open
and replace, rather than something to hunt for in the CMS.

The folders are for finding things by hand. The scripts do not care about them: a
picture is named by its filename alone, and `npm run media` looks for that name in
every folder here. So a file can be moved between them without anything breaking, and
one file can be used in two places — `stranger-soccer-hosts.jpg` is on a role page and
on the Playground. **Two files may not share a name**, in any folder: the dataset
keys assets by filename too, and the upload stops and says so.

```bash
npm run media               # upload every picture the content modules name
npm run media -- --dry-run  # say what would go up, upload nothing
npm run media -- --replace  # upload again even where the name is already taken

npm run project-detail      # the project pages
npm run playground          # the Playground page
npm run experience-detail   # the role pages
```

All of them are safe to re-run. To change a picture, save the new one under the same
name, then `npm run media -- --replace` and whichever writer owns the page it is on.

## project/

The screenshots. `scripts/project-content.mjs` names them — a `cover` per project and
an `IMG` at the point in a write-up where a picture belongs — so this folder is where
a screenshot is replaced or retaken.

### What belongs here

| File | Where it lands |
| --- | --- |
| `exploremehere-home.png` | Exploremehere — cover: the home page, with a tailored version beside the headline |
| `exploremehere-site.png` | Exploremehere — in the write-up, under why it exists: the sample site a user ends up with |
| `exploremehere-boost.png` | Exploremehere — in the write-up, under Boost |
| `exploremehere-tailor.png` | Exploremehere — in the write-up, under tailoring |
| `exploremehere-business.png` | Exploremehere — in the write-up, under the agency edition |
| `dongqiuwang-home.png` | 我是懂球王 — cover: the card on `/projects` and the top of the detail page |
| `dongqiuwang-news-poll.png` | 我是懂球王 — in the write-up, under the section on how a call is made |
| `dongqiuwang-card.png` | 我是懂球王 — in the write-up, under the core loop it feeds |
| `just-hoop-lobby.png` | Just Hoop — cover |
| `just-hoop-matchmaking.png` | Just Hoop — in the write-up, under the three product ends |
| `just-hoop-referee-console.png` | Just Hoop — in the write-up, under the remote-referee decision |
| `zhipai-console.png` | 智排 — cover: the day’s control room |
| `zhipai-scheduling.png` | 智排 — in the write-up, under the manual/automatic decision |
| `zhipai-portal.png` | 智排 — in the write-up, under the two entrances |
| `zhipai-teacher.png` | 智排 — in the write-up, under the teacher side |
| `zhipai-student.png` | 智排 — in the write-up, under the student side |
| `zhipai-student-schedule.png` | 智排 — in the write-up, closing the same section |

Full-page screenshots are the right thing to save, and nothing here is cropped — the
card, the cover and the pictures in a write-up all take the shape of the file, so what
you capture is what the page shows. A picture taller than it is wide by a quarter is
taken for a phone screenshot and held to a phone's width in the write-up, so a portrait
capture does not run the length of the column.

One thing to check before saving a capture: names. These are real centres, real
teachers and real students, and a screenshot goes on a public page — blur anything
that identifies somebody, the way the 智排 captures already do.

`npm run preview-detail` renders the pages straight from this folder, with no upload
and no token — which is the cheapest way to see whether a screenshot sits under the
right paragraph.

## photos/

The photographs — the ones of real places and real people, as opposed to pictures of
software. `scripts/photo-content.mjs` names them, describes what is in each one, and
decides where each lands.

| File | Where it lands |
| --- | --- |
| `stranger-soccer-hosts.jpg` | Stranger Soccer — the match-day contribution; and the Football tile on `/playground` |
| `ey-desktop-procedures.png` | EY — the desktop-procedures contribution |
| `basketball-huddle.jpg` | `/playground` — the large Basketball tile |
| `basketball.jpg` | Nowhere. The whole grid of shots, kept because `basketball-huddle.jpg` is only its top frame |
| `skydive.jpg` | `/playground` — the gallery |
| `sunset-shore.jpg` | `/playground` — the gallery |
| `snorkelling.jpg` | `/playground` — the gallery |
| `pagoda-overlook.jpg` | `/playground` — the gallery |

The two sport photographs are cropped by the design rather than shown whole: the tile
is a fixed shape and the picture fills it. Which part survives that crop is the
`hotspot` in `photo-content.mjs`, not the middle of the frame — a group shot has its
faces high up, and left to itself a 3:1 band would show five sets of shoulders. Set it
there, or drag it on the image in the Studio; both end up in the same field.

Two things to check before choosing a picture for a tile. **What is at the bottom of
it**, because that is where the headline goes: an empty stretch of court carries type,
a row of faces does not. And **whether it already has type on it** — the 懂王兄弟说球
covers do, which is why they are shown whole and small in the strip instead, never as
a background with more words over the top.

The tiles with no picture are the other half of the same decision, and they live in
`BENTO_LAYOUT`. A tile is given the size its own words fill — the paragraph that runs
four lines gets a 2×1, the three short ones get a 1×1 each — because a tile bigger
than its text is a hole where a picture should be, and that is exactly what it looks
like. The order in that list is what lets the grid pack them with nothing left over in
the middle.

A picture that is a grid of other pictures is a third case, and the answer is to cut
the frame you want out as its own file rather than to crop to it at display time: a
crop leaves a sliver of the next row along the edge, which reads as a broken image.

Anything with a person in it who is not you, or a client's name on it, is worth a
second look before it goes up. The two internship pictures here are already redacted
that way.

## channel/

The video covers the two 抖音 accounts put out. They are not photographs and they are
not screenshots of software, which is why they are their own folder: each one is a
finished piece of artwork with a headline already burnt into it.
`scripts/photo-content.mjs` names them in `ACCOUNT_COVERS`, and
`npm run project-detail` puts the first two of each on the account's document.

| File | Where it lands |
| --- | --- |
| `dongwang-legend-time.png` | 懂王兄弟说球 — a cover, in the strip under the projects |
| `dongwang-keep-practising.png` | 懂王兄弟说球 — a cover, in the strip under the projects |
| `life-tuition-week-zero.jpg` | 生活与成长账号 — a cover, in the strip under the projects |
| `life-internship-rejections.jpg` | 生活与成长账号 — a cover, in the strip under the projects |

Because the headline is already on them, they are shown whole and small in the strip
and never used as a background with more type over the top.

Two things to check before saving one here.

**Cut the share card down to the cover.** Saving a video from 抖音 gives you the cover
with a white strip under it carrying the handle and a QR code. That strip is app
chrome, not artwork — on the navy strip it reads as a white block — so trim it off in
the file, the same way `basketball-huddle.jpg` is cut out of its grid rather than
cropped at display time. Both `life-*.jpg` here have had it removed.

**Shape does not have to match.** 懂王兄弟说球 posts landscape covers and 生活与成长账号
portrait ones, and neither is cropped to agree with the other. The strip holds a cover
to a height rather than a width, so a landscape pair and a portrait pair still sit in
the same band and the two columns read as a row.

## profile/

`profile/` is the portrait, kept here for the same reason as the screenshots: so the
file that is on the site is a file you can find. Nothing uploads it — it goes up once,
by hand, in the Studio:

    Global settings → Identity → Profile image

That one image is read in three places — the mark in the masthead, the photo beside
the intro on `/about`, and the hero portrait if it is ever switched on — so replacing
it there replaces it everywhere, and there is no second copy to forget about. A
section can still override it with a picture of its own, which is the "A different
photo" field on the Editorial intro.

It is cropped to a square for the masthead and to 4:5 for the page, from the middle of
the picture. If a crop lands badly, set the hotspot on the image in the Studio rather
than re-cropping the file.

`favicon.png` is the same face again, cut out of the portrait and set on the brand
navy at 512×512. It goes up by hand too, in a different place:

    Global settings → SEO → Favicon

It is a second crop rather than a reference to the portrait because that field has no
hotspot, and the code behind it fits the picture inside 32×32 without cropping — hand
it the portrait whole and you get a 25×32 sliver of a letterboxed man. Square in,
square out. The background is painted in for the same kind of reason: the shot has a
white studio backdrop, and a white square disappears into a light browser tab.

To recrop it, work from `有眼镜p.jpg` and keep the head filling the frame top to
bottom — 32 pixels is not enough room to spend any of it on shoulders.
