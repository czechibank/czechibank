"use client";

import React, { useEffect, useState } from "react";

export const AppFooter: React.FC = () => {
  const [version, setVersion] = useState<string>("loading...");

  useEffect(() => {
    fetch("/api/v1/about")
      .then((res) => res.json())
      .then((data) => setVersion(data.data.version))
      .catch(() => setVersion("unknown"));
  }, []);

  return (
    <footer className="mt-8 border-t border-gray-300 pt-4 text-center text-sm text-gray-600">Version: {version}</footer>
  );
};
