/**
 * Cloudflare Worker / Edge Function: Payment Webhook Handler
 */

export async function onRequestPost(context) {
  const { request } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const payload = await request.json();
    console.log('[Edge Webhook Received]:', payload.event);

    return new Response(JSON.stringify({
      received: true,
      event: payload.event || 'payment.captured',
      timestamp: Date.now()
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ received: false, error: err.message }), {
      status: 400,
      headers: corsHeaders
    });
  }
}
