import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { level, message, data } = body;

    // This outputs directly in your VS Code terminal running `npm run dev`
    const timestamp = new Date().toISOString();
    console.log(`\n================== [VS CODE CLIENT LOG: ${timestamp}] ==================`);
    console.log(`[LEVEL]: ${level?.toUpperCase()}`);
    console.log(`[MESSAGE]: ${message}`);
    if (data !== undefined) {
      console.dir(data, { depth: null, colors: true });
    }
    console.log(`========================================================================\n`);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to log server-side' }, { status: 500 });
  }
}