import { State } from '@/store/state';
import { Store } from 'vuex';
import { CountdownTimer } from './countdown-timer';

let timer: CountdownTimer | null = null;

export const PersistPlugin = (store: Store<State>) => {
    store.subscribe((p, s) => {
        if (isWhitelisted(p.type)) {
            /*
             * Start up a countdown timer. Every mutation that should trigger a save will
             * either start a new counter, or add remaining time to it. When the timer hits
             * 0 we save off to file.
             */
            if (timer == null || timer.isFinished) {
                timer = new CountdownTimer(function() {
                    store.dispatch('app/save');
                }, 250);
            } else {
                timer.add(250);
            }
        }
    });
};

function isWhitelisted(mutation: string) {
    switch (mutation) {
        case 'app/UPDATE_STATE':
        case 'app/EXPAND_TAGS':
        case 'app/CREATE_TAG':
        case 'app/CREATE_TAG_CONFIRM':
        case 'app/CREATE_TAG_CANCEL':
        case 'app/UPDATE_TAG':
        case 'app/UPDATE_TAG_CONFIRM':
        case 'app/UPDATE_TAG_CANCEL':
        case 'app/SORT_TAGS':
        case 'app/DELETE_TAG':
        case 'app/DELETE_ALL_TAGS':
        case 'app/EXPAND_NOTEBOOKS':
        case 'app/CREATE_NOTEBOOK':
        case 'app/CREATE_NOTEBOOK_CONFIRM':
        case 'app/CREATE_NOTEBOOK_CANCEL':
        case 'app/UPDATE_NOTEBOOK':
        case 'app/UPDATE_NOTEBOOK_CREATE':
        case 'app/UPDATE_NOTEBOOK_CANCEL':
        case 'app/SORT_NOTEBOOKS':
        case 'app/DELETE_NOTEBOOKS':
        case 'app/DRAG_NOTEBOOK_STOP':
            return true;
        default:
            return false;
    }
}
