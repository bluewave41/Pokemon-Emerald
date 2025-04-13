INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (25, 3, 'WARP', 7, 2);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (68, 1, 'WARP', 5, 9);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (69, 1, 'SIGN', 15, 13);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (106, 2, 'WARP', 8, 8);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (107, 2, 'WARP', 9, 8);
INSERT INTO "Event" ("id", "mapId", "type", "x", "y") VALUES (108, 2, 'WARP', 8, 3);
SELECT setval('public."Event_id_seq"', (SELECT MAX(id) FROM "Event"));