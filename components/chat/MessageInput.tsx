"use client"
import Image from "next/image"

import { useState, useRef } from "react"
import {
    Send, Loader2, X, Paperclip,
    FileText, FileSpreadsheet, Film, Music, Image as ImageIcon,
} from "lucide-react"

// ─── Constants (kept in sync with lib/file-server.ts) ────────────────────────
const ACCEPT_ATTR =
    "image/*,video/mp4,video/webm,video/quicktime,audio/*,.pdf,.doc,.docx,.xls,.xlsx"

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100 MB

// ─── Types ────────────────────────────────────────────────────────────────────
type MessageInputProps = {
    onSendMessage: (content: string, media?: File) => Promise<void>
    disabled?: boolean
    isSending?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
}

function isImage(mime: string) { return mime.startsWith("image/") }
function isVideo(mime: string) { return mime.startsWith("video/") }
function isAudio(mime: string) { return mime.startsWith("audio/") }
function isPdf(mime: string) { return mime === "application/pdf" }
function isSpreadsheet(mime: string) {
    return mime.includes("spreadsheet") || mime.includes("excel")
}

function MediaTypeIcon({ mime }: { mime: string }) {
    if (isImage(mime)) return <ImageIcon className="w-5 h-5 shrink-0" />
    if (isVideo(mime)) return <Film className="w-5 h-5 shrink-0" />
    if (isAudio(mime)) return <Music className="w-5 h-5 shrink-0" />
    if (isPdf(mime)) return <FileText className="w-5 h-5 shrink-0 text-red-500" />
    if (isSpreadsheet(mime)) return <FileSpreadsheet className="w-5 h-5 shrink-0 text-green-600" />
    return <FileText className="w-5 h-5 shrink-0 text-blue-500" />
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MessageInput({ onSendMessage, disabled, isSending }: MessageInputProps) {
    const [value, setValue] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!value.trim() && !selectedFile) || disabled || isSending) return

        const currentContent = value
        const currentFile = selectedFile || undefined

        // Reset before async call for snappy UX
        setValue("")
        setSelectedFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }

        await onSendMessage(currentContent, currentFile)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > MAX_FILE_SIZE) {
            alert(`File is too large. Maximum allowed size is ${formatBytes(MAX_FILE_SIZE)}.`)
            return
        }

        setSelectedFile(file)

        // Only generate an object URL for preview-able types
        if (isImage(file.type) || isVideo(file.type)) {
            setPreviewUrl(URL.createObjectURL(file))
        } else {
            setPreviewUrl(null)
        }
    }

    const removeFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setSelectedFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-20"
        >
            <div className="max-w-4xl mx-auto space-y-3">
                {/* ── File Preview ───────────────────────────────────────── */}
                {selectedFile && (
                    <div className="relative inline-flex items-start group">
                        {/* Image / Video thumbnail */}
                        {previewUrl && isImage(selectedFile.type) && (
                            <div className="relative rounded-xl overflow-hidden border bg-muted w-28 h-28 shrink-0">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                        {previewUrl && isVideo(selectedFile.type) && (
                            <div className="relative rounded-xl overflow-hidden border bg-muted w-28 h-28 shrink-0">
                                <video
                                    src={previewUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                                    <Film className="w-6 h-6" />
                                </div>
                            </div>
                        )}

                        {/* Generic file card (PDF / DOCX / XLS / Audio) */}
                        {!previewUrl && (
                            <div className="flex items-center gap-3 bg-muted border rounded-xl px-3 py-2 max-w-xs">
                                <MediaTypeIcon mime={selectedFile.type} />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatBytes(selectedFile.size)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md hover:bg-destructive/90 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── Input Row ──────────────────────────────────────────── */}
                <div className="flex items-end gap-2">
                    {/* Hidden file picker */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={ACCEPT_ATTR}
                        className="hidden"
                    />

                    {/* Attachment trigger */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isSending}
                        title="Attach file (images, videos, PDFs, docs, spreadsheets, audio)"
                        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 shrink-0"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Text area */}
                    <div className="relative flex-1">
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={disabled || isSending}
                            placeholder={selectedFile ? "Add a caption (optional)…" : "Type a message…"}
                            rows={1}
                            style={{ minHeight: "44px", maxHeight: "120px" }}
                            className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none scrollbar-hide"
                        />
                    </div>

                    {/* Send button */}
                    <button
                        type="submit"
                        disabled={(!value.trim() && !selectedFile) || disabled || isSending}
                        className="inline-flex items-center justify-center rounded-full w-11 h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
                    >
                        {isSending
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <Send className="w-5 h-5 ml-0.5" />
                        }
                    </button>
                </div>

                {/* Size hint */}
                <p className="text-[11px] text-muted-foreground/60 leading-none">
                    Images · Videos · PDFs · Word · Excel · Audio &nbsp;·&nbsp; max 100 MB
                </p>
            </div>
        </form>
    )
}
