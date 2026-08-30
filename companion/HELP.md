## OnAirScreen

Bitfocus Companion module for [OnAirScreen](https://github.com/saschaludwig/OnAirScreen) studio displays. It uses the HTTP REST API (default port **8010**):

- Poll: `GET http://host:8010/api/status`
- Commands: `GET http://host:8010/api/command?cmd=LED1:ON`

OSC is **not** required. Enable HTTP in OnAirScreen (**Settings → Network**). Poll interval defaults to 500 ms so AIR times (including MIC / AIR1) stay close to the studio display.

### Connection

| Field                     | Default     | Notes                            |
| ------------------------- | ----------- | -------------------------------- |
| OnAirScreen IP / Hostname | `127.0.0.1` | Studio PC running OnAirScreen    |
| HTTP Port                 | `8010`      | Must match OnAirScreen HTTP port |
| Poll interval (ms)        | `500`       | How often `/api/status` is read  |

### Actions

| Action           | Sends                                              |
| ---------------- | -------------------------------------------------- |
| LED              | `LED{n}:ON` / `OFF` / `TOGGLE`                     |
| AIR timer        | `AIR{n}:ON` / `OFF` / `TOGGLE` (AIR1 = microphone) |
| Reset AIR timer  | `AIR3:RESET` or `AIR4:RESET`                       |
| AIR3 top-of-hour | `AIR3TOH:ON` / `OFF` / `TOGGLE`                    |
| Set AIR3 time    | `AIR3TIME:seconds`                                 |
| Set text field   | `NOW:` / `NEXT:` / `WARN:` plus text               |
| Raw command      | Any `COMMAND:VALUE` (e.g. `CONF:…`)                |

### Feedbacks

LED on, AIR running, AIR3 TOTH, Silence, WARN not empty.

### Variables

Use the connection label (example assumes `oas`): `$(oas:air1_time)`, `$(oas:led1_status)`, …

| Variable                | Meaning                                  |
| ----------------------- | ---------------------------------------- |
| `led{1-4}_status`       | `true` / `false`                         |
| `led{1-4}_text`         | LED label                                |
| `air{1-4}_status`       | Timer running                            |
| `air{1-4}_seconds`      | Integer seconds                          |
| `air{1-4}_time`         | `m:SS` like OnAirScreen (`125` → `2:05`) |
| `air{1-4}_text`         | Timer label                              |
| `air3_toth`             | Top-of-hour active                       |
| `now` / `next` / `warn` | Text lines                               |
| `silence`               | Silence alarm latched                    |
| `instance`              | Instance name                            |
| `version`               | OnAirScreen version                      |

### Presets

LED1–4 toggle with colour, AIR1–4 with live time on the button (MIC = AIR1), TOTH, Reset AIR3 / AIR4.

### Local development

This module is not in the Companion Store yet. Load it from disk:

1. `corepack enable && yarn install && yarn build`
2. Symlink this folder into Companion's `module-local-dev` directory using the npm package name:

```bash
# macOS (typical Companion user data dir)
mkdir -p "$HOME/Library/Application Support/companion/module-local-dev"
ln -sf /path/to/OAS-Companion \
  "$HOME/Library/Application Support/companion/module-local-dev/companion-module-astrastudio-onairscreen"
```

On Linux the user data directory is often `~/.companion` or `~/.config/companion`. You can also add the path under Companion **Developer** → module development.

3. Restart Companion and add connection **astrastudio / OnAirScreen**.
