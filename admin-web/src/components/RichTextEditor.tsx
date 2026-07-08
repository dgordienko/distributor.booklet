import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BulletListIcon,
  OrderedListIcon,
} from "./icons";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Форматирование ограничено тем, что умеет показать HTML-рендер на
// Android-планшете (util/Html.kt): жирный/курсив/подчёркнутый/зачёркнутый,
// маркированный/нумерованный список, выравнивание абзаца. Без заголовков,
// цитат, кода и ссылок — их некому показывать на стороне планшета.
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        link: false,
      }),
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rich-text">
      <div className="rich-text-toolbar">
        <button
          type="button"
          className={editor.isActive("bold") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>Ж</b>
        </button>
        <button
          type="button"
          className={editor.isActive("italic") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>К</i>
        </button>
        <button
          type="button"
          className={editor.isActive("underline") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>Ч</u>
        </button>
        <button
          type="button"
          className={editor.isActive("strike") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>З</s>
        </button>

        <span className="rich-text-toolbar-divider" />

        <button
          type="button"
          className={editor.isActive("bulletList") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Маркированный список"
        >
          <BulletListIcon />
        </button>
        <button
          type="button"
          className={editor.isActive("orderedList") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Нумерованный список"
        >
          <OrderedListIcon />
        </button>

        <span className="rich-text-toolbar-divider" />

        <button
          type="button"
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          aria-label="По левому краю"
        >
          <AlignLeftIcon />
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          aria-label="По центру"
        >
          <AlignCenterIcon />
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="По правому краю"
        >
          <AlignRightIcon />
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: "justify" }) ? "is-active" : ""}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          aria-label="По ширине"
        >
          <AlignJustifyIcon />
        </button>
      </div>
      <EditorContent editor={editor} className="rich-text-content" />
    </div>
  );
}
