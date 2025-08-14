import { errorResponse } from "@/lib/response";
import { APIError } from "better-auth/api";
import { NextResponse } from "next/server";
import { ApiError } from "./api-error";

export { ApiError };

export async function handleErrors(error: ApiError | APIError) {
  if (error instanceof APIError) {
    return Response.json(errorResponse(error.message, error.status.toString(), undefined), {
      status: error.statusCode,
    });
  }
  return Response.json(errorResponse(error.message, error.code, error.details), { status: error.statusCode });
}

export async function DELETE(request: Request) {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function HEAD(request: Request) {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request) {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function POST(request: Request) {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function PUT(request: Request) {
  return new Response("Method Not Allowed", { status: 405 });
}
