import { describe, expect, it } from 'vitest';
import { CURRENCY_NAME, WELCOME_BONUS_TOKENS } from '../economy';

describe('economy identity', () => {
  it('welcome bonus is 20,026 Tokens F90 (must match the DB trigger)', () => {
    expect(WELCOME_BONUS_TOKENS).toBe(20_026);
  });

  it('currency is branded "Tokens F90"', () => {
    expect(CURRENCY_NAME).toBe('Tokens F90');
  });
});
