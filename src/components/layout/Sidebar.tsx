import React from 'react';
import { Radio, Clock, Settings, Plug } from 'lucide-react';
import { Tooltip } from '@/components/shared/Tooltip';
import type { Route } from '@/types';

interface SidebarProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  isRecording?: boolean;
  meetingCount?: number;
}

interface NavItem {
  route: Route;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  isRecording = false,
  meetingCount = 0
}) => {
  const navItems: NavItem[] = [
    {
      route: 'live',
      icon: <Radio className="w-5 h-5" />,
      label: 'LIVE'
    },
    {
      route: 'history',
      icon: <Clock className="w-5 h-5" />,
      label: 'HISTORY',
      badge: meetingCount
    },
    {
      route: 'integrations',
      icon: <Plug className="w-5 h-5" />,
      label: 'INTEGRATIONS'
    },
    {
      route: 'settings',
      icon: <Settings className="w-5 h-5" />,
      label: 'SETTINGS'
    }
  ];

  return (
    <aside className="w-20 bg-black flex flex-col items-center py-6 gap-3">
      {navItems.map((item) => {
        const isActive = activeRoute === item.route;
        const showPulse = item.route === 'live' && isRecording;

        return (
          <Tooltip key={item.route} content={item.label} side="right">
            <button
              onClick={() => onNavigate(item.route)}
              className={`
                relative w-14 h-14 flex items-center justify-center
                border-2 transition-all
                ${isActive
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-white border-white/20 hover:border-white hover:bg-white/5'
                }
              `}
            >
              {item.icon}

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black text-xs font-black flex items-center justify-center border-2 border-black">
                  {item.badge > 99 ? '99' : item.badge}
                </span>
              )}

              {/* Recording pulse */}
              {showPulse && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-white animate-pulse" />
              )}
            </button>
          </Tooltip>
        );
      })}
    </aside>
  );
};
