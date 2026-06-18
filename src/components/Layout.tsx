import React from "react";
import Footer from "./Footer";
import CompactNavigation from "./CompactNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Ambient celestial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-[-10%] h-[360px] w-[360px] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <CompactNavigation />

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
