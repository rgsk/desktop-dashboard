import { useNavigate } from 'react-router-dom';

import { Link } from 'react-router-dom';
import { ModeToggle } from '../ModeToggle/ModeToggle';
import { Button } from '../ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '../ui/navigation-menu';

interface NavBarProps {}
const NavBar: React.FC<NavBarProps> = ({}) => {
  const navigate = useNavigate();
  return (
    <div className="print:hidden">
      <NavigationMenu>
        <NavigationMenuList className="px-2 py-2">
          <NavigationMenuItem>
            <Button
              onClick={() => {
                navigate(-1);
              }}
            >
              Back
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/linkedin-leaderboard">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Linkedin Leaderboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {/* <NavigationMenuItem>
            <Link to="/analytics-dashboard">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Analytics Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem> */}
          <NavigationMenuItem>
            <Link to="/track-post">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Track Post
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <div className="flex-grow"></div>
          <NavigationMenuItem>
            <ModeToggle />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default NavBar;
