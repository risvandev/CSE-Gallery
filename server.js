import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env natively with Node.js
try {
    if (fs.existsSync(path.join(__dirname, '.env'))) {
        process.loadEnvFile(path.join(__dirname, '.env'));
        console.log('✓ Loaded environment variables from .env');
    }
} catch (err) {
    console.warn('Notice: Could not load .env file directly, relying on system environment variables:', err.message);
}

const PORT = process.env.PORT || 5500;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let pathname = parsedUrl.pathname;

    // 1. Dynamic Environment API Endpoint
    if (pathname === '/api/config') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
        const config = {
            url: process.env.SUPABASE_URL || '',
            publishableKey: key,
            anonKey: key, // Backward-compatibility
            storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'class-moments',
            productionDomain: process.env.PRODUCTION_DOMAIN || 'https://gallery.mndo.online'
        };
        res.writeHead(200);
        res.end(JSON.stringify(config));
        return;
    }

    // 2. Clean URLs: redirect direct .html requests to clean paths (e.g. /about.html -> /about)
    if (pathname.endsWith('.html') && pathname !== '/index.html') {
        const cleanPath = pathname.slice(0, -5);
        res.writeHead(301, { 'Location': cleanPath });
        res.end();
        return;
    }

    // Static File Serving (Clean URLs support)
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    } else if (!path.extname(pathname)) {
        if (fs.existsSync(path.join(__dirname, pathname + '.html'))) {
            pathname += '.html';
        }
    }

    const filePath = path.join(__dirname, pathname);

    // Only serve the site itself: never dotfiles (.env, .git), server code or package files
    const BLOCKED = /(^|\/)\.|^\/(server\.js|package(-lock)?\.json|vercel\.json|supabase-schema\.sql|README\.md|node_modules|api)(\/|$)/i;
    if (BLOCKED.test(pathname)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
    }

    // Prevent directory traversal attacks
    if (!filePath.startsWith(__dirname + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const headers = { 'Content-Type': contentType };

        if (pathname.startsWith('/assets/')) {
            headers['Cache-Control'] = 'public, max-age=86400, stale-while-revalidate=604800';
        }

        res.writeHead(200, headers);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  Class Moments Gallery Server Running`);
    console.log(`  Local URL:   http://localhost:${PORT}`);
    console.log(`  Production:  ${process.env.PRODUCTION_DOMAIN || 'https://gallery.mndo.online'}`);
    console.log(`  Environment: .env (Frontend has zero hardcoded keys)`);
    console.log(`======================================================\n`);
});

