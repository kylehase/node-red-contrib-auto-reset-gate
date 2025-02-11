# node-red-contrib-auto-reset-gate

[![Node-RED](https://img.shields.io/badge/Node--RED-v3.x-red.svg)](https://nodered.org) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A Node-RED node that acts as a controllable gate for message flow, automatically resetting to a default state after a configurable delay.  The gate is toggled by incoming messages that match a specified property and value.

## Installation

Install via the Node-RED palette manager:

1.  Open the Node-RED menu (top-right hamburger icon).
2.  Select "Manage palette".
3.  Go to the "Install" tab.
4.  Search for `@kylehase/node-red-contrib-auto-reset-gate`.
5.  Click "Install".

Alternatively, install from the command line in your Node-RED user directory (typically `~/.node-red`):

```bash
npm install node-red-contrib-auto-reset-gate
```

## Usage

This node acts as a gate that can be either open (passing messages) or closed (blocking messages). The gate's state is controlled by a combination of a configurable default state, a message property, a match value, and a reset delay.

### Input

The node has a single input. Messages arriving at this input are either passed through to the output or blocked, depending on the gate's state.

### Control

The gate's state is toggled when a message arrives that meets the following condition:

*   The value of the configured `Message Property` in the incoming message (`msg.[Message Property]`) is strictly equal (using string comparison) to the configured `Match Value`.

If this condition is met, the gate's state is toggled (from open to closed, or closed to open, based on the `Default State`). After the configured `Delay`, the gate automatically returns to its `Default State`.

If the `Message Property` does not exist in the incoming message, the gate's state will *not* change, and the message will either pass or be blocked based on the current gate state.

### Output

If the gate is open, messages from the input are passed through to the output. If the gate is closed, messages are blocked and *not* sent to the output.

## Configuration

*   **Name:** (Optional) A descriptive name for the node, displayed in the flow editor.

*   **Delay:** (Required) The time, in milliseconds, before the gate automatically resets to its default state after being toggled. Must be a positive number.

*   **Default State:** (Required) Determines the initial and reset state of the gate.
    *   `Closed`: The gate starts closed (blocking messages). A matching message *opens* the gate temporarily.
    *   `Open`: The gate starts open (passing messages). A matching message *closes* the gate temporarily.

*   **Message Property:** (Required) The property of the incoming message (`msg`) to check. Supports nested properties (e.g., `payload.command.activate`). Uses a standard Node-RED `typedInput` restricted to `msg` properties.

*   **Match Value:** (Required) The value that `msg.[Message Property]` must equal (as a string) to trigger the gate.

## Status Indicator

The node displays a status indicator below its icon in the flow editor:

*   **Green dot:** The gate is currently open (passing messages).
*   **Red dot:** The gate is currently closed (blocking messages).
*   **Text:** Displays either "Open" or "Closed" to indicate the current state.

## Example Flows

### Example 1: Temporary Light Switch

This flow demonstrates using the `auto-reset-gate` to create a temporary light switch. A button press turns the light on, and it automatically turns off after 5 seconds.

1.  **Inject Node:** Configure to send a string "on" to the `payload`.
2.  **Auto-Reset Gate Node:**
    *   `Delay`: 5000 (5 seconds)
    *   `Default State`: Closed
    *   `Message Property`: payload
    *   `Match Value`: on
3.  **Change Node:** Set `msg.payload` to true (or whatever your light control node expects for "on").
4.  **Light Control Node:** (e.g., a node that controls a smart bulb).

When the Inject node sends "on", the gate opens, the Change node sets the payload to `true`, and the light turns on. After 5 seconds, the gate closes, blocking any further messages (until another "on" message is received).

### Example 2: Debounced Button

This flow uses the `auto-reset-gate` to debounce a button press, preventing multiple triggers from a single button press.

1.  **Button Node:** (e.g., a physical button input node).
2.  **Auto-Reset Gate Node:**
    *   `Delay`: 200 (200 milliseconds)
    *   `Default State`: Open
    *   `Message Property`: payload
    *   `Match Value`: (whatever your button node sends when pressed, e.g., "pressed")
3.  **Your Processing Logic:** (Whatever you want to do when the button is pressed).

The first button press will pass through. The gate then closes for 200ms, blocking any subsequent "bounces" from the button. After 200ms, the gate opens again, ready for the next *distinct* button press.

### Example 3: Controlling a Motor with Topic

This example uses `msg.topic` to control the gate, allowing different topics to open or close it.

1.  **MQTT In Node:** Subscribe to a topic (e.g., "motor/control").
2. **Auto-Reset Gate Node**:
    *   `Delay`: 10000
    *   `Default State`: Closed
    *   `Message Property`: topic
    *   `Match Value`: motor/control
3.  **Switch Node:**
    *   Route messages based on `msg.payload`:
        *   If `msg.payload` is "start", continue.
        *   Otherwise, stop.
4.  **Change Node:** Set `msg.payload` to whatever your motor control node expects for "start" (e.g., 1).
5.  **Motor Control Node:** (e.g., a node that controls a motor).

Sending a message with `topic: "motor/control"` and `payload: "start"` will open the gate for 10 seconds, allowing the motor to start. The Switch node prevents messages with different payloads from reaching the motor control node. Sending other messages on the same topic will *not* re-trigger the gate while it's already open (or closed, depending on `Default State`).

## License

This node is licensed under the MIT License. See the `LICENSE` file (if included) or the `package.json` for details.