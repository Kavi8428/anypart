
"use client"

import * as React from "react"
import { ChatShell } from "@/components/chat/ChatShell"
import { getSellerConversations, getSellerConversationMessages, sendSellerMessage, markSellerMessagesRead } from "@/app/actions/chat/seller"
import { editMessage, deleteMessage } from "@/app/actions/chat/messages"

export default function SellerChatsPage() {
  const [conversations, setConversations] = React.useState([])
  const [messages, setMessages] = React.useState([])
  const [selectedConversationId, setSelectedConversationId] = React.useState(null)
  const [isLoadingConversations, setIsLoadingConversations] = React.useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)

  const messagesRef = React.useRef([])

  // Sync ref with state
  React.useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Initial Load
  React.useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const res = await getSellerConversations()
        if (!isMounted) return

        if (res.error) {
          console.error(res.error)
        } else if (res.conversations) {
          const formatted = res.conversations.map((c) => ({
            ...c,
            lastMessageTime: new Date(c.lastMessageTime),
          }))
          setConversations(formatted)
        }
      } catch {
        console.error("Failed to load chats")
      } finally {
        if (isMounted) setIsLoadingConversations(false)
      }
    }

    init()
    return () => { isMounted = false }
  }, [])

  // Load Messages & Poll
  React.useEffect(() => {
    if (!selectedConversationId) return

    let isMounted = true
    let pollInterval

    async function fetchInitialMessages() {
      setIsLoadingMessages(true)
      try {
        const res = await getSellerConversationMessages(selectedConversationId)
        if (!isMounted) return

        if (res.messages) {
          const formatted = res.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))

          setMessages(formatted)
          markSellerMessagesRead(selectedConversationId)
        }
      } catch {
        console.error("Failed to load messages")
      } finally {
        if (isMounted) setIsLoadingMessages(false)
      }
    }

    fetchInitialMessages()

    // Polling logic
    pollInterval = setInterval(async () => {
      if (!isMounted || !selectedConversationId) return
      try {
        const currentMessages = messagesRef.current
        const lastMsgId = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].id : 0

        const response = await fetch(`/api/chat?conversationId=${selectedConversationId}&lastMessageId=${lastMsgId}&role=seller`)

        if (response.ok) {
          const data = await response.json()
          if (data.hasNew && data.messages.length > 0 && isMounted) {
            const newMsgs = data.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp)
            }))

            setMessages(prev => {
              const existingIds = new Set(prev.map(p => p.id))
              const uniqueNew = newMsgs.filter((m) => !existingIds.has(m.id))
              if (uniqueNew.length === 0) return prev
              return [...prev, ...uniqueNew]
            })

            markSellerMessagesRead(selectedConversationId)
          }
        }
      } catch {
        // Silent fail
      }
    }, 4000)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
    }
  }, [selectedConversationId])

  // Handle Send
  const handleSendMessage = async (content, media) => {
    if (!selectedConversationId) return

    setIsSending(true)
    try {
      const res = await sendSellerMessage(selectedConversationId, content, media)

      if (res.message) {
        const newMsg = {
          ...res.message,
          timestamp: new Date(res.message.timestamp)
        }
        setMessages(prev => [...prev, newMsg])

        // Update conversation list preview
        setConversations(prev => prev.map(c =>
          c.id === selectedConversationId
            ? { ...c, lastMessage: content, lastMessageTime: new Date() }
            : c
        ).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()))
      }
    } catch {
      console.error("Failed to send")
    } finally {
      setIsSending(false)
    }
  }

  const handleEditMessage = async (messageId, newContent) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
    ))
    const res = await editMessage(messageId, newContent, "seller")
    if (res.error) console.error("Edit failed:", res.error)
  }

  const handleDeleteMessage = async (messageId) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, content: "", isDeleted: true } : m
    ))
    const res = await deleteMessage(messageId, "seller")
    if (res.error) console.error("Delete failed:", res.error)
  }

  return (
    <ChatShell
      role="seller"
      conversations={conversations}
      isLoadingConversations={isLoadingConversations}
      selectedConversationId={selectedConversationId}
      messages={messages}
      isLoadingMessages={isLoadingMessages}
      onSelectConversation={setSelectedConversationId}
      onSendMessage={handleSendMessage}
      onEditMessage={handleEditMessage}
      onDeleteMessage={handleDeleteMessage}
      isSending={isSending}
    />
  )
}
