# Commands

The intention of `/commands` is to provide a place for async business logic that the front end (renderer thread) relies on.
These commands are meant to abstract away the underlying implementations of saving / loading files and making and API calls.

The renderer thread should be kept agnostic of what is going on within the main thread.
