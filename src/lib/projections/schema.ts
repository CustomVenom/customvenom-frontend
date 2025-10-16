import { z } from 'zod';

export const ReasonSchema = z.object({
  key: z.string(),
  label: z.string().optional(),
  // effect may be fraction (0.021) or percent (2.1)
  effect: z.number().optional()
});

export const ReasonsSchema = z.array(ReasonSchema);

export const ProjectionItemSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  player: z.object({
    id: z.string().or(z.number()).transform(String),
    name: z.string(),
    team: z.string().optional(),
    pos: z.string().optional()
  }),
  // required guardrail fields
  schema_version: z.string().or(z.number()).transform(String),
  last_refresh: z.string(), // ISO8601 preferred
  // example numeric fields (customize as needed)
  median: z.number().optional(),
  floor: z.number().optional(),
  ceiling: z.number().optional(),
  // reasons may be absent if none apply
  reasons: ReasonsSchema.optional()
});

export const ProjectionsPayloadSchema = z.object({
  ok: z.boolean().default(true),
  schema_version: z.string().or(z.number()).transform(String),
  last_refresh: z.string(),
  items: z.array(ProjectionItemSchema)
});

export type ProjectionItem = z.infer<typeof ProjectionItemSchema>;
export type ProjectionsPayload = z.infer<typeof ProjectionsPayloadSchema>;

export function parseProjectionsPayload(input: unknown): ProjectionsPayload | null {
  const r = ProjectionsPayloadSchema.safeParse(input);
  if (!r.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[projections] invalid payload:', r.error.issues);
    }
    return null;
  }
  return r.data;
}
