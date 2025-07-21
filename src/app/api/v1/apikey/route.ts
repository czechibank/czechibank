import { headers } from "next/headers";
import { auth } from "../../../../../auth";
import { checkUserAuthOrThrowError } from "../server-actions";

export async function GET(request: Request) {
  const user = await checkUserAuthOrThrowError(request);
  if ("error" in user) {
    return Response.json(user, { status: 401 });
  }

  const apiKeys = await auth.api.listApiKeys({ headers: await headers() });

  return Response.json(apiKeys);
}
