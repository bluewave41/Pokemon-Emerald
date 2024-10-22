import { z } from "zod";

export const bufferSchema = z.object({
  type: z.literal("Buffer"),
  data: z.number().array(),
});
