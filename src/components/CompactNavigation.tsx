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
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl">
      {/* Ambient gold halo bleeding down from the bar */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-12 h-12 bg-gradient-to-b from-primary/10 to-transparent" />
      {/* Glowing gold hairline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo (mobile + desktop) */}
        <button
          onClick={() => handleNavigation("/")}
          className="group flex items-center transition-transform duration-300 hover:scale-[1.03]"
          aria-label="BaziGPT home"
        >
          <Logo markSize={30} shimmer />
        </button>

        {/* Desktop: centered nav */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium tracking-wide transition-colors duration-300",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6",
                    active && "drop-shadow-[0_0_6px_rgba(201,162,39,0.7)]"
                  )}
                />
                <span className={cn(active && "text-gold-shimmer")}>{item.label}</span>
                {/* Animated underline that grows from center */}
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-3 bottom-1 h-px origin-center bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </button>
            );
          })}
        </nav>

        {/* Desktop: language */}
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

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

            <div className="mt-auto border-t border-border/60 p-3">
              <LanguageSwitcher
                variant="inline"
                onLanguageChange={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default CompactNavigation;
