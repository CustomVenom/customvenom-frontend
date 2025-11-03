'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Quick links shown as tabs on dashboard
const quickLinks = [
  {
    value: 'decisions',
    label: 'Important Decisions',
    href: '/dashboard/decisions',
  },
  {
    value: 'start-sit',
    label: 'Start/Sit',
    href: '/dashboard/start-sit',
  },
  {
    value: 'faab',
    label: 'FAAB Helper',
    href: '/dashboard/faab',
  },
  {
    value: 'waivers',
    label: 'Waivers',
    href: '/dashboard/players',
  },
];

export function NavigationCards() {
  const pathname = usePathname();

  // Determine active tab based on current path
  const activeTab = quickLinks.find((link) => pathname?.startsWith(link.href))?.value || 'decisions';

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">Tools</h2>
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-field-800 border-field-600">
          {quickLinks.map((link) => (
            <TabsTrigger key={link.value} value={link.value} asChild>
              <Link href={link.href} className="w-full data-[state=active]:bg-field-700 data-[state=active]:text-venom-400">
                {link.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          <div className="rounded-lg border border-field-600 bg-field-800 p-6 text-center text-gray-400">
            <p>Select a tool above to get started.</p>
            <p className="mt-2 text-sm">
              Click any tab to navigate to that tool, or use the top navigation menu.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
