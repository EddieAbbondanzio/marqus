# Links

Link to websites on the internet, or to other notes in your note directory.

## Links to the Web

Can be added via the normal GFM syntax: `[Text](http:website-url.com)`

## Linking Between Notes

Notes can be linked by using their path.

For example, if your notes looked like:

- Foo
  - Bar
- Baz

You could link to Foo via `[Click to open Foo](note://Foo)`

Or link to nested note `[Bar](note://Foo/Bar)`

\*\* Note links are case-sensitive.

### Notes With Spaces in Their Names

If your note has a name that contains spaces you'll need to url encode them.

This means swapping each space " " for "%20".

Ex: note "Foo bar" could be linked via `[Link](note://Foo%20bar)`
