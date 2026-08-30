# Companion module for OnAirScreen

Control [OnAirScreen](https://github.com/saschaludwig/OnAirScreen) from Bitfocus Companion 4: LEDs, AIR timers (including live MIC time), NOW / NEXT / WARN, and button colour from studio status.

The module talks HTTP to OnAirScreen (default port **8010**). OSC is not used.

## Requirements

- Bitfocus Companion 4
- OnAirScreen running, HTTP reachable (**Settings → Network**, port `8010`)

The module is not in the Companion Store yet. Use a `.tgz` from GitHub **Releases**.

## Install

1. Download `astrastudio-onairscreen-<version>.tgz` from Releases. Do **not** extract it.
2. In Companion open **Modules**.
3. Click **Import module package** and choose the `.tgz`.
4. Open **Connections** → add a connection → search **astrastudio** / **OnAirScreen**.
5. Set **OnAirScreen IP / Hostname** to the studio PC and **HTTP Port** to `8010` (must match OnAirScreen). Leave **Poll interval** at `500` ms unless you have a reason to change it.
6. Optionally change the connection **Label** (default is often the module name). That label is the prefix for all variables.

The connection should show **OK**. If it stays disconnected, check IP, HTTP port, firewall, and that OnAirScreen is running.

To update, import a newer `.tgz` the same way. Existing connections keep their settings.

## Use

### Presets

Under **Buttons → Presets**, pick this connection. There are:

- **LEDs** — LED 1–4 toggle; colour follows OnAirScreen
- **AIR timers** — AIR 1–4 with live time on the button (AIR1 = microphone / MIC), plus Top-of-Hour and Reset AIR3 / AIR4

Drag a preset onto a Stream Deck (or other) button. Press to toggle; the button shows the current timer as `m:SS`.

### Button text (variables)

The **Label** of the connection is the variable prefix. If the label is `oas`:

```text
$(oas:air1_time)
```

shows the MIC timer (`125` seconds → `2:05`). Combine with a caption:

```text
MIC
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
| `air3_toth`             | Top-of-hour countdown active          |
| `now` / `next` / `warn` | Text lines                            |
| `silence`               | Silence alarm latched                 |
| `instance` / `version`  | OnAirScreen identity                  |

### Actions and feedbacks

On a button you can add actions such as **LED**, **AIR timer**, **Reset AIR timer**, **AIR3 top-of-hour**, **Set AIR3 time**, **Set text field**, or **Raw command**.

Boolean feedbacks colour the button: LED on, AIR running, AIR3 TOTH, Silence, WARN not empty.

## License

[MIT](./LICENSE)
