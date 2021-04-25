export interface LocalNavigationState {
    width: string;
    files: {
        input?: { value: string };
    };
}

export const state: LocalNavigationState = {
    width: '200px',
    files: {}
};
