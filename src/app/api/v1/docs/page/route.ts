// @vojtech-cerveny:
// spotlight/elements doesn't work properly with nextjs, so this is a workaround how to server it.
// it should be fine, we can switch to any other api docs provider if needed.
import { NextRequest, NextResponse } from "next/server";
import { env } from "process";

export async function GET(req: NextRequest) {
  const origin = env.HOST || req.nextUrl.origin;
  const apiDescriptionUrl = `${origin}/api/v1/docs`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Czechibank API Docs</title>
    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css" />
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <elements-api
      apiDescriptionUrl="${apiDescriptionUrl}"
      router="hash"
      layout="sidebar"
      tryItCredentialsPolicy="include"
    />
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
