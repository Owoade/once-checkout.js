"use strict";
let clicked = false;
class Once {
    constructor(payload) {
        this.payload = payload !== null && payload !== void 0 ? payload : {};
    }
    validatePayload() {
        const { amount, successCallback } = this.payload;
        // cases
        const MISSING_PAYLOAD = !("amount" in this.payload)
            ? "amount"
            : (null !== null && null !== void 0 ? null : !("successCallback" in this.payload))
                ? "successCallback"
                : null;
        const TYPE_MISMATCH = !(typeof amount === "number")
            ? "amount"
            : (null !== null && null !== void 0 ? null : !(typeof successCallback === "function"))
                ? "successCallback"
                : null;
        return { missingPayload: MISSING_PAYLOAD, typeMismatch: TYPE_MISMATCH };
    }
    async checkout() {
        if (clicked)
            return;
        clicked = true;
        setTimeout(() => clicked = false, 10000);
        const errors = this.validatePayload();
        //   No errors
        const NO_ERROR = Object.values(errors).every((error) => !Boolean(error));
        if (NO_ERROR) {
            const checkout = await this.getCheckoutLink();
            window.open(checkout.url, "New Window", `width=500,height=700,top=${(screen.height - 700) / 4},left=${(screen.width - 500) / 2}`);
            return;
        }
        Boolean(errors.missingPayload) &&
            console.error(`Payload object must contain '${errors.missingPayload}' property `);
        Boolean(errors.typeMismatch) &&
            console.error(`${errors.typeMismatch} must be of type ${errors.typeMismatch === "amount" ? "number" : "function"}`);
    }
    async getCheckoutLink() {
        const requestConfig = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: this.payload.amount, host: window.location.host }),
        };
        const res = await fetch("https://api.checkoutonce.com/init", requestConfig);
        return await res.json();
    }
    setUpEvents(ref) {
        try {
            const socket = io("https://once-checkout-c1210716449a.herokuapp.com/transaction");
            socket.emit("transaction-init", ref);
            socket.on("transaction-resolved", this.payload.successCallback);
        }
        catch (e) {
            throw new Error("socket-io client cdn script missing, use <script src='https://cdn.socket.io/4.5.3/socket.io.min.js' ></script> preceeding all other scripts ");
        }
    }
}
