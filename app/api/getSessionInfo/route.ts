import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/utils/session";

// api route to retrieve session data
export async function GET(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else if (session.expiresAt < new Date()) {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    if (session) {
        return NextResponse.json({ session });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}