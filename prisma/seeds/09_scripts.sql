INSERT INTO "Script" ("id", "mapId", "script", "x", "y") VALUES (9, 1, 'this.mapHandler.active.drawImage(SpriteBank.getSprite(''utility'', ''truck''), 1, 8.5);', NULL, NULL);
SELECT setval('public."Script_id_seq"', (SELECT MAX(id) FROM "Script"));