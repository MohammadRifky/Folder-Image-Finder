console.log("Javascript has been loaded successfully");
let imageData = [];
const feedback = document.getElementById('feedback');
const textSearch = document.getElementById('textSearch');
const searchBtn = document.getElementById('search-btn');


const readFolder = (event) =>{
  feedback.classList.remove("hidden");
  let files = event.target.files;
  var relativePath = files[0].webkitRelativePath;
  var folder = relativePath.split("/");
  //notifting the images being scanned
  const imageQuantity = document.getElementById('imageQuantity');
  imageQuantity.innerHTML = files.length;
  //notifying folder being scanned
  const folderName = document.getElementById('folderName');
  folderName.innerHTML = folder[0];
  for (let i=0; i<files.length; i++){
    let file = files[i];
    Tesseract.recognize(
      file,
      'eng',
      // visualizing progress
      { logger: m => {
          console.log(m);
          let progressBar =  document.getElementById('readProgress');
          let progress = m.status === "recognizing text" ? (Math.round(m.progress *10)/10) *100  : 0 ;
          progressBar.style.width = progress+ "%";
          progressBar.innerHTML = progress+ "%";
        }
      }
    ).then(({ data: { text } }) => {
      feedback.innerHTML = `<p class="p text-success">Images are successfully scanned!</p>`
      imageData.push(
        {
          imgName:file.name,
          imgText: text
        }
      );
      textSearch.disabled = false;
      searchBtn.disabled = false;
      console.log(imageData);
    })
  }
}


const searchText = (event) =>{
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    event.target.classList.add('was-validated')
    return;
  }
  event.target.classList.add('was-validated')
  const search = document.getElementById('textSearch').value.toLowerCase();
  console.log(search);
  console.log(imageData);
  const matchingImages = imageData.filter( image => image.imgText.toLowerCase().includes(search));
  console.log(matchingImages);
  displayResults(matchingImages);
}


const displayResults = (results = []) => {
  const resultArea = document.getElementById('picturePreview');
  if(results.length == 0){
    resultArea.innerHTML = `<p class="p text-danger text-center">No results found! Please try with a different keyword</p>`;
    return;
  }
  let html = '';
  resultArea.innerHTML = results.map((result) => {
    html += `<div class="col-md-4 my-3">
              <div class="card">
                  <img src="https://www.saleme.lk/saleme/images/uploads/52572/saleme_5db453bc2ca56.jpg" class="card-img-top" alt="...">
                  <div class="card-body">
                      <h5 class="card-title">${result.imgName}</h5>
                  </div>
              </div>
            </div>`;
  })
  resultArea.innerHTML = html;
}