INSERT INTO "Map" ("id", "name", "width", "height", "backgroundTileId") VALUES (1, 'littleroot', 20, 20, 3);
INSERT INTO "Map" ("id", "name", "width", "height", "backgroundTileId") VALUES (2, 'player-house', 11, 9, 90);
INSERT INTO "Map" ("id", "name", "width", "height", "backgroundTileId") VALUES (3, 'player-house-upstairs', 9, 8, 90);
INSERT INTO "Map" ("id", "name", "width", "height", "backgroundTileId") VALUES (4, 'route101', 20, 20, 3);
SELECT setval('public."Map_id_seq"', (SELECT MAX(id) FROM "Map"));