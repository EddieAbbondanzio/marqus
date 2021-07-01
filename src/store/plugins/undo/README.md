# Vuex Undo

Undo is a plugin for Vuex that adds modular support for undo / redo. The undo plugin can be thought of as a timeline that keeps track of the order mutations were commited in. Mutations can be grouped together via groups so that an undo won't leave the app in an invalid state, and the timelines can be modularized to allow us to undo mutations only within a certain area if desired.

# How To Use

## Groups

Sometimes we'll want to group together mutations such that an undo or redo doesn't leave the app in a weird partial state. This is why groups were added.

Create a group using the helper `undo.group()`. Underneath the hood the function handles creating a new mutation group with it's namespaced module, and closing it from being further editted once done.

The `undoGroup` property is a unique id that needs to be passed as a property on the parameter object for each commit. This is required because when mutations are being commited in async functions we can't guarentee that they will be commited in a sequential order.

```
undo.group('namespaceFoo', (undoGroup) => {
    commit('a', {val: 1, undoGroup });
    commit('b', {val: 2, undoGroup });
});
```

# A Word of Caution

The plugin itself is written in a slightly complex manner because there are a few edge cases that need to be considered. For example, since mutations can be commited async (IE in an action, or async method) we can't always guarantee they were commited in a sequential order. A long running task that commits several mutations over a few seconds could be executed at the same time as other taks.

# Resources

The following were used as reference.

https://github.com/factorial-io/undo-redo-vuex
https://github.com/anthonygore/vuex-undo-redo
