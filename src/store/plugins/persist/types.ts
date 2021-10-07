import { MutationPayload, Commit } from "vuex";
import { ArraySchema, ObjectSchema } from "yup";

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
   * Function that modifies the state object before it is written to file.
   */
  transformer?: (s: any) => any;
  /**
   * Function that modifies the state object after it is loaded from file.
   */
  reviver?: (s: any) => any;

  /**
   * yup schema to validate on load prior to invoking reviver
   */
  schema?: ObjectSchema<any> | ArraySchema<any>;

  /**
   * The name the file should be stored under.
   */
  fileName?: string;
  /**
   * Mutation to initialize store state. This will be commited after the json file of the store is loaded and revived.
   */
  setStateAction: string;
  /**
   * Actions that should be ignored
   */
  ignore?: string[];
  /**
   * Custom serialization handler. Will be called instead of the default handler that writes a JSON file.
   */
  serialize?: (
    s: any,
    context: {
      rootState: any;
      fileName: string;
      mutationPayload: MutationPayload;
      commit: Commit;
    }
  ) => Promise<void>;
  /**
   * Custom deserialization handler. Will be called instead of the default handler that reads a JSON file.
   */
  deserialize?: () => Promise<any>;
}

export interface PersistModule {
  settings: PersistModuleSettings;
  saving?: boolean;
}
