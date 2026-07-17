"use client";

import { useCallback } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  // lucide v1 ตัดไอคอนแบรนด์ (Youtube) ออกแล้ว → ใช้ SquarePlay แทน
  SquarePlay,
  Strikethrough,
  Undo,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(active && "bg-muted text-foreground")}
    >
      {children}
    </Button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("ใส่ลิงก์ (URL)", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // ไม่ได้เลือกข้อความ + ไม่ได้อยู่บนลิงก์เดิม → แทรก URL เป็นข้อความให้เลย
    // (ถ้าปล่อยไป setLink บน selection ว่างจะกลายเป็น stored mark = ไม่มีอะไรขึ้นบนจอ
    //  จนกว่าจะพิมพ์ตัวถัดไป ซึ่งดูเหมือนปุ่มเสีย)
    if (editor.state.selection.empty && !editor.isActive("link")) {
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] })
        .run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("ลิงก์รูปภาพ (URL)");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt("ลิงก์ YouTube");
    if (url) editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1">
      <ToolbarButton label="ตัวหนา" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <Bold />
      </ToolbarButton>
      <ToolbarButton label="ตัวเอียง" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <Italic />
      </ToolbarButton>
      <ToolbarButton label="ขีดฆ่า" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
        <Strikethrough />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

      <ToolbarButton
        label="หัวข้อใหญ่"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 />
      </ToolbarButton>
      <ToolbarButton
        label="หัวข้อย่อย"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

      <ToolbarButton label="รายการแบบจุด" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        <List />
      </ToolbarButton>
      <ToolbarButton label="รายการแบบเลข" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton label="ยกคำพูด" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        <Quote />
      </ToolbarButton>
      <ToolbarButton label="โค้ด" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
        <Code />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

      <ToolbarButton label="ใส่ลิงก์" onClick={setLink} active={editor.isActive("link")}>
        <LinkIcon />
      </ToolbarButton>
      <ToolbarButton
        label="เอาลิงก์ออก"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      >
        <Unlink />
      </ToolbarButton>
      <ToolbarButton label="แทรกรูป" onClick={addImage}>
        <ImageIcon />
      </ToolbarButton>
      <ToolbarButton label="แทรกวิดีโอ YouTube" onClick={addYoutube}>
        <SquarePlay />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

      <ToolbarButton label="ย้อนกลับ" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo />
      </ToolbarButton>
      <ToolbarButton label="ทำซ้ำ" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  ariaInvalid,
}: {
  value: string;
  onChange: (html: string) => void;
  ariaInvalid?: boolean;
}) {
  const editor = useEditor({
    // ⚠️ ต้อง false ใน Next (SSR) ไม่งั้น hydration mismatch
    immediatelyRender: false,
    extensions: [
      // link มากับ StarterKit v3 แล้ว — config ที่นี่ อย่าลง @tiptap/extension-link แยก (จะซ้ำ)
      StarterKit.configure({
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image.configure({ HTMLAttributes: { class: "rounded-md" } }),
      Youtube.configure({ controls: true, nocookie: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-64 max-w-none px-3 py-2 focus:outline-none [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_p]:my-2",
      },
    },
  });

  if (!editor) {
    return <div className="h-72 animate-pulse rounded-lg border border-border bg-muted/30" aria-hidden="true" />;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        ariaInvalid && "border-destructive ring-3 ring-destructive/20",
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
