import type { Meta, StoryObj } from '@storybook/react';

import { ProLock } from '../src/components/ProLock';

const meta: Meta<typeof ProLock> = {
  title: 'Components/ProLock',
  component: ProLock,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProLock>;

export const Unlocked: Story = {
  args: {
    isPro: true,
    children: <div className="p-8">Pro content unlocked</div>,
  },
};

export const Locked: Story = {
  args: {
    isPro: false,
    children: <div className="p-8">Pro content locked</div>,
  },
};

export const CustomMessage: Story = {
  args: {
    isPro: false,
    message: 'Upgrade to unlock this feature',
    children: <div className="p-8">Pro content</div>,
  },
};

