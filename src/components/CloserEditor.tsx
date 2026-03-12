"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useState, useCallback, useEffect } from "react";

interface CloserEditorProps {
  content: Record<string, unknown>;
  editable: boolean;
  onSave?: (content: Record<string, unknown>) => void;
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.15)",
    background: active ? "rgba(140,235,76,0.2)" : "rgba(255,255,255,0.06)",
    color: active ? "#8ceb4c" : "#ccc",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  });

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive("bold"))}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive("italic"))}>I</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} style={btnStyle(editor.isActive("strike"))}>S</button>
      <span style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={btnStyle(editor.isActive("heading", { level: 1 }))}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive("heading", { level: 2 }))}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btnStyle(editor.isActive("heading", { level: 3 }))}>H3</button>
      <span style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive("bulletList"))}>List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive("orderedList"))}>1.</button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle(editor.isActive("blockquote"))}>Quote</button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={btnStyle(editor.isActive("codeBlock"))}>Code</button>
      <span style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
      <button onClick={addLink} style={btnStyle(editor.isActive("link"))}>Link</button>
      <button onClick={addImage} style={btnStyle(false)}>Image</button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} style={btnStyle(false)}>---</button>
    </div>
  );
}

export default function CloserEditor({ content, editable, onSave }: CloserEditorProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasContent = content && Object.keys(content).length > 0 && (content as { type?: string }).type === "doc";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: !editing, HTMLAttributes: { style: "color: #8ceb4c; text-decoration: underline;" } }),
      Image,
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content: hasContent ? content : { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "No content yet." }] }] },
    editable: false,
    editorProps: {
      attributes: {
        style: "outline: none; min-height: 200px; color: #fff; font-size: 15px; line-height: 1.7;",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editing);
    }
  }, [editing, editor]);

  const handleSave = useCallback(async () => {
    if (!editor || !onSave) return;
    setSaving(true);
    await onSave(editor.getJSON());
    setSaving(false);
    setEditing(false);
  }, [editor, onSave]);

  return (
    <div>
      {editable && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                background: "rgba(140,235,76,0.15)",
                border: "1px solid rgba(140,235,76,0.3)",
                color: "#8ceb4c",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Edit Page
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  background: "#8ceb4c",
                  border: "none",
                  color: "#050508",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); if (editor && hasContent) editor.commands.setContent(content); }}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#aaa",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
      {editing && <MenuBar editor={editor} />}
      <div
        style={{
          background: editing ? "rgba(255,255,255,0.03)" : "transparent",
          borderRadius: 8,
          padding: editing ? 16 : 0,
          border: editing ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .tiptap { font-size: 15px; line-height: 1.75; color: #d4d4d4; max-width: 760px; }
        .tiptap h1 { font-size: 26px; font-weight: 700; margin: 32px 0 12px; color: #fff; letter-spacing: -0.3px; }
        .tiptap h2 { font-size: 20px; font-weight: 600; margin: 28px 0 10px; color: #fff; letter-spacing: -0.2px; }
        .tiptap h3 { font-size: 16px; font-weight: 600; margin: 22px 0 8px; color: #e0e0e0; text-transform: uppercase; letter-spacing: 0.5px; }
        .tiptap p { margin: 0 0 12px; }
        .tiptap ul { list-style: none; padding-left: 0; margin: 8px 0 16px; }
        .tiptap ul li { padding: 6px 12px 6px 36px; position: relative; margin: 4px 0; border-radius: 6px; background: rgba(255,255,255,0.02); }
        .tiptap ul li::before { content: "→"; position: absolute; left: 12px; color: #8ceb4c; font-weight: 600; }
        .tiptap ol { list-style: none; padding-left: 0; margin: 8px 0 16px; counter-reset: list-counter; }
        .tiptap ol li { counter-increment: list-counter; padding: 8px 12px 8px 44px; position: relative; margin: 4px 0; border-radius: 6px; background: rgba(255,255,255,0.02); border-left: 2px solid rgba(140,235,76,0.2); }
        .tiptap ol li::before { content: counter(list-counter); position: absolute; left: 14px; top: 8px; color: #8ceb4c; font-weight: 700; font-size: 13px; width: 20px; text-align: center; }
        .tiptap blockquote { border-left: 3px solid rgba(140,235,76,0.5); padding: 12px 16px; margin: 16px 0; color: #aaa; background: rgba(140,235,76,0.04); border-radius: 0 8px 8px 0; font-style: italic; }
        .tiptap pre { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 14px 16px; margin: 14px 0; overflow-x: auto; border: 1px solid rgba(255,255,255,0.08); }
        .tiptap code { font-family: monospace; font-size: 13px; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; color: #8ceb4c; }
        .tiptap pre code { background: none; padding: 0; color: #d4d4d4; }
        .tiptap img { max-width: 100%; border-radius: 10px; margin: 16px 0; }
        .tiptap hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0; }
        .tiptap a { color: #8ceb4c; text-decoration: none; border-bottom: 1px solid rgba(140,235,76,0.3); }
        .tiptap a:hover { border-bottom-color: #8ceb4c; }
        .tiptap strong { color: #fff; font-weight: 600; }
      `}</style>
    </div>
  );
}
