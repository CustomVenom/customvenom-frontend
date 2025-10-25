import type { Meta, StoryObj } from '@storybook/react';

import { MobileDock } from '../src/components/MobileDock';

const meta: Meta<typeof MobileDock> = {
  title: 'Components/MobileDock',
  component: MobileDock,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      router: {
        pathname: '/tools',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MobileDock>;

export const Default: Story = {};

export const ActiveProjections: Story = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/projections',
      },
    },
  },
};

