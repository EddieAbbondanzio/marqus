import { State } from '@/store/state';
import { fileSystem } from '@/utils/file-system';
import path from 'path';
import { ActionTree } from 'vuex';
import { AppState, state } from './state';

const FILE_NAME = 'app.json';

export const actions: ActionTree<AppState, State> = {};
