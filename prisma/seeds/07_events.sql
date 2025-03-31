INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (1, 1, 'WARP', 5, 9);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (2, 2, 'WARP', 8, 8);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (3, 2, 'WARP', 9, 8);
SELECT setval('public."Event_id_seq"', (SELECT MAX(id) FROM "Event"));