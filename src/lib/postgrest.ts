import { PostgrestClient } from "@supabase/postgrest-js";

const POSTGREST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const POSTGREST_SCHEMA = process.env.POSTGREST_SCHEMA || "public";
const POSTGREST_API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createPostgrestClient() {
  // Append /rest/v1 if not present, as Supabase PostgREST endpoint is there
  const baseUrl = POSTGREST_URL.endsWith("/rest/v1")
    ? POSTGREST_URL
    : `${POSTGREST_URL}/rest/v1`;

  const client = new PostgrestClient(baseUrl, {
    schema: POSTGREST_SCHEMA,
    fetch: (...args) => {
      let [url, options] = args;

      if (url instanceof URL || typeof url === "string") {
        const urlObj = url instanceof URL ? url : new URL(url);
        const columns = urlObj.searchParams.get("columns");

        if (columns && columns.includes('"')) {
          const fixedColumns = columns.replace(/"/g, "");
          urlObj.searchParams.set("columns", fixedColumns);
          url = urlObj.toString();
        }
      }

      return fetch(url, {
        ...options,
      } as RequestInit);
    },
  });

  client.headers.set("Content-Type", "application/json");

  if (POSTGREST_API_KEY) {
    client.headers.set("apikey", POSTGREST_API_KEY);
    client.headers.set("Authorization", `Bearer ${POSTGREST_API_KEY}`);
  }
  return client;
}
