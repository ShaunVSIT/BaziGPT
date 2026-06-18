import React from "react";
import Footer from "./Footer";
import CompactNavigation from "./CompactNavigation";
import CelestialBackground from "./brand/CelestialBackground";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background text-foreground">
      <CelestialBackground />

      <CompactNavigation />

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
