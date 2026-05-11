# Design Review Checklist

Use this checklist for every user-facing ticket before merge or release. It is optimized for early engineering delivery, not for polished design sign-off.

For [AIT-4](/AIT/issues/AIT-4) and [AIT-5](/AIT/issues/AIT-5), review this checklist together with [docs/ux/intake-draft-workflow-contract.md](./intake-draft-workflow-contract.md). The checklist is the review gate; the workflow contract is the expected behavior and labeling reference.

## Ticket Metadata

- Ticket:
- Reviewer:
- Review date:
- Build or branch:
- Primary flow affected:

## 1. Workflow Clarity

- The primary user goal is obvious from the first screen or step.
- The next action is clear at each point in the flow.
- The flow does not require hidden knowledge or internal team jargon.
- Empty, loading, success, and failure states exist where the workflow can branch.
- The user can recover from mistakes without restarting the entire task.

## 2. Content And Language

- Labels and button text describe the action plainly.
- Instructions are short and placed where the decision is made.
- Error messages explain what went wrong and what the user can do next.
- Internal implementation terms are not exposed unless intentionally required.

## 3. State And Feedback

- Interactive elements have visible default, hover/focus, disabled, and busy states where relevant.
- The interface acknowledges user actions quickly.
- Long-running operations communicate progress or expected delay.
- Success feedback confirms the result, not just that the click happened.

## 4. Consistency

- Similar actions use the same label and pattern across the flow.
- Navigation, spacing, and hierarchy are consistent with adjacent screens.
- Destructive actions are visually distinct and intentionally placed.

## 5. Accessibility Baseline

- The flow is usable with keyboard navigation.
- Focus order follows the visual and task order.
- Color is not the only signal for state, urgency, or validation.
- Form fields have labels and errors that can be associated with the input.

## 6. Delivery Readiness

- Edge cases called out during planning are still handled in the implementation.
- Known UX compromises are documented in the ticket.
- Any follow-up UX debt has a named owner and a linked issue.
- UX review outcome is recorded before merge or release.

## Review Outcome

- Pass
- Pass with follow-up
- Changes required

## Notes

Record only the issues that need action. Link follow-up tickets when the review passes with debt accepted.
