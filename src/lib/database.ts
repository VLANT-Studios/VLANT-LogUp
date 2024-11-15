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
