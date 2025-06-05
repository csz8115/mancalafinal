import pino, { multistream } from "pino";
import pretty from "pino-pretty";
import fs from "fs";
import path from "path";

const prettyStream = pretty({
    colorize: true,
    levelFirst: true,
});

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}
const fileStream = fs.createWriteStream(path.join(logDir, "app.log"), { flags: "a" });
export const logger = pino(
    {},
    multistream([
        { stream: prettyStream },      // Console (pretty)
        { stream: fileStream, level: "error" },        // File (errors only)
    ])
);