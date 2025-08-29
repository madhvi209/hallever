class ConsoleManager {
    log(...args: unknown[]) {
        if (["dev", "development", "staging"].includes(process.env.ENV || "")) {
            console.log("[LOG]:", ...args);
        }
    }

    error(...args: unknown[]) {
        if (["dev", "development", "staging"].includes(process.env.ENV || "")) {
            console.error("[ERROR]:", ...args);
        }
    }

    warn(...args: unknown[]) {
        if (["dev", "development", "staging"].includes(process.env.ENV || "")) {
            console.warn("[WARN]:", ...args);
        }
    }
}

const consoleManager = new ConsoleManager();
export default consoleManager;
