// Maranello component catalog data — barrel re-export (split for maintainability)

export interface CatalogEntry {
  name: string;
  slug: string;
  category: string;
  description: string;
  keywords: string[];
  whenToUse: string;
  filePath: string;
  propsInterface: string;
}

import { CATALOG_A } from './component-catalog-entries-a';
import { CATALOG_B } from './component-catalog-entries-b';
import { CATALOG_C } from './component-catalog-entries-c';

export const CATALOG: CatalogEntry[] = [...CATALOG_A, ...CATALOG_B, ...CATALOG_C];
