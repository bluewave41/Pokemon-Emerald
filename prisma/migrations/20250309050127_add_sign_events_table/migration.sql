-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signs" (
    "id" SERIAL NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Signs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Events_eventId_key" ON "Events"("eventId");
