import apikeyService from "@/domain/apikey/apikey-service";
import { headers } from "next/headers";
import { checkUserAuthOrThrowError } from "../server-actions";

export async function GET(request: Request) {
  const user = await checkUserAuthOrThrowError(request);
  if ("error" in user) {
    return Response.json(user, { status: 401 });
  }

  const apiKeys = await apikeyService.server.listUserApiKey(await headers());

  return Response.json(apiKeys);
}
