/*
  Warnings:

  - You are about to drop the `MapTile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MapTile" DROP CONSTRAINT "MapTile_mapId_fkey";

-- DropForeignKey
ALTER TABLE "MapTile" DROP CONSTRAINT "MapTile_tileId_fkey";

-- DropTable
DROP TABLE "MapTile";

-- CreateTable
CREATE TABLE "MapTiles" (
    "id" SERIAL NOT NULL,
    "mapId" INTEGER NOT NULL,
    "tileId" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "permissions" INTEGER NOT NULL,

    CONSTRAINT "MapTiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MapTiles_mapId_x_y_key" ON "MapTiles"("mapId", "x", "y");

-- AddForeignKey
ALTER TABLE "MapTiles" ADD CONSTRAINT "MapTiles_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapTiles" ADD CONSTRAINT "MapTiles_tileId_fkey" FOREIGN KEY ("tileId") REFERENCES "Tiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
