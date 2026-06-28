import type { DropRewardType } from "@/domain/drops-domain/drops-types";

/** Human-friendly label for a drop reward type, used in UI surfaces. */
export function rewardTypeLabel(type: DropRewardType | string): string {
  switch (type) {
    case "SUPER_TOKENS":
      return "Tokens";
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
