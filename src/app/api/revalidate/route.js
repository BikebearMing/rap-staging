import { revalidateTag } from "next/cache";

// Flushes every cached WordPress response. Point a WordPress webhook (or
// curl) at POST /api/revalidate with the secret in an x-revalidate-secret
// header or ?secret= query. REVALIDATE_SECRET must be set in the environment.
export async function POST(request) {
  const secret =
    request.headers.get("x-revalidate-secret") ?? new URL(request.url).searchParams.get("secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag("wordpress", "max");
  return Response.json({ ok: true, revalidated: new Date().toISOString() });
}
