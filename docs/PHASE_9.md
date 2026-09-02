# Phase 9 — Real Life

Version: `0.9.0`

## Goal
Implement the project’s key differentiator:

> I need this now / Мне нужно это сейчас

The user describes an actual situation and immediately receives language material useful for that situation.

## Included
- Real Life screen
- free-text situation input
- optional dictation
- Teacher Engine integration with `mode: "real-life"`
- useful target-language phrase
- Text-to-Speech playback
- voice recording/practice
- mini-dialog prompt
- save as `PersonalSituation`
- save useful phrase as `LearningItem` type `situation-expression`
- immediate SRS eligibility
- automatic availability to future Session Engine planning

## Local demo behavior
The deterministic local provider includes a small multilingual phrase set for common practical intents such as:
- asking for help
- explaining a problem
- water leak
- pharmacy
- directions
- ordering coffee

Unknown requests fall back to a generic help phrase.

This is intentionally limited. It demonstrates the complete local data flow without pretending to replace a real language model.

## Adaptive loop

```text
Real Life need
→ PersonalSituation
→ situation-expression LearningItem
→ Session Engine
→ Review / SRS
→ later active recall
```

## Exit criteria
- user can describe a real need
- system returns a usable phrase when the provider supports it
- phrase can be played through Speech layer
- user can record themselves
- situation can be saved
- useful phrase can become a LearningItem
- saved material survives restart
- saved material can return in future sessions/review
- no frontend API secret is needed

## Next
Phase 10 — Polish / Release.
