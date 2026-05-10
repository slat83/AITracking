import "dotenv/config";

import { prisma } from "../src/server/db/client";
import { processDueJobs } from "../src/server/jobs";

async function main() {
  const processedJobs = await processDueJobs();

  console.log(`Processed ${processedJobs} job(s).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
