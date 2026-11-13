import { ContentValidationError, createContentStore } from "@/lib/content";

try {
  const { labs, paths, hubs, aiPages, resources } = createContentStore({
    rootDir: process.cwd(),
  }).load();
  console.log(
    `Content OK: ${labs.length} labs, ${paths.length} paths, ${hubs.length} hardware hubs, ${aiPages.length} AI pages, ${resources.length} resources.`,
  );
} catch (error) {
  if (!(error instanceof ContentValidationError)) throw error;
  console.error(error.message);
  process.exit(1);
}
