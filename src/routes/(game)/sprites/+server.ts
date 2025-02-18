import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import { BufferHelper } from '$lib/BufferHelper';

export async function GET({ url }) {
	const schema = z.object({
		bank: z.string()
	});

	const result = await schema.safeParseAsync({
		bank: url.searchParams.get('bank')
	});

	if (result.error) {
		return json({ error: 'Bank parameter is missing.' }, { status: 400 });
	}

	const buffer = new BufferHelper(
		await fs.readFile(
			path.join(path.resolve('./static/sprites'), path.basename(result.data.bank) + '.bank')
		)
	);

	const images: { name: string; data: string }[] = [];

	const imageCount = buffer.readByte();
	for (let i = 0; i < imageCount; i++) {
		images.push({
			name: buffer.readString(),
			data: 'data:image/png;base64,' + buffer.readString()
		});
	}

	return json(images);
}
