import { JWT_SECRET } from '$env/static/private';
import prisma from '$lib/prisma.js';
import { fail } from '@sveltejs/kit';
import argon2 from 'argon2';
import { zfd } from 'zod-form-data';
import jwt from 'jsonwebtoken';

export const actions = {
	login: async ({ request }) => {
		const schema = zfd.formData({
			username: zfd.text(),
			password: zfd.text()
		});

		const result = await schema.safeParseAsync(await request.formData());
		if (result.error) {
			return fail(400, { error: 'Username or password are missing.' });
		}

		const { username, password } = result.data;

		const user = await prisma.user.findFirst({
			select: {
				id: true,
				username: true,
				password: true
			},
			where: {
				username
			}
		});

		if (!user) {
			return fail(400, { error: 'Username or password are incorrect.' });
		}

		if (await argon2.verify(user?.password, password)) {
			const payload = {
				id: user.id,
				username: user.username
			};

			return jwt.sign(payload, JWT_SECRET);
		}
	},
	register: async ({ request }) => {
		const schema = zfd.formData({
			username: zfd.text(),
			password: zfd.text()
		});

		const result = await schema.safeParseAsync(await request.formData());
		if (result.error) {
			return fail(400, { error: 'Username or password are missing.' });
		}

		const { username, password } = result.data;

		// does the username already exist?
		const user = await prisma.user.findFirst({
			where: {
				username
			}
		});

		if (user) {
			return fail(409, { error: 'Username already exists.' });
		}

		await prisma.user.create({
			data: {
				username,
				password: await argon2.hash(password)
			}
		});
	}
};
