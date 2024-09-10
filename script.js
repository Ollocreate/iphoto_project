document.getElementById('importForm').addEventListener('submit', function(event) {
    event.preventDefault();
});

document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("imageCanvas");
    const colorInfo = document.getElementById("color-info");
    const positionInfo = document.getElementById("position-info");
    const imageSizeInfo = document.getElementById("image-size-info");
    const fileUploadBtn = document.getElementById("file-upload");
    const urlUploadBtn = document.getElementById("url-upload");
    const resizeBtn = document.getElementById("resize-button");
    const saveBtn = document.getElementById("save-button");
    const colorSample = document.getElementById("color-sample");
    const scrollContainer = document.querySelector(".scroll-container");
    const scaleSelect = document.getElementById("scaleSelect");
    const handToolBtn = document.getElementById("hand-tool");
    const eyedropperToolBtn = document.getElementById("eyedropper-tool");
    
    let ctx; 
    let image;
    let aspectRatio;
    let scale = 1;
    let activeTool = 'none';

// $(function () {
//     $('[data-toggle="tooltip"]').tooltip()
//   })
// document.getElementById('importForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const url = document.getElementById('urlInput').value.trim();
//     if (url) {
//         loadImageFromURL(url);
//     } else {
//         const fileInput = document.getElementById('fileInput');
//         if (fileInput.files.length > 0) {
//             const file = fileInput.files[0];
//             const reader = new FileReader();
//             reader.onload = function(event) {
//                 const img = new Image();
//                 img.src = event.target.result;
//                 img.onload = function() {
//                     loadImage(img);
//                     $('#importModal').modal('hide');
//                     showCoordinatesInSidebar();
//                     showColorInSidebar();
//                 };
//             };
//             reader.readAsDataURL(file);
//         }
//     }

//     document.getElementById('importForm').reset();
// });

    function getPixelInfo(event) {
        const rect = canvas.getBoundingClientRect();
        let x = Math.round(event.clientX - rect.left);
        let y = Math.round(event.clientY - rect.top);

        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }

        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const color = `RGB: ${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}`;
        const colorString = `Color: ${color}`;
        
        colorInfo.textContent = colorString;
        positionInfo.textContent = `Position: ${x}, ${y}`;
        colorSample.style.backgroundColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    }

    function loadImageFromURL(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const imageURL = URL.createObjectURL(blob);
                loadImage(imageURL);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                if (error == "Error: Network response was not ok") {
                    alert("Failed to load image. Response from third party website was not ok. Try again or try load image from another website");
                } else if (error == "TypeError: Failed to fetch") {
                    alert("Failed to load image. Your image has been probably blocked by CORS policy. Please try load image from another website.");
                } else {
                    alert("Failed to load image. Please check the URL and try again.");
                }
        });
    }
    
    scaleSelect.addEventListener("change", function() {
        const factor = parseFloat(this.value);
        scaleImage(factor);
    });

    function loadImage(src) {
        image = new Image();
        image.onload = function() {
            console.log("Image loaded", image.width, image.height);
            canvas.width = image.width;
            canvas.height = image.height;
            ctx = canvas.getContext("2d");
            drawImage();
            aspectRatio = image.width / image.height;
            imageSizeInfo.textContent = `Размер: ${image.width} x ${image.height}`;

            scrollContainer.scrollLeft = 0;
            scrollContainer.scrollTop = 0;

            canvas.addEventListener("click", getPixelInfo);
            canvas.addEventListener("mousemove", getPixelInfo);
        };
        image.onerror = function() {
            console.error("Не получилось загрузить изображение:", src);
            alert("Не получилось загрузить изображение. Попробуйте ещё раз.");
        };
        image.src = src;
    }

    function drawImage() {
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log("Холст очищен");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        console.log("Картинка отрисована");

        const thumbnailCanvas = document.getElementById('thumbnailCanvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        thumbnailCanvas.width = image.width / 5;
        thumbnailCanvas.height = image.height / 5;
        thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        thumbnailCtx.drawImage(image, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    }

    
    function scaleImage(factor) {
        scale = factor;
        
        drawImage();
    }

    const fileInput = document.getElementById("fileInput");
    const urlInput = document.getElementById("urlInput");
    const uploadBtn = document.getElementById("uploadBtn");

    uploadBtn.addEventListener("click", function() {
        const url = urlInput.value.trim();
        if (url) {
            loadImageFromURL(url);
        } else if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function() {
                loadImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Введите URL или выберите файл.");
            return;
        }
    });

// function renderCanvas(img) {
//     const container = document.querySelector('.image-canvas');
//     const containerWidth = container.clientWidth;
//     const containerHeight = container.clientHeight;

//     const padding = { top: 50, bottom: 50, left: 50, right: 50 };

//     const maxWidth = containerWidth - padding.left - padding.right;
//     const maxHeight = containerHeight - padding.top - padding.bottom;

//     const scaleX = maxWidth / img.width;
//     const scaleY = maxHeight / img.height;
//     const scale = Math.min(scaleX, scaleY);

//     const scaledWidth = img.width * scale;
//     const scaledHeight = img.height * scale;

//     const canvas = document.createElement('canvas');
//     canvas.width = containerWidth;
//     canvas.height = containerHeight;
//     const ctx = canvas.getContext('2d');

//     ctx.fillStyle = 'lightgrey';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     const offsetX = (containerWidth - scaledWidth) / 2;
//     const offsetY = (containerHeight - scaledHeight) / 2;

//     ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

//     canvas.classList.add('main-canvas');
//     container.innerHTML = '';
//     container.appendChild(canvas);



//     const scaleSelect = document.getElementById('scaleSelect');
//     scaleSelect.value = scale.toString();

//     const canvasSize = `${img.width}x${img.height}`;
//     document.querySelector('.img-size').textContent = `Размеры: ${canvasSize}`;

//     scaleSelect.addEventListener('change', function() {
//         const selectedScale = parseFloat(scaleSelect.value);
//         renderCanvasWithScale(img, selectedScale);
//     });

//     const previousOption = scaleSelect.querySelector('.custom');
//     if (previousOption) {
//         previousOption.remove();
//     }

//     const initialScale = calculateInitialScale(img);
//     const newOption = document.createElement('option');
//     newOption.classList.add('custom')
//     newOption.value = initialScale.toString();
//     newOption.textContent = Math.round(initialScale * 100) + '%';
//     newOption.selected = true;

//     scaleSelect.appendChild(newOption);

//     const originalPixelCountSpan = document.getElementById('originalPixelCount');

//     const originalPixelCount = img.width * img.height;

//     originalPixelCountSpan.textContent = (originalPixelCount / (1000000)).toFixed(2);

//     showCoordinatesInSidebar();
//     showColorInSidebar();
// }

// function calculateInitialScale(img) {
//     const container = document.querySelector('.image-canvas');
//     const containerWidth = container.clientWidth;
//     const containerHeight = container.clientHeight;

//     const padding = { top: 100, bottom: 100, left: 50, right: 50 };

//     const maxWidth = containerWidth - padding.left - padding.right;
//     const maxHeight = containerHeight - padding.top - padding.bottom;

//     const scaleX = maxWidth / img.width;
//     const scaleY = maxHeight / img.height;
//     return Math.min(scaleX, scaleY);
// }

// function renderCanvasWithScale(img, scale) {
//     const container = document.querySelector('.image-canvas');
//     const containerWidth = container.clientWidth;
//     const containerHeight = container.clientHeight;

//     const scaledWidth = img.width * scale;
//     const scaledHeight = img.height * scale;

//     const canvas = document.createElement('canvas');
//     canvas.width = containerWidth;
//     canvas.height = containerHeight;
//     const ctx = canvas.getContext('2d');

//     ctx.fillStyle = 'lightgrey';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     const offsetX = (containerWidth - scaledWidth) / 2;
//     const offsetY = (containerHeight - scaledHeight) / 2;

//     ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

//     canvas.classList.add('main-canvas');
//     container.innerHTML = '';
//     container.appendChild(canvas);

//     const thumbnailCanvas = document.getElementById('thumbnailCanvas');
//     const thumbnailCtx = thumbnailCanvas.getContext('2d');
//     thumbnailCanvas.width = img.width / 5;
//     thumbnailCanvas.height = img.height / 5;
//     thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
//     thumbnailCtx.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

//     const canvasSize = `${canvas.width}x${canvas.height}`;
//     document.querySelector('.img-size').textContent = `Размеры: ${canvasSize}`;

//     showCoordinatesInSidebar();
//     showColorInSidebar();
// }

// function showCoordinatesInSidebar() {
//     const canvas = document.querySelector('.main-canvas');
//     const sidebar = document.querySelector('.img-coordinates');

//     canvas.addEventListener('mousemove', function(event) {
//         const rect = canvas.getBoundingClientRect();
//         const scaleX = canvas.width / rect.width;
//         const scaleY = canvas.height / rect.height;
//         const x = Math.floor((event.clientX - rect.left) * scaleX);
//         const y = Math.floor((event.clientY - rect.top) * scaleY);
        
//         sidebar.innerHTML = `X: ${x}, Y: ${y}`;
//     });
// }

// function getColorAtPixel(canvas, x, y) {
//     const ctx = canvas.getContext('2d');
//     const pixelData = ctx.getImageData(x, y, 1, 1).data;
//     return `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
// }

// function showColorInSidebar() {
//     const canvas = document.querySelector('.main-canvas');
//     const sidebar = document.querySelector('.img-color');

//     canvas.addEventListener('click', function(event) {
//         const rect = canvas.getBoundingClientRect();
//         const scaleX = canvas.width / rect.width;
//         const scaleY = canvas.height / rect.height;
//         const x = Math.floor((event.clientX - rect.left) * scaleX);
//         const y = Math.floor((event.clientY - rect.top) * scaleY);
//         const color = getColorAtPixel(canvas, x, y);
        
//         const rectangleCanvas = createColorRectangle(color);
//         const colorCode = createColorCodeElement(color);

//         sidebar.innerHTML = '';
//         sidebar.appendChild(rectangleCanvas);
//         sidebar.appendChild(colorCode);
//     });
// }

// function createColorRectangle(color) {
//     const rectangleCanvas = document.createElement('canvas');
//     rectangleCanvas.width = 20;
//     rectangleCanvas.height = 20;
//     rectangleCanvas.classList.add('color-mini')
//     const rectCtx = rectangleCanvas.getContext('2d');
//     rectCtx.fillStyle = color;
//     rectCtx.fillRect(0, 0, 20, 20);
//     return rectangleCanvas;
// }

// function createColorCodeElement(color) {
//     const colorCode = document.createElement('div');
//     colorCode.textContent = color;
//     return colorCode;
// }

// function resizeImageNearestNeighbor(imageData, newWidth, newHeight) {
//     const canvas = document.createElement('canvas');
//     canvas.width = newWidth;
//     canvas.height = newHeight;
//     const ctx = canvas.getContext('2d');

//     const srcData = imageData.data;
//     const srcWidth = imageData.width;
//     const srcHeight = imageData.height;

//     const destData = new Uint8ClampedArray(newWidth * newHeight * 4);

//     const scaleX = srcWidth / newWidth;
//     const scaleY = srcHeight / newHeight;

//     for (let y = 0; y < newHeight; y++) {
//         for (let x = 0; x < newWidth; x++) {
//             const srcX = Math.floor(x * scaleX);
//             const srcY = Math.floor(y * scaleY);

//             const srcIndex = (srcY * srcWidth + srcX) * 4;
//             const destIndex = (y * newWidth + x) * 4;

//             destData[destIndex] = srcData[srcIndex]; // Red channel
//             destData[destIndex + 1] = srcData[srcIndex + 1]; // Green channel
//             destData[destIndex + 2] = srcData[srcIndex + 2]; // Blue channel
//             destData[destIndex + 3] = srcData[srcIndex + 3]; // Alpha channel
//         }
//     }

//     const newImageData = new ImageData(destData, newWidth, newHeight);
//     ctx.putImageData(newImageData, 0, 0);

//     return canvas;
// }


// document.getElementById('resizeForm').addEventListener('submit', function(event) {
//     event.preventDefault();

//     const newWidthInput = document.getElementById('newWidthInput');
//     const newHeightInput = document.getElementById('newHeightInput');
//     const resizeUnitsSelect = document.getElementById('resizeUnitsSelect');
//     const proportionsCheckbox = document.getElementById('proportionsCheckbox');

//     let newWidth = parseInt(newWidthInput.value);
//     let newHeight = parseInt(newHeightInput.value);

//     const units = resizeUnitsSelect.value;

//     if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
//         alert('Пожалуйста, введите корректные значения ширины и высоты.');
//         return;
//     }

//     if (units === 'percents') {
//         const container = document.querySelector('.image-canvas');
//         const containerWidth = container.clientWidth;
//         const containerHeight = container.clientHeight;

//         newWidth = (newWidth / 100) * containerWidth;
//         newHeight = (newHeight / 100) * containerHeight;
//     }

//     if (proportionsCheckbox.checked) {
//         const canvas = document.querySelector('.main-canvas');
//         const canvasWidth = canvas.width;
//         const canvasHeight = canvas.height;
//         const ratio = canvasWidth / canvasHeight;

//         if (newWidth && !newHeight) {
//             newHeight = newWidth / ratio;
//         } else if (newHeight && !newWidth) {
//             newWidth = newHeight * ratio;
//         } else {
//             const newRatio = newWidth / newHeight;
//             if (newRatio !== ratio) {
//                 if (newRatio > ratio) {
//                     newHeight = newWidth / ratio;
//                 } else {
//                     newWidth = newHeight * ratio;
//                 }
//             }
//         }
//     }

//     const canvas = document.querySelector('.main-canvas');
//     const ctx = canvas.getContext('2d');
//     const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

//     const resizedImage = resizeImageNearestNeighbor(originalImageData, newWidth, newHeight);

//     document.querySelector('.img-size').textContent = `Размеры: ${newWidth}x${newHeight}`;
//     renderCanvas(resizedImage);
// });
});