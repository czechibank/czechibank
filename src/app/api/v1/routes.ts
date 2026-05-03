import { NextResponse } from "next/server";

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
