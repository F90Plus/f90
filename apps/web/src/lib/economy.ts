/**
 * F90+ virtual economy — the user-facing currency identity. The DB is the runtime
 * authority for balances (the `handle_new_user` trigger credits the welcome bonus);
 * these constants are the SINGLE SOURCE for display and MUST match the trigger
 * (`supabase/migrations/20260604000003_welcome_bonus.sql`). Tokens F90 are VIRTUAL —
 * free-to-play, no real money, no gambling (D-039).
 */

/** The branded virtual currency. A proper noun — identical in every language. */
export const CURRENCY_NAME = 'Tokens F90';

/** Welcome bonus credited on signup. 20,026 → the 2026 World Cup (D-039). */
export const WELCOME_BONUS_TOKENS = 20_026;
