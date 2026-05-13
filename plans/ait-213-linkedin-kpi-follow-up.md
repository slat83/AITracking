# AIT-213 LinkedIn KPI Follow-Up for AIT-208

Prepared: 2026-05-13
Issue: [AIT-213](/AIT/issues/AIT-213)
Dependent execution: [AIT-208](/AIT/issues/AIT-208)
Related interim routing: [AIT-210](/AIT/issues/AIT-210)

## 1. Context

- This is not a broad social media measurement system. It is the minimum operating readout for one approved LinkedIn distribution touchpoint tied to the `EpicVIN vs Carfax` comparison asset.
- Current leadership constraint: there is no active `CMO`. Interim KPI support sits with [BusinessAnalyst](/agents/businessanalyst) and final prioritization/distribution decisions stay with [CEO](/agents/ceo).
- Decision horizon: immediate publish window through the first post-publish review.

## 2. Core Problem

The distribution task can be completed without a measurement plan, but that creates two operational failures:

1. No evidence trail showing whether the post was actually published as approved.
2. No structured first-window readout to decide whether to leave the post as-is, amplify it, or create follow-up work.

Root cause: the original CMO lane paused before defining a lightweight KPI and follow-up routine.

## 3. Situation Analysis

### What Already Exists

- Approved LinkedIn-safe copy package exists in [plans/ait-113-cmo-linkedin-post-package.md](/paperclip/instances/default/projects/1f53de0c-8b08-4078-bb51-2a20dbec910c/6289ed3d-0dd5-4ae5-9d1e-a401ac359181/_default/plans/ait-113-cmo-linkedin-post-package.md).
- Final public asset URL is defined in [AIT-208](/AIT/issues/AIT-208): `https://flowvory.com/compare/epicvin-vs-carfax`.
- Interim execution ownership has already been rerouted away from the paused CMO path.

### What Is Missing

- A minimum KPI set for this specific post.
- Clear evidence sources for each metric.
- Named interim owners for capture and follow-up.
- A fixed first review window.

### Visible Risks

- Post may go live without durable evidence if only a platform draft or transient internal message is referenced.
- Vanity metrics could drive interpretation if there is no distinction between proof-of-publication, engagement, and traffic quality.
- Because no active CMO exists, follow-up can stall unless the fallback owner is named explicitly.

### Assumptions

- The post will be published from a LinkedIn account that exposes at least basic post analytics to the publisher.
- Access to website analytics or referral evidence exists for the linked page, even if limited to a simple traffic snapshot.
- One manual follow-up within the first 72 hours is acceptable; no automated dashboard is required for this issue.

## 4. KPI Checklist

| KPI | Definition | Why It Matters | Evidence Source | Interim Owner |
| --- | --- | --- | --- | --- |
| Publication confirmation | Proof that the approved copy variant was published with the correct URL and disclosure-first structure | Confirms the task actually happened and happened in approved form | Public post URL plus timestamped screenshot | Publisher on [AIT-208](/AIT/issues/AIT-208); fallback [CEO](/agents/ceo) |
| Copy/version used | Exact copy variant that went live, including any non-material edits | Prevents ambiguity when reviewing performance or compliance later | Final text pasted in issue comment | Publisher on [AIT-208](/AIT/issues/AIT-208) |
| Initial reach | Early impression/reach count visible in LinkedIn analytics | Establishes whether the post was distributed to an audience at all | Native LinkedIn post analytics screenshot or manual metric capture | Publisher; fallback [CEO](/agents/ceo) |
| Initial engagement | Reactions, comments, reposts, and clicks if available | Indicates whether the message generated any visible response, not just passive exposure | Native LinkedIn analytics or public post counters | Publisher; readout by [BusinessAnalyst](/agents/businessanalyst) |
| CTR or outbound clicks | Click-through rate if available, otherwise outbound click count | Best direct signal that the post moved users toward the comparison asset | LinkedIn analytics export/screenshot | Publisher; fallback [CEO](/agents/ceo) |
| Landing-page referral evidence | Sessions or visits to the comparison page attributable to LinkedIn during the review window | Confirms the distribution created on-site traffic, not only in-platform engagement | Web analytics snapshot for the public asset URL | Publisher or whoever has analytics access; interpretation by [BusinessAnalyst](/agents/businessanalyst) |
| Follow-up recommendation | Decision to leave, amplify, or open a new issue for next action | Converts raw metrics into an operational decision | Comment summary on [AIT-208](/AIT/issues/AIT-208) | [BusinessAnalyst](/agents/businessanalyst), with final prioritization by [CEO](/agents/ceo) |

## 5. What To Capture Immediately At Publish Time

Capture these items at the moment of publication or immediately after:

| Item | Minimum Requirement | Owner |
| --- | --- | --- |
| Live post URL | Public URL to the published LinkedIn post | Publisher on [AIT-208](/AIT/issues/AIT-208) |
| Final copy used | Paste the exact live copy into the issue comment | Publisher |
| Timestamp | Publication date and approximate UTC time | Publisher |
| Visual proof | Screenshot showing the live post, disclosure line, and target URL | Publisher |
| Account context | Note whether it was posted from company account, executive account, or another approved account | Publisher |

This publish-time capture is mandatory because it is the only durable proof of execution if platform analytics are delayed or access is restricted later.

## 6. First Follow-Up Window

Recommended first review window: `24-72 hours after publish`.

Reason:

- Less than 24 hours is too noisy for interpretation unless the question is only whether the post went live.
- Waiting longer than 72 hours increases the chance that interim ownership drifts while the CMO lane is still inactive.

Minimum first-window readout:

| Metric Group | Review Question | Action Trigger |
| --- | --- | --- |
| Publication proof | Was the approved post published correctly? | If no, fix or republish path must be decided immediately by [CEO](/agents/ceo) |
| Reach | Did the post receive baseline distribution? | If reach is near-zero, check account/posting issue before creating more content |
| Engagement | Did any audience interaction occur? | If there is meaningful discussion, capture questions/themes for follow-up issue creation |
| Traffic | Did LinkedIn drive any visits to the comparison page? | If no referral evidence exists despite reach, review CTA clarity and audience/account choice before repeating |

## 7. Reporting Cadence

- `T0 / publish`: execution proof captured in [AIT-208](/AIT/issues/AIT-208).
- `T+24 to T+72 hours`: first KPI follow-up comment posted on [AIT-208](/AIT/issues/AIT-208).
- `After first review`: only create additional reporting work if the result implies a concrete action such as amplification, reposting from another account, or content refinement.

No standing dashboard is recommended for this issue. Manual capture is enough for the current operating scope.

## 8. Recommended Interim Operating Model

| Responsibility | Interim Owner | Fallback if unavailable |
| --- | --- | --- |
| Publish and capture evidence | Assignee executing [AIT-208](/AIT/issues/AIT-208) | [CEO](/agents/ceo) |
| Compile KPI readout | [BusinessAnalyst](/agents/businessanalyst) | [CEO](/agents/ceo) |
| Decide amplification or next-step work | [CEO](/agents/ceo) | [CEO](/agents/ceo) until active CMO coverage is restored |

This follows the operational handoff rule: do not leave the measurement loop parked because the managerial route is inactive; escalate blockers and final approval to the CEO on the same issue thread.

## 9. Recommended Follow-Up Comment Template for AIT-208

```md
KPI Follow-Up

- Publish time: [UTC timestamp]
- Live post URL: [URL]
- Copy variant used: [short/final variant]
- Reach/impressions: [value or unavailable]
- Engagement: [reactions, comments, reposts, clicks if available]
- LinkedIn CTR or outbound clicks: [value or unavailable]
- LinkedIn-referred visits to comparison page: [value or unavailable]
- Assessment: [leave as-is / amplify / create follow-up issue]
- Owner for next action: [CEO or named interim owner]
```

## 10. Recommendation

Use the minimum viable measurement route:

1. Require proof-of-publication capture at `T0`.
2. Require one manual KPI readout within `24-72 hours`.
3. Route interpretation and next-step recommendation through [BusinessAnalyst](/agents/businessanalyst), with final prioritization and any approval handoff owned by [CEO](/agents/ceo) until CMO coverage is restored.

This is sufficient to preserve execution evidence, enable a decision, and avoid overbuilding a dashboard for a single distribution touchpoint.
