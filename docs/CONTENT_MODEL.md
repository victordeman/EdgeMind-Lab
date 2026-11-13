# Content model

All site content lives in `content/` as MDX files with YAML frontmatter, plus one JSON file. Nothing is stored in a database or CMS.

```text
content/
├── labs/<slug>.mdx        one file per lab
├── paths/<slug>.mdx       one file per learning path
├── hardware/<slug>.mdx    arduino, raspberry-pi, linux, ender-3
├── ai/<slug>.mdx          language-models, agents
└── resources.json         resources that are not attached to a lab
```

- The **slug** is the file name without `.mdx`. It must be lowercase kebab-case (`rpi-gpio-python`) and becomes the URL.
- Files whose name starts with `_` are ignored, so templates can sit next to real content.
- Schemas are defined once in `lib/schemas.ts`; TypeScript types in `lib/types.ts` are inferred from them.
- Pages and components read content only through `lib/content.ts`. They never import `fs` or `gray-matter`.

## Validation

Content is validated by `npm run validate:content`, which runs automatically before `npm run build` and is also covered by `npm test`. A problem stops the build and is reported as `file: field: message`, for example:

```text
Invalid content (2 problems):
  content/labs/arduino-blink.mdx: title: Invalid input: expected string, received undefined
  content/paths/ai-agents.mdx: modules.1.labs.0: unknown lab slug "agent-sensors"
```

All problems are reported in one run. On top of the field rules below, these cross-file rules apply:

| Rule                                                                                                                    | Reported field                    |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Every slug in a lab's `prerequisites.labs` is an existing lab, and not the lab itself                                   | `prerequisites.labs.<n>`          |
| Every slug in a path's `modules[].labs` is an existing lab                                                              | `modules.<m>.labs.<n>`            |
| A lab is listed in at most one path and one module                                                                      | `modules.<m>.labs.<n>`            |
| Every `downloads[].file`, and every resource `href` that starts with `/`, is a file under `public/`                     | `downloads.<n>.file` / `<n>.href` |
| A lab whose `status` is not `planned` has the H2 sections `Steps`, `Expected outcome`, `Troubleshooting`, in that order | `body`                            |
| A lab whose `status` is not `planned` and that uses `ender-3` has at least one `safety` note                            | `safety`                          |
| All four hardware pages and both AI pages exist, and no others                                                          | `(file)` / `(file name)`          |

Unknown frontmatter keys are rejected, so a misspelt field name is caught instead of silently ignored.

## Lab — `content/labs/<slug>.mdx`

| Field                     | Type                                                                                                 | Required                                 | Notes                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `title`                   | string                                                                                               | yes                                      |                                                                                                               |
| `summary`                 | string, ≤ 160 characters                                                                             | yes                                      | Used on cards and as the meta description                                                                     |
| `hardware`                | array of `arduino` \| `raspberry-pi` \| `linux` \| `ender-3`                                         | yes, ≥ 1                                 | Drives hub listings and the hardware filter                                                                   |
| `topics`                  | array of `electronics` \| `linux` \| `language-models` \| `ai-agents` \| `3d-printing` \| `robotics` | yes, ≥ 1                                 | Drives the topic filter and the AI pages                                                                      |
| `difficulty`              | `beginner` \| `intermediate` \| `advanced`                                                           | yes                                      |                                                                                                               |
| `estimatedMinutes`        | positive integer                                                                                     | yes                                      |                                                                                                               |
| `objectives`              | string[]                                                                                             | yes, ≥ 1                                 |                                                                                                               |
| `prerequisites.labs`      | lab slug[]                                                                                           | no                                       | Each slug must exist                                                                                          |
| `prerequisites.knowledge` | string[]                                                                                             | no                                       |                                                                                                               |
| `bom`                     | `{ item, quantity, notes?, optional? }[]`                                                            | yes (may be `[]` for software-only labs) | `quantity` is a positive integer; put units or values in `notes`                                              |
| `safety`                  | string[]                                                                                             | no                                       | Required for any lab using mains power, a heated printer, motors or batteries                                 |
| `downloads`               | `{ label, file, kind }[]`, `kind` = `code` \| `stl` \| `diagram` \| `doc`                            | no                                       | `file` is a site path to a file under `public/`, for example `/code/arduino-blink/blink.ino`; it must exist   |
| `references`              | `{ label, url }[]`                                                                                   | yes, ≥ 1                                 | Official sources for the technical facts; `http` or `https` URLs                                              |
| `status`                  | `draft` \| `reviewed` \| `planned`                                                                   | yes                                      | `draft` = written, not yet bench-verified; `reviewed` = checked by staff; `planned` = listed as "Coming soon" |
| `updated`                 | ISO date, `YYYY-MM-DD`                                                                               | yes                                      |                                                                                                               |

**Body.** Every lab whose `status` is not `planned` must contain these H2 sections in this order: `## Steps`, `## Expected outcome`, `## Troubleshooting`. Other headings may appear between them. Objectives, prerequisites, the bill of materials, safety notes and downloads are rendered from frontmatter, so do not repeat them in the body. A `planned` lab needs complete frontmatter but no body.

## Learning path — `content/paths/<slug>.mdx`

| Field        | Type                                       | Required | Notes                                                                     |
| ------------ | ------------------------------------------ | -------- | ------------------------------------------------------------------------- |
| `title`      | string                                     | yes      |                                                                           |
| `summary`    | string                                     | yes      |                                                                           |
| `difficulty` | `beginner` \| `intermediate` \| `advanced` | yes      |                                                                           |
| `order`      | integer                                    | yes      | Position on the home page and the paths index, lowest first               |
| `outcomes`   | string[]                                   | yes, ≥ 1 |                                                                           |
| `modules`    | `{ title, summary, labs: slug[] }[]`       | yes, ≥ 1 | Each module lists ≥ 1 lab; every slug must exist; order is teaching order |

Estimated time is not stored. `getPathMinutes()` sums `estimatedMinutes` of the path's labs that are not `planned`.

Body: a short MDX overview of the path.

## Hardware hub — `content/hardware/<slug>.mdx`, AI page — `content/ai/<slug>.mdx`

| Field        | Type               | Required |
| ------------ | ------------------ | -------- |
| `title`      | string             | yes      |
| `summary`    | string             | yes      |
| `references` | `{ label, url }[]` | yes, ≥ 1 |

Body: an MDX overview. The labs shown on these pages are derived from lab frontmatter and are never listed by hand:

- a hardware hub shows the labs whose `hardware` includes its slug;
- `ai/language-models` shows labs with the topic `language-models`, and `ai/agents` shows labs with the topic `ai-agents`.

## Resource — `content/resources.json`

An array of:

| Field         | Type                                            | Required | Notes                                             |
| ------------- | ----------------------------------------------- | -------- | ------------------------------------------------- |
| `title`       | string                                          | yes      |                                                   |
| `description` | string                                          | yes      |                                                   |
| `category`    | `code` \| `stl` \| `diagram` \| `bom` \| `link` | yes      |                                                   |
| `href`        | site path under `public/`, or `http(s)` URL     | yes      | A path starting with `/` must be an existing file |
| `hardware`    | array of hardware slugs                         | no       |                                                   |

Lab downloads do not need to be repeated here; the resources page lists them automatically.

## Annotated example lab

`content/labs/example-lab.mdx` (illustrative; the values are placeholders, not a real lab):

```mdx
---
# Shown as the page heading and on cards.
title: Example lab title
# One sentence, at most 160 characters.
summary: What the student builds and why it matters, in one sentence.
# Which hub pages list this lab.
hardware: [raspberry-pi, linux]
# Which filters and AI pages list this lab.
topics: [electronics, linux]
difficulty: beginner
# Whole minutes for a first-time student, including wiring.
estimatedMinutes: 60
# Start each objective with a verb the student can be assessed on.
objectives:
  - Wire the circuit from the diagram.
  - Run the program and explain its output.
prerequisites:
  # Slugs of labs that must be done first; each must exist in content/labs/.
  labs: [rpi-linux-first-boot]
  # Anything else the student should already know.
  knowledge:
    - Reading a simple breadboard circuit.
bom:
  - item: Raspberry Pi board with a 40-pin GPIO header
    quantity: 1
  - item: Jumper wires (female to male)
    quantity: 4
    # Free text for values, units or substitutions.
    notes: Any colour.
  - item: Heatsink
    quantity: 1
    # Marks parts the lab works without.
    optional: true
# Shown in a warning box at the top of the lab.
safety:
  - Shut the Pi down and remove power before changing any wiring.
downloads:
  # The file must exist at public/code/example-lab/main.py.
  - label: Python program
    file: /code/example-lab/main.py
    kind: code
  - label: Wiring diagram
    file: /diagrams/example-lab-wiring.svg
    kind: diagram
# Every technical value in the lab must be traceable to one of these.
references:
  - label: gpiozero documentation
    url: https://gpiozero.readthedocs.io/en/stable/
# draft until a staff member has run the lab on real hardware.
status: draft
# Date of the last meaningful change.
updated: 2026-11-13
---

Optional introduction: one short paragraph of context.

## Steps

<Steps>
<Step title="Set up the hardware">

Instruction text. Put every program in `public/code/<lab-slug>/` and show it with `<CodeFile>`.

<CodeFile file="/code/<lab-slug>/example.ino" />

</Step>
</Steps>

## Expected outcome

<ExpectedOutcome>
  What the student should see when the lab works.
</ExpectedOutcome>

## Troubleshooting

<Troubleshooting>
  <Issue symptom="What the student sees" cause="Likely cause">
    What to check or change.
  </Issue>
</Troubleshooting>
```

### Lab body rules

The page renders the header, overview, parts list, safety notes, downloads, references and previous/next links from frontmatter. The MDX body holds only the teaching text. `npm run validate:content` enforces:

- No `# H1` in the body. The page title is the only H1.
- At most one `<Steps>` block. Each `<Step title="…">` gets the id `step-N` and appears in the table of contents.
- Every `<CodeFile file="…">` points to an existing file under `public/code/`. The page reads the file at build time, so the shown code and the download are the same bytes.
- Headings are `##` and `###`, in order.

### Lab MDX components (`components/lab/mdx.tsx`)

| Component                      | Use                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `Steps`, `Step title`          | The numbered procedure                                                         |
| `Wiring`, `Connection from/to` | A wiring table. Optional `diagram` and required `alt` for an image that exists |
| `CodeFile file`                | Highlighted code from `public/code/` with copy and download                    |
| `ExpectedOutcome`              | The result the student should see                                              |
| `Troubleshooting`, `Issue`     | Symptom, cause and fix entries                                                 |

MDX stays on the default (no JavaScript expressions in the body). Do not add images or diagrams that do not exist.

## Loader API (`lib/content.ts`)

| Function                                                                         | Returns                                                             |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `getLabs()`, `getLab(slug)`                                                      | All labs sorted by slug; one lab or `undefined`                     |
| `getPaths()`, `getPath(slug)`                                                    | All paths sorted by `order`; one path or `undefined`                |
| `getHubs()`, `getHub(slug)`                                                      | Hardware hub pages                                                  |
| `getAiPages()`, `getAiPage(slug)`                                                | AI pages                                                            |
| `getResources()`                                                                 | Entries of `content/resources.json`                                 |
| `getLabsByHardware(hardware)`, `getLabsByTopic(topic)`, `getLabsForAiPage(slug)` | Labs for a hub, a topic or an AI page                               |
| `getPathLabs(path)`                                                              | A path's labs in teaching order, including planned ones             |
| `getPathForLab(slug)`                                                            | The path that contains a lab                                        |
| `getNextPrevLab(slug)`                                                           | `{ previous?, next? }` within the lab's path, skipping planned labs |
| `getRelatedLabs(slug, limit)`                                                    | Written labs that share hardware or topics, never planned ones      |
| `readPublicTextFile(href)`, `getPublicFileSize(href)`                            | Text and byte size of a file under `public/`                        |
| `getPathMinutes(slug)`                                                           | Total minutes of a path's labs that are not planned                 |

Each returned lab, path or page carries its frontmatter fields plus `slug` and `body` (the MDX source without frontmatter).
