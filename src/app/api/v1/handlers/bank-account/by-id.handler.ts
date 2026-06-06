import { authenticateRequest } from "@/app/api/v1/auth";
import { parseJsonBody } from "@/app/api/v1/handlers/shared/parse-json-body";
import { parsePathParams } from "@/app/api/v1/handlers/shared/parse-path-params";
import { RenameBankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { canSeeYourBankAccountDetailFeature as anyOneCanSeeYourBankAccountFeature } from "@/domain/features-domain/features-application-service";
import featuresService from "@/domain/features-domain/features-service";
import { type ApiRouteContext } from "@/lib/api/with-api-handler";
import { conflict, type AppError } from "@/lib/errors";
import { validateWithResult } from "@/lib/result-helpers";
import { errAsync, okAsync } from "neverthrow";
import { z } from "zod";

type IdParams = { id: string };

const idSchema = z.object({ id: z.string().cuid() });

export function handleGetBankAccountById(request: Request, context: ApiRouteContext<IdParams>) {
  return authenticateRequest(request)
    .andThen((user) =>
      parsePathParams(context.params, idSchema).andThen((parsed) =>
        featuresService.server
          .getAllFeaturesResult()
          .map((result) => anyOneCanSeeYourBankAccountFeature(result.items))
          .orElse(() => okAsync(false))
          .andThen((anyoneCanSee) =>
            anyoneCanSee
              ? bankAccountService.getBankAccountByIdResult(parsed.id)
              : bankAccountService.getBankAccountByIdAndUserIdResult(parsed.id, user.id),
          ),
      ),
    )
    .map((bankAccount) => ({ bankAccount }));
}

export function handleDeleteBankAccountById(request: Request, context: ApiRouteContext<IdParams>) {
  return authenticateRequest(request).andThen((user) =>
    parsePathParams(context.params, idSchema).andThen((parsed) =>
      bankAccountService.getBankAccountByIdAndUserIdResult(parsed.id, user.id).andThen((bankAccount) =>
        bankAccountService.deleteBankAccountResult(bankAccount, user.id).andThen((deleted) => {
          if (deleted.isActive !== false) {
            return errAsync<{ message: string }, AppError>(
              conflict("Bank account deletion failed, account still active"),
            );
          }
          return okAsync({ message: "Bank account deleted successfully" });
        }),
      ),
    ),
  );
}

export function handleRenameBankAccountById(request: Request, context: ApiRouteContext<IdParams>) {
  return authenticateRequest(request).andThen((user) =>
    parsePathParams(context.params, idSchema).andThen((parsed) =>
      parseJsonBody(request)
        .andThen((body) => validateWithResult(RenameBankAccountSchema, body))
        .andThen(({ name: newName }) =>
          bankAccountService
            .getBankAccountByIdAndUserIdResult(parsed.id, user.id)
            .andThen(() => bankAccountService.renameBankAccountResult(parsed.id, user.id, newName)),
        ),
    ),
  );
}
