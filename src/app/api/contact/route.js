// The contact form's endpoint. Passes a submission on to the "Contact" form
// in Gravity Forms on the WordPress backend, which stores the entry and sends
// the notification email. The browser posts here rather than to WordPress so
// the request stays on this domain (no CORS) and spam can be dropped first.

const WP_ORIGIN = new URL(
  process.env.WORDPRESS_GRAPHQL_URL || "https://cms.rap.com.my/index.php?graphql"
).origin;

// Forms > Contact in wp-admin. The field IDs are the ones in its form editor.
const FORM_ID = process.env.GRAVITY_FORM_ID || 1;
const FIELDS = { name: 1, company: 2, phone: 3, email: 4, service: 5, location: 6, message: 7 };
const MAX_LENGTH = 5000;

const FAILED = "Sorry, your message could not be sent. Please try again or email us directly.";

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ ok: false, message: FAILED }, { status: 400 });
  }

  // Honeypot: a field people never see. A bot that fills it in is told the
  // message went through and nothing is sent.
  if (data.website) return Response.json({ ok: true });

  const body = {};
  for (const [name, id] of Object.entries(FIELDS)) {
    body[`input_${id}`] = String(data[name] ?? "")
      .trim()
      .slice(0, MAX_LENGTH);
  }

  let res, result;
  try {
    res = await fetch(`${WP_ORIGIN}/wp-json/gf/v2/forms/${FORM_ID}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    result = await res.json();
  } catch {
    return Response.json({ ok: false, message: FAILED }, { status: 502 });
  }

  if (result.is_valid) return Response.json({ ok: true });

  // Gravity Forms answers 400 with a message per field ID when a field fails
  // its validation; anything else is a fault on the server.
  if (res.status === 400 && result.validation_messages) {
    const names = Object.fromEntries(Object.entries(FIELDS).map(([name, id]) => [id, name]));
    const errors = {};
    for (const [id, message] of Object.entries(result.validation_messages)) {
      if (names[id]) errors[names[id]] = message;
    }
    return Response.json(
      { ok: false, message: "Please check the highlighted fields.", errors },
      { status: 400 }
    );
  }
  return Response.json({ ok: false, message: FAILED }, { status: 502 });
}
