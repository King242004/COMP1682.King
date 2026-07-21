# Final Report Readiness Checklist

**Last reviewed:** 21 July 2026

This file is an internal completion checklist. It must not be pasted into the submitted report.

## Overall status

The technical implementation is stable and the implementation and automated testing chapters are substantially complete. The final report is not yet submission ready because ethical approval, primary user research, competitor observations, UAT results and personal reflection are still missing. These items must use real evidence and must not be replaced with invented data.

| Area | Status | Main remaining work |
|---|---|---|
| Chapter 1 Introduction | Nearly complete | Recheck Section 1.6 after the final chapter structure is fixed |
| Chapter 2 Literature Review | Nearly complete | Add an academic source for backend trust boundaries and verify the claim about Western biased food imagery |
| Chapter 3 Product Research | Incomplete | Select and test one Vietnamese competitor, complete heuristic scores, feature matrix, task counts and observations |
| Chapter 4 Requirements and Design | Blocked by research | Insert ethics approval code, analyse interviews and survey, derive personas, user stories and MoSCoW requirements, insert diagrams, complete licence and IP checks |
| Chapter 5 Methodology | Nearly complete | Confirm dates against the official schedule and insert the Gantt chart image |
| Chapter 6 Implementation | Substantially complete | Insert project management and device screenshots, add selected architecture and code evidence, recount code only if source changes again |
| Chapter 7 Testing | Automated section complete | Insert appendix number, run UAT after ethics approval, add real results and align the traceability matrix with final FR identifiers |
| Chapter 8 Evaluation and Conclusion | Partly complete | Complete objective evaluation from real research and UAT, write personal reflection in the student's own voice, then write the final conclusion |
| References | Needs final reconciliation | Remove unused sources, add every cited source, fill access dates and apply Harvard formatting with hanging indents |
| Appendices | Incomplete | Add ethics approval, instruments, anonymised raw data, analysis, test evidence, screenshots, diagrams, Gantt chart and project management evidence |

## Technical evidence confirmed on 21 July 2026

| Check | Result |
|---|---|
| Frontend lint | Pass with no warnings |
| TypeScript compilation | Pass |
| Backend unit tests | 21 of 21 pass |
| API integration regression | 50 of 50 pass on the final local backend |
| Expo dependency compatibility | Dependencies up to date for SDK 54 |
| Expo Doctor | 18 of 18 checks pass |
| Backend production dependency audit | Zero known vulnerabilities |

The frontend dependency audit reports fifteen moderate findings inside the Expo SDK 54 build toolchain. npm only offers resolution by forcing a major upgrade to Expo 57. This upgrade is not appropriate immediately before submission because Expo Doctor confirms that the current SDK 54 dependency set is internally compatible. The findings do not represent a known vulnerability in MealMate application code, but they should be recorded as dependency risk and reviewed when Expo 57 becomes the selected supported platform.

## Required order of work

1. Submit and receive ethical approval.
2. Complete the direct competitor evaluation in Chapter 3. This does not require participant data.
3. Run the approved survey and five interviews.
4. Analyse the data and complete Sections 4.2 to 4.5.
5. Freeze final functional requirement identifiers and update the Chapter 7 traceability matrix.
6. Run UAT with five participants and calculate the real SUS score.
7. Complete Chapters 7 and 8 using the real results.
8. Reconcile in-text citations and the reference list.
9. Assemble the final Word report using the university template, insert figures and appendices, update the table of contents, then render and inspect every page.

## Items that require the student's input

- Ethical approval reference number
- Official project dates and submission schedule
- Direct observations from using competitor applications
- Survey CSV and five anonymised interview records
- Five UAT records and SUS answers
- Personal reflection in Section 8.3
- Screenshots from the physical device, Git history and project board
- University intellectual property policy conclusion

## Items that Codex can complete after receiving the evidence

- Statistical and thematic analysis of survey and interview data
- Personas, user stories and evidence based MoSCoW prioritisation
- Charts, tables and requirements traceability updates
- UAT scoring, SUS calculation and evaluation narrative
- Final citation reconciliation and Harvard reference formatting
- Consolidation into the final DOCX and full visual layout verification
