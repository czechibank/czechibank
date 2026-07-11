import type { DropRewardType } from "@/domain/drops-domain/drops-types";

/** Human-friendly label for a drop reward type, used in UI surfaces. */
export function rewardTypeLabel(type: DropRewardType | string): string {
  switch (type) {
    case "SUPER_TOKENS":
      return "Super Tokens";
    case "BADGE":
      return "Badge";
    case "LOTTERY_ENTRY":
      return "Lottery";
    case "VAULT_BONUS":
      return "Vault bonus";
    case "DISPLAY_TITLE":
      return "Title";
    default:
      return type;
  }
}

/** Shared completed-at formatting for header chips and profile cards. */
export function formatCompletedAt(iso: string): string {
  return new Date(iso).toLocaleString();
}

/**
 * One toast line per completed drop, shared by the transfer and
 * create-account dialogs so reward labels stay consistent.
 */
export function formatDropToastLine(drop: { name: string; rewardType: string; rewardAmount?: number | null }): string {
  const reward =
    drop.rewardAmount != null
      ? `+${drop.rewardAmount} ${rewardTypeLabel(drop.rewardType)}`
      : rewardTypeLabel(drop.rewardType);
  return `· ${drop.name} (${reward})`;
}
