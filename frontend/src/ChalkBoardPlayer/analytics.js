export const trackEvent = typeof process !== "undefined" &&
    process.env?.REACT_APP_GOOGLE_ANALYTICS_ID &&
    typeof window !== "undefined" &&
    window.gtag
    ? (category, name, label, value) => {
        window.gtag("event", name, {
            event_category: category,
            event_label: label,
            value,
        });
    }
    : typeof process !== "undefined" && process.env?.JEST_WORKER_ID
        ? (category, name, label, value) => { }
        : (category, name, label, value) => {
            // Uncomment the next line to track locally
            // console.info("Track Event", category, name, label, value);
        };
