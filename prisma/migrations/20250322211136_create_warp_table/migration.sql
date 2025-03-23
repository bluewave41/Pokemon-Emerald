-- CreateTable
CREATE TABLE "Warp" (
    "eventId" INTEGER NOT NULL,
    "target" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Warp_eventId_key" ON "Warp"("eventId");

-- AddForeignKey
ALTER TABLE "Warp" ADD CONSTRAINT "Warp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warp" ADD CONSTRAINT "Warp_target_fkey" FOREIGN KEY ("target") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
