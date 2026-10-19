const STORAGE_KEY = "pendingFlightPrice";
const TTL_MS = 5 * 60 * 1000;
const memoryCache = new Map();

export function getFlightPriceCacheKey({ Key, token, OutBoundKey, InboundKey }) {
    return `${Key || ""}|${token || ""}|${OutBoundKey || ""}|${InboundKey || ""}`;
}

export function stashFlightPrice(keyParts, data) {
    const key = getFlightPriceCacheKey(keyParts);
    const entry = { key, data, at: Date.now() };
    memoryCache.set(key, entry);
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    } catch {
        // ignore quota / private mode
    }
}

export function peekFlightPrice(keyParts) {
    const expected = getFlightPriceCacheKey(keyParts);
    const mem = memoryCache.get(expected);
    if (mem && Date.now() - (mem.at || 0) < TTL_MS) {
        return mem.data;
    }

    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.key !== expected) return null;
        if (Date.now() - (parsed.at || 0) >= TTL_MS) {
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }
        memoryCache.set(expected, parsed);
        return parsed.data;
    } catch {
        return null;
    }
}

/** Clears after a short delay so React Strict Mode remount can still reuse it. */
export function scheduleClearFlightPrice(keyParts, delayMs = 2500) {
    const expected = getFlightPriceCacheKey(keyParts);
    setTimeout(() => {
        memoryCache.delete(expected);
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.key === expected) sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
    }, delayMs);
}