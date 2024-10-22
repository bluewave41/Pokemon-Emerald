import { NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "fs";

const schema = z.object({
  name: z.string(),
});

export async function POST(req: Request) {
  const result = await schema.safeParseAsync(await req.json());
  if (result.error) {
    return NextResponse.json(
      {
        error: "Invalid bank name.",
      },
      { status: 400 }
    );
  }

  const { name } = result.data;

  return NextResponse.json({
    sprites: await fs.readFile(`./public/sprites/${name}/sprites.pack`),
  });
}
