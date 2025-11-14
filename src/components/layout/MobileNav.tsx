'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: '/players', label: 'Players', icon: '👥' },
    { href: '/team', label: 'Team', icon: '🏈' },
    { href: '/matchup', label: 'Matchup', icon: '⚔️' },
    { href: '/tools/start-sit', label: 'Tools', icon: '🛠️' },
  ];

  return (
    <nav className="bottom">
      <div className="mobile-nav-content">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
            <span className="icon">{link.icon}</span>
            <span className="label">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
