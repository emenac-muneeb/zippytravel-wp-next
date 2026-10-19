import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

// Helper function to write logs to console and local file
function logRequest(status, message, details = {}) {
  const timestamp = new Date().toISOString();
  const logString = `[${timestamp}] [${status}] - ${message} | Details: ${JSON.stringify(details)}\n`;

  // 1. Log to console (useful for Vercel, docker, pm2, etc.)
  if (status === 'SUCCESS') {
    console.log(logString.trim());
  } else {
    console.error(logString.trim());
  }

  // 2. Log to a local file (useful for local development/server file logs)
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logFilePath = path.join(logsDir, 'revalidation.log');
    fs.appendFileSync(logFilePath, logString, 'utf8');
  } catch (err) {
    console.error('Failed to write log to local file:', err.message);
  }
}

export async function GET(request) {
  return handleRevalidation(request);
}

export async function POST(request) {
  return handleRevalidation(request);
}

async function handleRevalidation(request) {
  const method = request.method;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { searchParams } = new URL(request.url);

  try {
    // 1. Get the token from query params or headers
    let token = searchParams.get('token') || 
                  searchParams.get('secret') || 
                  request.headers.get('x-revalidate-token');

    // Extract bearer token from Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Parse body for POST requests to extract token, path, and type
    let body = null;
    if (method === 'POST') {
      try {
        body = await request.json();
        if (body) {
          token = token || body.token || body.secret;
        }
      } catch (e) {
        // Request body is empty or not JSON, continue
      }
    }

    // 3. Retrieve the configured secret
    const secret = process.env.NEXT_Premier_REVALIDATE_TOKEN;
    if (!secret) {
      const errorMsg =
        "NEXT_Premier_REVALIDATE_TOKEN environment variable is not defined on the server.";
      logRequest('CONFIG_ERROR', errorMsg, { method, ip });
      return NextResponse.json(
        { revalidated: false, message: `Server Configuration Error: ${errorMsg}` },
        { status: 500 }
      );
    }

    // 4. Validate token
    if (!token || token !== secret) {
      const tokenSnippet = token ? `${token.substring(0, 3)}...` : 'none';
      logRequest('UNAUTHORIZED', 'Invalid or missing token.', { method, ip, tokenProvided: tokenSnippet });
      return NextResponse.json(
        { revalidated: false, message: 'Unauthorized: Invalid or missing token.' },
        { status: 401 }
      );
    }

    // 5. Determine path and type to revalidate
    const path = searchParams.get('path') || body?.path || '/';
    const type = searchParams.get('type') || body?.type || 'layout';

    // 6. Execute revalidation
    revalidatePath(path, type);

    logRequest('SUCCESS', `Successfully revalidated path "${path}" with type "${type}".`, { method, ip, path, type });

    return NextResponse.json({
      revalidated: true,
      message: `Successfully triggered revalidation for path "${path}" with type "${type}".`,
      path,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logRequest('ERROR', `Internal Server Error: ${error.message}`, { method, ip, stack: error.stack });
    return NextResponse.json(
      { 
        revalidated: false, 
        message: 'Internal Server Error during revalidation.', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

