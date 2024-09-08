const publicVapidKey = "BH6-3vcDUAyaI-JYDuT1jTfn7XL3SfcjMHhuU4PSjwZTdy03yCTI66sWcVTLRo65r5JdIu61IzpxAtmmEewG-i4";

// Check for service worker
if ("serviceWorker" in navigator) {
    send().catch((err) => console.error(err));
}

// Register SW, Register Push, Send Push
async function send() {
    // Register Service Worker
    const register = await navigator.serviceWorker.register("./sw.js", {
        scope: "/",
    });

    await navigator.serviceWorker.ready;

    // Register Push
    await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}