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
    const confirmResizeBtn = document.getElementById("confirmResizeBtn");
    const resizeUnitsSelect = document.getElementById("resizeUnitsSelect");
    const resizeWidthInput = document.getElementById("newWidthInput");
    const resizeHeightInput = document.getElementById("newHeightInput");
    const proportionsCheckbox = document.getElementById("proportionsCheckbox");

    const handToolBtn = document.getElementById("handTool");
    const scrollContainer = document.querySelector(".scroll-container");
    const eyedropperToolBtn = document.getElementById("eyedropperTool");
    const eyedropperSwatch1 = document.getElementById("eyedropper-swatch-1");
    const eyedropperSwatch2 = document.getElementById("eyedropper-swatch-2");
    const eyedropperColor1RGB = document.getElementById("eyedropper-color-1-rgb");
    const eyedropperColor2RGB = document.getElementById("eyedropper-color-2-rgb");
    const eyedropperColor1XYZ = document.getElementById("eyedropper-color-1-xyz");
    const eyedropperColor2XYZ = document.getElementById("eyedropper-color-2-xyz");
    const eyedropperColor1LAB = document.getElementById("eyedropper-color-1-lab");
    const eyedropperColor2LAB = document.getElementById("eyedropper-color-2-lab");
    const eyedropperPositionInfo1 = document.getElementById("eyedropper-position-info-1");
    const eyedropperPositionInfo2 = document.getElementById("eyedropper-position-info-2");
    const eyedropperContrastInfo = document.getElementById("eyedropper-contrast-info");


    let ctx = canvas.getContext("2d");
    let thumbnailCtx = thumbnailCanvas.getContext("2d");
    let image = new Image();
    let aspectRatio = 1;
    let scale = 1;
    let activeTool = 'none';

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


    function activateTool(tool) {
        try {
            (function () {
                image.width // проверяем наличие загруженного изображения
            }())
        } catch (error) {
            console.error("No image\n", error);
            return; // если изображения нет, инструменты не активируются
        }
   
        activeTool = tool;
   
        if (tool === 'hand') {
            handToolBtn.classList.add('active');
            eyedropperToolBtn.classList.remove('active'); // деактивируем eyedropper tool, если он активен
            canvas.style.cursor = 'grab';
        } else if (tool === 'eyedropper') {
            eyedropperToolBtn.classList.add('active'); // активируем eyedropper tool
            handToolBtn.classList.remove('active'); // деактивируем hand tool, если он активен
            canvas.style.cursor = 'crosshair';
        }
    }
   
    handToolBtn.addEventListener("click", () => activateTool('hand'));
    eyedropperToolBtn.addEventListener("click", () => activateTool('eyedropper'));


    let currentR1, currentR2, currentG1, currentG2, currentB1, currentB2

    canvas.addEventListener("mousedown", function(e) {
        if (activeTool === 'eyedropper') {
            const x = e.offsetX;
            const y = e.offsetY;
            const imageData = ctx.getImageData(x, y, 1, 1).data;

            const rgbColor = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
            const xyzColorData = RGBtoXYZ(imageData)
            const labColorData = XYZtoLAB(xyzColorData)

            const xyzColor = `xyz(${xyzColorData[0].toFixed(2)}, ${xyzColorData[1].toFixed(2)}, ${xyzColorData[2].toFixed(2)})`
            const labColor = `lab(${labColorData[0].toFixed(2)}, ${labColorData[1].toFixed(2)}, ${labColorData[2].toFixed(2)})`

            const rgbColorString = `${rgbColor}`;
            const xyzColorString = `${xyzColor}`
            const labColorString = `${labColor}`

            if (e.button === 0 && (e.shiftKey || e.ctrlKey || e.altKey)) {
                eyedropperSwatch2.style.backgroundColor = rgbColor;

                eyedropperColor2RGB.textContent = rgbColorString
                eyedropperColor2XYZ.textContent = xyzColorString
                eyedropperColor2LAB.textContent = labColorString

                eyedropperPositionInfo2.textContent = `Координаты: ${x}, ${y}`

                currentR2 = imageData[0]
                currentG2 = imageData[1]
                currentB2 = imageData[2]

                checkContrastRatio(currentR1, currentR2, currentG1, currentG2, currentB1, currentB2)
            } else {
                eyedropperSwatch1.style.backgroundColor = rgbColor;

                eyedropperColor1RGB.textContent = rgbColorString
                eyedropperColor1XYZ.textContent = xyzColorString
                eyedropperColor1LAB.textContent = labColorString

                eyedropperPositionInfo1.textContent = `Координаты: ${x}, ${y}`

                currentR1 = imageData[0]
                currentG1 = imageData[1]
                currentB1 = imageData[2]

                checkContrastRatio(currentR1, currentR2, currentG1, currentG2, currentB1, currentB2)
            }
        }
    });

    let isDragging = false;
    let lastX, lastY;

    scrollContainer.addEventListener('mousedown', (e) => {
        if (activeTool === 'hand') {
            isDragging = true;
            canvas.style.cursor = 'grabbing';
            lastX = e.clientX;
            lastY = e.clientY;
        }
    });

    scrollContainer.addEventListener('mousemove', (e) => {
        if (isDragging && activeTool === 'hand') {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;

            scrollContainer.scrollLeft -= dx;
            scrollContainer.scrollTop -= dy;

            lastX = e.clientX;
            lastY = e.clientY;
        }
    });

    scrollContainer.addEventListener('mouseup', () => {
        isDragging = false;
    });

    scrollContainer.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === 'h') {
            activateTool('hand');
        } else if (e.key === 'e') {
            activateTool('eyedropper');
        }
    });
    
    
    function RGBtoXYZ([R, G, B]) {
        const [var_R, var_G, var_B] = [R, G, B]
            .map(x => x / 255)
            .map(x => x > 0.04045
                ? Math.pow(((x + 0.055) / 1.055), 2.4)
                : x / 12.92)
            .map(x => x * 100)
    
        X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805
        Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722
        Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505
        return [X, Y, Z]
    }

    function XYZtoLAB([x, y, z]) {
        const ref_X =  95.047;
        const ref_Y = 100.000;
        const ref_Z = 108.883;

        const [ var_X, var_Y, var_Z ] = [ x / ref_X, y / ref_Y, z / ref_Z ]
            .map(a => a > 0.008856
                ? Math.pow(a, 1 / 3)
                : (7.787 * a) + (16 / 116))
    
        CIE_L = (116 * var_Y) - 16
        CIE_a = 500 * (var_X - var_Y)
        CIE_b = 200 * (var_Y - var_Z)
    
        return [CIE_L, CIE_a, CIE_b]
    }


    // Функция написана по методике описанной в https://www.w3.org/TR/WCAG20-TECHS/G18.html
    function checkContrastRatio(r1_8bit, r2_8bit, g1_8bit, g2_8bit, b1_8bit, b2_8bit) {
        const sr1 = r1_8bit / 255
        const sr2 = r2_8bit / 255
        const sg1 = g1_8bit / 255
        const sg2 = g2_8bit / 255
        const sb1 = b1_8bit / 255
        const sb2 = b2_8bit / 255

        if (isNaN(sr1) || isNaN(sr2) || isNaN(sg1) || isNaN(sg2) || isNaN(sb1) || isNaN(sb2)) {
            return
        }

        let r1, r2, g1, g2, b1, b2

        if (sr1 <= 0.03928) {
            r1 = sr1 / 12.92
        } else {
            r1 = ((sr1 + 0.055) / 1.055 ) ** 2.4
        }

        if (sr2 <= 0.03928) {
            r2 = sr2 / 12.92
        } else {
            r2 = ((sr2 + 0.055) / 1.055 ) ** 2.4
        }

        if (sg1 <= 0.03928) {
            g1 = sg1 / 12.92
        } else {
            g1 = ((sg1 + 0.055) / 1.055 ) ** 2.4
        }

        if (sg2 <= 0.03928) {
            g2 = sg2 / 12.92
        } else {
            g2 = ((sg2 + 0.055) / 1.055 ) ** 2.4
        }

        if (sb1 <= 0.03928) {
            b1 = sb1 / 12.92
        } else {
            b1 = ((sb1 + 0.055) / 1.055 ) ** 2.4
        }

        if (sb2 <= 0.03928) {
            b2 = sb2 / 12.92
        } else {
            b2 = ((sb2 + 0.055) / 1.055 ) ** 2.4
        }

        const l1 = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1
        const l2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2

        if ((l1 + 0.05) / (l2 + 0.05) >= 4.5) {
            eyedropperContrastInfo.textContent = `Контрастность: ${((l1+0.05) / (l2 + 0.05)).toFixed(2)} (Достаточная)`

            eyedropperContrastInfo.style.color = "green"
        } else if ((l2 + 0.05) / (l1 + 0.05) >= 4.5) {
            eyedropperContrastInfo.textContent = `Контрастность: ${((l2+0.05) / (l1 + 0.05)).toFixed(2)} (Достаточная)`

            eyedropperContrastInfo.style.color = "green"
        } else {
            // Контраст меньше 4.5
            if (((l1 + 0.05) / (l2 + 0.05)) >= ((l2 + 0.05) / (l1 + 0.05))) {
                eyedropperContrastInfo.textContent = `Контрастность: ${((l1+0.05) / (l2 + 0.05)).toFixed(2)} (Недостаточная)`

                eyedropperContrastInfo.style.color = "red"
            } else {
                eyedropperContrastInfo.textContent = `Контрастность: ${((l2+0.05) / (l1 + 0.05)).toFixed(2)} (Недостаточная)`

                eyedropperContrastInfo.style.color = "red"
            }
        }
    }
});
