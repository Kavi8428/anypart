# 💬 Chat System Implementation Plan — anypart.lk

> **Status**: Planning Only — No code changes made  
> **Date**: 2026-02-20  
> **Scope**: Full chat system between buyers and sellers, scoped to orders, with live sync  

---

## 📌 Overview

The anypart.lk schema already has a strong foundation for chat:

| Model | Purpose |
|---|---|
| `conversations` | One chat thread per `(buyer_id, seller_id, order_id)` |
| `messages` | Individual messages inside a conversation (`sender_type`: 0 = buyer, 1 = seller) |
| `media` | File/image attachments linked to messages |
| `media_types` | Reference table for attachment types |

**No schema changes are required.** The existing design supports everything we need.

---

## 🗂️ File Structure to Create

```
app/
├── actions/
│   └── chat/
│       ├── buyer.ts          ← EXISTS (extend with sendMessage, markRead)
│       └── seller.ts         ← NEW: getSellerConversations, getConversationMessages, sendMessage
│
├── api/
│   └── chat/
│       └── route.ts          ← NEW: Polling endpoint for live message sync
│
components/
└── chat/
    ├── ChatShell.tsx          ← NEW: Main reusable layout shell (sidebar + chat area)
    ├── ConversationList.tsx   ← NEW: Conversation sidebar list
    ├── ConversationItem.tsx   ← NEW: Single conversation row
    ├── MessageList.tsx        ← NEW: Scrollable message thread
    ├── MessageBubble.tsx      ← NEW: Individual message bubble
    ├── MessageInput.tsx       ← NEW: Textarea + send button form
    ├── ChatHeader.tsx         ← NEW: Partner name, order info, back button
    ├── EmptyState.tsx         ← NEW: No conversation selected view
    └── types.ts               ← NEW: Shared TypeScript types for all chat components
```

---

## 🔑 Phase 1: Shared Types (`components/chat/types.ts`)

Define all shared TypeScript interfaces used across components and actions.

```typescript
// components/chat/types.ts

export type SenderRole = "buyer" | "seller"

export type ChatMessage = {
  id: string
  content: string
  senderRole: SenderRole       // "buyer" | "seller"
  isMe: boolean                // Derived from current user's role
  timestamp: Date
  isRead: boolean
  media: ChatMedia[]
}

export type ChatMedia = {
  id: number
  url: string
  type: number
  fileName: string
  fileSize: number
}

export type ChatConversation = {
  id: string
  partnerId: number
  partnerName: string
  partnerAvatar: string | null
  orderId: number
  orderRef: string             // e.g., "Order #42"
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

export type ChatShellProps = {
  role: SenderRole
  conversations: ChatConversation[]
  isLoadingConversations: boolean
  selectedConversationId: string | null
  messages: ChatMessage[]
  isLoadingMessages: boolean
  onSelectConversation: (id: string) => void
  onSendMessage: (content: string) => Promise<void>
  isSending: boolean
}
```

**Key Design Decisions:**
- `isMe` is computed from the current user's role, not stored
- `SenderRole` replaces the confusing `sender_type: 0 | 1` integer
- `orderId` + `orderRef` are included in conversations to show context

---

## 🏗️ Phase 2: Reusable Component Breakdown

### `components/chat/ChatShell.tsx`
**The main layout container.** Accepts `ChatShellProps` and renders the two-panel layout:
- Left: `ConversationList` (responsive, hidden on mobile when chat is open)
- Right: `ChatHeader` + `MessageList` + `MessageInput` OR `EmptyState`

**Props:** Full `ChatShellProps`.  
**State managed internally:** `mobileShowChat` (boolean toggle for responsive layout).

---

### `components/chat/ConversationList.tsx`
**Renders the scrollable list of conversations in the sidebar.**

```tsx
Props: {
  conversations: ChatConversation[]
  selectedId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
}
```

**Features:**
- Search bar input (client-side filter by `partnerName`)
- Loading skeleton state
- Empty state ("No conversations yet")
- Maps over `conversations` → renders `ConversationItem`

---

### `components/chat/ConversationItem.tsx`
**Single row in the conversation list.**

```tsx
Props: {
  conversation: ChatConversation
  isSelected: boolean
  onClick: () => void
}
```

**Shows:** Avatar, partner name, last message preview (truncated), time badge, unread count badge.

---

### `components/chat/ChatHeader.tsx`
**Top bar of the active conversation.**

```tsx
Props: {
  conversation: ChatConversation
  onBack: () => void         // mobile back button
}
```

**Shows:** Back button (mobile only), avatar, partner name, order reference link, online indicator (future).

---

### `components/chat/MessageList.tsx`
**The scrollable message thread area.**

```tsx
Props: {
  messages: ChatMessage[]
  isLoading: boolean
}
```

**Features:**
- Auto-scroll to bottom on new messages (`useEffect` with `ref`)
- Date separator grouping (e.g., "Today", "Yesterday")
- Loading spinner
- Empty state ("Start the conversation!")
- Maps over `messages` → renders `MessageBubble`

---

### `components/chat/MessageBubble.tsx`
**Individual chat bubble.**

```tsx
Props: {
  message: ChatMessage
}
```

**Shows:** Content text, timestamp, read indicator (✓ / ✓✓), media thumbnails if any.  
**Styling:** Right-aligned for `isMe: true`, left-aligned for `isMe: false`.

---

### `components/chat/MessageInput.tsx`
**The bottom compose area.**

```tsx
Props: {
  onSend: (content: string) => Promise<void>
  isSending: boolean
  disabled?: boolean
}
```

**Features:**
- Textarea (multi-line) with Enter to send, Shift+Enter for newline
- Send button with loading state
- Character limit (2000 chars)
- Attach file button (phase 2 / media upload future feature)

---

### `components/chat/EmptyState.tsx`
**Shown when no conversation is selected.**

```tsx
Props: {
  role: SenderRole
}
```

**Shows:** Role-appropriate illustration and text.
- Buyer: "Select a conversation to chat with a seller about your order"
- Seller: "Select a conversation to respond to a buyer enquiry"

---

## ⚙️ Phase 3: Server Actions

### 3a. Extend `app/actions/chat/buyer.ts`

**Add two functions:**

#### `sendBuyerMessage(conversationId: string, content: string)`
```typescript
// Security:
// 1. getBuyerSession() → verify session exists
// 2. Fetch conversation, check conversation.buyer_id === session.buyer_id
// 3. Insert message with sender_type = 0 (buyer), sender_id = session.buyer_id,
//    receiver_id = conversation.seller_id
// 4. Update conversations.updated_at (to bump it to top of list)
// 5. Return { message: formattedMessage }
```

#### `markBuyerMessagesRead(conversationId: string)`
```typescript
// 1. getBuyerSession() → verify
// 2. Check ownership
// 3. Update all messages where sender_type = 1 (seller sent) AND is_read = 0
//    to is_read = 1 for this conversation
// 4. Return { success: true }
```

---

### 3b. Create `app/actions/chat/seller.ts` (NEW)

#### `getSellerConversations()`
```typescript
// 1. getSellerSession() → if null, return { error, notSignedIn: true }
// 2. prisma.conversations.findMany where seller_id = session.seller_id
// 3. Include: buyer_details (id, full_name), messages (last 1, desc), orders (id)
// 4. Transform to ChatConversation[] format
// 5. unreadCount = count of messages where sender_type = 0 AND is_read = 0
```

#### `getSellerConversationMessages(conversationId: string)`
```typescript
// 1. getSellerSession() → verify
// 2. Fetch conversation, check conversation.seller_id === session.seller_id
// 3. prisma.messages.findMany where conversation_id, orderBy created_at asc
// 4. isMe = msg.sender_type === 1 (1 = seller is "me")
// 5. Return { messages: ChatMessage[] }
```

#### `sendSellerMessage(conversationId: string, content: string)`
```typescript
// 1. getSellerSession() → verify
// 2. Fetch conversation, check conversation.seller_id === session.seller_id
// 3. Insert message with sender_type = 1, sender_id = session.seller_id,
//    receiver_id = conversation.buyer_id
// 4. Update conversations.updated_at
// 5. Return { message: formattedMessage }
```

#### `markSellerMessagesRead(conversationId: string)`
```typescript
// 1. getSellerSession() → verify ownership
// 2. Update all messages where sender_type = 0 AND is_read = 0 to is_read = 1
// 3. Return { success: true }
```

---

## 🌐 Phase 4: API Route for Live Sync (Polling)

### `app/api/chat/route.ts` (NEW)

**Strategy: Server-Sent Events (SSE) via Next.js Route Handler** — No WebSockets needed.  
This is the simplest, most reliable approach compatible with Next.js App Router.

#### `GET /api/chat?conversationId=X&lastMessageId=Y&role=buyer|seller`

```typescript
// 1. Authenticate from cookies (getSellerSession or getBuyerSession based on role param)
// 2. Validate ownership of conversationId
// 3. Return new messages since lastMessageId using:
//    prisma.messages.findMany where id > lastMessageId
// 4. Response: NextResponse.json({ messages: ChatMessage[], hasNew: boolean })
```

**Polling approach (client-side):**
- Poll `GET /api/chat?...` every **3 seconds** using `setInterval` inside a `useEffect`
- When `hasNew: true`, append new messages to state (avoid full re-fetch)
- Clear interval on unmount or conversation change

**Why polling, not WebSockets:**
- Next.js App Router does not natively support WebSocket upgrades
- Polling every 3s is sufficient for a chat supporting order inquiries (not high-frequency chat)
- No additional infrastructure (Pusher, Ably, Socket.io) required
- Can be upgraded to SSE or WebSocket later without changing components

---

## 📄 Phase 5: Page Integration

### `app/buyer/chat/page.tsx` (REFACTOR)

**Replace the existing ~334 line monolithic component** with a thin page wrapper:

```tsx
"use client"

// State management stays at page level
// Calls: getBuyerConversations(), getSellerConversationMessages(), sendBuyerMessage()
// Renders: <ChatShell role="buyer" ... />
// Handles polling via useEffect + setInterval calling GET /api/chat
```

**Keep at page level:**
- `isAuthenticated` check + `BuyerSignInDialog` gate
- `conversations` state + loading state
- `messages` state + loading state
- `selectedConversationId` state
- Polling interval ref
- `handleSendMessage` → calls `sendBuyerMessage()` action

---

### `app/seller/(dashboard)/chats/page.jsx` (NEW IMPLEMENTATION)

**Mirrors the buyer page but for seller context:**

```jsx
"use client"
// Calls: getSellerConversations(), getSellerConversationMessages(), sendSellerMessage()
// Uses getSellerSession() (auto-protected by dashboard middleware)
// Renders: <ChatShell role="seller" ... />
// Handles polling via useEffect + setInterval
```

**Difference from buyer page:**  
No auth gate needed (seller dashboard is already protected by middleware).

---

## 🔄 Phase 6: Live Sync — Detailed Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                          │
│                                                             │
│  [useEffect on selectedConversationId]                      │
│   → Load initial messages via Server Action                 │
│   → Start polling interval (3s)                             │
│                                                             │
│  [Polling]                                                  │
│   → GET /api/chat?conversationId=X&lastMessageId=Y&role=Z   │
│   → If hasNew: true → append messages to state              │
│   → Update lastMessageId ref                                │
│                                                             │
│  [Send Message]                                             │
│   → Call Server Action: sendBuyerMessage / sendSellerMessage│
│   → On success: optimistically add message to state         │
│   → Update lastMessageId ref                                │
│                                                             │
│  [Cleanup]                                                  │
│   → clearInterval on unmount or conversation change         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       SERVER SIDE                           │
│                                                             │
│  GET /api/chat                                              │
│   → Authenticate cookie (buyer_session / seller_session)    │
│   → Verify conversation ownership                           │
│   → Query: messages WHERE id > lastMessageId                │
│   → Return: { messages[], hasNew: bool }                    │
│                                                             │
│  Server Actions (send, markRead)                            │
│   → Auth check via getBuyerSession / getSellerSession       │
│   → Ownership check on conversation                         │
│   → DB insert / update                                      │
│   → Return formatted message                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Phase 7: Security Checklist

| Check | Where | Detail |
|---|---|---|
| Auth required | All actions + API route | `getBuyerSession()` / `getSellerSession()` must return non-null |
| Ownership check | Messages load, send, mark-read | `conversation.buyer_id === session.buyer_id` |
| Input sanitization | `sendBuyerMessage`, `sendSellerMessage` | Trim content, max 2000 chars, not empty |
| Role isolation | API route | Only return messages for the authenticated user's role |
| CSRF protection | Server Actions | Already handled by Next.js Server Actions (same-origin POST) |
| Rate limiting | `sendBuyerMessage`, `sendSellerMessage` | Use existing `rateLimit()` from `@/lib/rate-limit` |
| SQL injection | All queries | Prisma ORM handles parameterization |

---

## 📋 Phase 8: Implementation Order (Strict Sequence)

Follow this order to ensure 100% consistency at each step:

```
Step 1:  Create  components/chat/types.ts
Step 2:  Create  components/chat/MessageBubble.tsx
Step 3:  Create  components/chat/MessageList.tsx
Step 4:  Create  components/chat/MessageInput.tsx
Step 5:  Create  components/chat/ConversationItem.tsx
Step 6:  Create  components/chat/ConversationList.tsx
Step 7:  Create  components/chat/ChatHeader.tsx
Step 8:  Create  components/chat/EmptyState.tsx
Step 9:  Create  components/chat/ChatShell.tsx          (wires steps 2-8 together)
Step 10: Extend  app/actions/chat/buyer.ts              (add sendBuyerMessage, markBuyerMessagesRead)
Step 11: Create  app/actions/chat/seller.ts             (all 4 seller actions)
Step 12: Create  app/api/chat/route.ts                  (polling API)
Step 13: Refactor app/buyer/chat/page.tsx               (use ChatShell + new actions)
Step 14: Implement app/seller/(dashboard)/chats/page.jsx (use ChatShell + seller actions)
Step 15: Test full flow: create conversation → send → receive via polling
```

---

## 🎯 Key Consistency Rules

1. **`sender_type` semantics**: Always `0 = buyer`, `1 = seller`. Never change this.
2. **`isMe` computation**: Always computed on the client from the user's role + sender_type. Never stored in DB.
3. **Conversation IDs**: Always strings in the UI (`id.toString()`), always parsed as `parseInt()` before DB queries.
4. **Session access pattern**: Always use `getBuyerSession()` / `getSellerSession()` from `@/lib/auth`. Never read cookies directly in actions.
5. **Error response shape**: All actions return `{ error: string }` on failure and `{ data }` on success.
6. **API route auth**: Reads `role` from query param, then validates with the corresponding session function.
7. **`updated_at` bump**: Always update `conversations.updated_at` after a message is sent, so the list stays sorted.
8. **Unread count**: Always counted server-side as `messages where sender_type != myType AND is_read = 0`.
9. **Polling cleanup**: Always `clearInterval` in `useEffect` cleanup function.
10. **Component prop types**: Always import from `components/chat/types.ts`. Never redefine locally.

---

## 🚀 Future Enhancements (Post-MVP)

| Feature | Notes |
|---|---|
| Media/file upload | Use `media` + `media_types` tables. Add upload to `/api/chat/media` |
| Real-time (SSE) | Replace polling with `ReadableStream` response from `/api/chat/stream` |
| Push notifications | Send SMS via existing QuickSend gateway when new message received |
| Conversation initiation | Allow buyer to start chat from product page (auto-creates conversation + order link) |
| Read receipts UI | Show ✓ (sent) / ✓✓ (read) icons on MessageBubble using `is_read` field |
| Typing indicators | Requires SSE or WebSocket — not needed for MVP |

---

## 📁 Final File Map

```
components/chat/
├── types.ts              — Shared interfaces (ChatMessage, ChatConversation, ChatShellProps)
├── ChatShell.tsx         — Main layout, responsive mobile/desktop split
├── ConversationList.tsx  — Left sidebar with search
├── ConversationItem.tsx  — Single conversation row
├── ChatHeader.tsx        — Top bar with partner info and order reference
├── MessageList.tsx       — Scrollable messages, auto-scroll, date separators
├── MessageBubble.tsx     — Individual bubble (left/right), with time + read status
├── MessageInput.tsx      — Compose textarea + send button
└── EmptyState.tsx        — "Select a conversation" placeholder

app/actions/chat/
├── buyer.ts              — getBuyerConversations, getConversationMessages, sendBuyerMessage, markBuyerMessagesRead
└── seller.ts             — getSellerConversations, getSellerConversationMessages, sendSellerMessage, markSellerMessagesRead

app/api/chat/
└── route.ts              — GET: polling for new messages (auth + ownership + incremental fetch)

app/buyer/chat/
└── page.tsx              — Buyer chat page (ChatShell + buyer actions + polling)

app/seller/(dashboard)/chats/
└── page.jsx              — Seller chat page (ChatShell + seller actions + polling)
```
