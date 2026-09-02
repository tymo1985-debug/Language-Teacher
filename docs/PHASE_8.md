# Phase 8 — Conversation

Version: `0.8.0`

## Included
- multi-turn conversation sessions
- realistic scenario picker
- text input
- optional SpeechRecognition dictation
- persisted conversation turns in Session storage
- conversation history passed to AI Teacher context
- structured post-answer corrections
- Mistake Memory integration
- repeated mistake counting
- conversation mistakes immediately available to Session Engine
- conversation completion

## Pedagogical behavior
Conversation Mode follows the project role:
1. the user sees the situation;
2. the user answers independently;
3. the system does not show the answer in advance;
4. the partner responds;
5. only meaningful corrections are shown after the answer;
6. the dialogue continues.

## Mistake Memory
Corrections can become persistent `Mistake` records.

If the same original/corrected pair appears again:
- `count` increases;
- `lastSeenAt` is updated;
- the mistake remains active;
- it is available to future Session Engine planning.

This closes the first practical adaptive loop between conversation and future training.

## Speech
When browser SpeechRecognition exists, the user may dictate one turn.
If it is unavailable, text conversation still works normally.

## Local demo provider
The Phase 8 local provider can continue a multi-turn conversation and demonstrate correction persistence, but it is not a real language model.

## Exit criteria
- user can start a scenario
- user can complete multiple turns
- turns persist in IndexedDB
- text input always works
- optional voice input degrades safely
- correction is shown after user response
- correction can be stored as a mistake
- repeated mistake count can increase
- stored mistakes affect future session planning
- no frontend API secret is required

## Next
Phase 9 — Real Life.
