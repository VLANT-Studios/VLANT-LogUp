// VLANT-LogUp: service for uploading logs
// Copyright (c) 2024 Antonio Albert

// This file is part of VLANT-LogUp.

// VLANT-LogUp is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// VLANT-LogUp is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with VLANT-LogUp.  If not, see <http://www.gnu.org/licenses/>.

// Diese Datei ist Teil von VLANT-LogUp.

// VLANT-LogUp ist Freie Software: Sie können es unter den Bedingungen
// der GNU General Public License, wie von der Free Software Foundation,
// Version 3 der Lizenz oder (nach Ihrer Wahl) jeder neueren
// veröffentlichten Version, weiter verteilen und/oder modifizieren.

// VLANT-LogUp wird in der Hoffnung, dass es nützlich sein wird, aber
// OHNE JEDE GEWÄHRLEISTUNG, bereitgestellt; sogar ohne die implizite
// Gewährleistung der MARKTFÄHIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.
// Siehe die GNU General Public License für weitere Details.

// Sie sollten eine Kopie der GNU General Public License zusammen mit
// VLANT-LogUp erhalten haben. Wenn nicht, siehe <https://www.gnu.org/licenses/>.

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
