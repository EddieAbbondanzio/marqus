import { v4 as uuidv4 } from 'uuid';

export interface Entity {
    id: string;
}

/**
 * Generate a new entity id.
 */
export const generateId = uuidv4;
