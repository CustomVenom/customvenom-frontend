import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayerDrawer from '../PlayerDrawer';
import KeyboardCheatsheet from '../KeyboardCheatsheet';
import type { Row } from '@/lib/tools';

// Mock data for PlayerDrawer
const mockRow: Row = {
  player_name: 'Test Player',
  team: 'TEST',
  position: 'QB',
  range: { p10: 10.0, p50: 15.0, p90: 20.0 },
  explanations: [],
  schema_version: 'v1',
  last_refresh: new Date().toISOString(),
};

describe('Dialog Accessibility', () => {
  describe('PlayerDrawer', () => {
    it('should have accessible name when open', () => {
      render(<PlayerDrawer open={true} onClose={() => {}} row={mockRow} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-labelledby', 'player-drawer-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'player-drawer-description');

      const title = screen.getByText('Test Player Details');
      expect(title).toHaveAttribute('id', 'player-drawer-title');

      const description = screen.getByText(
        /View detailed projections, range analysis, and reasoning for Test Player/
      );
      expect(description).toHaveAttribute('id', 'player-drawer-description');
    });

    it('should not render when closed', () => {
      render(<PlayerDrawer open={false} onClose={() => {}} row={mockRow} />);

      const dialog = screen.queryByRole('dialog');
      expect(dialog).not.toBeInTheDocument();
    });
  });

  describe('KeyboardCheatsheet', () => {
    it('should have accessible name when open', () => {
      render(<KeyboardCheatsheet />);

      // Open the cheatsheet
      const button = screen.getByLabelText('Show keyboard shortcuts');
      fireEvent.click(button);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-labelledby', 'keyboard-cheatsheet-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'keyboard-cheatsheet-description');

      const title = screen.getByText('Keyboard Shortcuts');
      expect(title).toHaveAttribute('id', 'keyboard-cheatsheet-title');

      const description = screen.getByText(
        /Keyboard shortcuts and hotkeys for navigating and using the application/
      );
      expect(description).toHaveAttribute('id', 'keyboard-cheatsheet-description');
    });

    it('should not render dialog when closed', () => {
      render(<KeyboardCheatsheet />);

      const dialog = screen.queryByRole('dialog');
      expect(dialog).not.toBeInTheDocument();
    });
  });
});
