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
    <footer className="mt-8 border-t border-gray-300 pt-4 text-center text-sm text-gray-600">Version: {version}</footer>
  );
};
