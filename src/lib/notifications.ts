import { NTFY_TOKEN, NTFY_URL } from "$env/static/private";

const delay = (ms: number) => {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve()
        }, ms)
    });
}
const retryFetch = (url: string, fetchOptions = {}, retries = 3, retryDelay = 1000, timeout?: number) => {
    return new Promise<Response>((resolve, reject) => {
        // check for timeout
        if (timeout) {
            setTimeout(() => {
                reject('error: timeout') // reject if over time
            }, timeout);
        }

        // console.log(`${url} ${JSON.stringify(fetchOptions)} ${retries} ${retryDelay}`)

        const wrapper = (n: number) => {
            // console.log(n)
            fetch(url, fetchOptions)
                .then(res => { resolve(res) })
                .catch(async err => {
                    if (n > 0) {
                        // console.log(`retrying ${n}`)
                        await delay(retryDelay);
                        wrapper(--n);
                    } else {
                        reject(err);
                    }
                });
        }

        wrapper(retries);
    });
}

export async function sendNtfyNotification(content: string, { title, tags, priority = "default", contentTitle }: { title?: string, tags?: string[], priority?: "max" | "high" | "default" | "low" | "min", contentTitle?: string }) {
    if (!NTFY_URL.startsWith("http")) return
    return retryFetch(NTFY_URL, {
        method: "POST",
        body: (contentTitle ? `## ${contentTitle}\n` : "") + content,
        headers: {
            "Title": title ?? "",
            "Tags": tags?.join(",") ?? "",
            "Priority": priority ?? "default",
            "Authorization": "Bearer " + NTFY_TOKEN,
            "X-Markdown": true,
        },
        // verbose: true,
    }, 10, 1000).catch(console.error)
}


export function notifyError(message: string, extraTitle?: string) {
    return sendNtfyNotification(
        message,
        {
            // contentTitle: (extraTitle) ? `Fehler: ${extraTitle}` : "Fehler",
            title: `Fehler`,
            priority: "max",
            tags: ["rotating_light"]
        }
    );
}

export function notifyWarn(message: string, extraTitle?: string) {
    return sendNtfyNotification(
        message,
        {
            // contentTitle: (extraTitle) ? `Warnung: ${extraTitle}` : "Warnung",
            title: `Warnung`,
            priority: "high",
            tags: ["warning"]
        }
    );
}

export function notifyInfo(message: string, extraTitle?: string) {
    return sendNtfyNotification(
        message,
        {
            // contentTitle: (extraTitle) ? `Info: ${extraTitle}` : "Info",
            title: `Info`,
            priority: "default",
            tags: ["information_source"]
        }
    );
}

export function notifySuccess(message: string, title?: string) {
    return sendNtfyNotification(
        message,
        {
            // contentTitle: (title) ? `${title}` : "👍",
            title: `Erfolg`,
            priority: "default",
            tags: ["white_check_mark"]
        }
    );
}

export function notifyLowPriority(message: string) {
    return sendNtfyNotification(
        message,
        {
            priority: "low",
        }
    );
}
