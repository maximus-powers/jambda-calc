import { NextRequest, NextResponse } from 'next/server';

import { transpile } from 'jambda-calc';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    console.log('BODY: ', body);

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const result = transpile(code);

    console.log('RESULT???????????', result);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in transpile API:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'An unknown error occurred during transpilation',
      },
      { status: 500 }
    );
  }
}
