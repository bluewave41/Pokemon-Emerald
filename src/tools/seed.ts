import prisma from '$lib/prisma';
import { promises as fs } from 'fs';

async function main() {
	await handleBasicTable('spriteBank', '01_spritebanks.sql');
	await handleBasicTable('sprite', '02_sprites.sql');
	await handleBasicTable('tile', '03_tiles.sql');
	await handleBasicTable('map', '04_maps.sql');
	await handleBasicTable('tileFrame', '05_tile_frames.sql');
	await handleBasicTable('mapTile', '06_map_tiles.sql');
	await handleBasicTable('event', '07_events.sql');
	await handleBasicTable('warp', '07_warps.sql');
	await handleBasicTable('sign', '08_signs.sql');
	await handleBasicTable('script', '09_scripts.sql');
}

main();

async function handleBasicTable(tableName: string, fileName: string) {
	const data = await prisma[tableName].findMany({
		orderBy: {
			id: 'asc'
		}
	});

	await fs.writeFile(`prisma/seeds/${fileName}`, buildSql(tableName, data), {
		flag: 'w'
	});
}

function buildSql(tableName: string, records: any) {
	const capitalized = tableName.slice(0, 1).toUpperCase() + tableName.slice(1);
	console.log(capitalized);
	const sqlInserts = records
		.map((row) => {
			const columns = Object.keys(row)
				.map((col) => `"${col}"`)
				.join(', ');
			const values = Object.values(row)
				.map((value) => {
					if (Array.isArray(value)) {
						return value.length ? `ARRAY[${value}]` : 'NULL';
					}
					if (value === null) return 'NULL';
					if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
					return value;
				})
				.join(', ');

			return `INSERT INTO "${capitalized}" (${columns}) VALUES (${values});`;
		})
		.join('\n');

	return (
		sqlInserts +
		'\n' +
		`SELECT setval('public."${capitalized}_id_seq"', (SELECT MAX(id) FROM "${capitalized}"));`
	);
}
