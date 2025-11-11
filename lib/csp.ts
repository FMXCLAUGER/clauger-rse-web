import { headers } from "next/headers"

export async function getCSPNonce(): Promise<string | null> {
  const headersList = await headers()
  return headersList.get("x-nonce")
}
