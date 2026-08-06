# MealMate UI reference

MealMate is an Expo React Native mobile app. This folder is only a short design reference; the code is the source of truth.

## Source of truth

- Colors, spacing and radii: `frontend/src/ui/theme.ts`
- Shared components: `frontend/src/ui/components`
- Typography: Be Vietnam Pro through `@expo-google-fonts/be-vietnam-pro`
- Icons: Ionicons through `@expo/vector-icons`
- Vietnamese and English copy: `frontend/src/i18n`

## Rules

- Reuse shared components before adding screen-specific versions.
- Keep touch targets accessible and provide labels for icon-only buttons.
- Use pressed and disabled states supported by React Native; web-only CSS hover and cursor rules do not apply.
- Keep screens readable on small phones and avoid horizontal scrolling.
- User-facing nutrition estimates must say that they are estimates.
- New screens must support both Vietnamese and English.

When this document conflicts with the running app, update this document from the shared theme and components instead of creating a second design system.
