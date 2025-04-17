-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "mapId" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "bank" INTEGER NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_bank_fkey" FOREIGN KEY ("bank") REFERENCES "SpriteBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
