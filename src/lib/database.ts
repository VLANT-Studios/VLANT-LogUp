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

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const words = [
    "Haus", "Baum", "Auto", "Katze", "Hund",
    "Blume", "Sonne", "Mond", "Wasser", "Luft",
    "Buch", "Tisch", "Stuhl", "Fenster", "Tor",
    "Strasse", "Schule", "Kind", "Freund", "Familie",
    "Garten", "Vogel", "Fisch", "Berg", "Tal",
    "Wald", "Fluss", "Stadt", "Dorf", "Licht",
    "Stern", "Wolke", "Regen", "Wind", "Feuer",
    "Zug", "Bahn", "Feld", "Blatt", "Kraft",
    "Spiel", "Leben", "Weg", "Ziel", "Traum",
    "VLANT", "Chemnitz", "JKG", "Kepler", "Toni"
]

function generateRandomID() {
    let out = "";
    for (let i = 0; i < 5; i++) {
        out += words[Math.floor(Math.random() * words.length)] + (i < 4 && i >= 0 ? "-" : "")
    }
    return out;
}

export async function addLogEntry(content: string, appVer: string, name: string | undefined) {
    const token = generateRandomID()
    await db.log.create({
        data: {
            app_ver: appVer,
            content,
            created: new Date(),
            name: name,
            token,
        }
    })
    return token;
}
