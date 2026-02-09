"use server";

import { v4 as uuidv4 } from "uuid";

export async function generateRequestId(): Promise<string> {
  return Promise.resolve(uuidv4());
}
