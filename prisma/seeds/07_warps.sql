INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (1, 1, 2, 1, 'DOOR', 'UP');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (2, 2, 1, 1, 'DOOR', 'DOWN');
INSERT INTO "Warp" ("id", "eventId", "mapId", "warpId", "type", "direction") VALUES (3, 3, 1, 1, 'DOOR', 'DOWN');
SELECT setval('public."Warp_id_seq"', (SELECT MAX(id) FROM "Warp"));