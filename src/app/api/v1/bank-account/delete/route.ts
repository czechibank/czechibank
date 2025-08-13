import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bankAccountId = searchParams.get("id");

    if (!bankAccountId) {
      return NextResponse.json({ error: "Missing bank account ID" }, { status: 400 });
    }
    const result = await bankAccountService.deleteBankAccount(bankAccountId);

    await bankAccountService.deleteBankAccount(bankAccountId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
