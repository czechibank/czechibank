"use client";

import { User } from "@prisma/client";

export default function AdministrationClientPage({ user }: { user: User }) {
  return (
    <div>
      <h1>Administration Page</h1>
      <p>Welcome, {user.name}!</p>
      <p>This page is under construction.</p>
    </div>
  );
}
