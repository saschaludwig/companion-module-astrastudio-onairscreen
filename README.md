# companion-module-astrastudio-onairscreen

Bitfocus Companion 4 module for [OnAirScreen](https://github.com/saschaludwig/OnAirScreen). Control studio LEDs, AIR timers, and text fields over HTTP, with live variables from `/api/status`.

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE).

## Getting started

```bash
corepack enable
yarn install
yarn build
yarn test
```

`yarn build` is enough for Companion to load the module. `yarn dev` runs the TypeScript compiler in watch mode.

## Local development in Companion

Companion looks for unpublished modules in its `module-local-dev` folder. Symlink this repository there **using the package name** (`companion-module-astrastudio-onairscreen`), not the folder name `OAS-Companion`:

```bash
# macOS
mkdir -p "$HOME/Library/Application Support/companion/module-local-dev"
ln -sf "$(pwd)" \
  "$HOME/Library/Application Support/companion/module-local-dev/companion-module-astrastudio-onairscreen"
```

Then restart Companion and add **astrastudio / OnAirScreen**. Host = OnAirScreen IP, HTTP port **8010**. OSC is not used.
