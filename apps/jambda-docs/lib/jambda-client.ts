export async function transpile(code: string): Promise<string> {
  try {
    const response = await fetch('/api/transpile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transpile code');
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error transpiling code:', error);
    throw error;
  }
}

export async function visualize(
  expression: string,
  options: {
    unitSize?: number;
    lineWidth?: number;
    padding?: number;
    backgroundColor?: string;
  }
): Promise<string> {
  try {
    const response = await fetch('/api/visualize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression,
        options,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to visualize expression');
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error visualizing expression:', error);
    throw error;
  }
}

export const jambdaClient = {
  transpile,
  visualize,
};

export default jambdaClient;
