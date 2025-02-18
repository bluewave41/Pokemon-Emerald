import path from 'path';
import type { PageServerLoad } from './$types';
import { promises as fs } from 'fs';
import { zfd } from 'zod-form-data';
import { fail } from '@sveltejs/kit';
import { BufferHelper } from '$lib/BufferHelper';
import { removeExtension } from '$lib/utils/removeExtension';
import type { SpriteFile } from '$lib/interfaces/SpriteFile';

export const load: PageServerLoad = async ({ params }) => {
	const reader = new BufferHelper(
		await fs.readFile(
			path.join(path.resolve('./static/sprites'), path.basename(params.bank) + '.bank')
		)
	);

	const imageCount = reader.readByte();
	const images = [];
	for (let i = 0; i < imageCount; i++) {
		images.push({
			name: reader.readString(),
			data: reader.readString()
		});
	}

	return {
		sprites: images
	};
};

export const actions = {
	add: async ({ request }) => {
		const schema = zfd.formData({
			bank: zfd.text(),
			files: zfd
				.file()
				.or(zfd.file().array())
				.transform((files: File[] | File) => (Array.isArray(files) ? files : [files]))
		});

		const data = await request.formData();

		const result = await schema.safeParseAsync(data);
		if (result.error) {
			console.log(result.error);
			return fail(400);
		}

		const { bank } = result.data;
		const files = await Promise.all(
			result.data.files.map(async (file) => ({
				bytes: Buffer.from(await file.arrayBuffer()).toString('base64'),
				name: removeExtension(file.name)
			}))
		);

		const expandLength = files.reduce(
			(prev, curr) => prev + curr.bytes.length + curr.name.length + 4,
			0
		);

		const bankFile = await fs.readFile(
			path.join(path.resolve('./static/sprites'), path.basename(bank) + '.bank')
		);

		const buffer = new BufferHelper(bankFile);
		const imageCount = buffer.readByte();
		const images: SpriteFile[] = [];
		for (let i = 0; i < imageCount; i++) {
			images.push({
				name: buffer.readString(),
				data: buffer.readString()
			});
		}

		const errors = [];

		// make sure there aren't any duplicates
		for (const image of files) {
			const isImageAlreadyDefined = images.find(
				(definedImage) => definedImage.name === removeExtension(image.name)
			);
			if (isImageAlreadyDefined) {
				errors.push(`${image.name} is already defined.`);
			}
		}

		if (errors.length) {
			return fail(409, { errors });
		}

		buffer.seek(0);
		// update image count
		buffer.writeByte(imageCount + files.length);
		buffer.seek(buffer.length);
		buffer.expand(expandLength);

		for (const image of files) {
			buffer.writeString(image.name);
			buffer.writeString(image.bytes);
		}

		await fs.writeFile(`./static/sprites/${bank}.bank`, buffer.getUsed(), 'binary');
	}
};
