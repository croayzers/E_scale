const { env } = require('../../lib/env');
const { json, methodNotAllowed, serverError } = require('../../lib/http');
const { normalizePlanCode } = require('../../lib/plans');

const PRICE_TO_TIER = {
  [env('ESCALE_STRIPE_PRICE_PRO')]:     'pro',
  [env('ESCALE_STRIPE_PRICE_PREMIUM')]: 'premium'
};

function supabaseHeaders() {
  return {
    apikey: env('ESCALE_SUPABASE_SERVICE_ROLE_KEY'),
    Authorization: `Bearer ${env('ESCALE_SUPABASE_SERVICE_ROLE_KEY')}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
}

async function supabaseRest(path, method, body, query = '') {
  const url = `${env('ESCALE_SUPABASE_URL')}/rest/v1/${path}${query}`;
  const res = await fetch(url, {
    method,
    headers: supabaseHeaders(),
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function verifySignature(rawBody, sigHeader, secret) {
  const crypto = require('crypto');
  const parts = {};
  sigHeader.split(',').forEach(item => {
    const [key, val] = item.split('=');
    parts[key.trim()] = val;
  });
  const timestamp = parts.t;
  const sig = parts.v1;
  const payload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);

  const webhookSecret = env('ESCALE_STRIPE_WEBHOOK_SECRET');
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  if (webhookSecret && sig) {
    try {
      if (!verifySignature(rawBody.toString(), sig, webhookSecret)) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  try {
    switch (event.type) {

      checkout.session.completed

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const tier = PRICE_TO_TIER[priceId] || 'pro';
        const customerId = sub.customer;

        const rows = await supabaseRest('billing_customers', 'GET', null,
          `?select=id,organization_id&stripe_customer_id=eq.${customerId}&limit=1`);
        const billing = Array.isArray(rows) && rows[0] ? rows[0] : null;

        if (billing) {
          await supabaseRest('billing_customers', 'PATCH', {
            stripe_price_id: priceId,
            subscription_status: sub.status,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: sub.cancel_at_period_end || false,
            updated_at: new Date().toISOString()
          }, `?id=eq.${billing.id}`);

          await supabaseRest('organizations', 'PATCH', {
            current_tier_code: tier,
            updated_at: new Date().toISOString()
          }, `?id=eq.${billing.organization_id}`);
        }
        console.log(`[webhook] subscription.updated customer=${customerId} tier=${tier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;

        const rows = await supabaseRest('billing_customers', 'GET', null,
          `?select=id,organization_id&stripe_customer_id=eq.${customerId}&limit=1`);
        const billing = Array.isArray(rows) && rows[0] ? rows[0] : null;

        if (billing) {
          await supabaseRest('billing_customers', 'PATCH', {
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          }, `?id=eq.${billing.id}`);

          await supabaseRest('organizations', 'PATCH', {
            current_tier_code: 'free_lite',
            updated_at: new Date().toISOString()
          }, `?id=eq.${billing.organization_id}`);

          await supabaseRest('audit_events', 'POST', {
            organization_id: billing.organization_id,
            event_type: 'subscription_cancelled',
            event_payload: { stripe_customer_id: customerId }
          });
        }
        console.log(`[webhook] subscription.deleted customer=${customerId} → free_lite`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const rows = await supabaseRest('billing_customers', 'GET', null,
          `?select=id,organization_id&stripe_customer_id=eq.${customerId}&limit=1`);
        const billing = Array.isArray(rows) && rows[0] ? rows[0] : null;

        if (billing) {
          await supabaseRest('billing_customers', 'PATCH', {
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          }, `?id=eq.${billing.id}`);

          await supabaseRest('audit_events', 'POST', {
            organization_id: billing.organization_id,
            event_type: 'payment_failed',
            event_payload: { stripe_customer_id: customerId, invoice_id: invoice.id }
          });
        }
        console.warn(`[webhook] payment_failed customer=${customerId}`);
        break;
      }

      default:
        console.log(`[webhook] Evento ignorado: ${event.type}`);
    }

    return json(res, 200, { received: true });

  } catch (err) {
    return serverError(res, err);
  }
};

module.exports.config = { api: { bodyParser: false } };
