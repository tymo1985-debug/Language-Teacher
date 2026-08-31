# Language Teacher — Technical Specification

Version: 1.0  
Status: Baseline specification  
Product type: Progressive Web App (PWA)  
Architecture principle: local-first, multi-language, single-user-first

---

# 1. Product Vision

**Language Teacher** — персональное PWA-приложение для практического изучения иностранных языков.

В отличие от классических языковых сервисов, приложение не строится вокруг прохождения фиксированных уровней, игровых очков или линейной карты уроков.

Главный цикл продукта:

```text
User
  ↓
Language + Goal + Real situation
  ↓
Practice session
  ↓
Listening / Speaking / Pronunciation / Grammar
  ↓
User response
  ↓
Error & skill analysis
  ↓
Personal memory
  ↓
Next adaptive session
```

Основная задача:

> научить человека понимать язык и использовать его в реальной жизни.

---

# 2. Product Principles

1. Multi-language first.
2. Single-user first.
3. Local-first storage.
4. Offline-capable PWA.
5. AI is a service layer, not the application itself.
6. UI must not depend on a specific AI provider.
7. Language content must not be hard-coded into UI.
8. Learning is driven by user needs, mistakes and real-life situations.
9. Recognition and active production are different skills.
10. Progress measures real abilities, not artificial XP.
11. Speech architecture must support multiple providers.
12. Core learning data belongs to the user and must be exportable.

---

# 3. Scope

## MVP v0.1

Required:

- installable PWA;
- responsive mobile/desktop UI;
- one local user profile;
- multiple learning languages;
- language switching;
- onboarding;
- Today screen;
- Session screen;
- Conversation mode;
- Review mode;
- Words / Learning Items;
- Progress;
- Settings;
- IndexedDB;
- local learning history;
- mistake tracking;
- basic SRS;
- AI Teacher abstraction;
- audio playback;
- voice recording;
- offline application shell;
- backup / restore.

Not required in v0.1:

- account system;
- multi-user UI;
- cloud sync;
- advanced phoneme scoring;
- social functions;
- leaderboards;
- paid subscription;
- advertising.

---

# 4. User Model

Base scenario:

```text
one installation = one primary user
```

No visible profile selector is required.

Internally every user-owned object should still support:

```json
{
  "userId": "local-user"
}
```

Reason:

future compatibility with:

- multi-profile;
- family use;
- login;
- synchronization;
- migration to cloud storage.

---

# 5. Multi-language Architecture

A user can have multiple Language Profiles.

Example:

```json
{
  "userId": "local-user",
  "activeLanguageId": "cs",
  "languages": ["cs", "en", "de"]
}
```

Each language has independent:

- progress;
- learning items;
- mistakes;
- SRS queue;
- conversations;
- pronunciation profile;
- sessions;
- personal situations;
- sources;
- language knowledge base.

---

# 6. Recommended Repository Structure

```text
language-teacher/
│
├── index.html
├── manifest.webmanifest
├── sw.js
│
├── src/
│   ├── app/
│   │   ├── app.js
│   │   ├── router.js
│   │   ├── state.js
│   │   └── events.js
│   │
│   ├── ui/
│   │   ├── screens/
│   │   │   ├── onboarding.js
│   │   │   ├── today.js
│   │   │   ├── session.js
│   │   │   ├── conversation.js
│   │   │   ├── review.js
│   │   │   ├── words.js
│   │   │   ├── progress.js
│   │   │   └── settings.js
│   │   │
│   │   ├── components/
│   │   │   ├── app-header.js
│   │   │   ├── bottom-nav.js
│   │   │   ├── button.js
│   │   │   ├── card.js
│   │   │   ├── language-switcher.js
│   │   │   ├── audio-player.js
│   │   │   ├── voice-recorder.js
│   │   │   └── progress-indicator.js
│   │   │
│   │   └── styles/
│   │       ├── tokens.css
│   │       ├── base.css
│   │       ├── layout.css
│   │       ├── components.css
│   │       └── responsive.css
│   │
│   ├── learning/
│   │   ├── session-engine.js
│   │   ├── review-engine.js
│   │   ├── srs-engine.js
│   │   ├── mistake-engine.js
│   │   ├── difficulty-engine.js
│   │   └── progress-engine.js
│   │
│   ├── language/
│   │   ├── language-engine.js
│   │   ├── profile-engine.js
│   │   ├── phrase-engine.js
│   │   ├── source-engine.js
│   │   └── language-pack.js
│   │
│   ├── speech/
│   │   ├── speech-provider.js
│   │   ├── recorder.js
│   │   ├── recognition.js
│   │   ├── synthesis.js
│   │   └── pronunciation.js
│   │
│   ├── ai/
│   │   ├── teacher-engine.js
│   │   ├── context-builder.js
│   │   ├── response-parser.js
│   │   ├── provider.js
│   │   └── prompts/
│   │
│   ├── storage/
│   │   ├── db.js
│   │   ├── schema.js
│   │   ├── migrations.js
│   │   ├── backup.js
│   │   └── restore.js
│   │
│   └── utils/
│
├── languages/
│   └── README.md
│
├── assets/
│   ├── icons/
│   └── sounds/
│
├── docs/
│   ├── PROJECT_ROLE.md
│   ├── TECHNICAL_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   └── ROADMAP.md
│
└── README.md
```

Do not create empty complexity for its own sake. Modules may initially be smaller and can be split as implementation grows.

---

# 7. Core Architecture

Use three main layers:

```text
┌────────────────────┐
│        UI          │
└──────────┬─────────┘
           │
┌──────────▼─────────┐
│  Learning Engine   │
└──────────┬─────────┘
           │
┌──────────▼──────────────┐
│ AI / Speech / Web Layer │
└─────────────────────────┘
```

Rules:

- UI must not call AI provider directly.
- UI must not contain learning logic.
- Session Engine must not depend on UI implementation.
- Teacher Engine must work through a provider abstraction.
- Speech must work through provider abstraction.
- Storage access must be centralized.

---

# 8. Storage Architecture

Primary local database:

**IndexedDB**

Store:

- user;
- settings;
- language profiles;
- learning items;
- mistakes;
- sessions;
- reviews;
- progress;
- personal situations;
- cached generated learning content;
- metadata for audio recordings.

Suggested stores:

```text
users
settings
languageProfiles
learningItems
mistakes
sessions
reviews
progress
situations
sources
audioMeta
```

Use explicit schema versions and migration scripts.

Never make destructive schema changes without migration logic.

---

# 9. Core Data Models

## User

```json
{
  "id": "local-user",
  "displayName": "",
  "interfaceLanguage": "ru",
  "activeLanguageId": "cs",
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

---

## LanguageProfile

```json
{
  "id": "local-user:cs",
  "userId": "local-user",
  "languageId": "cs",
  "name": "Čeština",
  "status": "active",
  "goals": [
    "everyday-life",
    "living-in-country"
  ],
  "skills": {
    "speaking": 0.32,
    "listening": 0.25,
    "pronunciation": 0.36,
    "grammar": 0.41,
    "vocabulary": 0.38
  },
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

Do not store only one global `level`.

---

## LearningItem

```json
{
  "id": "uuid",
  "userId": "local-user",
  "languageId": "cs",
  "type": "chunk",
  "text": "Dám si jednu kávu, prosím.",
  "meaning": "Я возьму один кофе, пожалуйста.",
  "register": "neutral",
  "contexts": ["cafe", "restaurant"],
  "tags": [],
  "skills": ["speaking", "listening"],
  "memory": {
    "recognition": 0.90,
    "production": 0.45,
    "listening": 0.62,
    "pronunciation": 0.71
  },
  "introducedAt": "ISO_DATE",
  "lastSeenAt": "ISO_DATE",
  "nextReviewAt": "ISO_DATE"
}
```

Learning item types may include:

```text
word
chunk
phrase
grammar-pattern
pronunciation-item
listening-item
situation-expression
```

---

## Mistake

```json
{
  "id": "uuid",
  "userId": "local-user",
  "languageId": "cs",
  "original": "jedno káva",
  "correct": "jednu kávu",
  "category": "grammar",
  "pattern": "accusative-feminine",
  "severity": "medium",
  "count": 3,
  "firstSeenAt": "ISO_DATE",
  "lastSeenAt": "ISO_DATE",
  "status": "active"
}
```

---

## Session

```json
{
  "id": "uuid",
  "userId": "local-user",
  "languageId": "cs",
  "topic": "Ordering coffee",
  "targetDuration": 12,
  "status": "planned",
  "blocks": [],
  "createdAt": "ISO_DATE",
  "completedAt": null
}
```

---

## PersonalSituation

```json
{
  "id": "uuid",
  "userId": "local-user",
  "languageId": "cs",
  "title": "Talk to landlord",
  "description": "Explain that water is leaking under the sink.",
  "status": "active",
  "createdAt": "ISO_DATE"
}
```

---

# 10. Session Engine

Session Engine creates adaptive practice sessions.

Inputs:

```text
LanguageProfile
Recent mistakes
Weak learning items
SRS queue
Recent sessions
User goals
Personal situations
Difficulty state
```

Recommended content balance:

```text
~70% current goal/context
~20% scheduled review
~10% older surprise recall
```

This ratio is guidance, not a hard-coded permanent rule.

Session Engine should avoid:

- too many new words;
- repeated identical exercise formats;
- unrelated grammar dumps;
- excessive translation tasks.

---

# 11. Training Block Types

Initial supported block types:

```text
CONTEXT
LISTEN
UNDERSTAND
PHRASE
NOTICE
REPEAT
SPEAK
RESPOND
GRAMMAR
ROLEPLAY
CORRECTION
RECALL
```

Each block must be represented as structured data.

Example:

```json
{
  "type": "SPEAK",
  "prompt": "Ask for one coffee politely.",
  "expectedIntent": "order-coffee",
  "hints": [
    "Dám si...",
    "Chtěl bych..."
  ]
}
```

Do not store UI markup inside learning block data.

---

# 12. Teacher Engine

Teacher Engine is the central AI orchestration layer.

Flow:

```text
Session Engine
     ↓
Context Builder
     ↓
Teacher Engine
     ↓
AI Provider
     ↓
Structured response
     ↓
Response Parser / Validation
     ↓
Learning Engine
     ↓
UI
```

Teacher Engine context may include:

- target language;
- interface language;
- user goals;
- current skill estimates;
- recent learning items;
- recurring mistakes;
- recent sessions;
- current real-life situation;
- desired lesson duration;
- maximum number of new concepts;
- correction policy.

---

# 13. AI Output Contract

AI should return structured JSON whenever possible.

Example:

```json
{
  "type": "conversation_turn",
  "speaker": {
    "role": "waiter",
    "text": "Co si dáte?"
  },
  "expected": {
    "intent": "order-drink"
  },
  "hints": [
    "Dám si...",
    "Chtěl bych..."
  ]
}
```

The UI renders the result.

AI must not generate arbitrary application HTML.

Responses should be validated before they enter application state.

---

# 14. Correction Policy

Conversation feedback priorities:

1. meaning-changing mistakes;
2. misunderstanding risk;
3. repeated errors;
4. unnatural phrasing;
5. important grammar patterns.

Avoid correcting every minor issue.

Correction object:

```json
{
  "understood": true,
  "original": "Já chci jedno káva.",
  "corrected": "Chtěl bych jednu kávu.",
  "natural": "Dám si jednu kávu, prosím.",
  "note": "After 'jednu', use 'kávu'.",
  "severity": "medium"
}
```

If the answer is sufficiently good:

```json
{
  "understood": true,
  "correctionRequired": false
}
```

---

# 15. Mistake Engine

Responsibilities:

- normalize significant mistakes;
- detect repeated patterns;
- count repetitions;
- update severity;
- add patterns to future sessions;
- reduce priority after successful recall;
- avoid storing insignificant one-off issues.

Suggested escalation:

```text
first occurrence
→ correction only

repeated
→ store mistake

repeated again
→ schedule focused practice

persistent pattern
→ generate micro lesson

improved
→ verify later
```

---

# 16. SRS Engine

SRS must support multiple memory dimensions.

For every learning item:

```text
recognition
production
listening
pronunciation
```

The next exercise should target the weakest relevant dimension.

Example:

```text
recognition = 0.92
production = 0.41
```

Do not ask for recognition again unless needed.

Generate an active production task instead.

Initial scheduling can use a simple deterministic algorithm.

Avoid over-engineering v0.1.

---

# 17. Progress Engine

Do not center progress around XP.

Track:

```text
Speaking
Listening
Pronunciation
Vocabulary
Grammar
```

Also track real-life capabilities:

```text
order food
buy groceries
ask directions
talk to neighbours
make phone calls
explain a problem
visit doctor
handle bank conversation
```

UI states:

```text
Not practiced
Developing
Good
Strong
```

Numeric values may exist internally.

---

# 18. Speech Architecture

Use abstraction:

```text
SpeechProvider
```

Potential implementations:

```text
BrowserSpeechProvider
CloudSpeechProvider
LocalSpeechProvider
AIPronunciationProvider
```

Do not tightly couple the app to one browser speech API.

Core v0.1 requirements:

- microphone permission;
- voice recording;
- local playback;
- native/reference audio playback;
- graceful fallback if recognition is unavailable.

Advanced pronunciation scoring is deferred.

---

# 19. Real Life Mode

Entry point:

```text
I need this now
```

Flow:

```text
Describe situation
    ↓
Generate natural phrase
    ↓
Listen
    ↓
Practice speaking
    ↓
Optional mini dialogue
    ↓
Save for learning
```

Saved content becomes:

- PersonalSituation;
- LearningItem(s);
- future Session Engine input.

This feature should strongly influence the product identity.

---

# 20. Language Research / Source Engine

When a language is added, Source Engine may build or refresh a Language Knowledge Base.

Possible categories:

- pronunciation references;
- dictionaries;
- frequency data;
- grammar references;
- corpora;
- everyday phrase resources;
- listening sources;
- public educational resources.

Rules:

- preserve source metadata;
- distinguish external source content from AI-generated content;
- cache research results;
- do not repeat expensive research unnecessarily;
- do not silently copy copyrighted long-form material;
- generated training content should be original or properly source-limited.

---

# 21. UI Information Architecture

Primary mobile navigation:

```text
Today
Practice
Words
Progress
Settings
```

Practice may contain:

```text
Speaking
Listening
Pronunciation
Review
Real Life
Grammar Focus
```

Avoid putting every feature into persistent bottom navigation.

---

# 22. Today Screen

Primary action:

```text
START PRACTICE
```

Suggested layout:

```text
Language selector

Greeting

TODAY
Main session card

Quick practice
- Speak
- Listen
- Review
- Real Life

Needs attention
- recurring pronunciation issue
- grammar pattern
- weak phrase

Bottom navigation
```

The user should not have to decide what to study every day.

---

# 23. Conversation Screen

Single primary task:

**speak**

Suggested structure:

```text
Back / context
Conversation partner
Prompt / audio
Voice control
Hint
Feedback
Continue
```

Do not show unnecessary dashboards during conversation.

---

# 24. Review Screen

Review should prioritize recall and production.

Exercise examples:

- answer aloud;
- complete a phrase;
- react to a situation;
- understand audio;
- reformulate naturally;
- recall a phrase after context;
- fix a known mistake.

Avoid endless flashcard translation.

---

# 25. Words Screen

This is not a traditional dictionary.

Show language in context.

Learning item detail may include:

- main expression;
- meaning;
- pronunciation;
- common combinations;
- examples;
- register;
- contexts;
- memory strength;
- next review;
- known mistakes.

---

# 26. Visual Design System

Design direction:

**Calm Intelligence**

Goals:

- adult;
- premium;
- minimal;
- calm;
- highly readable;
- not game-like;
- comfortable for repeated daily use.

Suggested base tokens:

```css
:root {
  --bg: #F7F7F5;
  --surface: #FFFFFF;
  --text-primary: #161616;
  --text-secondary: #686868;
  --border: #E7E7E3;

  --success: #2E7D5A;
  --warning: #B47A19;
  --danger: #B84A4A;

  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
}
```

Language-specific accent may be supported, but the interface must remain visually consistent.

---

# 27. Typography

Use:

```text
system-ui
```

or an equivalent modern readable UI stack.

Recommended:

```text
body: 15–17px
learning phrase: 26–40px
phonetics: 18–22px
secondary metadata: 13–14px
```

Large readable text is more important than decorative typography.

---

# 28. Interaction Rules

Minimum touch target:

```text
44 × 44 px
```

Primary buttons:

```text
48–56 px height
```

UX rule:

> one screen = one primary task

Examples:

```text
Conversation → speak
Listening → listen
Review → recall
Pronunciation → repeat
```

---

# 29. Responsive Behavior

Mobile-first.

Desktop should use the same product model, not a separate desktop application.

Suggested:

```text
mobile:
single column

tablet:
single / two-column adaptive

desktop:
centered content + optional secondary panel
```

Avoid excessively wide reading lines.

---

# 30. Offline Strategy

The application shell must work offline.

Offline-capable:

- application UI;
- stored learning items;
- SRS;
- progress;
- history;
- downloaded/generated sessions;
- local recordings;
- cached reference audio where permitted.

Online-dependent:

- AI generation;
- new external research;
- cloud speech;
- external listening sources;
- future sync.

The app must clearly handle loss of connectivity without crashing.

---

# 31. Backup / Restore

Required in MVP.

Settings:

```text
Data
  Export backup
  Import backup
```

Backup should contain:

```text
schemaVersion
user
settings
languageProfiles
learningItems
mistakes
sessions
reviews
progress
situations
```

Audio may be optionally excluded from initial backups if file size becomes excessive.

Backup format:

```text
language-teacher-backup.json
```

Import must validate schema before applying data.

---

# 32. PWA Requirements

Required:

- valid web app manifest;
- installability;
- service worker;
- offline application shell;
- responsive layout;
- icons;
- theme metadata;
- safe update flow;
- cache versioning.

Service worker code must be isolated from learning logic.

---

# 33. Security / Privacy

Principles:

- local-first by default;
- do not upload local learning data unless needed for an explicit AI/sync action;
- clearly separate local and remote processing;
- microphone permission only when needed;
- do not record audio without an explicit user action;
- allow deleting local recordings;
- do not hard-code secrets or API keys in frontend source;
- remote AI calls require a safe backend/proxy architecture where necessary.

---

# 34. Error Handling

All external systems must fail gracefully.

Examples:

```text
AI unavailable
→ allow local review

speech recognition unavailable
→ recording still works

network unavailable
→ local session works

source fetch fails
→ cached language profile remains usable
```

Never make the entire application unusable because one external capability fails.

---

# 35. Development Quality Rules

1. Keep modules small and focused.
2. Avoid duplicated business logic.
3. Centralize storage access.
4. Centralize AI provider access.
5. Centralize speech provider access.
6. Use data models instead of HTML strings.
7. Validate external responses.
8. Maintain schema migrations.
9. Avoid cross-module global variables.
10. Do not mix UI rendering and learning logic.
11. Add meaningful comments only where logic is non-obvious.
12. Preserve backward compatibility for user data.
13. Keep mobile usability as a release gate.
14. Keep offline startup as a release gate.
15. Do not introduce a dependency without a clear reason.

---

# 36. Development Phases

## Phase 1 — Foundation

Build:

- repository structure;
- PWA shell;
- routing;
- state layer;
- design tokens;
- responsive layout;
- IndexedDB wrapper;
- schema versioning;
- basic settings;
- basic offline shell.

Exit criteria:

- app installs;
- app opens offline;
- navigation works;
- local settings persist;
- no AI dependency.

---

## Phase 2 — Language Profiles

Build:

- onboarding;
- add language;
- language switcher;
- LanguageProfile storage;
- goals;
- initial skill estimates.

Exit criteria:

- one user can add multiple languages;
- language-specific data remains separated.

---

## Phase 3 — Learning Data

Build:

- LearningItem;
- Mistake;
- Session;
- PersonalSituation;
- Progress models;
- repository/data-access services.

Exit criteria:

- all primary learning entities persist locally;
- schema migration is tested.

---

## Phase 4 — Review / SRS

Build:

- review queue;
- basic scheduling;
- multidimensional memory;
- active recall exercises.

Exit criteria:

- scheduled items return correctly;
- progress survives restart.

---

## Phase 5 — Session Engine

Build:

- training blocks;
- session planner;
- Today session;
- session completion;
- session history.

Exit criteria:

- a session can be created and completed without AI.

Use mock/static content first.

---

## Phase 6 — Speech

Build:

- recording;
- playback;
- speech abstraction;
- feature detection;
- fallbacks.

Exit criteria:

- recording works on supported devices;
- unsupported recognition does not break the app.

---

## Phase 7 — AI Teacher

Build:

- provider abstraction;
- Context Builder;
- Teacher Engine;
- structured response contract;
- validation;
- correction objects.

Exit criteria:

- AI can generate a valid structured session block;
- invalid output is rejected safely.

---

## Phase 8 — Conversation

Build:

- roleplay UI;
- turn handling;
- voice/text user input;
- corrections;
- mistake tracking.

Exit criteria:

- full multi-turn conversation works;
- repeated mistakes can influence future tasks.

---

## Phase 9 — Real Life

Build:

- "I need this now";
- phrase generation;
- speaking practice;
- mini-dialogue;
- save to learning;
- Personal Situations.

Exit criteria:

- a real-life request can become future training content.

---

## Phase 10 — Polish / Release

Build:

- accessibility;
- mobile testing;
- desktop testing;
- offline testing;
- backup/restore;
- update flow;
- performance review;
- error states.

Exit criteria:

- production-ready MVP.

---

# 37. MVP Screens

Required screens:

```text
Onboarding
Today
Practice
Session
Conversation
Review
Words
Progress
Settings
```

Optional sub-screens:

```text
Language setup
Learning item detail
Personal situations
Backup / restore
```

---

# 38. Non-goals

Do not add during MVP unless explicitly approved:

```text
ads
XP economy
hearts
leaderboards
friends/social feed
daily streak pressure
avatars/mascots
achievements
subscriptions
marketplace
complex account system
multi-user profile selector
```

---

# 39. Architectural Invariants

These rules should be treated as non-negotiable unless the architecture is intentionally revised.

### Rule 1

The app must remain usable without AI for local review and stored learning.

### Rule 2

AI provider is replaceable.

### Rule 3

Speech provider is replaceable.

### Rule 4

Languages are data, not UI code.

### Rule 5

One installation starts as one user, but records include `userId`.

### Rule 6

Learning data is local-first and exportable.

### Rule 7

A mistake can influence future sessions.

### Rule 8

Progress is multidimensional.

### Rule 9

Real-life situations can become learning material.

### Rule 10

UI is not the learning engine.

---

# 40. Recommended First Implementation Task

Start with **Phase 1 — Foundation only**.

Do not implement AI, speech analysis or complete courses in the first commit.

First milestone:

```text
Language Teacher opens
↓
PWA installs
↓
responsive shell works
↓
Today / Practice / Words / Progress / Settings navigation works
↓
IndexedDB initializes
↓
settings persist
↓
application works offline
```

After this foundation is stable, proceed to Phase 2.

---

# 41. Product Identity Summary

Language Teacher is not:

- Duolingo clone;
- flashcard app;
- AI chat window;
- grammar textbook;
- game.

Language Teacher is:

> **a local-first personal language trainer that uses adaptive practice, speech, memory, real-life situations and AI to make the user actually use the language.**

