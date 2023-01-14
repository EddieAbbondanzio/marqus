# Attachments

Attachments are images and files that are inserted into notes. Images will be rendered, and any other type of file will be a clickable link that will open up the appropriate application to handle them.

To make it super easy to add images, Seismic Notes supports dragging and dropping them into any note that is being actively edited.

![Drag and drop](https://github.com/EddieAbbondanzio/seismic-notes/blob/master/docs/images/drag-and-drop.gif)

## How Attachments Work

Notes can use any file within their `attachment` folder as an attachment.

To open a notes `attachment` folder, right click on it in the sidebar and select "Open attachments"
![Drag and drop](https://github.com/EddieAbbondanzio/seismic-notes/blob/master/docs/images/open-attachments.png)

Images can be inserted using: `![](attachment://image.jpg)`

Files can be inserted with: `[Link text](attachment://random-text.txt)`

## File Names With Spaces

Similar to note links, any file that contains a space in it's name will need to be URL encoded. This means swapping any spaces " " with "%20".

Ex to link an image called "Screenshot 3.jpg": `![](attachment://screenshot%203.jpg)`

## Fine Tune Image Height and Widths

If your image is too large, you can specify the dimensions of it by passing a `width` or `height` url parameter.

Ex to resize an image to 300x400: `![](attachment://large-image.jpg?width=300&height=400)`
