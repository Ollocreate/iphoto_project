$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("imageCanvas");
    const thumbnailCanvas = document.getElementById("thumbnailCanvas");
    const colorInfo = document.getElementById("colorInfo");
    const positionInfo = document.getElementById("positionInfo");
    const imageSizeInfo = document.getElementById("imageSizeInfo");
    const colorMini = document.getElementById("colorMini");
    const scaleSelect = document.getElementById("scaleSelect");
    
    const resizeBtn = document.getElementById("resizeBtn");
    const saveBtn = document.getElementById("saveBtn");
    const pixelInfo = document.getElementById("originalPixelCount");
    const newPixelInfo = document.getElementById("resizedPixelCount");
    const resizeModal = document.getElementById("resizeModal");
    const confirmResizeBtn = document.getElementById("confirmResizeBtn");
    const resizeUnitsSelect = document.getElementById("resizeUnitsSelect");
    const resizeWidthInput = document.getElementById("newWidthInput");
    const resizeHeightInput = document.getElementById("newHeightInput");
    const proportionsCheckbox = document.getElementById("proportionsCheckbox");


    let ctx = canvas.getContext("2d");
    let thumbnailCtx = thumbnailCanvas.getContext("2d");
    let image = new Image();
    let aspectRatio = 1;
    let scale = 1;

    function getPixelInfo(event) {
        const rect = canvas.getBoundingClientRect();
        let x = Math.round(event.clientX - rect.left);
        let y = Math.round(event.clientY - rect.top);

        if (x < 0) x = 0;
        if (y < 0) y = 0;

        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const color = `${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}`;
        colorInfo.textContent = `${color}`;
        positionInfo.textContent = `XY: ${x}, ${y}`;
        colorMini.style.backgroundColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    }

    async function loadImageFromURL(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const imageURL = URL.createObjectURL(blob);
            loadImage(imageURL);
        } catch (error) {
            handleImageLoadError(error);
        }
    }

    function handleImageLoadError(error) {
        console.error('Возникла проблема:', error);
        if (error.message.includes("Network response was not ok")) {
            alert("Не удалось загрузить изображение. Ответ со стороннего веб-сайта был неудовлетворительным. Попробуйте еще раз или попробуйте загрузить изображение с другого сайта.");
        } else if (error.message.includes("Failed to fetch")) {
            alert("Не удалось загрузить изображение. Вероятно, ваше изображение было заблокировано политикой CORS. Пожалуйста, попробуйте загрузить изображение с другого сайта.");
        } else {
            alert("Не удалось загрузить изображение. Пожалуйста, проверьте URL-адрес и повторите попытку.");
        }
    }

    // Функция загрузки изображения в канвас
    function loadImage(src) {
        image = new Image();
        image.onload = function() {
            updateCanvas();
            updateThumbnail();
            updateImageInfo();

            canvas.addEventListener("click", getPixelInfo);
            canvas.addEventListener("mousemove", getPixelInfo);
        };
        image.onerror = function() {
            handleImageLoadError(new Error("Image loading error"));
        };
        image.src = src;
    }

    // Обновление канваса
    function updateCanvas() {
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Сохранение контекста для масшабирования
        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(image, 0, 0);
        ctx.restore();
    }

    // Обновление уменьшенной версии изображения
    function updateThumbnail() {
        thumbnailCanvas.width = image.width / 5;
        thumbnailCanvas.height = image.height / 5;

        thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        thumbnailCtx.drawImage(image, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    }

    // Обновление информации о изображении
    function updateImageInfo() {
        aspectRatio = image.width / image.height;
        imageSizeInfo.textContent = `Размер: ${image.width} x ${image.height}`;
    }

    // Масштабирование изображения
    // function scaleImage(factor) {
    //     scale = factor;

    //     updateCanvas();
    // }

    // Загрузка изображения через FileInput или URL
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
        }
    });

    // Обработчик изменения масштаба
    scaleSelect.addEventListener("change", function() {
        scale = parseFloat(this.value);
        updateCanvas();
    });

    proportionsCheckbox.addEventListener("change", function() {
        if (resizeUnitsSelect.value === "percentage") {
            if (this.checked) {
                const value = resizeWidthInput.value;
                resizeHeightInput.value = value;
            }
        }
    });

    resizeBtn.addEventListener("click", function() {
        pixelInfo.textContent = `Размер: ${(image.width * image.height / 1e6).toFixed(2)}`;
    });

    // Функция для обновления размеров и расчета новой площади
    function updateNewPixelInfo() {
        let newWidth, newHeight;
        const isPercentage = resizeUnitsSelect.value === "percentage";

        if (isPercentage) {
            const widthFactor = parseFloat(resizeWidthInput.value) / 100;
            const heightFactor = parseFloat(resizeHeightInput.value) / 100;
            newWidth = Math.round(image.width * widthFactor);
            newHeight = Math.round(image.height * heightFactor);
        } else {
            newWidth = parseInt(resizeWidthInput.value);
            newHeight = parseInt(resizeHeightInput.value);
        }

        if (isNaN(newWidth) || isNaN(newHeight)) {
            newPixelInfo.textContent = "0";
        } else {
            newPixelInfo.textContent = `${(newWidth * newHeight / 1e6).toFixed(2)}`;
        }
    }

    // Обработчик для ввода ширины
    function handleWidthInput() {
        if (resizeUnitsSelect.value === "percentage") {
            if (proportionsCheckbox.checked) {
                resizeHeightInput.value = resizeWidthInput.value;  // Сохраняем пропорции
            }
        } else {
            if (proportionsCheckbox.checked) {
                resizeHeightInput.value = Math.round(resizeWidthInput.value / aspectRatio);
            }
        }

        updateNewPixelInfo();
    }

    // Обработчик для ввода высоты
    function handleHeightInput() {
        if (resizeUnitsSelect.value === "percentage") {
            if (proportionsCheckbox.checked) {
                resizeWidthInput.value = resizeHeightInput.value;  // Сохраняем пропорции
            }
        } else {
            if (proportionsCheckbox.checked) {
                resizeWidthInput.value = Math.round(resizeHeightInput.value * aspectRatio);
            }
        }

        updateNewPixelInfo();
    }

    // Привязываем обработчики событий для ввода ширины и высоты
    resizeWidthInput.addEventListener("input", handleWidthInput);
    resizeHeightInput.addEventListener("input", handleHeightInput);

    confirmResizeBtn.addEventListener("click", function() {
        let newWidth, newHeight;
        
        // Определяем новый размер на основе процентов или пикселей
        if (resizeUnitsSelect.value === "percentage") {
            const widthPercentage = resizeWidthInput.value;
            const heightPercentage = resizeHeightInput.value;
    
            if (!widthPercentage || !heightPercentage) {
                alert("Заполните и ширину, и высоту.");
                return;
            }
    
            const widthFactor = parseFloat(widthPercentage) / 100;
            const heightFactor = parseFloat(heightPercentage) / 100;
            newWidth = Math.round(image.width * widthFactor);
            newHeight = Math.round(image.height * heightFactor);
        } else {
            newWidth = parseInt(resizeWidthInput.value);
            newHeight = parseInt(resizeHeightInput.value);
        }
    
        // Проверка на корректность новых размеров
        if (newWidth <= 0 || newHeight <= 0) {
            alert("Ширина или высота должны быть больше 0.");
            return;
        }
    
        // Изменяем размер изображения и сразу рисуем его на холсте
        resizeAndDrawImageNearestNeighbor(image, newWidth, newHeight);

        aspectRatio = newWidth / newHeight;
        imageSizeInfo.textContent = `Размер: ${newWidth} x ${newHeight}`;
        resizedImage.src = resizedImageData;
    });
    
    // Функция изменения размера и рисования изображения на существующем холсте
    function resizeAndDrawImageNearestNeighbor(image, width, height) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
    
        ctx.imageSmoothingEnabled = false;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(scale, scale);  
        ctx.drawImage(image, 0, 0, width, height); 
        ctx.restore();
    }
    
    // Сохранение изображения
    saveBtn.addEventListener("click", function() {
        const link = document.createElement("a");
        link.download = "Image.png";
        link.href = canvas.toDataURL();
        link.click();
    });
    

});
