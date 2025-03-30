-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SIGN', 'WARP');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('UP', 'DOWN', 'LEFT', 'RIGHT');

-- CreateEnum
CREATE TYPE "WarpType" AS ENUM ('DOOR', 'CAVE', 'STAIRS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Map" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "backgroundTileId" INTEGER,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tile" (
    "id" SERIAL NOT NULL,
    "hash" CHAR(32) NOT NULL,
    "original" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "overlay" BOOLEAN NOT NULL DEFAULT false,
    "animated" BOOLEAN NOT NULL DEFAULT false,
    "sequence" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "delay" INTEGER,
    "activatedAnimation" BOOLEAN,
    "warpType" "WarpType",

    CONSTRAINT "Tile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TileFrame" (
    "id" SERIAL NOT NULL,
    "tileId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "TileFrame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapTile" (
    "id" SERIAL NOT NULL,
    "mapId" INTEGER NOT NULL,
    "tileId" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "permissions" INTEGER NOT NULL,

    CONSTRAINT "MapTile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "mapId" INTEGER NOT NULL,
    "type" "EventType" NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sign" (
    "eventId" INTEGER NOT NULL,
    "text" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Warp" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "mapId" INTEGER,
    "warpId" INTEGER,
    "type" "WarpType" NOT NULL,
    "direction" "Direction" NOT NULL,

    CONSTRAINT "Warp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpriteBank" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SpriteBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sprites" (
    "id" SERIAL NOT NULL,
    "bankId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "Sprites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Map_name_key" ON "Map"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tile_hash_key" ON "Tile"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "TileFrame_data_key" ON "TileFrame"("data");

-- CreateIndex
CREATE UNIQUE INDEX "MapTile_mapId_x_y_key" ON "MapTile"("mapId", "x", "y");

-- CreateIndex
CREATE UNIQUE INDEX "Sign_eventId_key" ON "Sign"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Warp_eventId_key" ON "Warp"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "SpriteBank_name_key" ON "SpriteBank"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sprites_bankId_name_key" ON "Sprites"("bankId", "name");

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_backgroundTileId_fkey" FOREIGN KEY ("backgroundTileId") REFERENCES "Tile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TileFrame" ADD CONSTRAINT "TileFrame_tileId_fkey" FOREIGN KEY ("tileId") REFERENCES "Tile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapTile" ADD CONSTRAINT "MapTile_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapTile" ADD CONSTRAINT "MapTile_tileId_fkey" FOREIGN KEY ("tileId") REFERENCES "Tile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warp" ADD CONSTRAINT "Warp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warp" ADD CONSTRAINT "Warp_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprites" ADD CONSTRAINT "Sprites_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "SpriteBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
