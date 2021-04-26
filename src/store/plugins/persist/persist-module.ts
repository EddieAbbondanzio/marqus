import { TaskScheduler } from '@/utils/task-scheduler';

/**
 * Settings for a module that the persist plugin should be tracking.
 */
export interface PersistModuleSettings {
    /**
     * Namespace of the module
     */
    namespace: string;
    /**
     * List of mutations that should trigger save to file.
     */
    filter?: string[];
    /**
     * Function that modifies the state object before it
     * is written to file.
     */
    transformer?: (s: any) => any;
    /**
     * Function that modifies the state object after it is
     * loaded from file.
     */
    reviver?: (s: any) => any;
    /**
     * The name the file should be stored under.
     */
    fileName?: string;
    /**
     * Mutation to initialize store state. This will be commited
     * after the json file of the store is loaded and revived.
     */
    initiMutation: string;
}

export interface PersistModule {
    scheduler: TaskScheduler;
    settings: PersistModuleSettings;
}
