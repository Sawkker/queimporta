-- CreateTable
CREATE TABLE "DatasetSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatasetSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "datasetSourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrbanData" (
    "id" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrbanData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UrbanData_timestamp_idx" ON "UrbanData"("timestamp");

-- CreateIndex
CREATE INDEX "UrbanData_metricId_idx" ON "UrbanData"("metricId");

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_datasetSourceId_fkey" FOREIGN KEY ("datasetSourceId") REFERENCES "DatasetSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrbanData" ADD CONSTRAINT "UrbanData_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
