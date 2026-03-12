import { createClient } from "@supabase/supabase-js";

const NOTION_TOKEN = process.env.NOTION_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: unknown;
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

const PAGES_TO_IMPORT = [
  { notion_id: "3134930a-b85f-81dd-add5-c0942f821610", nav_key: "playbook/sales-calls/during-call", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-819c-8a96-e04d2697dfcd", nav_key: "playbook/sales-calls/payment-agreement/klarna-verification-sop", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-8143-9e0b-fca672f11d4c", nav_key: "playbook/sales-calls/payment-agreement/refund-request", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-8134-be5a-df574d8401ee", nav_key: "playbook/onboarding/contract-onboarding", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-81d2-b8b2-e802c47c6763", nav_key: "playbook/admin/the-standard", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-8109-895b-d03b7a3665a3", nav_key: "playbook/daily-weekly-monthly/daily-checklist", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-8141-8783-f985aedc8af1", nav_key: "playbook/daily-weekly-monthly/ghl-lead-follow-up", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-81a7-8ea5-c60165ccde41", nav_key: "playbook/daily-weekly-monthly/eom-reoffer-sop", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-81a2-bcb3-fbbdbe9d5d82", nav_key: "playbook/hr/comp-plan", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-813b-9707-c0bd04f4ed7b", nav_key: "playbook/hr/google-authenticator", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-8163-a36a-c4d0a5f511c1", nav_key: "playbook/training/icp/pattern-recognition", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-8102-a92f-fb4a57ed8eee", nav_key: "playbook/training/icp/ideal-customer-profile", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-81bf-9d19-e84a8e6997b7", nav_key: "playbook/training/icp/handling-competitors", client_slug: "budgetdog" },
  { notion_id: "3134930a-b85f-810b-b685-d15db19e877b", nav_key: "playbook/resources/pricing-calculator", client_slug: "budgetdog" },
  { notion_id: "2e14930a-b85f-80c3-b787-c3603dc58101", nav_key: "playbook/crm/pcn/meeting-transfers", client_slug: "budgetdog" },
];

const LINK_PAGES = [
  { nav_key: "student-success-stories", title: "Student Success Stories", page_type: "link", external_url: "https://docs.google.com/spreadsheets/d/1OmxcQfPWhUSAVPAYiFJNRpNKT8tm5PVJYC_3qeqqOqU/edit" },
  { nav_key: "playbook/sales-calls/payment-agreement/create-and-use-invoice", title: "Create and Use Invoice", page_type: "link", external_url: "https://app.asana.com/1/1204253457493585/project/1206378120012092/task/1207120074290595" },
  { nav_key: "playbook/sales-calls/payment-agreement/bda-refund-sop", title: "BDA Refund SOP", page_type: "link", external_url: "https://app.asana.com/1/1204253457493585/project/1206378120012092/task/1207032863480715" },
  { nav_key: "playbook/sales-calls/payment-agreement/cash-refund-tracker", title: "Cash & Refund Tracker", page_type: "link", external_url: "https://docs.google.com/spreadsheets/d/1XmYFfVRm-uySClXGn6NzN5F5rJBBL-LwzZTkYbTssMk/edit" },
  { nav_key: "playbook/onboarding/cancellation-refund", title: "Millionaire Club & Coaches Circle Cancellation/Refund", page_type: "link", external_url: "https://app.asana.com/1/1204253457493585/project/1207164407196428/task/1208164424943877" },
  { nav_key: "playbook/admin/scorecard", title: "Budgetdog Scorecard", page_type: "link", external_url: "https://docs.google.com/spreadsheets/d/1W5eEtQKgVCzZp9P1ltDZOPALYT3yFoY_/edit" },
  { nav_key: "playbook/internal-comms/sales-team-meetings", title: "Sales Team Meetings", page_type: "link", external_url: "https://docs.google.com/document/d/1wriFZya-_kKmYli2qSZbozGCtyDhrTzyI7re_wj6r1w/edit" },
  { nav_key: "playbook/hr/time-off", title: "Time Off Request", page_type: "link", external_url: "https://form.asana.com/?k=oriyKmK38LrkcfgGSd_z9g&d=1204253457493585" },
  { nav_key: "playbook/hr/team-calendar", title: "Team Event Calendar", page_type: "link", external_url: "https://app.asana.com/1/1204253457493585/project/1206511684133754/calendar/1206511719748408" },
  { nav_key: "playbook/crm/ghl-overview", title: "Overview of GHL Sales Meeting (Mandatory)", page_type: "link", external_url: "https://fathom.video/share/CsiSjzx6RkL4_ZWvagFfnLGKWikbeU9K" },
  { nav_key: "playbook/crm/ghl-training", title: "GHL Sales Rep Training", page_type: "link", external_url: "https://docs.google.com/document/d/1sc_d9Vjf1vKatTLN570ruKait5ZhoTc-wOofyCWQXDs/edit" },
  { nav_key: "playbook/crm/calendars", title: "Calendars", page_type: "link", external_url: "https://www.notion.so/Calendars-2454930ab85f8091a03be0235be3e54a" },
  { nav_key: "playbook/training/icp/low-ticket", title: "Low Ticket (Millionaire Club)", page_type: "link", external_url: "https://budgetdogacademy.com/millionaire-club-step-1" },
  { nav_key: "playbook/training/icp/private-investment-upsell", title: "BDA Private Investment Upsell", page_type: "link", external_url: "https://www.loom.com/share/1b45bf749f5a4067873ed49e91bc607b" },
  { nav_key: "playbook/training/company-info/understanding-academy", title: "Understanding the Budgetdog Academy", page_type: "link", external_url: "https://www.loom.com/share/eb3680fc574349e982093a224082d4bc" },
  { nav_key: "playbook/training/company-info/services", title: "Budgetdog Services", page_type: "link", external_url: "https://drive.google.com/file/d/1nSwALWPyf5D1JxeAIIVYcZ1NhX0OZZge/view" },
  { nav_key: "playbook/training/offer/other-offers", title: "Understanding Other Offers", page_type: "link", external_url: "https://www.loom.com/share/4ab00f639979419682477a3f1faaa811" },
  { nav_key: "playbook/training/offer/ebook", title: "Ebook on Investing", page_type: "link", external_url: "https://drive.google.com/file/d/15Lbpow17MgcCDRz2ixPh2iuHMp29vIXP/view" },
  { nav_key: "playbook/training/sales-training/call-vault", title: "Closer Call Vault", page_type: "link", external_url: "https://docs.google.com/document/d/1j8w3ZDz_RY6JycdOSlWII4ku-Yi90l5Hl2AZPeX57gI/edit" },
  { nav_key: "playbook/resources/marketing/podcast", title: "Podcast", page_type: "link", external_url: "https://moneyonmymind.libsyn.com/" },
  { nav_key: "playbook/resources/marketing/youtube", title: "YouTube", page_type: "link", external_url: "https://www.youtube.com/c/Budgetdog" },
  { nav_key: "playbook/resources/marketing/one-pager", title: "Private Investment One Pager", page_type: "link", external_url: "https://drive.google.com/file/d/1mUSwPpd87CmvaM6koHF5NtZiizGwXuZf/view" },
  { nav_key: "playbook/resources/marketing/skool-referral", title: "Partner Referral Links (Skool)", page_type: "link", external_url: "https://www.skool.com/budgetdog-academy-8538/classroom/aee4d480" },
  { nav_key: "playbook/resources/marketing/financial-tools", title: "Financial Resource/Tools Links", page_type: "link", external_url: "https://docs.google.com/document/d/1g-Uw3kkti7RzdIHEaT2x6Tcte2vyuV-zDfvgt3nwMSs/edit" },
  { nav_key: "playbook/resources/marketing/financial-quiz", title: "Financial Quiz", page_type: "link", external_url: "https://budgetdog.outgrow.us/financialhealthcheck" },
  { nav_key: "playbook/resources/testimonials/student-wins", title: "Student Wins Sheet", page_type: "link", external_url: "https://docs.google.com/spreadsheets/d/1OmxcQfPWhUSAVPAYiFJNRpNKT8tm5PVJYC_3qeqqOqU/edit" },
  { nav_key: "playbook/resources/testimonials/academy-stats", title: "Budgetdog Academy Stats", page_type: "link", external_url: "https://drive.google.com/file/d/1WjTEZG8niCLesBD8zQOHX42nCk1Io1Wg/view" },
  { nav_key: "playbook/resources/testimonials/success-files", title: "Downloadable Student Success Files", page_type: "link", external_url: "https://drive.google.com/drive/folders/1KdVAQRlYHOCZGnoUAaOcfiVUmQPKEkz9" },
  { nav_key: "playbook/resources/testimonials/youtube", title: "YouTube Testimonials", page_type: "link", external_url: "https://www.youtube.com/playlist?list=PLl-OyTJcaz9Q20hWfCeAUSa75l35H7Hos" },
  { nav_key: "playbook/resources/testimonials/trustpilot", title: "Trustpilot", page_type: "link", external_url: "https://www.trustpilot.com/review/budgetdog.com" },
  { nav_key: "playbook/resources/referral/referral-link", title: "Academy Referral Link", page_type: "link", external_url: "" },
  { nav_key: "payment-links", title: "Payment Links", page_type: "link", external_url: "https://docs.google.com/spreadsheets/d/1TgeYqOWgQDPt4HAzeceBLIoJdbA_CwUX/edit" },
];

const EMBED_PAGES = [
  { nav_key: "playbook/sales-calls/payment-agreement/manually-sending-contracts", title: "Manually Sending Contracts", page_type: "embed", loom_url: "https://www.loom.com/share/9c9422e0ae6e4271828700859331ea9c" },
  { nav_key: "playbook/internal-comms/slack-channels", title: "How to Use Slack Channels", page_type: "embed", loom_url: "https://www.loom.com/share/3ec41baa9d424a909b5d4c6ec6d6858a" },
  { nav_key: "playbook/resources/referral/referral-link", title: "Academy Referral Link", page_type: "embed", loom_url: "https://www.loom.com/share/7c0d85159c1f404cb89c84615864e2ef" },
];

function convertRichText(richTexts: Array<{ type: string; text?: { content: string; link?: { url: string } | null }; annotations?: { bold?: boolean; italic?: boolean; strikethrough?: boolean; underline?: boolean; code?: boolean }; plain_text?: string }>): TipTapNode[] {
  const nodes: TipTapNode[] = [];
  for (const rt of richTexts) {
    if (!rt.text?.content && !rt.plain_text) continue;
    const text = rt.text?.content || rt.plain_text || "";
    const marks: { type: string; attrs?: Record<string, unknown> }[] = [];
    if (rt.annotations?.bold) marks.push({ type: "bold" });
    if (rt.annotations?.italic) marks.push({ type: "italic" });
    if (rt.annotations?.strikethrough) marks.push({ type: "strike" });
    if (rt.annotations?.code) marks.push({ type: "code" });
    if (rt.text?.link?.url) marks.push({ type: "link", attrs: { href: rt.text.link.url } });
    const node: TipTapNode = { type: "text", text };
    if (marks.length > 0) node.marks = marks;
    nodes.push(node);
  }
  return nodes;
}

async function fetchBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
    });
    if (!res.ok) {
      console.error(`Failed to fetch blocks for ${pageId}: ${res.status} ${await res.text()}`);
      break;
    }
    const data = await res.json();
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

async function fetchPageTitle(pageId: string): Promise<string> {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
    },
  });
  if (!res.ok) return "Untitled";
  const data = await res.json();
  const props = data.properties;
  for (const key of Object.keys(props)) {
    if (props[key].type === "title" && props[key].title?.length > 0) {
      return props[key].title.map((t: { plain_text: string }) => t.plain_text).join("");
    }
  }
  return "Untitled";
}

async function convertBlocksToTipTap(blocks: NotionBlock[]): Promise<TipTapNode[]> {
  const nodes: TipTapNode[] = [];
  let currentList: { type: string; items: TipTapNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      nodes.push({
        type: currentList.type === "bulleted" ? "bulletList" : "orderedList",
        content: currentList.items,
      });
      currentList = null;
    }
  };

  for (const block of blocks) {
    const blockData = block[block.type] as Record<string, unknown> | undefined;
    if (!blockData) { flushList(); continue; }

    const richText = (blockData.rich_text as Array<{ type: string; text?: { content: string; link?: { url: string } | null }; annotations?: Record<string, boolean>; plain_text?: string }>) || [];

    switch (block.type) {
      case "paragraph": {
        flushList();
        const content = convertRichText(richText);
        nodes.push({ type: "paragraph", content: content.length > 0 ? content : undefined });
        break;
      }
      case "heading_1":
      case "heading_2":
      case "heading_3": {
        flushList();
        const level = parseInt(block.type.slice(-1));
        const content = convertRichText(richText);
        nodes.push({ type: "heading", attrs: { level }, content: content.length > 0 ? content : undefined });
        break;
      }
      case "bulleted_list_item":
      case "numbered_list_item": {
        const listType = block.type === "bulleted_list_item" ? "bulleted" : "numbered";
        if (!currentList || currentList.type !== listType) {
          flushList();
          currentList = { type: listType, items: [] };
        }
        const content = convertRichText(richText);
        const listItem: TipTapNode = {
          type: "listItem",
          content: [{ type: "paragraph", content: content.length > 0 ? content : undefined }],
        };
        // Handle nested children
        if (block.has_children) {
          const childBlocks = await fetchBlocks(block.id);
          const childNodes = await convertBlocksToTipTap(childBlocks);
          if (childNodes.length > 0) {
            listItem.content!.push(...childNodes);
          }
        }
        currentList.items.push(listItem);
        break;
      }
      case "toggle": {
        flushList();
        // Render toggle as heading + content
        const content = convertRichText(richText);
        nodes.push({ type: "heading", attrs: { level: 3 }, content: content.length > 0 ? content : undefined });
        if (block.has_children) {
          const childBlocks = await fetchBlocks(block.id);
          const childNodes = await convertBlocksToTipTap(childBlocks);
          nodes.push(...childNodes);
        }
        break;
      }
      case "callout": {
        flushList();
        const icon = (blockData.icon as { type?: string; emoji?: string })?.emoji || "";
        const content = convertRichText(richText);
        const text = icon ? [{ type: "text", text: icon + " " } as TipTapNode, ...content] : content;
        nodes.push({ type: "blockquote", content: [{ type: "paragraph", content: text }] });
        break;
      }
      case "quote": {
        flushList();
        const content = convertRichText(richText);
        nodes.push({ type: "blockquote", content: [{ type: "paragraph", content: content.length > 0 ? content : undefined }] });
        break;
      }
      case "divider": {
        flushList();
        nodes.push({ type: "horizontalRule" });
        break;
      }
      case "code": {
        flushList();
        const text = richText.map(r => r.plain_text || r.text?.content || "").join("");
        nodes.push({
          type: "codeBlock",
          attrs: { language: (blockData.language as string) || null },
          content: [{ type: "text", text }],
        });
        break;
      }
      case "image": {
        flushList();
        const imageData = blockData as { type?: string; file?: { url: string }; external?: { url: string } };
        const url = imageData.type === "file" ? imageData.file?.url : imageData.external?.url;
        if (url) {
          nodes.push({ type: "image", attrs: { src: url } });
        }
        break;
      }
      case "video": {
        flushList();
        const videoData = blockData as { type?: string; external?: { url: string } };
        const url = videoData.external?.url;
        if (url) {
          nodes.push({ type: "paragraph", content: [{ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }] });
        }
        break;
      }
      case "bookmark": {
        flushList();
        const bookmarkUrl = (blockData as { url?: string }).url;
        if (bookmarkUrl) {
          nodes.push({ type: "paragraph", content: [{ type: "text", text: bookmarkUrl, marks: [{ type: "link", attrs: { href: bookmarkUrl } }] }] });
        }
        break;
      }
      case "table": {
        flushList();
        // Render table rows as paragraphs (TipTap starter-kit doesn't include tables)
        if (block.has_children) {
          const rows = await fetchBlocks(block.id);
          for (const row of rows) {
            const cells = (row.table_row as { cells?: Array<Array<{ plain_text: string }>> })?.cells || [];
            const text = cells.map(cell => cell.map(t => t.plain_text).join("")).join(" | ");
            if (text) {
              nodes.push({ type: "paragraph", content: [{ type: "text", text }] });
            }
          }
        }
        break;
      }
      default: {
        flushList();
        // Try to extract text from unknown block types
        if (richText.length > 0) {
          const content = convertRichText(richText);
          nodes.push({ type: "paragraph", content });
        }
      }
    }
  }
  flushList();
  return nodes;
}

async function importNotionPages() {
  console.log("Starting Notion import...\n");

  // Import Notion pages
  for (const page of PAGES_TO_IMPORT) {
    console.log(`Importing: ${page.nav_key}...`);
    try {
      const title = await fetchPageTitle(page.notion_id);
      const blocks = await fetchBlocks(page.notion_id);
      const tiptapContent = await convertBlocksToTipTap(blocks);

      const doc: TipTapNode = {
        type: "doc",
        content: tiptapContent.length > 0 ? tiptapContent : [{ type: "paragraph" }],
      };

      const { error } = await supabase
        .from("closer_pages")
        .upsert({
          client_slug: page.client_slug,
          nav_key: page.nav_key,
          title,
          content: doc,
          page_type: "page",
          updated_at: new Date().toISOString(),
        }, { onConflict: "client_slug,nav_key" });

      if (error) {
        console.error(`  Error: ${error.message}`);
      } else {
        console.log(`  Done: "${title}" (${blocks.length} blocks)`);
      }
    } catch (err) {
      console.error(`  Failed: ${err}`);
    }
  }

  // Seed link pages
  console.log("\nSeeding link pages...");
  for (const page of LINK_PAGES) {
    const { error } = await supabase
      .from("closer_pages")
      .upsert({
        client_slug: "budgetdog",
        nav_key: page.nav_key,
        title: page.title,
        page_type: page.page_type,
        external_url: page.external_url,
        content: {},
        updated_at: new Date().toISOString(),
      }, { onConflict: "client_slug,nav_key" });

    if (error) {
      console.error(`  Error seeding ${page.nav_key}: ${error.message}`);
    } else {
      console.log(`  Seeded: ${page.nav_key}`);
    }
  }

  // Seed embed pages
  console.log("\nSeeding embed pages...");
  for (const page of EMBED_PAGES) {
    const { error } = await supabase
      .from("closer_pages")
      .upsert({
        client_slug: "budgetdog",
        nav_key: page.nav_key,
        title: page.title,
        page_type: page.page_type,
        loom_url: page.loom_url,
        content: {},
        updated_at: new Date().toISOString(),
      }, { onConflict: "client_slug,nav_key" });

    if (error) {
      console.error(`  Error seeding ${page.nav_key}: ${error.message}`);
    } else {
      console.log(`  Seeded: ${page.nav_key}`);
    }
  }

  console.log("\nImport complete!");
}

importNotionPages().catch(console.error);
