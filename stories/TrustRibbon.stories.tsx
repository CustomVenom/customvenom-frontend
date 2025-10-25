import type { Meta, StoryObj } from '@storybook/react';
import { TrustRibbon } from '../src/components/TrustRibbon';

const meta: Meta<typeof TrustRibbon> = {
  title: 'Components/TrustRibbon',
  component: TrustRibbon,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TrustRibbon>;

export const Fresh: Story = {
  args: {
    schemaVersion: 'v1.0.0',
    lastRefresh: new Date().toISOString(),
    stale: false,
  },
};

export const Stale: Story = {
  args: {
    schemaVersion: 'v1.0.0',
    lastRefresh: new Date(Date.now() - 3600000).toISOString(),
    stale: true,
    staleAge: '3600',
  },
};

export const MissingData: Story = {
  args: {
    schemaVersion: 'v1',
    stale: false,
  },
};

