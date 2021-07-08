import { NotebookGetters } from '@/features/notebooks/store/getters';
import { NotebookMutations } from '@/features/notebooks/store/mutations';
import { State } from '@/store/state';
import { ActionTree } from 'vuex';
import { Actions } from 'vuex-smart-module';
import { NotebookState } from './state';

export class NotebookActions extends Actions<NotebookState, NotebookGetters, NotebookMutations, NotebookActions> {}
