import { fail } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import type { PageServerLoad } from './$types.js';
import prisma from '$lib/prisma.js';

export const load: PageServerLoad = async () => {
	const banks = await prisma.spriteBank.findMany();

	return {
		banks
	};
};

export const actions = {
	create: async ({ request }) => {
		const schema = zfd.formData({
			bank: zfd.text()
		});

		const result = await schema.safeParseAsync(await request.formData());
		if (result.error) {
			return fail(400);
		}

		const { bank } = result.data;

		await prisma.spriteBank.create({
			data: {
				name: bank
			}
		});
	}
};
