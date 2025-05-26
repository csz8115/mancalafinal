import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/utils/session";

// api route for middleware to query database to check if session exists

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else if (session.expiresAt < new Date()) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
    } 
    // check if session exists in database
    const dbSession = await prisma.session.findUnique({
        where: {
            userId: session.userId,
        },
    });

    if (dbSession) {
        return NextResponse.json({ session: dbSession });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}