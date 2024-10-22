import axios from "axios";
import { z } from "zod";
import { bufferSchema } from "../schemas/BufferSchema";
import { GameMap } from "../lib/GameMap";

const schema = z.object({
  map: bufferSchema,
});

export async function fetchMap(key: string) {
  const response = await axios.post("/api/maps", { name: key });

  const result = await schema.safeParseAsync(response.data);
  if (result.error) {
    console.log(result.error);
    throw new Error(`Failed loading pack: ${key}`);
  }

  return await GameMap.loadMap(key, Buffer.from(result.data.map.data));
}
