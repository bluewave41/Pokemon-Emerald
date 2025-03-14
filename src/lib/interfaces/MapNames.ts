import { z } from 'zod';

export type MapNames = 'littleroot' | 'route101';

export const mapNamesSchema = z.enum(['littleroot', 'route101']);
