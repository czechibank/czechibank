import { createAccessControl } from "better-auth/plugins/access";
import { adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  project: ["create", "share", "update", "delete", "read"], // <-- Permissions available for created roles
  users: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const visitor = ac.newRole({
  project: ["read"],
  users: ["create"],
});

export const user = ac.newRole({
  project: ["create"],
  users: ["create"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  project: ["create", "update"],
  users: ["create", "update", "delete"],
});
