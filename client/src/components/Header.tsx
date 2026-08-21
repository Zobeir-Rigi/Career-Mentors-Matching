import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./ui/Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";
import { useAuth } from "@/lib/context/useAuth";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const fullName = user?.fullName ?? "";
  const roleName = user?.role?.toLowerCase();
  const isAuthenticated = Boolean(user && user.role);
  const hasProfileNavigation =
    user?.role === "MENTEE" || user?.role === "MENTOR";

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }

    setIsMenuOpen(false);
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      "flex min-h-11 items-center rounded-md px-4 py-2.5",
      "font-sans text-sm font-semibold transition-colors",
      "focus-visible:outline focus-visible:outline-2",
      "focus-visible:outline-offset-2 focus-visible:outline-accent",
      isActive
        ? "bg-accent text-on-accent"
        : "text-muted hover:bg-surface hover:text-fg",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Brand */}
        <div className="min-w-0">
          <Logo />
        </div>

        {/* Desktop navigation */}
        {isAuthenticated && roleName && hasProfileNavigation && (
          <nav
            className="hidden items-center gap-2 md:flex"
            aria-label="Main navigation"
          >
            <NavLink to={`/${roleName}/profile`} className={navLinkClasses}>
              Profile
            </NavLink>

            <NavLink to={`/${roleName}/dashboard`} className={navLinkClasses}>
              Dashboard
            </NavLink>
          </nav>
        )}

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {user ? (
            <>
              <span className="text-sm font-medium text-fg">{fullName}</span>
              <Button variant="quiet" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="quiet" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button variant="primary" onClick={() => navigate("/signup")}>
                Sign up
              </Button>
            </>
          )}
        </div>

        {/* Mobile action: keep only the menu in the narrow header */}
        <div className="flex shrink-0 items-center md:hidden">
          <Button
            variant="quiet"
            className="px-3"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="md:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-fg/30"
            aria-label="Close navigation"
            onClick={() => setIsMenuOpen(false)}
          />

          <aside
            id="mobile-navigation"
            className="fixed right-0 top-0 z-50 flex h-dvh w-72 flex-col border-l border-line bg-bg p-5"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between">
              <Logo />

              <Button
                variant="quiet"
                className="shrink-0 px-3"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>

            {isAuthenticated && roleName && hasProfileNavigation && (
              <nav className="mt-8 flex flex-col gap-2">
                <NavLink
                  to={`/${roleName}/profile`}
                  className={navLinkClasses}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </NavLink>

                <NavLink
                  to={`/${roleName}/dashboard`}
                  className={navLinkClasses}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
              </nav>
            )}

            {/* Theme control lives in the drawer on mobile so it cannot overlap the brand */}
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm font-semibold text-fg">Theme</span>
              <ThemeToggle />
            </div>

            <div className="mt-auto border-t border-line pt-4">
              {user ? (
                <div className="space-y-2">
                  <p className="px-4 text-sm font-medium text-fg">{fullName}</p>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="quiet"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Log in
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => {
                      navigate("/signup");
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
