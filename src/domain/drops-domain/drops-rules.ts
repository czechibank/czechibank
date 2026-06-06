export type EvalContext = {
  requestBody: Record<string, unknown>;
  resultData: Record<string, unknown>;
};

function getAmount(ctx: EvalContext): number | undefined {
  const v = ctx.requestBody.amount;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function getBankAccountName(ctx: EvalContext): string | undefined {
  const fromResult = ctx.resultData.name;
  if (typeof fromResult === "string") return fromResult;
  const fromBody = ctx.requestBody.name;
  if (typeof fromBody === "string") return fromBody;
  return undefined;
}

function matchName(name: string, op: "eq" | "in" | "regex", values: string[], caseSensitive?: boolean): boolean {
  const n = caseSensitive ? name : name.toLowerCase();
  const vals = caseSensitive ? values : values.map((v) => v.toLowerCase());
  if (op === "eq") return vals.some((v) => n === v);
  if (op === "in") return vals.some((v) => n === v);
  try {
    return vals.some((pattern) => {
      const re = new RegExp(pattern, caseSensitive ? "" : "i");
      return re.test(name);
    });
  } catch {
    return false;
  }
}

export function evaluateRule(rule: unknown, ctx: EvalContext): boolean {
  if (!rule || typeof rule !== "object" || !("kind" in rule)) {
    return false;
  }
  const r = rule as {
    kind: string;
    of?: unknown[];
    equals?: number;
    gte?: number;
    op?: string;
    values?: string[];
    caseSensitive?: boolean;
  };

  switch (r.kind) {
    case "all": {
      const of = Array.isArray(r.of) ? r.of : [];
      if (of.length === 0) return true;
      return of.every((child) => evaluateRule(child, ctx));
    }
    case "any": {
      const of = Array.isArray(r.of) ? r.of : [];
      if (of.length === 0) return false;
      return of.some((child) => evaluateRule(child, ctx));
    }
    case "amount": {
      const amount = getAmount(ctx);
      if (amount === undefined) return false;
      if (r.equals !== undefined && amount !== r.equals) return false;
      if (r.gte !== undefined && amount < r.gte) return false;
      return true;
    }
    case "bank_account_name": {
      const name = getBankAccountName(ctx);
      if (!name || !r.op || !Array.isArray(r.values)) return false;
      if (r.op !== "eq" && r.op !== "in" && r.op !== "regex") return false;
      return matchName(name, r.op, r.values, r.caseSensitive);
    }
    default:
      return false;
  }
}
