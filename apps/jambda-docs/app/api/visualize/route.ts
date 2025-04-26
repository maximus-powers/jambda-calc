import { NextRequest, NextResponse } from 'next/server';
import { visualize } from 'jambda-calc';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expression, options = {} } = body;

    console.log('VISUALIZE BODY: ', body);

    if (!expression) {
      return NextResponse.json({ error: 'No lambda expression provided' }, { status: 400 });
    }

    const result = visualize(expression, options);

    console.log('VISUALIZE RESULT TYPE: ', typeof result);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in visualize API:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'An unknown error occurred during visualization',
      },
      { status: 500 }
    );
  }
}
