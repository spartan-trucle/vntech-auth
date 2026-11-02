# Plan: Remove section 5 (permissions and attacks)

Request (2026-11-02): the talk is too long, so remove section 5 entirely. The user was told that this removes the only authorization content and confirmed "remove it entirely".

Result: 63 → 56 slides, about 61.5 → 54.5 min before Q&A.

## Changes

1. Delete `presentation/sections/05-authz-attacks.html` and remove `'05-authz-attacks'` from `SECTIONS` in `presentation/index.html`.
2. Remove section 05 CSS from `presentation/css/deck.css`: the part color for `data-part` 05, the "section 05" block, and "section 05 · attack cards". Remove only rules that no other section uses. Grep each class first.
3. Remove icons that only section 5 used from the sprite in `index.html`, for example `ic-bug`. Grep first, because 2.8 uses `ic-bug`.
4. Fix references in other slides:
   - 0.4 map: the "section 5 · AuthZ + attacks" box goes. The map shows sections 1–4. The caption must stay true.
   - 2.9 trade-off line: "Both attacks: XSS and CSRF (5.4)" becomes a direct link to the OWASP cheat sheets for XSS and CSRF, with no slide number.
   - `00-outline.html`: remove the 05 row.
   - `99-thanks.html`: check the lead text and any section 5 mention.
   - Any other "5.x" or "section 5" reference, found with grep across all sections.
5. Run `tools/renumber.py`.
6. Docs:
   - `auth-outline.md`: remove section 5 and add it to the cut list as "RBAC, broken access control, attacks: cut for time (2026-11-02)".
   - `notes/speaker-script.md`: remove the section 5 headings, renumber to 56, and update the timing table, the cut order and the slide lists.
   - `presentation/CLAUDE.md`, `presentation/README.md`, root `README.md`: section list.
7. Kahoot:
   - `notes/kahoot-questions.md`: Q12 (IDOR) is replaced by a refresh-token question.
   - `notes/kahoot-quiz.xlsx`: Q10 (IDOR) is replaced by the same refresh-token question. Answers stay shuffled.
   - The question: "Five API calls get 401 at the same moment. What is the right move?" Correct answer: "Refresh once, share it, retry each call once".

## Check

- 56 slides, unique ids, footers 1/56..56/56, eyebrows in order.
- `node --check` on inline scripts, and no console errors.
- `?print` PDF of 0.4, 2.9 and the outline slide.
- No HTML references to removed CSS classes or icons.

## Risks

- The talk title stays "Authentication & Authorization". After this change, authorization is covered by slide 0.2, the 401 vs 403 slide, and scope / `aud` checks in section 4.
- Restoring section 5 later is a `git revert` of the removal commit.
