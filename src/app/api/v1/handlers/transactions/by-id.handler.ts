import { authenticateRequest } from "@/app/api/v1/auth";
import transactionService from "@/domain/transaction-domain/transaction-service";
import { type ApiRouteContext } from "@/lib/api/with-api-handler";
import { ResultAsync } from "neverthrow";

type IdParams = { id: string };

export function handleGetTransactionById(request: Request, context: ApiRouteContext<IdParams>) {
  return ResultAsync.fromSafePromise(context.params).andThen(({ id }) =>
    authenticateRequest(request)
      .andThen((user) => transactionService.getTransactionDetailResult(id, user.id))
      .map((transaction) => ({ transaction })),
  );
}
