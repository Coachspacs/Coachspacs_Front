# Coach Space — Post-MVP Epic: AI Study Companion & Course Materials

_Personalized roadmap, lesson summarization, adaptive quizzes, course/lesson attachments, and dynamic academy content management_

**Stack:** Backend: Django / DRF (new `ai_engine` app) · Web: Next.js · Mobile: Flutter · Database: PostgreSQL · AI: LLM API (structured/JSON output, no vector DB required at this stage)

**Phasing:** Phase 1 (remaining training days) — US-21 (attachments) + US-18 (initial roadmap) + US-19 (lesson summarizer). Phase 2 (hackathon month) — US-20 (adaptive quiz) + continuous roadmap updates + UI polish for demo. Parallel Track — US-23 (dynamic academy branding and content management), fully independent from Django/DRF, PostgreSQL, and the AI engine.

**Out of scope for now (deferred):** course/instructor ratings and reviews, and automatic video-to-text (speech-to-text) transcription. Both are candidates for a later phase.

---

## Story Index

| Story ID | Title                                              | Priority | Phase           |
| -------- | --------------------------------------------------- | -------- | --------------- |
| US-21    | Course and Lesson Attachments                       | Medium   | Phase 1         |
| US-18    | AI-Generated Personalized Learning Roadmap          | High     | Phase 1         |
| US-19    | AI Lesson Summarization                             | High     | Phase 1         |
| US-20    | Adaptive AI-Generated Quizzes                       | Medium   | Phase 2         |
| US-23    | Dynamic Academy Branding & Content Management       | High     | Parallel Track  |

_Execution note: US-21 is listed first because it is a prerequisite for the richest version of US-19 (see the note at the end of US-19). US-23 is a separate parallel track and is fully independent from the Django/AI work; it uses Firebase/Firestore, Firebase Authentication, and Next.js to make the public website dynamic and academy-customizable without requiring deployments for content or branding changes._

---

## US-21 — Course and Lesson Attachments

**Story ID:** US-21

**Requirements:** R4.05

**Priority:** Medium

**Phase:** Phase 1 (Post-MVP)

### User Story

As an instructor, I want to attach supporting files either to a specific lesson or to the course as a whole, so that students have supplementary materials (slides, worksheets, code samples, resource sheets) alongside the video content.

### Scenarios

**Scenario 1: (Happy Path — Lesson-Level Attachment)**

1. Instructor is editing a lesson inside the course authoring flow (US-08).
2. Instructor uploads a file (e.g., a PDF of slides) and attaches it to that specific lesson.
3. Student viewing that lesson sees the attachment listed with a download action.

**Scenario 2: (Happy Path — Course-Level Attachment)**

1. Instructor uploads a file to the course as a whole (e.g., a single resource pack covering the entire course) rather than to one lesson.
2. System shows this file in a "Course Materials" section visible from any lesson in that course, not duplicated per lesson.

**Scenario 3: (Multiple Attachments)**

1. Instructor attaches more than one file to the same lesson or course.
2. Student sees all attachments listed in upload order, each with its own file name, type, and size.

**Scenario 4: (File Type and Size Validation)**

1. Instructor tries to upload a file that exceeds the configured size limit or has an unsupported type.
2. System rejects the upload and shows the allowed types and size limit.

**Scenario 5: (Replace or Remove an Attachment)**

1. Instructor deletes or replaces an existing attachment.
2. Students immediately stop seeing the removed file; the lesson/course content itself is unaffected.

**Scenario 6: (Access Control)**

1. A guest or a student not enrolled in the course tries to access an attachment's download link directly.
2. System denies access unless the requester is enrolled (or the lesson/course is in preview mode, per existing preview rules).

**Scenario 7: (Archived Course)**

1. Instructor archives a course that has attachments.
2. Previously enrolled students can still access and download existing attachments.

### Acceptance Criteria

- An instructor can attach one or more files either to an individual lesson or to the course as a whole.
- Course-level attachments appear in a single "Course Materials" section, not duplicated across every lesson.
- Only configured file types and a maximum file size are accepted; violations show a clear error.
- Students can download attachments only if they are enrolled or the content is in preview mode, consistent with existing access rules.
- Removing or replacing an attachment does not affect the lesson/course content itself.
- Attachments in archived courses remain accessible to already-enrolled students.

### Tasks

**UI/UX (Figma)**

- Design the attachment upload UI inside the lesson editor and a separate "Course Materials" upload area (extends US-08's authoring screens).
- Design the attachment list/download UI for students, both at the lesson level and the course-level "Materials" tab.
- Design the file type/size validation error state.

**Backend (Django/DRF)**

- Create the `Attachment` model and upload endpoint, supporting both lesson-scoped and course-scoped attachments.
- Implement file type and size validation server-side.
- Store files in object storage; serve downloads through an authenticated, permission-checked endpoint (reusing existing enrollment/preview access logic).
- Implement delete/replace endpoints for instructors, scoped to their own courses.

**Frontend (Next.js)**

- Add attachment upload to the course authoring flow (lesson-level and course-level).
- Add the attachment list with download action to the lesson player and a "Course Materials" tab on the course page.

**Frontend (Flutter)**

- Add the attachment list and download action to the mobile lesson view and course materials screen.

**Database (PostgreSQL)**

- `Attachment`: id, course_id → Course (always set), lesson_id → Lesson (nullable — null means course-level), file_url, file_name, file_size, mime_type, uploaded_at.

**Testing**

- Test uploading, listing, and downloading attachments at both the lesson and course level.
- Test file type/size rejection.
- Test that course-level attachments are not duplicated per lesson.
- Test access control (non-enrolled users cannot download; preview rules respected).
- Test that removing/replacing an attachment doesn't affect the lesson/course record.
- Test attachments remain accessible after the course is archived.

---

## US-18 — AI-Generated Personalized Learning Roadmap

**Story ID:** US-18

**Requirements:** R4.01, R4.02

**Priority:** High

**Phase:** Phase 1 (Post-MVP)

### User Story

As a student, I want the platform to build me a personalized sequence of courses based on my goal and current level, and to keep adjusting it as I progress, so that I always know what to study next instead of browsing the catalog on my own.

### Scenarios

**Scenario 1: (Happy Path — Initial Roadmap Generation)**

1. Student completes registration (or opens "My Path" for the first time).
2. System asks 2–3 short questions: learning goal/category, current level, weekly time available.
3. System sends the student's answers plus metadata of existing published courses (title, description, level, prerequisites) to the AI engine.
4. AI engine returns an ordered list of course IDs drawn only from the existing catalog, each with a short "why this step" reason.
5. System creates a `LearningPath` with `LearningPathStep` records and displays it on the student's dashboard.

**Scenario 2: (Roadmap Adjusts After Course Completion)**

1. Student completes a course that was a step in their active path.
2. System marks that step as done and re-evaluates only the remaining steps (not the whole path).
3. Updated path is shown without disrupting steps already marked done.

**Scenario 3: (No Suitable Courses Yet)**

1. Student's stated goal doesn't match any published course closely enough.
2. System shows a message that no path could be built yet and suggests browsing the catalog instead.
3. No fabricated or non-existent course is ever shown.

**Scenario 4: (AI Engine Failure or Timeout)**

1. The AI request fails or times out.
2. System falls back to a simple rule-based default (e.g., most popular courses in the chosen category).
3. Student is not blocked from continuing to the dashboard.

**Scenario 5: (Student Skips or Reorders a Step)**

1. Student manually marks a suggested step as "skip" or enrolls in a course out of the suggested order.
2. System respects the student's choice and re-evaluates the remaining path around it.

**Scenario 6: (Regenerate Roadmap)**

1. Student changes their stated goal from their profile/settings.
2. Student taps "Regenerate my path."
3. System builds a new path following the same generation logic, keeping history of the previous one.

### Acceptance Criteria

- The AI-suggested path only ever references courses that exist and are published — never a fabricated course or ID.
- Every suggested step includes a short, human-readable reason.
- The path updates incrementally after each course completion, not from scratch each time.
- If the AI call fails, the student still gets a usable (fallback) path and is never blocked.
- A student can view, skip, or manually reorder steps.
- A student can regenerate their path after changing their goal.
- The roadmap UI text is shown in the student's active language (Arabic or English).

### Tasks

**UI/UX (Figma)**

- Design the short diagnostic/onboarding questionnaire (goal, level, weekly time).
- Design the "My Path" screen: ordered steps, status per step, AI reason text, skip/reorder actions.
- Design the fallback/empty state and the "regenerate path" flow.

**Backend (Django/DRF)**

- Create the `ai_engine` app to centralize all LLM calls (prompt templates, request/response handling, caching, rate limiting).
- Implement the roadmap generation service: builds a prompt from student goal + published course metadata, requests structured JSON output constrained to real course IDs, validates the response against the actual catalog before saving.
- Implement the roadmap endpoints: `POST /api/ai/roadmap/generate`, `GET /api/ai/roadmap`, `POST /api/ai/roadmap/regenerate`, `PATCH /api/ai/roadmap/steps/{id}` (skip/reorder).
- Implement a signal/hook on course completion that triggers incremental re-evaluation of remaining steps.
- Implement the rule-based fallback path generator (e.g., most-enrolled courses in the chosen category) for AI failures/timeouts.
- Enforce a per-student rate limit on generation/regeneration calls.

**Frontend (Next.js)**

- Build the onboarding questionnaire flow (post-registration and from settings).
- Build the "My Path" page with step list, status indicators, reasons, and skip/reorder controls.
- Handle the fallback/empty and loading states.

**Frontend (Flutter)**

- Build the questionnaire and "My Path" screens where included in this phase's scope (can follow after web if timeline is tight).

**Database (PostgreSQL)**

- `LearningGoal`: id, student_id → User, goal_text/category, weekly_time, created_at.
- `LearningPath`: id, student_id → User, goal_id → LearningGoal, status (active/archived), generated_at.
- `LearningPathStep`: id, path_id → LearningPath, course_id → Course, order, status (pending/in_progress/done/skipped), ai_reason, updated_at.

**Testing**

- Test that generated steps always reference existing, published courses only.
- Test incremental re-evaluation after a course completion (earlier "done" steps stay untouched).
- Test the fallback path is served when the AI call fails or times out.
- Test skip/reorder behavior and regeneration after a goal change.
- Test rate limiting on repeated generation requests.

---

## US-19 — AI Lesson Summarization

**Story ID:** US-19

**Requirements:** R4.03

**Priority:** High

**Phase:** Phase 1 (Post-MVP)

### User Story

As a student, I want to get a short AI-generated summary of a lesson in my preferred language, so that I can review the key points quickly without rewatching the whole lesson.

### Scenarios

**Scenario 1: (Happy Path — First Request for a Lesson)**

1. Student opens a lesson that has text content available (instructor-provided notes and/or lesson-level attachment text — see note below).
2. Student taps "Summarize this lesson."
3. Since no summary exists yet for this lesson/language, system calls the AI engine and generates one.
4. System stores the summary and displays it to the student.

**Scenario 2: (Cached Summary — Subsequent Requests)**

1. A different student opens the same lesson and taps "Summarize."
2. System serves the already-stored summary instantly, without calling the AI engine again.

**Scenario 3: (Language Switch)**

1. Student switches the interface language from Arabic to English (or vice versa).
2. Student requests the summary again.
3. System generates/serves a summary specifically for that language (summaries are cached per lesson **and** per language).

**Scenario 4: (Lesson Has No Usable Text Source)**

1. Student requests a summary for a lesson that has no notes text and no text-extractable attachment.
2. System shows a clear message that summarization isn't available for this lesson yet, instead of a broken action.

**Scenario 5: (Generation Failure)**

1. The AI request fails.
2. System shows a retry option rather than a broken state.
3. Failure is logged for monitoring.

**Scenario 6: (Content Updated by Instructor)**

1. Instructor edits the lesson's notes text (or replaces its summarization-relevant attachment) after a summary was already generated.
2. System invalidates the cached summary for that lesson so the next request regenerates it.

### Acceptance Criteria

- A summary is generated only once per lesson/language pair and reused for every subsequent student (cached, not per-student).
- Summaries are available in both Arabic and English, matching the requester's active interface language.
- Lessons without any usable text source show a clear "not available" message instead of erroring.
- A failed generation shows a retry action and is logged.
- Editing the lesson's source content invalidates its cached summary.
- Only published, accessible lessons can be summarized (respecting existing enrollment/preview rules).

### Tasks

**UI/UX (Figma)**

- Design the "Summarize this lesson" action and the summary display (within the lesson player view).
- Design the "not available" and "generation failed / retry" states.

**Backend (Django/DRF)**

- Implement the summarization service in `ai_engine`: builds the prompt from the lesson's available text source + target language, calls the LLM, stores the result.
- Create endpoints: `GET /api/lessons/{id}/summary?lang=`, triggering generation on cache miss.
- Add a signal to invalidate the cached summary when the lesson's notes text changes, or its relevant attachment is replaced/removed.
- Enforce existing lesson-access permission checks before allowing summarization.

**Frontend (Next.js)**

- Add the "Summarize" action to the lesson player and render the returned summary.
- Handle loading, cached-instant, not-available, and retry states.

**Frontend (Flutter)**

- Add the same summarization action and states to the mobile lesson player.

**Database (PostgreSQL)**

- `LessonSummary`: id, lesson_id → Lesson, language, content, model_version, generated_at, is_stale (bool, set true on source content change).

**Testing**

- Test that a second request for the same lesson/language does not trigger a new AI call.
- Test both languages are generated/served correctly and independently cached.
- Test the "not available" path for lessons with no usable text source.
- Test cache invalidation after a lesson's source content changes.
- Test access control (only enrolled/preview-eligible students can summarize a given lesson).

> **Note on content source:** For this phase, the source text for summarization is whatever the instructor makes available as readable text — a notes field on the lesson, and/or a text-extractable attachment from US-21 (e.g., a PDF of slides). Automatic speech-to-text transcription of the video itself is deferred to a later phase (see the epic's "Out of scope for now" note).

---

## US-20 — Adaptive AI-Generated Quizzes

**Story ID:** US-20

**Requirements:** R4.04

**Priority:** Medium

**Phase:** Phase 2 (Hackathon)

### User Story

As a student, I want my next quiz attempt to focus more on the topics I struggled with, so that I spend my study time reinforcing my actual weak points instead of repeating what I already know.

### Scenarios

**Scenario 1: (Happy Path — Adaptive Regeneration After a Weak Attempt)**

1. Student completes a quiz; several answers on a specific topic tag are incorrect.
2. System identifies the weak topic tag(s) from the structured attempt data (no free-text analysis needed).
3. On the next attempt, system requests AI-generated questions weighted toward those weak tags, still constrained to the lesson/course's actual topic scope.
4. Student sees a quiz with a higher proportion of questions on their weak areas.

**Scenario 2: (Strong Performance — No Adaptation Needed)**

1. Student passes a quiz with no notably weak topic tags.
2. Next quiz attempt uses the standard/default question set rather than a skewed one.

**Scenario 3: (Insufficient Data)**

1. Student is taking a quiz for the first time in a course with no prior attempt history.
2. System serves the standard quiz; adaptive weighting only applies from the second attempt onward.

**Scenario 4: (AI Generation Failure)**

1. The AI request for adaptively weighted questions fails.
2. System falls back to the existing static/manual question bank for that quiz.

**Scenario 5: (Instructor Override)**

1. Instructor has authored a manual quiz for a lesson.
2. System never replaces or removes instructor-authored questions — adaptive generation only supplements with additional practice questions, clearly labeled as AI-generated.

### Acceptance Criteria

- Adaptive weighting is based only on structured attempt data (topic tags, correct/incorrect), not free-text interpretation.
- AI-generated questions are clearly labeled as such and never silently replace instructor-authored questions.
- A student with no prior attempt history gets the standard quiz.
- A failed AI generation falls back to the existing static question bank without blocking the student.
- Adaptive behavior can be toggled off per course by the instructor if they prefer a fixed quiz.

### Tasks

**UI/UX (Figma)**

- Design the quiz results view showing per-topic performance.
- Design the "AI-generated practice question" label/badge within the quiz UI.
- Design the instructor-facing toggle to enable/disable adaptive quizzes per course.

**Backend (Django/DRF)**

- Extend the existing quiz/question models with `topic_tag` and `is_ai_generated` fields.
- Implement the adaptive generation service in `ai_engine`: takes weak topic tags + lesson/course scope, requests structured question output from the AI, validates format before storing.
- Implement the fallback to the static question bank on AI failure.
- Add the per-course adaptive-quiz toggle and respect it in the quiz-serving logic.

**Frontend (Next.js)**

- Show per-topic performance breakdown after a quiz attempt.
- Render the "AI-generated" badge on applicable questions.

**Frontend (Flutter)**

- Mirror the same performance breakdown and badge in the mobile quiz flow, if in scope for this phase.

**Database (PostgreSQL)**

- Extend `Question` (or equivalent existing model): add `topic_tag`, `is_ai_generated`.
- `QuizTopicPerformance` (optional, if not derivable from existing attempt data): student_id, course_id, topic_tag, correct_count, incorrect_count, updated_at.

**Testing**

- Test that weak-topic detection correctly reflects attempt history.
- Test that instructor-authored questions are never overwritten or removed by adaptive generation.
- Test the fallback to the static bank on AI failure.
- Test the per-course toggle disables adaptive behavior when off.

---

## US-23 — Dynamic Academy Branding & Content Management

**Story ID:** US-23

**Requirements:** R4.07

**Priority:** High

**Phase:** Parallel Track (Post-MVP)

**Dependencies:** Next.js public website, Firebase/Firestore, Firebase Authentication

**Independence:** Fully independent from Django/DRF, PostgreSQL, and the AI Engine.

### User Story

As an academy administrator or authorized content editor, I want to manage the public website's content, branding, and visual configuration without changing code or redeploying the application, so that the academy can keep its website up to date and eventually use the same Coach Space platform with its own identity and content.

As a platform owner, I want the public-facing content and branding to be configurable per academy, so that the same Coach Space platform can be reused and branded for multiple academies without maintaining separate codebases.

### Architectural Principle

US-23 introduces a lightweight content and branding layer using **Firebase/Firestore + Firebase Authentication**, while keeping the existing application architecture unchanged.

The responsibility boundaries are:

- **Django / DRF / PostgreSQL:** Core platform data and business logic.
- **Firebase / Firestore:** Public website content, branding, theme, navigation, and academy-specific marketing configuration.
- **Firebase Authentication:** Authentication for the content-management dashboard only.
- **Next.js:** Public website rendering, server-side content fetching, caching, ISR, SEO, and on-demand revalidation.
- **Flutter:** No dependency on the CMS for the core mobile application in this phase.

Firebase must not become a second source of truth for users, courses, enrollments, lessons, quizzes, or other core platform entities.

### Scenarios

**Scenario 1: (Happy Path — Edit Landing Page Content)**

1. Authorized content editor signs into the CMS dashboard.
2. Editor opens the landing page.
3. Editor changes editable content such as the hero heading, description, CTA text, or feature section.
4. Editor saves the changes.
5. System stores the updated content in Firestore.
6. Next.js revalidates the affected public page.
7. Visitors see the updated content without requiring a code deployment.

**Scenario 2: (Branding Customization)**

1. Authorized editor opens the academy branding settings.
2. Editor changes supported branding values such as:
   - Academy logo
   - Favicon
   - Primary color
   - Secondary/accent colors
   - Typography settings
   - Button style
   - Other predefined visual tokens
3. Editor saves the changes.
4. Next.js applies the updated branding to the public website after revalidation.
5. The underlying Next.js components and application code remain unchanged.

**Scenario 3: (Multiple Public Pages)**

1. Editor opens the CMS dashboard.
2. System displays the available public pages, such as:
   - Landing
   - About
   - FAQ
   - Contact
   - Other configured marketing pages
3. Editor selects a page and updates its sections.
4. Changes are saved independently for that page.
5. Only the affected public content is revalidated.

**Scenario 4: (Section-Based Content Editing)**

1. Editor opens a page.
2. System displays its configurable sections in a structured editor.
3. Editor updates a section without editing raw application code.
4. The system validates the content according to the section's schema.
5. The updated section is saved and rendered by Next.js.

Example sections may include:

- Hero
- Features
- Statistics
- Testimonials
- FAQ
- CTA
- Footer
- Partner/logos section

The CMS should not expose arbitrary code editing.

**Scenario 5: (Image / Media Management)**

1. Editor needs to replace an image used on a public page.
2. Editor uploads or selects an approved image.
3. System stores the media reference and associates it with the relevant content section.
4. The public Next.js page uses the new media after revalidation.
5. Existing content remains intact if the upload fails.

**Scenario 6: (Preview Before Publishing)**

1. Editor modifies public content.
2. Editor previews the changes before making them publicly visible.
3. System renders the preview using the draft content.
4. Editor confirms publication.
5. Published content becomes available on the public website.
6. Visitors do not see unfinished draft changes.

**Scenario 7: (Publish / Draft State)**

1. Editor modifies a page or section.
2. Changes initially remain in draft state.
3. Editor explicitly publishes the changes.
4. System updates the published version.
5. Next.js revalidates the affected page.
6. Visitors see the newly published content.

**Scenario 8: (CMS Authentication)**

1. Content editor opens the CMS dashboard.
2. System displays a dedicated Firebase Authentication login page.
3. Editor authenticates using an authorized Firebase account.
4. Unauthorized users cannot access CMS management screens.
5. Successful authentication grants access only to the CMS functionality.
6. This authentication does not create or modify a Coach Space student/instructor account in Django.

**Scenario 9: (Unauthorized CMS Access)**

1. A visitor attempts to access the CMS dashboard without authentication.
2. System redirects the visitor to the CMS login page.
3. An authenticated Firebase user without the required CMS role attempts to access restricted functionality.
4. System denies access.

**Scenario 10: (Academy-Specific Branding)**

1. Coach Space is configured for Academy A.
2. Academy A has its own logo, colors, typography, public content, and marketing sections.
3. The same Coach Space codebase is configured for Academy B.
4. Academy B has a different visual identity and public content.
5. Each academy sees and serves its own configuration.
6. Changes to Academy A do not modify Academy B's content or branding.

**Scenario 11: (No Content / Missing Configuration)**

1. A public page is requested but a configurable section has no content.
2. Next.js uses the predefined component fallback or hides the optional section.
3. The page remains functional and visually valid.
4. Missing CMS content must never cause the public website to crash.

**Scenario 12: (Firebase / CMS Failure)**

1. Next.js cannot retrieve CMS content from Firebase.
2. The public website remains available using the most recently cached/revalidated content where possible.
3. If no cached content exists, the system renders safe predefined fallback content.
4. A Firebase failure must not take down the entire public website.

**Scenario 13: (Content Update Without Deployment)**

1. Editor changes public website content.
2. Editor publishes the change.
3. Next.js receives or triggers an on-demand revalidation request.
4. The affected page is regenerated using the new content.
5. No Git commit, build, or manual deployment is required.

**Scenario 14: (CMS Does Not Manage Core Platform Data)**

1. An editor uses the CMS to modify marketing content.
2. The editor cannot use the CMS to directly modify:
   - Students
   - Instructors
   - Courses
   - Lessons
   - Enrollments
   - Quiz attempts
   - Learning paths
   - AI data
   - Other Django-managed business data
3. Core platform data continues to be managed exclusively by Django/PostgreSQL.

### Acceptance Criteria

- Authorized editors can log into a dedicated CMS dashboard using Firebase Authentication.
- CMS authentication is completely separate from Django/Coach Space user authentication.
- Editors can create, edit, save, and publish configurable public website content without modifying source code.
- Public pages can contain configurable sections managed through Firestore.
- Branding can be customized through predefined configuration values rather than code changes.
- Public content and branding changes are reflected through Next.js without requiring a full application deployment.
- On-demand revalidation is supported for published content changes.
- Next.js fetches CMS content server-side and uses appropriate caching/ISR strategies so public pages remain SEO-friendly and performant.
- Draft content is not publicly visible until explicitly published.
- CMS users without the required permissions cannot modify protected content.
- Missing or malformed optional CMS content does not break the public website.
- Firebase/Firestore failures do not unnecessarily take down the public website; cached or predefined fallback content is used where available.
- CMS data is clearly separated from Django/PostgreSQL core application data.
- The CMS does not become a second source of truth for users, courses, lessons, enrollments, or other core entities.
- The data model supports academy-specific content and branding so the same Coach Space codebase can serve multiple academies.
- Content belonging to one academy cannot be accidentally exposed or modified by another academy.
- The architecture does not require a separate codebase or deployment for each academy.

### Tasks

**UI/UX (Figma)**

- Design the CMS login page.
- Design the CMS dashboard.
- Design the public-page content management interface.
- Design the section-based editor.
- Design the branding/theme settings interface.
- Design draft/published states.
- Design save, publish, and unsaved-change states.
- Design validation and error states.
- Design media/image selection and upload states.
- Design preview mode.
- Design empty states for pages and sections.
- Design permission/unauthorized states.
- Design the academy selector or academy context indicator for future multi-academy usage.

**Firebase / Firestore**

- Create the Firebase project/environment configuration.
- Configure Firestore.
- Define the CMS data model and collection structure.
- Create academy-level content isolation.
- Define security rules for CMS data.
- Configure Firebase Authentication.
- Define CMS editor/admin roles.
- Store public page content as structured documents.
- Store academy branding/theme configuration.
- Store navigation and other public-site configuration.
- Define media storage strategy, preferably using Firebase Storage or another appropriate object-storage layer.
- Configure appropriate indexes where required.
- Ensure Firestore rules prevent unauthorized cross-academy access.

**Firebase Authentication**

- Create dedicated CMS authentication.
- Support authorized content-editor accounts.
- Define CMS-specific roles/claims if required.
- Protect CMS routes and write operations.
- Keep Firebase Auth completely independent from Django authentication.
- Do not duplicate Coach Space student/instructor accounts inside Firebase Auth.

**Next.js**

- Implement the public website content layer.
- Fetch Firestore content server-side.
- Integrate CMS data with existing Next.js page components.
- Implement ISR/revalidation for public pages.
- Implement on-demand revalidation after content publication.
- Implement safe fallback content.
- Prevent client-side Firestore reads for public page rendering where they would negatively affect SEO or initial performance.
- Implement draft/preview rendering.
- Implement academy-specific content resolution.
- Implement academy-specific branding/theme configuration.
- Ensure images are optimized through the existing Next.js image strategy where applicable.
- Ensure CMS content does not unnecessarily increase client-side JavaScript.
- Preserve existing SEO metadata, sitemap, structured data, and performance behavior.

**CMS Dashboard — Next.js**

- Build authenticated CMS routes.
- Build page management screens.
- Build section editors.
- Build branding settings.
- Build media management/selection.
- Build draft/publish workflow.
- Build preview functionality.
- Build validation and error handling.
- Build unauthorized/access-denied states.
- Add academy context for multi-academy configurations.

**Backend (Django/DRF)**

**No implementation dependency for US-23.**

Django remains completely independent from the CMS.

No Django models or endpoints are required for the initial implementation.

If future requirements require shared academy identity between Django and Firebase, that should be treated as a separate architectural story rather than introducing an implicit dependency into US-23.

**Frontend (Flutter)**

- No required implementation for the initial US-23 scope.
- Flutter continues consuming core platform data from Django/DRF.
- Mobile application does not need to consume Firestore CMS data unless a future requirement specifically calls for dynamic mobile marketing content.

**Database / Firestore**

A multi-academy-ready structure should be used from the beginning.

Suggested structure:

```text
academies/
  {academyId}/
    settings/
      branding
      general

    pages/
      landing
      about
      faq
      contact

    navigation/
      main

    media/
      ...
```

Example `branding` document:

```text
{
  logoUrl,
  faviconUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  textColor,
  headingFont,
  bodyFont,
  buttonRadius,
  updatedAt
}
```

Example `pages/landing` document:

```text
{
  status: "published",

  sections: [
    {
      type: "hero",
      order: 1,
      data: {
        title,
        description,
        primaryCta,
        secondaryCta,
        image
      }
    },

    {
      type: "features",
      order: 2,
      data: {
        title,
        items: [...]
      }
    },

    {
      type: "faq",
      order: 3,
      data: {
        items: [...]
      }
    }
  ],

  updatedAt,
  publishedAt
}
```

The exact schema should remain controlled and versionable rather than allowing arbitrary JSON to become the UI contract.

### Recommended Content Architecture

The CMS should follow a **structured-content approach** rather than a generic page builder.

For example:

```text
Page
 ├── Hero
 ├── Features
 ├── Stats
 ├── Testimonials
 ├── FAQ
 ├── CTA
 └── Footer
```

Each section has a known schema and maps to an existing Next.js component.

This gives editors flexibility while preserving:

- Design consistency
- Performance
- Accessibility
- SEO
- Type safety
- Predictable rendering
- Easier maintenance

The CMS should **not** initially attempt to become a full drag-and-drop website builder.

### Multi-Academy / White-Label Readiness

US-23 should be designed as the first step toward making Coach Space deployable for multiple academies.

The intended future model is:

```text
Coach Space Platform
        │
        ├── Academy A
        │     ├── Branding
        │     ├── Landing Content
        │     ├── About
        │     └── Navigation
        │
        ├── Academy B
        │     ├── Branding
        │     ├── Landing Content
        │     ├── About
        │     └── Navigation
        │
        └── Academy C
              ├── Branding
              ├── Landing Content
              ├── About
              └── Navigation
```

The initial implementation does not need to introduce full multi-tenancy across Django.

Instead, Firestore should be structured so that academy-specific CMS content is isolated from the beginning.

A future multi-tenant implementation can then connect:

```text
Django Academy
       ↓
Academy Identifier
       ↓
Firebase CMS
       ↓
Academy-specific public website
```

without redesigning the CMS data model.

### Performance & SEO Requirements

- Public content should be fetched server-side where possible.
- Public pages should remain statically optimized through Next.js ISR/caching.
- Firebase client SDK should not be required for ordinary public page rendering.
- CMS updates should use on-demand revalidation rather than forcing frequent rebuilds.
- Public pages should retain server-rendered content for search engines.
- CMS functionality should not unnecessarily increase the JavaScript bundle of public pages.
- Images should use optimized delivery.
- Firebase requests should be cached where appropriate.
- Failure of the CMS should degrade gracefully rather than blocking the public website.

### Security Requirements

- Firestore security rules must deny unauthorized writes.
- CMS authentication must use Firebase Authentication.
- CMS roles must be explicitly defined.
- Academy-level data must be isolated.
- Public visitors should only receive published content.
- Draft content must never be exposed through public APIs or public page rendering.
- Sensitive application data must never be stored in Firestore merely for CMS convenience.
- Firebase credentials and privileged Admin SDK credentials must never be exposed to the browser.
- Server-side Firebase Admin access must be kept in secure server/runtime configuration.

### Testing

**Authentication**

- Test successful CMS login.
- Test invalid login.
- Test unauthorized CMS access.
- Test insufficient-role access.
- Test logout/session expiration.

**Content Management**

- Test creating/editing page content.
- Test editing individual sections.
- Test saving drafts.
- Test publishing content.
- Test preview mode.
- Test that unpublished changes are not visible publicly.
- Test that published changes appear after revalidation.

**Branding**

- Test changing academy logo.
- Test changing supported theme colors.
- Test changing supported typography settings.
- Test that branding changes do not require source-code changes.
- Test that branding changes are isolated per academy.

**Multi-Academy Isolation**

- Test Academy A cannot read Academy B's CMS content.
- Test Academy A cannot modify Academy B's branding.
- Test public requests resolve the correct academy configuration.
- Test switching academy context does not leak cached content between academies.

**Performance**

- Test server-side content rendering.
- Test ISR/cache behavior.
- Test on-demand revalidation.
- Test that Firebase client SDK is not unnecessarily loaded on public pages.
- Test page performance before and after CMS integration.

**Failure Handling**

- Test Firestore timeout/failure.
- Test cached-content fallback.
- Test predefined-content fallback when no cached content exists.
- Test malformed CMS data.
- Test missing optional sections.
- Test failed media upload.

**Security**

- Test Firestore security rules.
- Test direct access to unpublished content.
- Test direct access to another academy's content.
- Test that Firebase privileged credentials are never exposed client-side.
- Test that CMS access cannot be used to modify Django-managed data.

### Definition of Done

US-23 is considered complete when:

- A non-technical authorized editor can log into the CMS.
- The editor can modify the landing page and supported public pages.
- The editor can change the academy's supported branding.
- The editor can preview and publish changes.
- Published changes appear on the public Next.js website without a manual deployment.
- Public pages remain SEO-friendly and performant through server-side rendering/ISR.
- CMS authentication is completely separate from Django authentication.
- Firestore is used only for CMS/public-site configuration and content.
- Core Django/PostgreSQL data remains untouched.
- Academy-specific content is isolated and the data model is ready for multiple academies.
- Firebase failure does not unnecessarily take down the public website.
- The implementation does not require a separate codebase for each academy.

---

## Traceability Addendum

| Requirement  | Covered by |
| ------------ | ---------- |
| R4.01, R4.02 | US-18      |
| R4.03        | US-19      |
| R4.04        | US-20      |
| R4.05        | US-21      |
| R4.07        | US-23      |

---

## Deferred (not in this epic's scope)

- **Course/instructor ratings and reviews** — revisit after the hackathon.
- **Automatic video-to-text (speech-to-text) transcription** — revisit as a later enhancement to reduce instructor workload for US-19's content source; not required for the current AI Study Companion scope.
