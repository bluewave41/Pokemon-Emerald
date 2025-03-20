import { z } from 'zod';

export type MapNames = 'littleroot' | 'route101' | 'oldale' | 'route102';

export const mapNamesSchema = z.enum(['littleroot', 'route101', 'oldale', 'route102']);
