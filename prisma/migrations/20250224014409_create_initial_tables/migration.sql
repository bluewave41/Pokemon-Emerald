-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maps" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "backgroundTileId" INTEGER,

    CONSTRAINT "Maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tiles" (
    "id" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "Tiles_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Users_uuid_key" ON "Users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Maps_name_key" ON "Maps"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tiles_hash_key" ON "Tiles"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "MapTile_mapId_x_y_key" ON "MapTile"("mapId", "x", "y");

-- AddForeignKey
ALTER TABLE "Maps" ADD CONSTRAINT "Maps_backgroundTileId_fkey" FOREIGN KEY ("backgroundTileId") REFERENCES "Tiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapTile" ADD CONSTRAINT "MapTile_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapTile" ADD CONSTRAINT "MapTile_tileId_fkey" FOREIGN KEY ("tileId") REFERENCES "Tiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
