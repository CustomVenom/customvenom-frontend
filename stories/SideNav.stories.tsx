import type { Meta, StoryObj } from '@storybook/react';
import { SideNav } from '../src/components/SideNav';

const meta: Meta<typeof SideNav> = {
  title: 'Components/SideNav',
  component: SideNav,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      router: {
        pathname: '/tools',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SideNav>;

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

export const ActiveSettings: Story = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings',
      },
    },
  },
};

