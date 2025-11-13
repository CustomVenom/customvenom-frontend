import { Sport, SportClient } from './base/SportClient';

/**
 * Singleton registry for sport clients
 * Manages NFL and NBA clients, provides lookup by sport ID
 */
class SportRegistryClass {
  private clients = new Map<Sport, SportClient>();

  register(client: SportClient): void {
    this.clients.set(client.getSportId(), client);
  }

  get(sport: Sport): SportClient | undefined {
    return this.clients.get(sport);
  }

  all(): SportClient[] {
    return Array.from(this.clients.values());
  }

  available(): SportClient[] {
    return this.all().filter((c) => c.isAvailable());
  }
}

// Export singleton instance
export const SportRegistry = new SportRegistryClass();
