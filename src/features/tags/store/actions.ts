import { TagGetters } from '@/features/tags/store/getters';
import { TagMutations } from '@/features/tags/store/mutations';
import { State } from '@/store/state';
import { ActionTree } from 'vuex';
import { Actions } from 'vuex-smart-module';
import { TagState } from './state';

export class TagActions extends Actions<TagState, TagGetters, TagMutations, TagActions> {}
