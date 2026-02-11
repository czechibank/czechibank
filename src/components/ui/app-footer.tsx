"use client";

import { useEffect, useState } from "react";

export const AppFooter = () => {
  const [version, setVersion] = useState("loading...");

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await fetch("/api/v1/about");
        const data = await res.json();
        setVersion(data.data.version);
      } catch (error) {
        console.error("Error fetching version:", error);
        setVersion("unknown");
      }
    };

    fetchVersion();
  }, []);

  return (
    <footer className="relative z-10 border-t-3 border-black bg-white py-4 text-center text-sm font-bold text-muted-foreground dark:bg-zinc-950">
      Version: {version}
    </footer>
  );
};
