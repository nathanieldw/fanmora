import { User } from '@/types';

// Type declarations for DesktopSidebar component
declare module '@/components/navigation/DesktopSidebar' {
    export interface DesktopSidebarProps {
        user: User;
        onCreatePost?: () => void;
    }
    
    const DesktopSidebar: React.FC<DesktopSidebarProps>;
    export default DesktopSidebar;
}

// Type declarations for SuggestionsSidebar component
declare module '@/components/navigation/SuggestionsSidebar' {
    export interface SuggestionsSidebarProps {
        user: User;
    }
    
    const SuggestionsSidebar: React.FC<SuggestionsSidebarProps>;
    export default SuggestionsSidebar;
}

// Type declarations for MobileNav component
declare module '@/components/navigation/MobileNav' {
    export interface MobileNavProps {
        user: User;
        onCreatePost?: () => void;
    }
    
    const MobileNav: React.FC<MobileNavProps>;
    export default MobileNav;
}
