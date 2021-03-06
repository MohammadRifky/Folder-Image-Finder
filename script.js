if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
  });
}
let imageData = [];
const feedback = document.getElementById('feedback');
const folderUpload = document.getElementById('folderUpload');
const main_buttons = document.getElementById('main-btn');
const saveButton = document.getElementById('save-data');
const searchForm = document.getElementById('search-form');
const progressBar =  document.getElementById('readProgress');
const searchedText = document.getElementById('searchedFor');
const saveContainer = document.getElementById('save-container');
const searchText = (event) =>{
  event.preventDefault();
  if (!event.target.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    event.target.classList.add('was-validated')
    return;
  }
  feedback.classList.add('hidden');
  event.target.classList.add('was-validated')
  const search = document.getElementById('textSearch').value.toLowerCase();
  searchedText.innerHTML = `<p class="p">Results for images with the text "${search}"<p>`;
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
    previewImage(result.imgName)
    html += `<div class="col-md-4 my-3">
              <div class="card shadow-lg rounded-lg" id="preview-${result.imgName}">
                  <div class="card-body">
                      <h5 class="card-title">${result.imgName}</h5>
                  </div>
              </div>
            </div>`;
  })
  resultArea.innerHTML = html;
}
//folderUpload.files;
const previewImage = async (image_name) =>{
  const image_handler = await window.dirHandle.getFileHandle(image_name);
  let img_preview = await image_handler.getFile();
  let reader = new FileReader();
  reader.addEventListener("load", function() {
    let image = new Image();
    image.classList.add('img-preview');
    image.src = this.result;
    console.log(image);
    document.getElementById('preview-'+image_name).appendChild(image);
  });
  reader.readAsDataURL(img_preview);
}
const files = [];
const scheduler = Tesseract.createScheduler();
const worker = Tesseract.createWorker({
  logger: m => {
    console.log(m)
    if(m.status === "recognizing text"){
      progressBar.classList.remove('bg-warning');
      let progress = (Math.round(m.progress *10)/10)*100;
      progressBar.style.width = progress+ "%";
      progressBar.innerHTML = progress+ "%";
    }
  }
});
const worker2 = Tesseract.createWorker();
const butDir = document.getElementById('test_folder');
butDir.addEventListener('click', async () => {
  dirHandle = await window.showDirectoryPicker();
  folder = dirHandle.name;
  for await (const entry of dirHandle.values()) {
    //console.log(entry.kind, entry.name);
    let fileName = entry.name;
    let filehandler = await dirHandle.getFileHandle(fileName);
    let file = await filehandler.getFile();
    //notifying the progress
    feedback.classList.remove("hidden");
    progressBar.style.width = "100%";
    progressBar.classList.add('bg-warning');
    progressBar.innerHTML = "Intializing...";
    //notifying folder being scanned
    const folderName = document.getElementById('folderName');
    folderName.innerHTML = folder;

    files.push(file);
  }
  console.log(files); 
  const scanned_data = await recognize();
  files.forEach((file, index)=>{
    let fileName = file.name;
    imageData[index] = {};
    imageData[index].imgName = fileName;
    const imageText = scanned_data[index].data.text;
    imageData[index].imgText = imageText;
  })
  feedback.innerHTML = `<p class="p text-success">Images are successfully scanned!</p>`;
  searchForm.classList.toggle('hidden');
  saveContainer.classList.toggle('hidden');
});
const recognize = async () => {
  await worker.load();
  await worker2.load();
  await worker.loadLanguage('eng');
  await worker2.loadLanguage('eng');
  await worker.initialize('eng');
  await worker2.initialize('eng');
  scheduler.addWorker(worker);
  scheduler.addWorker(worker2);
  /** Add 10 recognition jobs */
  const results = await Promise.all(files.map((file) => (
    scheduler.addJob('recognize', file)
  )))
  return results;
};
//save button
document.getElementById('save-data').addEventListener('click', ()=>{
  localStorage.setItem("Image-finder:"+window.folder , JSON.stringify(imageData) );
});
//scan exisitng
const scannedFolders = [];
const displayExisting = document.getElementById('display_existing_folders');
document.getElementById('scanExisting').addEventListener('click', ()=>{
  let keys = Object.keys(JSON.parse(JSON.stringify(localStorage)));
  keys.forEach(key => {
    if(key.startsWith("Image-finder:")){
      scannedFolders.push(key.slice(13));
    }
  });
  console.log(scannedFolders);
  scannedFolders.forEach((folder) =>{
    displayExisting.innerHTML += `<div class="d-flex justify-content-between align-items-center bg-primary px-3 py-2 border-rounded">
      <p class="text-white">${folder}</p>
      <button class="btn btn-secondary" id="scan-${folder}" onclick="scanExisting(this.id)">Select</button>
    </div>`;
  })
})
const scanExisting = (id) =>{
  const keytoSearch = id.slice(5);
  console.log(keytoSearch);
  const existingData = JSON.parse(localStorage.getItem("Image-finder:"+keytoSearch));
  imageData.push(existingData[0]);
  console.log(imageData);
  feedback.innerHTML = `<p class="p text-success">Images within ${keytoSearch} can be searched</p>`;
}