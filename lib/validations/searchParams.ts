import { z } from "zod"
import { TOTAL_PAGES } from "@/lib/constants"

export const reportPageSchema = z.object({
  page: z.coerce
    .number()
    .int("Le numéro de page doit être un entier")
    .positive("Le numéro de page doit être positif")
    .min(1, "La page minimum est 1")
    .max(TOTAL_PAGES, `La page maximum est ${TOTAL_PAGES}`)
    .default(1)
    .catch(1),
})

export type ReportPageParams = z.infer<typeof reportPageSchema>
