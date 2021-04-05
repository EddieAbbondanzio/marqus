import { AppState } from './modules/app/state';
import { ConfigState } from './modules/config/config';
import { NotebookState } from './modules/notebooks/state';
import { TagState } from './modules/tags/state';

export interface State {
    config: ConfigState;
    app: AppState;
    tags: TagState;
    notebooks: NotebookState;
}
