INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (16, 25, 2, 3, 'STAIRS', 'UP');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (38, 68, 2, 1, 'DOOR', 'UP');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (75, 106, 1, 1, 'DOOR', 'DOWN');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (76, 107, 1, 1, 'DOOR', 'DOWN');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (77, 108, 3, 3, 'STAIRS', 'UP');
SELECT setval('public."Warp_id_seq"', (SELECT MAX(id) FROM "Warp"));