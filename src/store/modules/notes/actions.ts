import { State } from '@/store/state';
import { fileSystem } from '@/utils/file-system';
import path from 'path';
import { ActionTree } from 'vuex';
import { Note, NoteState } from './state';

export const actions: ActionTree<NoteState, State> = {};
