"use client"
import Image from "next/image"

import clsx from "clsx"
import {
    Check, CheckCheck, FileText, FileSpreadsheet,
    Film, Music, Paperclip, Download, Pencil, Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { ChatMessage, ChatMedia } from "./types"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

// ─── Type guards ──────────────────────────────────────────────────────────────
function isImage(item: ChatMedia) { return item.type === 1 }
function isVideo(item: ChatMedia) { return item.type === 2 }
function isAudio(item: ChatMedia) { return item.type === 4 }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FileIcon({ item }: { item: ChatMedia }) {
    if (item.fileName.endsWith(".pdf"))
        return <FileText className="w-6 h-6 text-red-400 shrink-0" />
    if (item.fileName.match(/\.(xls|xlsx)$/i))
        return <FileSpreadsheet className="w-6 h-6 text-green-500 shrink-0" />
    return <Paperclip className="w-6 h-6 text-sky-400 shrink-0" />
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
}

function MediaItem({ item, isMe }: { item: ChatMedia; isMe: boolean }) {
    const borderCls = isMe ? "border-primary-foreground/20" : "border-border/40"

    if (isImage(item)) {
        return (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden relative min-h-[100px] w-full">
                <Image src={item.url} alt={item.fileName} width={500} height={300} className="w-full h-auto object-contain hover:opacity-90 transition-opacity" unoptimized />
            </a>
        )
    }

    if (isVideo(item)) {
        return (
            <div className={clsx("rounded-xl overflow-hidden border", borderCls)}>
                <video src={item.url} controls className="max-w-full max-h-64 w-full" preload="metadata">
                    Your browser does not support video playback.
                </video>
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs opacity-70">
                    <Film className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.fileName}</span>
                    <span className="shrink-0 ml-auto">{formatBytes(item.fileSize)}</span>
                </div>
            </div>
        )
    }

    if (isAudio(item)) {
        return (
            <div className={clsx("rounded-xl border overflow-hidden", borderCls)}>
                <div className="flex items-center gap-2 px-3 pt-2 pb-1 text-xs opacity-80">
                    <Music className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1">{item.fileName}</span>
                    <span className="shrink-0">{formatBytes(item.fileSize)}</span>
                </div>
                <audio controls src={item.url} className="w-full px-2 pb-2" preload="metadata">
                    Your browser does not support audio playback.
                </audio>
            </div>
        )
    }

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            download={item.fileName}
            className={clsx("flex items-center gap-3 rounded-xl border px-3 py-2.5 hover:bg-white/5 transition-colors", borderCls)}
        >
            <FileIcon item={item} />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate leading-tight">{item.fileName}</p>
                <p className="text-xs opacity-60 mt-0.5">{formatBytes(item.fileSize)}</p>
            </div>
            <Download className="w-4 h-4 opacity-60 shrink-0" />
        </a>
    )
}

// ─── Edit inline input ────────────────────────────────────────────────────────
function EditInput({
    initial,
    onSave,
    onCancel,
}: {
    initial: string
    onSave: (text: string) => void
    onCancel: () => void
}) {
    const [text, setText] = useState(initial)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (text.trim()) onSave(text.trim())
        }
        if (e.key === "Escape") onCancel()
    }

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <textarea
                autoFocus
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-background/30 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2 justify-end text-xs">
                <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                </button>
                <button
                    onClick={() => text.trim() && onSave(text.trim())}
                    disabled={!text.trim()}
                    className="text-primary font-semibold disabled:opacity-50"
                >
                    Save
                </button>
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────
type MessageBubbleProps = {
    message: ChatMessage
    onEdit?: (messageId: string, newContent: string) => Promise<void>
    onDelete?: (messageId: string) => Promise<void>
}

export function MessageBubble({ message, onEdit, onDelete }: MessageBubbleProps) {
    const { content, isMe, timestamp, isRead, isEdited, isDeleted } = message
    const [editing, setEditing] = useState(false)

    const handleSaveEdit = async (newContent: string) => {
        setEditing(false)
        await onEdit?.(message.id, newContent)
    }

    const handleDelete = async () => {
        await onDelete?.(message.id)
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div
                    className={clsx(
                        "flex w-full mb-4",
                        isMe ? "justify-end" : "justify-start",
                    )}
                >
                    <div
                        className={clsx(
                            "max-w-[72%] sm:max-w-[62%] rounded-2xl px-3 py-2 relative shadow-sm",
                            isMe
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-muted text-foreground rounded-tl-sm border border-border/50",
                            isDeleted && "opacity-60",
                        )}
                    >
                        {/* ── Deleted placeholder ───── */}
                        {isDeleted ? (
                            <p className={clsx(
                                "text-sm italic px-1",
                                isMe ? "text-primary-foreground/60" : "text-muted-foreground",
                            )}>
                                🗑 This message was deleted
                            </p>
                        ) : (
                            <>
                                {/* ── Media attachments ─── */}
                                {message.media && message.media.length > 0 && !editing && (
                                    <div className="mb-2 space-y-2">
                                        {message.media.map((item) => (
                                            <MediaItem key={item.id} item={item} isMe={isMe} />
                                        ))}
                                    </div>
                                )}

                                {/* ── Text / Inline edit ─── */}
                                {editing ? (
                                    <EditInput
                                        initial={content}
                                        onSave={handleSaveEdit}
                                        onCancel={() => setEditing(false)}
                                    />
                                ) : (
                                    content && (
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed break-words px-1">
                                            {content}
                                        </p>
                                    )
                                )}

                                {/* ── Edited badge ─────── */}
                                {isEdited && !editing && (
                                    <span className={clsx(
                                        "text-[10px] italic opacity-60 px-1",
                                        isMe ? "text-primary-foreground/70" : "text-muted-foreground/70"
                                    )}>
                                        (edited)
                                    </span>
                                )}
                            </>
                        )}

                        {/* ── Timestamp + read tick ── */}
                        <div
                            className={clsx(
                                "flex items-center gap-1 justify-end mt-1 select-none",
                                isMe ? "text-primary-foreground/70" : "text-muted-foreground/70",
                            )}
                        >
                            <span className="text-[10px] tabular-nums">{format(timestamp, "HH:mm")}</span>
                            {isMe && (
                                <span title={isRead ? "Read" : "Sent"}>
                                    {isRead
                                        ? <CheckCheck className="w-3 h-3" />
                                        : <Check className="w-3 h-3" />
                                    }
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>

            {/* ── Context Menu (only for own messages) ── */}
            {isMe && !isDeleted && (
                <ContextMenuContent className="w-40">
                    <ContextMenuItem
                        className="cursor-pointer gap-2"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            )}
        </ContextMenu>
    )
}
