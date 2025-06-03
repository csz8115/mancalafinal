import pino from "pino";
import pretty from "pino-pretty";
import fs from "fs";
import { multistream } from "pino";

const prettyStream = pretty({
    colorize: true,
    levelFirst: true,
});

const fileStream = fs.createWriteStream("logs/app.log", { flags: "a" });
export const logger = pino(
    {},
    multistream([
        { stream: prettyStream },      // Console (pretty)
        { stream: fileStream, level: "error" },        // File (errors only)
    ])
);