INSERT INTO "SpriteBank" ("id", "name") VALUES (1, 'player');
INSERT INTO "SpriteBank" ("id", "name") VALUES (2, 'npc-fat');
INSERT INTO "SpriteBank" ("id", "name") VALUES (3, 'mom');
INSERT INTO "SpriteBank" ("id", "name") VALUES (4, 'utility');
INSERT INTO "SpriteBank" ("id", "name") VALUES (5, 'misc');
INSERT INTO "SpriteBank" ("id", "name") VALUES (6, 'vigoroth');
SELECT setval('public."SpriteBank_id_seq"', (SELECT MAX(id) FROM "SpriteBank"));