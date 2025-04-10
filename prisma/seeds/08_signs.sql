INSERT INTO "Sign" ("id", "eventId", "text") VALUES (8, 21, 'LITTLEROOT TOWN\n"A town that can''t be shaded any hue."');
SELECT setval('public."Sign_id_seq"', (SELECT MAX(id) FROM "Sign"));