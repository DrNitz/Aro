// Cloudflare Pages Serverless Edge Function (Free Tier: 100,000 req/day)
// Proxies Open Food Facts search and product requests to prevent browser CORS blocks

const USER_AGENT = "AroHealthApp/1.0 (https://github.com/DrNitz/Aro; contact@arohealth.org)";

export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const pathParts = params.catchall || [];
  const fullPath = pathParts.join('/');

  // If calling off-search
  let targetUrl = '';
  if (fullPath.startsWith('off-search')) {
    const subPath = fullPath.replace(/^off-search\/?/, '');
    targetUrl = `https://search.openfoodfacts.org/${subPath}${url.search}`;
  } else if (fullPath.startsWith('off')) {
    const subPath = fullPath.replace(/^off\/?/, '');
    targetUrl = `https://world.openfoodfacts.org/${subPath}${url.search}`;
  } else {
    targetUrl = `https://search.openfoodfacts.org/search${url.search}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    });

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    newHeaders.set('Cache-Control', 'public, max-age=3600');

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
