/**
 * League gate: Enforce active league limits
 * Free users: 1 active league
 * Pro users: Unlimited
 */
export function canActivateAnotherLeague(isPro: boolean, activeCount: number): boolean {
  if (isPro) return true;
  return activeCount < 1; // Allow activating if there are fewer than 1 active league
}
