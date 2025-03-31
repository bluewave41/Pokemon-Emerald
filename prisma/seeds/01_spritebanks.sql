INSERT INTO "SpriteBank" ("id", "name") VALUES (1, 'player');
SELECT setval('public."SpriteBank_id_seq"', (SELECT MAX(id) FROM "SpriteBank"));