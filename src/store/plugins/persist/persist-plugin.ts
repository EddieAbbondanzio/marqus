import { State } from '@/store/state';
import { Store } from 'vuex';
import { CountdownTimer } from './countdown-timer';

const DELAY = 250;

let timer: CountdownTimer | null = null;

export const PersistPlugin = (store: Store<State>) => {
    store.subscribe((p, s) => {
        if (p.type === 'DIRTY') {
            /*
             * Start up a countdown timer. Every time dirty flag is set, a save will
             * either start a new counter, or add remaining time to it. When the timer hits
             * 0 we save off to file.
             */
            if (timer == null || timer.isFinished) {
                timer = new CountdownTimer(
                    function() {
                        store.dispatch('save');
                    },
                    DELAY,
                    DELAY
                );
            } else {
                timer.add(DELAY);
            }
        }
    });
};
