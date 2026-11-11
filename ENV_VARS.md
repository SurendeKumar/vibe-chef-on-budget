# Environment variables

`.env` is gitignored and managed entirely by the Stripe Projects CLI — never
hand-edit it. Run `stripe projects env --pull` to (re)sync it after adding or
rotating services. Documented here for reference (names only, no values):

## OpenRouter — AI (resource: `mood-meal-ai`)
- `MOOD_MEAL_AI_API_KEY`
- `MOOD_MEAL_AI_TYPE`

## OpenRouter — plan (resource: `openrouter-plan`)
- `OPENROUTER_PLAN_API_KEY`
- `OPENROUTER_PLAN_TYPE`

## Supabase — project (resource: `mood-meal-db`)
- `SUPABASE_DB_PASS`
- `SUPABASE_DB_URL` — direct connection, used for migrations (`npm run db:migrate`)
- `SUPABASE_POOLER_URL` — pooled connection, used by the app at runtime
- `SUPABASE_PROJECT_REF`
- `SUPABASE_PROJECT_URL`
- `SUPABASE_PUBLISHABLE_KEY`

## Supabase — plan (resource: `supabase-plan`)
- `SUPABASE_ORG_SLUG`
- `SUPABASE_PLAN`
