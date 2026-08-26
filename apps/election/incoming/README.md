# Portraits waiting to be taken in

Drop candidate photographs here, named after the person — `Abrar Jainuddin
Hataman.jpg`, `abdulraof-macacua.png`, `Sema, Romeo.jpeg` all match the same
way. Middle names, initials, honorifics and file extension do not matter; the
first and last name do.

Then, from `apps/election`:

    bun run portraits ./incoming --credit "Who released these"

Each file is matched to a name on the ballot, squared to 320px, compressed, and
written into `app/_images/people/`. The generated list in
`app/_lib/portraits.generated.ts` is rewritten from what is on disk. Anything
that matches nobody is listed back at you rather than filed under a guess.

The credit is required, and it is the whole point: it is the line printed under
the photograph saying who released it. Only put files here that the project has
the right to publish — a party's own headshots supplied for a voter guide, an
official government release, or photography commissioned for this project. Not
anything lifted from a news story or a social account.

The images in this folder are ignored by git; the ones that make it into
`app/_images/people/` are the record.
