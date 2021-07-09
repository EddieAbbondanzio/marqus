import { NotebookGetters } from '@/features/notebooks/store/getters';
import { NotebookMutations } from '@/features/notebooks/store/mutations';
import { Actions } from 'vuex-smart-module';
import { NotebookState } from './state';

export class NotebookActions extends Actions<NotebookState, NotebookGetters, NotebookMutations, NotebookActions> {}
