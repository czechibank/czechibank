type BankAccountNameToastAction = "create" | "rename";

/**
 * Builds toast copy for create/rename actions using the final saved name.
 *
 * When the requested name was adjusted to keep it unique, the description
 * briefly explains that the original name was already taken.
 */
export function bankAccountNameSavedToast(args: {
  requestedName: string;
  savedName: string;
  action: BankAccountNameToastAction;
}): { title: string; description: string } {
  const requested = args.requestedName.trim();
  const saved = args.savedName.trim();
  const title = args.action === "create" ? "Bank Account Created" : "Bank Account Renamed";

  if (requested === saved) {
    return {
      title,
      description: args.action === "create" ? `“${saved}” created.` : `Renamed to “${saved}”.`,
    };
  }

  return {
    title,
    description: `Saved as “${saved}” — “${requested}” was already taken.`,
  };
}
