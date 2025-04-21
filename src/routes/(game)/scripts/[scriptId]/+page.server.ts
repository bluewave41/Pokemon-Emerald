import prisma from '$lib/prisma.js';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

export async function load({ params }) {
	const { scriptId } = params;

	const script = await prisma.script.findFirst({
		where: {
			id: parseInt(scriptId)
		}
	});

	return {
		script
	};
}

export const actions = {
	update: async ({ request, params }) => {
		const fd = await request.formData();
		const schema = zfd.formData({
			x: z.string().transform((val) => (val === '' ? null : parseInt(val))),
			y: z.string().transform((val) => (val === '' ? null : parseInt(val))),
			condition: z.string().transform((val) => (val === '' ? null : val)),
			setup: z.string().transform((val) => (val === '' ? null : val)),
			script: zfd.text()
		});

		const result = await schema.safeParseAsync(fd);
		if (result.error) {
			console.log('error', result.error);
			return fail(400);
		}

		await prisma.script.update({
			data: {
				x: result.data.x,
				y: result.data.y,
				condition: result.data.condition,
				setup: result.data.setup,
				script: result.data.script
			},
			where: {
				id: parseInt(params.scriptId)
			}
		});
	}
};
