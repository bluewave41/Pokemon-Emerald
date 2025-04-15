INSERT INTO "Script" ("id", "name", "mapId", "condition", "setup", "script", "x", "y") VALUES (49, 'jump_from_truck_intro', 1, '!FlagSet.has(1);', 'const active = this.activeMap;
const mom = new NPC(''mom'', ''mom'', 5, 8, ''DOWN'', active, true);

active.entities.addEntity(new Sprite(''truck'', 2, 10, ''misc'', [''truck''], active).setPriority(1));
active.entities.addEntity(mom);

mom.setVisible(false);', 'const active = this.activeMap;
const tiles = [active.getTile(5, 8), active.getTile(5, 7)];
const mom = active.entities.getEntity(''mom'');
const player = this.player;

this.player.coords.setCoords(3, 10);
this.player.jump(''RIGHT'');

await GameEvent.waitForOnce(''movementFinished'');
await sleep(500);
tiles.forEach((tile) => tile.playForward());
await GameEvent.waitForOnce(''animationComplete'');
mom.setVisible(true);
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
await GameEvent.waitForOnce(''fadedOut'');
await this.loadMapById(2, 1, WarpType.DOOR);
this.canvas.elements.removeElement(''fadedOut'');
this.canvas.elements.addElement(new FadeInRect());
player.setVisible(true);
FlagSet.set(1);', NULL, NULL);
INSERT INTO "Script" ("id", "name", "mapId", "condition", "setup", "script", "x", "y") VALUES (50, 'enter_house', 2, '!FlagSet.has(2) && !FlagSet.has(3);', 'const active = this.activeMap;
const mom = new NPC(''mom'', ''mom'', 9, 8, ''UP'', active, true);
active.entities.addEntity(mom);
active.entities.addEntity(new NPC(''vigoroth-tv'', ''vigoroth'', 4, 5, ''UP'', active, true).setPath([''UP'']));
active.entities.addEntity(
	new NPC(''vigoroth-walk'', ''vigoroth'', 1, 3, ''RIGHT'', active, true).setPath([
			''RIGHT'',
			''RIGHT'',
			''RIGHT'',
			''LEFT'',
			''LEFT'',
			''LEFT''
	])
);
active.entities.addEntity(new Sprite(''box-open'', 5, 4, ''misc'', ''box-open'', active));
active.entities.addEntity(new Sprite(''box-closed'', 5, 2, ''misc'', ''box-closed'', active));', 'const active = this.activeMap;
this.player.coords.setCoords(8, 8);
const mom  = active.entities.getEntity(''mom'');
await this.showMessageBox("MOM: See, A?/Isn''t it nice in here, too?");
mom.direction = ''LEFT'';
this.player.direction = ''RIGHT'';
await this.showMessageBox(
	"The mover''s POKéMON do all the work/of moving us in and cleaning up after."
);
await this.showMessageBox(''This is so convenient!'');
await this.showMessageBox(''A, your room is upstairs./Go check it out dear!'');
await this.showMessageBox(''DAD bought you a new clock to mark/our move here.'');
await this.showMessageBox("Don''t forget to set it!");
this.player.walk(''UP'');
mom.direction = ''UP'';
FlagSet.set(2);', NULL, NULL);
INSERT INTO "Script" ("id", "name", "mapId", "condition", "setup", "script", "x", "y") VALUES (51, 'exit_house', 2, '', '', 'const active = this.activeMap;
const mom = active.entities.getEntity(''mom'');
mom.direction = ''LEFT'';
await this.showMessageBox("MOM: Well, A?");
await this.showMessageBox("Aren''t you interested in seeing your/very own room?");
this.player.walk(''UP'');
mom.direction = ''UP'';', 8, 8);
INSERT INTO "Script" ("id", "name", "mapId", "condition", "setup", "script", "x", "y") VALUES (52, 'exit_room_before_setting_clock', 2, 'FlagSet.has(2) && !FlagSet.has(3);', 'const active = this.activeMap;
const mom = new NPC(''mom'', ''mom'', 8, 4, ''UP'', active, true);
active.entities.addEntity(mom);
active.entities.addEntity(new NPC(''vigoroth-tv'', ''vigoroth'', 4, 5, ''UP'', active, true).setPath([''UP'']));
active.entities.addEntity(
	new NPC(''vigoroth-walk'', ''vigoroth'', 1, 3, ''RIGHT'', active, true).setPath([
			''RIGHT'',
			''RIGHT'',
			''RIGHT'',
			''LEFT'',
			''LEFT'',
			''LEFT''
	])
);
active.entities.addEntity(new Sprite(''box-open'', 5, 4, ''misc'', ''box-open'', active));
active.entities.addEntity(new Sprite(''box-closed'', 5, 2, ''misc'', ''box-closed'', active));
', 'const active = this.activeMap;
const mom = active.entities.getEntity(''mom'');
await this.showMessageBox("MOM: A.");
await this.showMessageBox("Go set the clock in your room, honey.");
await Promise.all([this.player.handleWarp(3), mom.walk(''UP'')]);
', NULL, NULL);
SELECT setval('public."Script_id_seq"', (SELECT MAX(id) FROM "Script"));