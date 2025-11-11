import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("L'URL du site doit être valide")
    .default("https://rse.clauger.com"),
})

const formatErrors = (errors: z.ZodFormattedError<Map<string, string>, string>) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value) return `${name}: ${value._errors.join(", ")}\n`
    })
    .filter(Boolean)

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})

if (!parsed.success) {
  console.error(
    "❌ Variables d'environnement invalides:\n",
    ...formatErrors(parsed.error.format())
  )
  throw new Error("Variables d'environnement invalides")
}

export const env = parsed.data
