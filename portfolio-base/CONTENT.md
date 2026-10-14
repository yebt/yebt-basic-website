# Content

Projects live in `src/content/projects/`, garden notes in `src/content/garden/`. Each entry is a `.md` file, or `.mdx`
when it needs images, collages or margin notes. The frontmatter schema is in `src/content.config.ts`.

## Components for MDX

Import them at the top of the `.mdx` file, after the frontmatter. Images are imported too, so Astro can resize them:

```mdx
import { Callout, Collage, Figure, Sidenote } from '../../components/content';
import diagram from '../../assets/projects/ledger-core/context-map.png';
```

Put project images under `src/assets/` (for example `src/assets/projects/<slug>/`). Leave a blank line before and after
each component.

### `<Figure>`: one image with a caption

```mdx
<Figure src={diagram} alt="Context map: postings, balances, periods" figure="FIG. 02" caption="Contexts talk through events." />
```

`wide` lets it span into the side column on wide screens.

### `<Collage>`: several images composed like a print

Cuts placed on a 12 × 9 grid over a dark ground, with solid blocks, guide lines, arcs and tiny size labels.

```mdx
<Collage
  layout="tower"
  figure="FIG. 01"
  caption="What the reader should look at."
  images={[
    { src: a, alt: '…', label: 'CORE' },
    { src: b, alt: '…', label: 'PORTS' },
    { src: c, alt: '…' },
    { src: d, alt: '…' },
  ]}
/>
```

- `layout`: `tower` (4 images), `spread` (3) or `pair` (2). Extra images reuse the preset's slots.
- Per image, `area="row-start / col-start / row-end / col-end"` (grid lines 1–10 by 1–13) overrides the preset slot.
- `blocks={['1 / 9 / 4 / 13']}` replaces the preset's dark blocks.
- `label` names the cut in its tag; without it the tag reads `C-01`, `C-02`, …
- `wide` spans into the side column on wide screens.

### `<Sidenote>`: margin note

```mdx
The paragraph the note comments on.

<Sidenote label="Rule of thumb">
  If a test of the core needs a container, a port is missing.
</Sidenote>
```

Place it between paragraphs. On wide screens it floats into the side column level with the text that follows it; on
narrow screens it becomes an inline note at that point. Notes are numbered automatically.

### `<Callout>`: highlighted block

```mdx
<Callout kind="decision" title="Events over shared tables">Why, and the trade-off accepted.</Callout>
```

`kind`: `note` (default), `decision`, `warning`, `placeholder`.

## Video

Set `video` (a YouTube watch or `youtu.be` URL) in a project's frontmatter: the page shows a thumbnail and loads the
player only when the visitor presses play. `playlist` renders a link card instead.

## Placeholders

`src/assets/placeholders/*.jpg` are generated textures used by the sample entries (`ledger-core.mdx`,
`screaming-architecture.mdx`). Replace them with real images and delete the folder when nothing imports it.
