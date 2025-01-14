-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChannelMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChannelMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "channels_name_key" ON "channels"("name");

-- CreateIndex
CREATE INDEX "channels_name_idx" ON "channels"("name");

-- CreateIndex
CREATE INDEX "_ChannelMembers_B_index" ON "_ChannelMembers"("B");

-- AddForeignKey
ALTER TABLE "_ChannelMembers" ADD CONSTRAINT "_ChannelMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelMembers" ADD CONSTRAINT "_ChannelMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
