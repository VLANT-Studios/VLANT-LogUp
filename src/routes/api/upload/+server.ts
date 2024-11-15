import { RATELIMIT_BYPASS_TOKEN } from '$env/static/private';
import { addLogEntry } from '$lib/database.js';
import { notifyInfo, notifyWarn, sendNtfyNotification } from '$lib/notifications.js';
import { json } from '@sveltejs/kit';

const MAX_USE_PER_HOUR = 5
const OVERALL_USE_PER_HOUR = 10

const RATELIMIT_USAGE = new Map<string, number>()
const LAST_USAGE = new Map<string, Date>()
let RECENT_UPLOADS = 0
let LAST_UPLOAD = new Date(0)

function notSameHour(d1: Date, d2: Date) {
    return d1.getHours() != d2.getHours() && (d1 < d2 || d1 > d2)
}

export async function POST({ request, getClientAddress, url }) {
    const rlbypass = url.searchParams.get("rlbypass") == RATELIMIT_BYPASS_TOKEN;
    const iphash = Bun.hash(getClientAddress()).toString(16)
    if (!rlbypass) {
        if (notSameHour(LAST_USAGE.get(iphash) ?? new Date(0), new Date())) RATELIMIT_USAGE.set(iphash, 0)
        if (notSameHour(LAST_UPLOAD, new Date())) RECENT_UPLOADS = 0
        if ((RATELIMIT_USAGE.get(iphash) ?? 0) >= MAX_USE_PER_HOUR || RECENT_UPLOADS >= OVERALL_USE_PER_HOUR) {
            notifyWarn(`${iphash} hit the ratelimit!`);
            return json({ error: 429, status: "ratelimited", until: "end of hour" }, { status: 429 })
        }
    }

    let data;
    let token;
    try {
        data = await request.json();
    } catch {}
    if (data && typeof data == "object") {
        if (!data["content"] || !data["app_ver"]) return json({ error: 400, status: "data missing" }, { status: 400 });

        try {
            token = await addLogEntry(data["content"], data["app_ver"], data["name"]);
            sendNtfyNotification(`New log upload: ${data["content"].length} chars, from version ${data["app_ver"]}, name: ${data["name"]} -> token \`${token}\``, {})
        } catch (e) {
            console.error("error with log save: " + e)
        }
    }

    if (token) {
        if (!rlbypass) {
            RATELIMIT_USAGE.set(iphash, (RATELIMIT_USAGE.get(iphash) ?? 0) + 1)
            LAST_USAGE.set(iphash, new Date())
            RECENT_UPLOADS += 1
            LAST_UPLOAD = new Date()
        }
        return json({ success: true, token, rl_remaining: MAX_USE_PER_HOUR - (RATELIMIT_USAGE.get(iphash) ?? 0) });
    } else {
        return json({ success: false }, { status: 500 });
    }
}
