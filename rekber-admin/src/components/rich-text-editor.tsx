"use client"

import { useEffect } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Columns,
  Rows,
  Trash2,
  Undo2,
  Redo2,
} from "lucide-react"
import { cn } from "@/lib/utils"

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Masukkan URL tautan", previousUrl || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5 bg-muted/30 rounded-t-md">
      <ToolbarButton title="Tebal" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Miring" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Garis bawah" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        title="Judul Bagian"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Sub-judul"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton title="Daftar bullet" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Daftar angka" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Kutipan" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton title="Rata kiri" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Rata tengah" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Rata kanan" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Rata kanan-kiri" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton title="Tambah tautan" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Hapus tautan" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        title="Sisipkan tabel"
        disabled={editor.isActive("table")}
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton title="Urungkan" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Ulangi" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

function TableToolbar({ editor }: { editor: Editor }) {
  if (!editor.isActive("table")) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5 bg-blue-50">
      <span className="text-xs text-muted-foreground px-1">Tabel:</span>
      <ToolbarButton title="Tambah baris" onClick={() => editor.chain().focus().addRowAfter().run()}>
        <Rows className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Hapus baris" onClick={() => editor.chain().focus().deleteRow().run()}>
        <Rows className="h-4 w-4 text-destructive" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton title="Tambah kolom" onClick={() => editor.chain().focus().addColumnAfter().run()}>
        <Columns className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Hapus kolom" onClick={() => editor.chain().focus().deleteColumn().run()}>
        <Columns className="h-4 w-4 text-destructive" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-1" />
      <ToolbarButton title="Hapus tabel" onClick={() => editor.chain().focus().deleteTable().run()}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </ToolbarButton>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || "Tulis konten di sini..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rte-content focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="border rounded-md bg-background">
      <Toolbar editor={editor} />
      <TableToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
