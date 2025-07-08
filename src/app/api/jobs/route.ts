
import { NextResponse } from 'next/server';
import { getJobs } from '@/services/jobService';

// This forces the route to be dynamic, ensuring it's not cached.
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const jobs = await getJobs();
        return NextResponse.json(jobs);
    } catch (error) {
        console.error("Error in /api/jobs:", error);
        return NextResponse.json(
            { message: "Failed to fetch jobs." },
            { status: 500 }
        );
    }
}
