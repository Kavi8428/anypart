# Restricting Contact Details in Product Description — Next.js

> Prevent sellers from entering phone numbers, emails, and addresses in description fields.

---

## 1. Regex Pattern Validation (Core Technique)

This is the most direct approach — detect and block known patterns.

### Sri Lankan Phone Numbers
```js
const sriLankanPhone = /(?:\+94|0094|0)?(?:7[0-9]|1[1-9]|2[1-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|8[1-9]|9[1-9])\d{7}/g;
```
Covers formats like: `0771234567`, `+94771234567`, `0094771234567`

### Email Addresses
```js
const emailPattern = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
```

### Physical Addresses *(common signals)*
```js
const addressPattern = /\b\d{1,4}\s[\w\s]{1,30}(?:road|rd|street|st|lane|ln|avenue|ave|mawatha|place|no\.?)\b/gi;
```

### Sri Lankan Postal Codes
```js
const postalCode = /\b\d{5}\b/g;
```

---

## 2. Real-Time Frontend Validation (Next.js)

```jsx
const forbiddenPatterns = [
  { pattern: /(?:\+94|0094|0)?[7][0-9]\d{7}/g,                          label: 'phone number' },
  { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,     label: 'email address' },
  { pattern: /\b\d{1,4}\s[\w\s]{1,20}(?:road|street|lane|avenue|mawatha|rd|st)\b/gi, label: 'address' },
  { pattern: /\b\d{5}\b/g,                                               label: 'postal code' },
];

const validateDescription = (text) => {
  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(text)) {
      return `Contact details are not allowed (${label} detected).`;
    }
  }
  return null;
};
```

```jsx
<textarea
  value={description}
  onChange={(e) => {
    setDescription(e.target.value);
    setError(validateDescription(e.target.value));
  }}
/>
{error && <p className="text-red-500 text-sm">{error}</p>}
```

---

## 3. Server-Side Validation (Always Required)

Never rely on frontend alone. Validate again in your API route:

```js
// pages/api/product.js  OR  app/api/product/route.js

export async function POST(req) {
  const { description } = await req.json();

  const error = validateDescription(description); // reuse same logic
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  // proceed to save...
}
```

---

## 4. Obfuscation & Bypass Prevention

Sellers may try to bypass regex using tricks like `0-77-123-4567` or `john[at]gmail.com`.
Normalize the text before running pattern checks:

```js
const normalize = (text) =>
  text
    .replace(/[\s\-().]/g, '')     // remove spaces, dashes, dots, brackets
    .replace(/\[at\]/gi, '@')      // catch [at] tricks
    .replace(/\(at\)/gi, '@')      // catch (at) tricks
    .replace(/zero/gi, '0')        // catch word substitutions
    .toLowerCase();

// Run all patterns against normalize(text) as well
const validateDescription = (text) => {
  const normalized = normalize(text);
  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(text) || pattern.test(normalized)) {
      return `Contact details are not allowed (${label} detected).`;
    }
  }
  return null;
};
```

---

## 6. UX Best Practices

- Show a **clear warning** above the field: *"Do not include phone numbers, emails, or addresses."*
- Display **real-time inline error messages** as the seller types — not just on submit.
- On form submit, **highlight** or underline the detected violation in the text if possible.
- Add a **"Why can't I add this?"** tooltip explaining the platform policy.
- Consider a **character counter** to encourage concise, clean descriptions.

---

## Summary Table

| Technique | Layer | Effort | Bypass Resistance |
|---|---|---|---|
| Regex validation | Frontend + Backend | Low | Medium |
| Text normalization | Frontend + Backend | Low | High |
| Real-time inline error | Frontend UX | Low | — |
| Pattern highlighting | Frontend UX | Medium | — |
| AI / PII detection | Backend | High | Very High |
| Rate limiting submissions | Backend | Low | Medium |

---

## Recommended Production Approach

> **Regex + Normalization on both Frontend and Backend** is the minimum standard.
> Add an **AI/PII layer** if abuse is frequent or the platform scales significantly.
