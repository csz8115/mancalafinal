"use server";
import { prisma } from "@/utils/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function createSession(username: string) {
    const sessionId = crypto.randomBytes(24).toString("hex");
    console.log(sessionId);
    const expiresAt = new Date();
    // retrieve 
    const session = await prisma.session.create({
        data : {
            sessionId: sessionId,
            userId: username,
            expiresAt: expiresAt,
        }
    });
    return session;
}

export async function deleteSession(sessionId: string) {
    return prisma.session.delete({
        where: {
            data : {
                sessionId: sessionId,
            }
        },
    });
}

export async function getSession(sessionId: string) {
    return prisma.session.findUnique({
        where: {
            sessionId: sessionId,
        },
    });
}