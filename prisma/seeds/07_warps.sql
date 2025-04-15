INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (16, 25, 2, 3, 'STAIRS', 'UP');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (82, 117, 2, 1, 'DOOR', 'UP');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (83, 119, 1, 1, 'DOOR', 'DOWN');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (84, 120, 1, 1, 'DOOR', 'DOWN');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (85, 121, 3, 3, 'STAIRS', 'UP');
SELECT setval('public."Warp_id_seq"', (SELECT MAX(id) FROM "Warp"));