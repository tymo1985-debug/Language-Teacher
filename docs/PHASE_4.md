# Phase 4 — Review / SRS

Version: `0.4.0`

## Included
- deterministic SRS engine
- due-item filtering
- review queue
- weakest memory dimension selection
- active recall exercise generation
- `Again / Hard / Good / Easy` review ratings
- per-dimension memory updates
- persistent review history in the existing `reviews` store
- `nextReviewAt` scheduling
- Review screen
- Review entry from Practice
- centralized application version metadata
- application version information in Settings

## Memory dimensions
Each LearningItem continues to track independently:
- recognition
- production
- listening
- pronunciation

The review engine targets the weakest current dimension instead of repeatedly testing only recognition.

## Scheduling
Phase 4 intentionally uses a simple deterministic scheduling algorithm. It is local, inspectable and replaceable. Advanced adaptive scheduling is deferred until enough real learning data exists.

## Exit criteria
- due items return in a deterministic queue
- completed reviews persist
- rating a review updates the targeted memory dimension
- `nextReviewAt` persists across restart
- review history persists
- no AI dependency
- no speech dependency
- empty review state works without seeded content

## Next
Phase 5 — Session Engine.
