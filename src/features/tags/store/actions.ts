import { TagGetters } from '@/features/tags/store/getters';
import { TagMutations } from '@/features/tags/store/mutations';
import { generateId } from '@/store';
import { Actions } from 'vuex-smart-module';
import { TagState } from './state';

export class TagActions extends Actions<TagState, TagGetters, TagMutations, TagActions> {}
