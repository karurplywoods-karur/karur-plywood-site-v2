#!/usr/bin/env npx ts-node
/**
 * scripts/generate-blog.ts
 *
 * Standalone blog generation script — runs in GitHub Actions (or locally).
 * No Vercel. No timeout. No Pro plan needed.
 *
 * Usage:
 *   npx ts-node scripts/generate-blog.ts           ← generates 1 post
 *   npx ts-node scripts/generate-blog.ts --count=5 ← generates up to 5 posts
 *   npx ts-node scripts/generate-blog.ts --dry-run ← validates setup only
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// ── Config from environment ──────────────────────────────────
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

// ── Parse CLI args ───────────────────────────────────────────
const args       = process.argv.slice(2);
const countArg   = args.find(a => a.startsWith('--count='));
const COUNT      = countArg ? Math.min(parseInt(countArg.split('=')[1]), 20) : 1;
const DRY_RUN    = args.includes('--dry-run');

// ── Validate env vars before doing anything ──────────────────
function validateEnv() {
  const missing: string[] = [];
  if (!SUPABASE_URL)      missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_KEY)      missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('   Set them in GitHub → Settings → Secrets and variables → Actions');
    process.exit(1);
  }
}

// ── Clients ──────────────────────────────────────────────────
function getClients() {
  const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const ai = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  return { db, ai };
}

// ── Types ────────────────────────────────────────────────────
interface SeoKeyword {
  id:      string;
  keyword: string;
  cluster: string | null;
  priority: number;
}

interface FaqItem {
  question: string;
  answer:   string;
}

interface GeneratedContent {
  seo_title:        string;
  slug:             string;
  meta_title:       string;
  meta_description: string;
  content:          string;
  faq_section:      FaqItem[];
  suggested_links:  Array<{ anchor_text: string; url: string; context: string }>;
}

interface LinkMapping {
  phrase:      string;
  url:         string;
  description: string | null;
  active:      boolean;
}

// ── Slug generator ───────────────────────────────────────────
function makeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 75);
}

// ── Word count ───────────────────────────────────────────────
function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

// ── Prompt builder ───────────────────────────────────────────
function buildPrompt(keyword: string, links: LinkMapping[]): string {
  // Sanitize keyword — prevent prompt injection
  const safe = keyword.replace(/["\\<>\n\r]/g, '').trim().slice(0, 200);

  const linkBlock = links.length > 0
    ? `\n<internal_links>\nInsert these links ONCE each into body text only (not headings):\n${
        links.map(l => `  "${l.phrase}" → ${l.url}`).join('\n')
      }\n</internal_links>`
    : '';

  return `You are an expert SEO content writer for an Indian plywood and hardware dealer.

<task>Write a complete, well-researched SEO blog post targeting the keyword below.</task>
<keyword>${safe}</keyword>
<business>Karur Plywood & Company — plywood, laminates, doors, hardware dealer in Karur, Tamil Nadu, India</business>${linkBlock}

Return ONLY a raw JSON object — no markdown fences, no preamble, no explanation.

JSON structure:
{
  "seo_title":        "<H1 title, includes keyword, 50-65 chars>",
  "slug":             "<url slug, hyphenated, max 70 chars>",
  "meta_title":       "<meta title, 50-60 chars, includes keyword>",
  "meta_description": "<meta description, 150-160 chars, includes keyword, ends with CTA>",
  "content":          "<full HTML blog, 1800-2500 words, uses h2/h3/p/ul/li/strong/a tags, keyword appears 8-12 times, no inline styles, no script tags>",
  "faq_section": [
    {"question": "<question?>", "answer": "<2-4 sentence answer>"},
    {"question": "<question?>", "answer": "<2-4 sentence answer>"},
    {"question": "<question?>", "answer": "<2-4 sentence answer>"},
    {"question": "<question?>", "answer": "<2-4 sentence answer>"},
    {"question": "<question?>", "answer": "<2-4 sentence answer>"}
  ],
  "suggested_links": [
    {"anchor_text": "<exact phrase>", "url": "<url>", "context": "<one sentence>"}
  ]
}

Content rules:
- Write for Indian readers — mention Tamil Nadu, local context where relevant
- Include 4-6 H2 sections with H3 sub-sections
- Add FAQ as <section class="faq"><h2>Frequently Asked Questions</h2>...</section> at end of content
- Use INR prices where relevant (₹)
- End with a WhatsApp CTA paragraph encouraging readers to contact on WhatsApp`;
}

// ── JSON extractor — robust to preamble/fences ───────────────
function extractJson(raw: string): string {
  const start = raw.indexOf('{');
  const end   = raw.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new Error(`No JSON object found. Response preview: ${raw.slice(0, 300)}`);
  }
  return raw.slice(start, end + 1);
}

// ── DOM-safe internal link injector ─────────────────────────
function injectLinks(html: string, mappings: LinkMapping[]): string {
  const active = mappings.filter(m => m.active);
  if (active.length === 0) return html;

  // Split on HTML tags — only modify text nodes (even indices)
  const parts = html.split(/(<[^>]+>)/);
  const injected = new Set<string>();
  let insideAnchor = false;

  return parts.map((part, idx) => {
    // Odd = tag
    if (idx % 2 === 1) {
      if (/^<a[\s>]/i.test(part))  insideAnchor = true;
      if (/^<\/a>/i.test(part))    insideAnchor = false;
      return part;
    }
    // Even = text node
    if (!part.trim() || insideAnchor) return part;

    let text = part;
    for (const m of active) {
      if (injected.has(m.phrase)) continue;
      const safeUrl = m.url.startsWith('/') || m.url.startsWith('https://') ? m.url : null;
      if (!safeUrl) continue;

      const escaped = m.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const replaced = text.replace(new RegExp(`\\b(${escaped})\\b`, 'i'), (_, cap) => {
        injected.add(m.phrase);
        const title = (m.description ?? m.phrase).replace(/"/g, '&quot;');
        return `<a href="${safeUrl}" title="${title}" rel="noopener">${cap}</a>`;
      });
      text = replaced;
    }
    return text;
  }).join('');
}

// ── Basic HTML sanitizer (no DOMPurify needed in Node) ───────
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
}

// ── FAQ schema builder ────────────────────────────────────────
function buildFaqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name:    f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

// ── Ensure slug is unique ─────────────────────────────────────
async function uniqueSlug(db: ReturnType<typeof createClient>, base: string): Promise<string> {
  let slug    = base;
  let counter = 1;
  while (true) {
    const { data } = await db
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${counter++}`;
    if (counter > 50) throw new Error('Cannot find unique slug after 50 tries');
  }
}

// ── Main generation function ──────────────────────────────────
async function generateOne(
  db:       ReturnType<typeof createClient>,
  ai:       Anthropic,
  links:    LinkMapping[]
): Promise<{ success: boolean; keyword?: string; slug?: string; error?: string }> {

  // 1. Atomically claim next pending keyword
  const { data: keyword, error: claimErr } = await db
    .rpc('claim_next_pending_keyword') as { data: SeoKeyword | null; error: any };

  if (claimErr) return { success: false, error: `Claim failed: ${claimErr.message}` };
  if (!keyword)  return { success: false, error: 'No pending keywords found' };

  console.log(`\n📝 Generating: "${keyword.keyword}" (priority ${keyword.priority})`);

  // Log start
  await db.from('blog_generation_logs').insert({
    keyword_id:   keyword.id,
    keyword_text: keyword.keyword,
    status:       'started',
  });

  const startTime = Date.now();

  try {
    // 2. Call Claude API — no timeout issue here (local/GH Actions process)
    const prompt = buildPrompt(keyword.keyword, links);
    console.log('   🤖 Calling Claude API…');

    const message = await ai.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 16384,
      messages:   [{ role: 'user', content: prompt }],
    });

    if (message.stop_reason === 'max_tokens') {
      throw new Error('Response truncated — max_tokens reached. Try a shorter prompt.');
    }

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    // 3. Extract and parse JSON
    const jsonText = extractJson(rawText);
    let parsed: GeneratedContent;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      throw new Error(`JSON parse failed: ${(e as Error).message}`);
    }

    // 4. Validate
    if (!parsed.seo_title?.trim())        throw new Error('Missing seo_title');
    if (!parsed.content?.trim())          throw new Error('Missing content');
    if (!parsed.meta_description?.trim()) throw new Error('Missing meta_description');

    const wc = wordCount(parsed.content);
    if (wc < 1200) throw new Error(`Content too short: ${wc} words (min 1200)`);

    if (!Array.isArray(parsed.faq_section) || parsed.faq_section.length < 3) {
      throw new Error(`Insufficient FAQ items: ${parsed.faq_section?.length ?? 0}`);
    }

    // Filter out weak FAQs
    parsed.faq_section = parsed.faq_section.filter(
      f => f.question?.trim().length > 10 && f.answer?.trim().length > 20
    );

    // Enforce lengths
    parsed.slug             = makeSlug(parsed.slug || parsed.seo_title);
    if (parsed.meta_title.length > 65)       parsed.meta_title = parsed.meta_title.slice(0, 60);
    if (parsed.meta_description.length > 165) parsed.meta_description = parsed.meta_description.slice(0, 160);

    // 5. Sanitize + inject links
    parsed.content = sanitizeHtml(parsed.content);
    if (links.length > 0) {
      parsed.content = injectLinks(parsed.content, links);
    }

    // 6. Build FAQ schema
    const faqSchema = buildFaqSchema(parsed.faq_section);

    // 7. Resolve unique slug
    const slug = await uniqueSlug(db, parsed.slug);

    // 8. Build excerpt from first <p>
    const pMatch = parsed.content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const excerpt = pMatch
      ? pMatch[1].replace(/<[^>]+>/g, '').slice(0, 300)
      : parsed.meta_description;

    const tokensUsed = (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);
    const durationMs = Date.now() - startTime;
    const readTime   = Math.ceil(wc / 200);

    // 9. Insert blog post — matches YOUR existing blog_posts schema
    const { data: post, error: insertErr } = await db
      .from('blog_posts')
      .insert({
        title:                  parsed.seo_title,
        slug,
        excerpt,
        content:                parsed.content,
        cover_image:            '',
        category:               'Buying Guide',        // default category
        tags:                   [keyword.cluster ?? keyword.keyword.split(' ')[0]],
        published:              false,                 // NEVER auto-publish
        author:                 'Karur Plywood Team',
        read_time:              readTime,
        // AI-specific columns (added by migration)
        meta_title:             parsed.meta_title,
        meta_description:       parsed.meta_description,
        faq_schema:             faqSchema,
        suggested_links:        parsed.suggested_links ?? [],
        word_count:             wc,
        reading_time_minutes:   readTime,
        seo_keyword_id:         keyword.id,
      })
      .select('id, slug')
      .single();

    if (insertErr) throw new Error(insertErr.message);

    // 10. Mark keyword completed
    await db
      .from('seo_keywords')
      .update({ status: 'completed', generated_blog_id: post.id })
      .eq('id', keyword.id);

    // 11. Log success
    await db.from('blog_generation_logs').insert({
      keyword_id:   keyword.id,
      keyword_text: keyword.keyword,
      blog_post_id: post.id,
      status:       'success',
      tokens_used:  tokensUsed,
      duration_ms:  durationMs,
    });

    const cost = ((tokensUsed / 1_000_000) * 18).toFixed(4); // ~$3 input + $15 output avg
    console.log(`   ✅ Saved: /blog/${slug}`);
    console.log(`   📊 ${wc} words · ${readTime} min read · ${tokensUsed} tokens · ~$${cost}`);

    return { success: true, keyword: keyword.keyword, slug };

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Mark keyword failed
    await db
      .from('seo_keywords')
      .update({ status: 'failed', error_msg: errorMsg.slice(0, 1000) })
      .eq('id', keyword.id);

    // Log failure
    await db.from('blog_generation_logs').insert({
      keyword_id:   keyword.id,
      keyword_text: keyword.keyword,
      status:       'failed',
      error_msg:    errorMsg.slice(0, 1000),
      duration_ms:  Date.now() - startTime,
    });

    console.error(`   ❌ Failed: ${errorMsg}`);
    return { success: false, keyword: keyword.keyword, error: errorMsg };
  }
}

// ── Entry point ───────────────────────────────────────────────
async function main() {
  console.log('🪵 Karur Plywood — AI Blog Generator');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : `Generate ${COUNT} post(s)`}`);
  console.log(`   Time: ${new Date().toISOString()}\n`);

  validateEnv();

  if (DRY_RUN) {
    console.log('✅ Environment variables OK');
    console.log('✅ Dry run complete — no posts generated');
    process.exit(0);
  }

  const { db, ai } = getClients();

  // Auto-recover any keywords stuck in processing > 15 min
  await db.rpc('reset_stuck_keywords', { timeout_minutes: 15 });

  // Fetch active link mappings once
  const { data: links } = await db
    .from('internal_link_mappings')
    .select('phrase, url, description, active')
    .eq('active', true);

  const linkMappings: LinkMapping[] = links ?? [];
  console.log(`🔗 Loaded ${linkMappings.length} internal link mappings`);

  // Generate posts sequentially
  let succeeded = 0;
  let failed    = 0;

  for (let i = 0; i < COUNT; i++) {
    if (i > 0) {
      // 5s delay between posts — respect API rate limits
      console.log('\n   ⏳ Waiting 5s before next post…');
      await new Promise(r => setTimeout(r, 5000));
    }

    const result = await generateOne(db, ai, linkMappings);

    if (result.success) succeeded++;
    else {
      failed++;
      // If no keywords left, stop early
      if (result.error === 'No pending keywords found') {
        console.log('\n📭 No more pending keywords. Stopping.');
        break;
      }
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log(`📊 Summary: ${succeeded} succeeded · ${failed} failed`);
  console.log('   Review drafts at: https://www.karurplywood.co.in/admin/seo');
  console.log('─'.repeat(50));

  // Exit with error code if all failed (makes GitHub Actions mark the run red)
  if (succeeded === 0 && failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
