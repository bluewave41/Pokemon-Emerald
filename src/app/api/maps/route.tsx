import { NextResponse } from "next/server";
import { z } from "zod";
import { promises as fs } from "fs";

const schema = z.object({
  name: z.string(),
});

export async function POST(req: Request) {
  const result = schema.safeParse(await req.json());
  if (result.error) {
    console.log(result.error);
    return NextResponse.json(
      {
        error: "Missing name parameter",
      },
      { status: 400 }
    );
  }

  const [area, subArea] = result.data.name.split("/");

  return NextResponse.json({
    map: await fs.readFile(`./public/maps/${area}/${subArea}/${subArea}.map`),
  });
}
