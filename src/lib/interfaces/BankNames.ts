import { z } from 'zod';

export type BankNames = 'player' | 'npc-fat' | 'mom' | 'utility' | 'misc' | 'vigoroth';

export const bankNamesSchema = z.enum(['player', 'npc-fat', 'mom', 'utility', 'misc', 'vigoroth']);
