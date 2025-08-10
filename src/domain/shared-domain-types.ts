import { ErrorContext } from "better-auth/react";

export type ResponseSuccessErrorType = {
  onSuccess: () => void;
  onError: (error: ErrorContext) => void;
};
