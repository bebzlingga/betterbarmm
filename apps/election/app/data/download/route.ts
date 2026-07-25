import { readFile, stat } from "node:fs/promises";
import { join, normalize } from "node:path";
import { type NextRequest } from "next/server";

const datasetRoot = join(process.cwd(), "..", "..", "datasets", "election");

// Allowlist — never serve an arbitrary path from a query param.
const downloadableFiles = new Set([
  "election.min.json",
  "barmm_2026_developing_stories.json",
  "election-supplement.json",
]);

export async function GET(request: NextRequest) {
  const requestedFile = request.nextUrl.searchParams.get("file");

  if (!requestedFile || !downloadableFiles.has(requestedFile)) {
    return new Response("File not found", { status: 404 });
  }

  const filePath = normalize(join(datasetRoot, requestedFile));
  const fileStats = await stat(filePath);
  const body = await readFile(filePath);

  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": "application/json",
      "content-length": String(fileStats.size),
      "content-disposition": `attachment; filename="${requestedFile}"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
