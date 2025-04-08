INSERT INTO "SpriteBank" ("id", "name") VALUES (1, 'player');
INSERT INTO "SpriteBank" ("id", "name") VALUES (2, 'npc-fat');
INSERT INTO "SpriteBank" ("id", "name") VALUES (3, 'mom');
SELECT setval('public."SpriteBank_id_seq"', (SELECT MAX(id) FROM "SpriteBank"));