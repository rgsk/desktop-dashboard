## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Starting Development With Watching Tailwind Styles.

the way tailwind is setup we need to be watching tailwind classes:

dev command is setup to run `concurrently \"npm start\" \"npm run tailwind:watch\"`

```bash
npm run dev
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Environment Variables

src/main/lib/environmentVars.ts

from this file we can switch between production and development environment
