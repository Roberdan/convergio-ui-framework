/** @convergio/core/config — Config loading and validation. */
export {
  loadAppConfig,
  loadNavSections,
  loadPageConfig,
  loadAIConfig,
  loadPageRoutes,
  loadLocaleOverrides,
} from "../../src/lib/config-loader";
export { rawConfigSchema, type ValidatedConfig } from "../../src/lib/config-schema";
export { blockSchema } from "../../src/lib/config-block-schemas";
