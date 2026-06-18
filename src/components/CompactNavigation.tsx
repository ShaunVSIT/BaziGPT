import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Sparkles, CalendarDays, Star, Info, type LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "./LanguageSwitcher";
import { Logo } from "./brand/Logo";
import { cn } from "@/lib/utils";

interface NavigationItem {
  path: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const CompactNavigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { path: "/", label: t("navigation.home"), icon: Sparkles, description: t("home.discoverDestiny") },
    { path: "/daily", label: t("navigation.daily"), icon: CalendarDays, description: t("daily.subtitle") },
    { path: "/famous", label: t("navigation.famous"), icon: Star, description: t("famous.subtitle") },
    { path: "/about", label: t("navigation.about"), icon: Info, description: t("about.subtitle") },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" || location.pathname === "" : location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6 md:justify-center">
        {/* Mobile: logo */}
        <button
          onClick={() => handleNavigation("/")}
          className="flex items-center md:hidden"
          aria-label="BaziGPT home"
        >
          <Logo markSize={28} />
        </button>

        {/* Desktop: centered nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
          <div className="ml-2">
            <LanguageSwitcher />
          </div>
        </nav>

        {/* Mobile: hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-border bg-card p-0">
            <SheetHeader className="border-b border-border/60 p-4 text-left">
              <SheetTitle className="flex items-center">
                <Logo markSize={28} />
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 p-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border-r-2 px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 size-5 shrink-0",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="flex flex-col">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          active ? "text-primary" : "text-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-border/60 p-4">
              <LanguageSwitcher fullWidth onLanguageChange={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default CompactNavigation;
