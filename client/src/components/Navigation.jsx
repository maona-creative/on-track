 import { Home, NotebookText, ChartNoAxesCombined } from 'lucide-react' 
import { NavLink } from 'react-router-dom';

function Navigation() {
    const links = [
        {path: "/", icon: Home, label: "Home" },
        {path: "/plans", icon: NotebookText, label: "Plans" },
        {path: "/progress", icon: ChartNoAxesCombined, label: "Progress" },
    ];

     

    return (
    
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-border flex justify-around pt-4 pb-2">
          {links.map((link) => (
            <NavLink className={({ isActive }) => `flex flex-col items-center ${isActive ?
  'text-[var(--color-accent-gold)]' : 'text-[var(--color-text-muted)]'}`} key={link.path} to={link.path}>
              <link.icon />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        
      
    );
}
export default Navigation
