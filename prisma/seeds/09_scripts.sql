INSERT INTO "Script" ("id", "name", "mapId", "script", "x", "y") VALUES (31, 'jump_from_truck_intro', 1, '
const active = this.activeMap;
const tiles = [active.getTile(5, 8), active.getTile(5, 7)];
const mom = new NPC(''mom'', 5, 8, active, true);
const player = this.player;

active.entities.push(new Sprite(1, 8.5, ''utility'', ''truck'', active).setPriority(1));
this.player.coords.setCoords(3, 10);
this.player.jump(''RIGHT'');

await GameEvent.waitForOnce(''movementFinished'');
await sleep(500);
tiles.forEach((tile) => tile.playForward());
await GameEvent.waitForOnce(''animationComplete'');
active.entities.push(mom);
await sleep(200);
await mom.walk(''DOWN'');
tiles.forEach((tile) => tile.playReversed());
await GameEvent.waitForOnce(''animationComplete'');
await sleep(200);
await mom.walk(''DOWN'');
mom.direction = ''LEFT'';
await this.showMessageBox("MOM: A, we''re here, honey!");
await this.showMessageBox(''It must be tiring riding with our things/in the moving truck.'');
await this.showMessageBox(''Well, this is LITTLEROOT TOWN.'');
await this.showMessageBox(''How do you like it?/This is our new home!'');
await this.showMessageBox(
	"It has a quaint feel, but it seems to be/an easy place to live, don''t you think?"
);
await this.showMessageBox("And, you get your own room, A!/Let''s go inside.");
await Promise.all([mom.walk(''UP''), player.walk(''RIGHT'')]);
tiles.forEach((tile) => tile.playForward());
await GameEvent.waitForOnce(''animationComplete'');
await Promise.all([mom.walk(''UP''), player.walk(''UP'')]);
mom.setVisible(false);
await player.walk(''UP'');
player.setVisible(false);
tiles.forEach((tile) => tile.playReversed());
await GameEvent.waitForOnce(''animationComplete'');
await sleep(300);
this.canvas.elements.addElement(new FadeOutRect());
await this.loadMapById(2, 1, WarpType.DOOR);
this.canvas.elements.removeElement(''fadedOut'');
this.canvas.elements.addElement(new FadeInRect());
player.setVisible(true);', NULL, NULL);
INSERT INTO "Script" ("id", "name", "mapId", "script", "x", "y") VALUES (44, 'test', 2, 'const active = this.activeMap;
active.entities.push(new Sprite(3.7, 4.1, ''misc'', ''vigroth-up1'', active));', NULL, NULL);
SELECT setval('public."Script_id_seq"', (SELECT MAX(id) FROM "Script"));