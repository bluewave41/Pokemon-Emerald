INSERT INTO "Sign" ("id", "eventId", "text") VALUES (35, 118, 'LITTLEROOT TOWN/"A town that can''t be shaded any hue."');
SELECT setval('public."Sign_id_seq"', (SELECT MAX(id) FROM "Sign"));