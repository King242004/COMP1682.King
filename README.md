# MealMate

MealMate is split into three runnable applications plus one design reference folder.

## Project structure

```text
frontend/       Expo mobile app
backend/        Express API and business rules
email-relay/    Small deployable service that sends signed OTP emails
design-system/  Design reference material; not imported by the applications
```

## Frontend

`frontend/app` contains only Expo Router route files. Screen logic lives under
`frontend/src/features`, grouped by the feature a user sees: auth, meals, home,
plan, exercise, community, coach, scan, profile, progress, and weight. Community
keeps post screens/components in `posts` and account discovery/profile code in
`users`.

Shared code stays outside feature folders only when several features use it:

- `src/config`: calculation rules and static catalogs.
- `src/context`: app-wide refresh state.
- `src/i18n`: Vietnamese and English strings.
- `src/ui`: reusable components and visual theme.
- `src/utils`: API client and small cross-feature helpers.

Files that call the backend use explicit names such as `coachApi.ts`,
`communityApi.ts`, and `mealsApi.ts`, so editor tabs remain easy to identify.

## Backend

The API keeps the standard Express flow:

```text
route -> controller -> service/model
```

- `src/routes/*Routes.js`: endpoint definitions only.
- `src/controllers`: request and response handling.
- `src/services/coach`: Coach context, prompts, scope, language, and replies.
- `src/services/nutrition`: calorie, macro, food-safety, and estimation logic.
- `src/models`: MongoDB persistence models.
- `src/config`: environment, database, AI models, and shared rules.
- `src/services/emailRelayClient.js`: signed calls to the standalone email relay.
- `src/middleware`: authentication, upload, limits, and error handling.
- `src/validators`: request validation that does not belong in controllers.

## Commands

Run commands from the relevant application folder:

```bash
# frontend
npm test
npm run lint
npx tsc --noEmit

# backend
npm test

# email relay
npm test
```
