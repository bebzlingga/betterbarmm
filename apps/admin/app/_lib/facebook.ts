/* ============================================================
   The Facebook Page, through Meta's Graph API

   Needs two server-only settings on the admin's Vercel project:
     FACEBOOK_PAGE_ID            the Page's numeric id
     FACEBOOK_PAGE_ACCESS_TOKEN  a long-lived Page token with
                                 pages_manage_posts and pages_read_engagement
   Optional: FACEBOOK_PAGE_NAME, for the preview.

   A scheduled post is handed to Facebook's own scheduler
   (published=false + scheduled_publish_time), so nothing here has to
   wake up later to send it. Facebook accepts times 10 minutes to 75
   days ahead.
   ============================================================ */

const GRAPH = "https://graph.facebook.com/v21.0";

export const facebookConfigured = () => Boolean(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
export const facebookPageName = () => process.env.FACEBOOK_PAGE_NAME || "BetterBARMM";

export type FacebookResult = { id?: string; url?: string; error?: string };

export async function postToFacebook(post: { body: string; link: string | null; imageUrl: string | null; scheduledAt: Date | null }): Promise<FacebookResult> {
  const page = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!page || !token) return { error: "Facebook is not connected: set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN." };

  const form = new URLSearchParams({ access_token: token });
  // A photo post carries its text as the caption; a link rides in the text.
  const text = post.imageUrl && post.link ? `${post.body}\n\n${post.link}` : post.body;
  if (post.imageUrl) {
    form.set("url", post.imageUrl);
    form.set("caption", text);
  } else {
    form.set("message", text);
    if (post.link) form.set("link", post.link);
  }
  if (post.scheduledAt) {
    form.set("published", "false");
    form.set("scheduled_publish_time", String(Math.floor(post.scheduledAt.getTime() / 1000)));
  }

  const res = await fetch(`${GRAPH}/${page}/${post.imageUrl ? "photos" : "feed"}`, { method: "POST", body: form });
  const json = (await res.json().catch(() => ({}))) as { id?: string; post_id?: string; error?: { message?: string } };
  if (!res.ok || json.error) return { error: json.error?.message ?? `Facebook answered ${res.status}.` };
  // A photo returns its photo id and the post id; the post is what to link.
  const id = json.post_id ?? json.id;
  return { id, url: id ? `https://www.facebook.com/${id}` : undefined };
}
