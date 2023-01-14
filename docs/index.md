# Intro

The docs assume you're already familiar with Github Flavored Markdown. If this is your first time hearing about Github Flavored Markdown (GFM) please take a moment to read through the specs: https://github.github.com/gfm/ or at least the intro section.

# The Note Directory

Seismic Notes stores all of it's notes in a folder of your choosing on your computer's file system. The very first time you open Seismic a modal will prompt you to select where to store notes. Once the note directory has been set up, Seismic will save it off to the config file.

If you accidentally pick the wrong directory and would like to change it, this can be done via File menu atop the window:

![Change note directory](https://github.com/EddieAbbondanzio/seismic-notes/blob/master/docs/images/change-data-directory.png)

Or by manually updating the `noteDirectory` property in `config.json`.

# Notes

Notes are stored as plain text in the note directory.

Each note itself will be a folder within the note directory. The folder will have a randomly generated uuid as the name, and within it there should be an `index.md`, `metadata.json` and an `attachments` folder.

![Note folders within the note directory](https://github.com/EddieAbbondanzio/seismic-notes/blob/master/docs/images/notes-in-the-fs.png)

What the inside of a note folder looks like:
![Note folders within the note directory](https://github.com/EddieAbbondanzio/seismic-notes/blob/master/docs/images/note-folder.png)

- `index.md`: The markdown content of the note
- `metadata.json`: Any metadata about the note such as name, date created, sort method for children notes, and more.
- `attachments` directory: Where attachments inserted into the note live.
