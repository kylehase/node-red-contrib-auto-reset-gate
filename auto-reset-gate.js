module.exports = function (RED) {
    function AutoResetGateNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        let isBlocking = config.defaultClosed;
        let timeout = null;
        let delay = parseInt(config.delay, 10) || 1000;
        let messageProperty = config.property || "payload";  // Use messageProperty
        let matchValue = config.value; // Use matchValue
        function updateStatus() {
            const statusText = isBlocking ? "Closed" : "Open";
            node.status({ fill: isBlocking ? "red" : "green", shape: "dot", text: statusText });
        }
        node.on("input", function (msg, send, done) {
            let checkProperty = messageProperty; // Use messageProperty
            if (checkProperty.startsWith("msg.")) {
                checkProperty = checkProperty.substring(4);
            }
            let messageValue;
            try {
                messageValue = eval("msg." + checkProperty);
            }
            catch (e)
            {
                node.warn("property " + checkProperty + " not found in msg");
                messageValue = undefined;
            }
            if (messageValue !== undefined && String(messageValue) === String(matchValue)) { // Use matchValue
                isBlocking = !config.defaultClosed;
                updateStatus();
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    isBlocking = config.defaultClosed;
                    updateStatus();
                }, delay);
            } else if (!isBlocking) {
                send(msg);
            }
            done();
        });
        node.on("close", function () {
            if (timeout) {
                clearTimeout(timeout);
            }
            node.status({});
        });
        updateStatus();
    }
    RED.nodes.registerType("auto-reset-gate", AutoResetGateNode, {
        defaults: {
            delay: { value: 1000, required: true },
            defaultClosed: { value: false },
            property: {value: "topic"},
            value: {value: "close"},
            name: {value: ""}
        }
    });
};