import { authenticateRequest } from "@/app/api/v1/auth";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";

export function handleGetAllBankAccounts(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  return authenticateRequest(request).andThen(() => bankAccountService.getAllBankAccountsResult({ page, limit }));
}
