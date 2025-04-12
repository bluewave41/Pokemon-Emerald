INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (20, 1, 'WARP', 5, 9);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (21, 1, 'SIGN', 15, 13);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (22, 2, 'WARP', 8, 8);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (23, 2, 'WARP', 9, 8);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (24, 2, 'WARP', 8, 3);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (25, 3, 'WARP', 7, 2);
SELECT setval('public."Event_id_seq"', (SELECT MAX(id) FROM "Event"));