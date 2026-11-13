// Serverless function for Vercel / Netlify / Cloudflare
// Serves environment configuration to the frontend dynamically

export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    const config = {
        url: process.env.SUPABASE_URL || '',
        publishableKey: key,
        anonKey: key, // Backward-compatibility
        storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'class-moments',
        productionDomain: process.env.PRODUCTION_DOMAIN || 'https://gallery.mndo.online'
    };

    res.status(200).json(config);
}
