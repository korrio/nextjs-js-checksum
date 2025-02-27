// middleware.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache for the integrity map
let integrityMap = null;

// Load integrity map (only once)
function getIntegrityMap() {
    if (integrityMap !== null) {
        return integrityMap;
    }

    try {
        const integrityPath = path.join(process.cwd(), 'public/nextjs-integrity.json');
        const integrityData = fs.readFileSync(integrityPath, 'utf8');
        integrityMap = JSON.parse(integrityData);
    } catch (error) {
        console.warn('Could not load integrity map:', error.message);
        integrityMap = {};
    }

    return integrityMap;
}

// This middleware intercepts HTML responses and adds integrity attributes
export default function middleware(request) {
    const response = NextResponse.next();

    // Only process HTML responses
    const url = request.nextUrl.pathname;
    if (!url.endsWith('.html') && !url.endsWith('/')) {
        return response;
    }

    // Get integrity map
    const integrityMap = getIntegrityMap();

    // Add Content-Security-Policy header with integrity requirements
    const cspDirectives = [];

    // Add script-src directive with integrity hashes
    const scriptHashes = Object.values(integrityMap).join(' ');
    if (scriptHashes) {
        cspDirectives.push(`script-src 'self' ${scriptHashes}`);
    }

    // Set CSP header if we have directives
    if (cspDirectives.length > 0) {
        response.headers.set(
            'Content-Security-Policy',
            cspDirectives.join('; ')
        );
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};