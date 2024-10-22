import axios from "axios";
import { z } from "zod";
import { bufferSchema } from "../schemas/BufferSchema";

const schema = z.object({
  sprites: bufferSchema,
});

export async function fetchPack(key: string) {
  const response = await axios.post("/api/sprites", { name: key });
  const result = await schema.safeParseAsync(response.data);
  if (result.error) {
    console.log(result.error);
    throw new Error(`Failed loading pack: ${key}`);
  }

  return Buffer.from(result.data.sprites.data);
}
