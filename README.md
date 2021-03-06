# Folder-Image-Finder
Ever been on a situation to search through a folder of images to find the exact image you have been looking for? But what if the folder contained more than what it is possible for you to search? Solution is here. Folder image finder is a progressive web app designed to search through the text content across all images and find you the one which you came looking for...
## How it works?
This uses the [Tesseract JS](https://github.com/naptha/tesseract.js) for OCR purposes and stores the data in the local storage of the browser in user's device. Then users can search the images through certain keywords in the text of the image which they remember.
### Technologies used
- Basic HTML and CSS for structure and styling
- Bootstrap for layout and responsive design
- Vanilla Javascript **No Libraries or Frameworks**
- ***Tesseract JS*** for OCR purposes
- File System Access API for handling inputs
- Workbox to provide caching, offline features and make it a PWA
