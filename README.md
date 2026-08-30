# Companion module for OnAirScreen

Control [OnAirScreen](https://github.com/saschaludwig/OnAirScreen) from Bitfocus Companion **4.3 or 5**: LEDs, AIR timers (including live MIC time), NOW / NEXT / WARN, and button colour from studio status.

The module talks HTTP to OnAirScreen (default port **8010**) for commands. Live status prefers the OnAirScreen **WebSocket** (HTTP port + 1, so **8011** by default) and falls back to polling `GET /api/status` if the socket is down. OSC is not used.

## Requirements

- Bitfocus Companion **4.3 or 5**
- OnAirScreen running, HTTP reachable (**Settings → Network**, port `8010`)
- Firewall: allow the HTTP port **and** HTTP+1 (WebSocket). If 8011 is blocked, the module keeps polling HTTP.

The module is not in the Companion Store yet. Use a `.tgz` from GitHub **Releases**.

## Install

1. Download `astrastudio-onairscreen-<version>.tgz` from Releases. Do **not** extract it.
2. In Companion open **Modules**.
3. Click **Import module package** and choose the `.tgz`.
4. Open **Connections** → add a connection → search **astrastudio** / **OnAirScreen**.
5. Set **OnAirScreen IP / Hostname** to the studio PC and **HTTP Port** to `8010` (must match OnAirScreen). Leave **Use WebSocket** on unless you must poll only. Leave **Poll interval** at `500` ms (used when WebSocket is off or disconnected).
6. Set the connection **Label** to `oas` so variable examples in this README match (`$(oas:air1_time)`). Companion often defaults the label to the module name.

The connection should show **OK** plus instance name and version (for example `Studio-1 · 0.9.9beta2`). If it stays disconnected, check IP, HTTP port, firewall (8010 and 8011), and that OnAirScreen is running.

To update, import a newer `.tgz` the same way. Existing connections keep their settings.

## Use

### Presets

Under **Buttons → Presets**, pick this connection. There are:

- **LEDs** — LED 1–4 toggle; caption and colour follow OnAirScreen
- **AIR timers** — AIR 1–4 with live caption and time (`m:SS`) on the button (AIR1 = microphone), plus Top-of-Hour and Reset AIR3 / AIR4
- **Texts / Alarms** — NOW / NEXT / WARN display, Clear WARN, Silence alarm

Drag a preset onto a Stream Deck (or other) button. Press to toggle; AIR buttons show the current timer as `m:SS`.

### Button text (variables)

The **Label** of the connection is the variable prefix. If the label is `oas`:

```text
$(oas:air1_time)
```

shows the MIC timer (`125` seconds → `2:05`). Combine with the live caption from OnAirScreen:

```text
$(oas:air1_text)
$(oas:air1_time)
```

Use the variable picker (dollar sign) next to the button text field so the prefix matches your Label.

| Variable                | Meaning                               |
| ----------------------- | ------------------------------------- |
| `air{1-4}_time`         | Timer as `m:SS` (same as OnAirScreen) |
| `air{1-4}_seconds`      | Seconds as a number                   |
| `air{1-4}_status`       | `true` / `false` (running)            |
| `air{1-4}_text`         | Timer caption (Mic, Phone, …)         |
| `led{1-4}_status`       | `true` / `false`                      |
| `led{1-4}_text`         | LED caption                           |
| `led{1-4}_autoflash`    | Autoflash enabled                     |
| `led{1-4}_timedflash`   | Timedflash enabled                    |
| `air3_toth`             | Top-of-hour countdown active          |
| `now` / `next` / `warn` | Text lines                            |
| `silence`               | Silence alarm latched                 |
| `instance` / `version`  | OnAirScreen identity                  |

### Actions and feedbacks

On a button you can add actions such as **LED**, **AIR timer**, **Reset AIR timer**, **AIR3 top-of-hour**, **Set AIR3 time** (`2:05` or raw seconds), **Set text field**, **WARN** (priority 0 / 1 / 2; empty text clears that priority), or **Raw command**.

A failed HTTP command is reported as a failed Companion action. After a successful command the module re-reads `/api/status` immediately so button colour does not wait for the next poll.

Boolean feedbacks colour the button: LED on, LED autoflash, LED timedflash, AIR running, AIR3 TOTH, Silence, WARN not empty.

## License

[MIT](./LICENSE)
