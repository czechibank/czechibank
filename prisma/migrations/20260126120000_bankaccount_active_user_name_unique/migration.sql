-- Enforce unique (userId, name) only for active accounts so soft-deleted rows do not block reuse.
CREATE UNIQUE INDEX "BankAccount_userId_name_active_key" ON "BankAccount" ("userId", "name") WHERE "isActive" = true;
