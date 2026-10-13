---
name: human-writing
description: >-
  Writing standards for outward-facing text such as messages, PR descriptions,
  emails, docs, and review notes. Produces concise prose the user can stand behind
  without AI filler or agent-to-agent language.
---

# Human Writing

Write concise, supported prose that the user can stand behind.

## Core rules

1. **The user must be able to stand behind every sentence.** If a teammate
   asks "what did you mean by this line?", "the AI wrote it" is not an
   acceptable answer. Cut anything the user wouldn't naturally claim or
   couldn't defend. When unsure whether an idea is the user's, ask or drop it.

2. **Shorter is better.** A doc generated long from a short prompt disrespects
   every reader; the cost multiplies per reader. If the content is really just
   the prompt, send the prompt. Never lengthen while editing — polish without
   padding. Every rewrite loses meaning, so prefer the user's own phrasing
   where it exists.

3. **Writing is thinking — don't fake the thinking.** Specs, status updates,
   retros are proof-of-thought. Draft from facts established in the
   conversation (decisions made, code verified), never from generic filler
   that simulates analysis that didn't happen.

4. **No AI voice in human channels.** Audience check first: a human reading
   Slack/email gets human prose; a coding agent reading a GitHub review
   comment may get structured agent instructions — but only when the user
   explicitly set that up, and never mixed into the human-facing channel.

## Slop blacklist (never in outward text)

- Openers: "Great question!", "I hope this finds you well", "Certainly!"
- Filler: "It's worth noting", "In today's fast-paced world", "delve",
  "leverage", "seamless", "robust", "comprehensive", "streamline"
- Hedge-pairs: "not only X but also Y", "It's important to remember that…"
- Structure slop: bullet lists where two sentences work; headers in a
  3-paragraph message; bold-term-colon-explanation lists; emoji sprinkled
  as decoration; "TL;DR" followed by something longer than the original
- Sign-offs the user wouldn't type: "Best regards" in Slack, "🤖 Generated
  with" outside commits/PRs where it's convention
- Meta-narration: "As an AI", "I've gone ahead and", "Let me know if you'd
  like me to…"

## Workflow when drafting for the user

1. Identify audience (human teammate vs agent vs mixed) and channel norms.
2. Draft at the length the user would write — match their register (this
   user: lowercase-casual in Slack, terse, bullets only for real lists).
3. Strip blacklist items; reread as the recipient.
4. Show the draft; the user sends or edits. Don't auto-send outward text
   unless already authorized.
5. Quoting raw AI output is fine if labeled as such ("Claude suggested X —
   worth a look?").

## Editing existing text on request ("humanize this")

Keep all technical substance. Convert agent-speak to first person, cut
length 30–50%, restore the user's phrasing where known, keep links/refs.
