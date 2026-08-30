## OnAirScreen

Bitfocus Companion module for [OnAirScreen](https://github.com/saschaludwig/OnAirScreen) studio displays. Works with Companion **4.3 and 5**.

Commands use the HTTP REST API (default port **8010**):

- Status poll (fallback): `GET http://host:8010/api/status`
- Commands: `GET http://host:8010/api/command?cmd=LED1:ON`
- Live status (preferred): WebSocket `ws://host:8011` (HTTP port **+ 1**)

OSC is **not** required. Enable HTTP in OnAirScreen (**Settings → Network**). Allow both the HTTP port and HTTP+1 through the firewall. If the WebSocket is blocked, the module keeps polling `/api/status` (default every 500 ms).

### Install (until this module is in the Companion Store)

1. Download `astrastudio-onairscreen-<version>.tgz` from the GitHub **Releases** page. Do **not** extract it.
2. Companion **Modules** → **Import module package** → choose the `.tgz`.
3. **Connections** → add **astrastudio / OnAirScreen**.
4. Set the connection **Label** to `oas` so variable examples below match.

Local development: `corepack enable && yarn install && yarn build`, then symlink this folder into Companion's `module-local-dev` directory as `companion-module-astrastudio-onairscreen`.

### Connection

| Field                         | Default     | Notes                                                            |
| ----------------------------- | ----------- | ---------------------------------------------------------------- |
| OnAirScreen IP / Hostname     | `127.0.0.1` | Studio PC running OnAirScreen                                    |
| HTTP Port                     | `8010`      | Must match OnAirScreen HTTP port                                 |
| Use WebSocket for live status | on          | `ws://host:(HTTP+1)`. Off = HTTP poll only                       |
| WebSocket Port                | _(empty)_   | Empty = HTTP port + 1. Set only if OnAirScreen uses another port |
| Poll interval (ms)            | `500`       | Used when WebSocket is off or disconnected                       |

The connection status shows instance name and version when connected, for example `Studio-1 · 0.9.9beta2`.

### Actions

| Action           | Sends                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| LED              | `LED{n}:ON` / `OFF` / `TOGGLE`                                             |
| AIR timer        | `AIR{n}:ON` / `OFF` / `TOGGLE` (AIR1 = microphone)                         |
| Reset AIR timer  | `AIR3:RESET` or `AIR4:RESET`                                               |
| AIR3 top-of-hour | `AIR3TOH:ON` / `OFF` / `TOGGLE`                                            |
| Set AIR3 time    | `AIR3TIME:seconds` from `m:ss` (e.g. `2:05`) or a raw second count         |
| Set text field   | `NOW:` / `NEXT:` / `WARN:` plus text                                       |
| WARN             | `WARN:text`, `WARN:1:text`, `WARN:2:text`; empty text clears that priority |
| Raw command      | Any `COMMAND:VALUE` (e.g. `CONF:…`)                                        |

A failed command is marked as a failed Companion action. After a successful command the module re-reads `/api/status` immediately.

### Feedbacks

LED on, LED autoflash, LED timedflash, AIR running, AIR3 TOTH, Silence, WARN not empty.

### Variables

Use the connection label (example assumes `oas`): `$(oas:air1_time)`, `$(oas:led1_status)`, …

| Variable                | Meaning                                  |
| ----------------------- | ---------------------------------------- |
| `led{1-4}_status`       | `true` / `false`                         |
| `led{1-4}_text`         | LED label                                |
| `led{1-4}_autoflash`    | Autoflash enabled                        |
| `led{1-4}_timedflash`   | Timedflash enabled                       |
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

LED1–4 toggle with live caption and colour, AIR1–4 with live caption and time (AIR1 = microphone), TOTH, Reset AIR3 / AIR4, NOW / NEXT / WARN display, Clear WARN, Silence alarm.
