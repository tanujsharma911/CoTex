import { Link, useLocation } from 'react-router';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from '../components/ui/navigation-menu';

import { useAuthStore } from '../store/useAuthStore';
import ThemeToggleApp from './ThemeToggleApp';
import { useEffect } from 'react';

const NavBar = () => {
  const { isAuthenticated } = useAuthStore();
  let location = useLocation();

  const navList = [
    {
      name: 'Projects',
      to: 'project',
      protected: true
    },
    {
      name: 'Profile',
      to: 'profile',
      protected: true
    },
    {
      name: 'Get Started',
      to: 'login',
      protected: false
    }
  ];

  if (location.pathname.includes('edit')) {
    return null;
  }
  return (
    <nav className="w-screen flex items-center h-14 sticky top-0 z-50 bg-background">
      <div className="w-full mx-5 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">
          <img src="/img/logo.png" alt="CoTeX logo" className="h-5" />
        </Link>

        <NavigationMenu className={'space-x-1'}>
          <NavigationMenuList className={'space-x-1'}>
            {navList.map((nav) => {
              if (nav.protected === true && !isAuthenticated) return;
              if (nav.protected === false && isAuthenticated) return;

              return (
                <NavigationMenuItem key={nav.name}>
                  <Link
                    className="text-muted-foreground hover:bg-accent transition-colors px-3 py-1.5 rounded-lg"
                    to={nav.to}
                  >
                    {nav.name}
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
          <ThemeToggleApp />
        </NavigationMenu>
      </div>
    </nav>
  );
};

export { NavBar };
