$(function () {
    $("[data-toggle='tooltip']").tooltip();
});

document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", function(event) {
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
    const workingArea = document.querySelector(".working-area");
    const eyedropperToolBtn = document.getElementById("eyedropperTool");
    const eyedropperContrastInfo = document.getElementById("eyedropper-contrast-info");

    const curvesModal = document.getElementById("curvesModal");
    const applyCurvesBtn = document.getElementById("applyСurves");
    const resetCurvesBtn = document.getElementById("resetСurves");
    const previewCurvesCheck = document.getElementById("previewCurvesCheck");
    const point1InputIn = document.getElementById("point1-input-in");
    const point1InputOut = document.getElementById("point1-input-out");
    const point2InputIn = document.getElementById("point2-input-in");
    const point2InputOut = document.getElementById("point2-input-out");
    const svg = document.getElementById("curves-graph");
    const point1 = document.getElementById("point1-circle");
    const point2 = document.getElementById("point2-circle");
    const curveLine = document.getElementById("curve-line");

    const matrixInputs = document.querySelectorAll(".matrix");
    const presetSelect = document.getElementById("filterSelect");
    const previewFilterCheck = document.getElementById("previewFilterCheck");
    const applyFilterBtn = document.getElementById("applyFilter");
    const resetFilterBtn = document.getElementById("resetFilter");

    let ctx = canvas.getContext("2d");
    let thumbnailCtx = thumbnailCanvas.getContext("2d");
    let image = new Image();
    let aspectRatio = 1;
    let scale = 1;
    let activeTool = "none";
    let originalPixels;

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
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const imageURL = URL.createObjectURL(blob);
            loadImage(imageURL);
        } catch (error) {
            handleImageLoadError(error);
        }
    }

    function handleImageLoadError(error) {
        console.error("Возникла проблема:", error);
        if (error.message.includes("Network response was not ok")) {
            alert("Не удалось загрузить изображение. Ответ со стороннего веб-сайта был неудовлетворительным. Попробуйте еще раз или попробуйте загрузить изображение с другого сайта.");
        } else if (error.message.includes("Failed to fetch")) {
            alert("Не удалось загрузить изображение. Вероятно, ваше изображение было заблокировано политикой CORS. Пожалуйста, попробуйте загрузить изображение с другого сайта.");
        } else {
            alert("Не удалось загрузить изображение. Пожалуйста, проверьте URL-адрес и повторите попытку.");
        }
    }

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

    function updateCanvas() {
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.scale(scale, scale);
        ctx.drawImage(image, 0, 0);
        ctx.restore();
    }

    function updateThumbnail() {
        const canvas = document.getElementById("imageCanvas");

        thumbnailCanvas.width = canvas.width / 5;
        thumbnailCanvas.height = canvas.height / 5;

        thumbnailCtx.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        thumbnailCtx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    }

    function updateImageInfo() {
        originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        aspectRatio = image.width / image.height;
        imageSizeInfo.textContent = `Размер: ${image.width} x ${image.height}`;
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
        }
    });

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
        const currentWidth = canvas.width / scale;  // Учитываем масштаб
        const currentHeight = canvas.height / scale;
    
        pixelInfo.textContent = `${(currentWidth * currentHeight / 1e6).toFixed(2)}`;
        
        imageSizeInfo.textContent = `${Math.round(currentWidth)} x ${Math.round(currentHeight)}`;
    });
    

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

    resizeWidthInput.addEventListener("input", handleWidthInput);
    resizeHeightInput.addEventListener("input", handleHeightInput);

    confirmResizeBtn.addEventListener("click", function() {
        let newWidth, newHeight;
        
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
    
        if (newWidth <= 0 || newHeight <= 0) {
            alert("Ширина или высота должны быть больше 0.");
            return;
        }
    
        resizeAndDrawImageNearestNeighbor(image, newWidth, newHeight);

        aspectRatio = newWidth / newHeight;
        imageSizeInfo.textContent = `Размер: ${newWidth} x ${newHeight}`;
    });
    
    function resizeAndDrawImageNearestNeighbor(image, width, height) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
    
        ctx.imageSmoothingEnabled = false;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        // ctx.scale(scale, scale);  
        ctx.drawImage(image, 0, 0, width, height); 
        ctx.restore();
    }
    
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
   
        if (tool === "hand") {
            handToolBtn.classList.add("active");
            eyedropperToolBtn.classList.remove("active"); // деактивируем eyedropper tool, если он активен
            canvas.style.cursor = "grab";
        } else if (tool === "eyedropper") {
            eyedropperToolBtn.classList.add("active"); // активируем eyedropper tool
            handToolBtn.classList.remove("active"); // деактивируем hand tool, если он активен
            canvas.style.cursor = "crosshair";
        }
    }
   
    handToolBtn.addEventListener("click", () => activateTool("hand"));
    eyedropperToolBtn.addEventListener("click", () => activateTool("eyedropper"));


    let currentR1, currentR2, currentG1, currentG2, currentB1, currentB2;

    canvas.addEventListener("mousedown", function(e) {
        if (activeTool === "eyedropper") {
            const x = e.offsetX;
            const y = e.offsetY;
            const imageData = ctx.getImageData(x, y, 1, 1).data;

            const rgbColor = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
            const xyzColorData = RGBtoXYZ(imageData);
            const labColorData = XYZtoLAB(xyzColorData);

            const xyzColor = `xyz(${xyzColorData[0].toFixed(2)}, ${xyzColorData[1].toFixed(2)}, ${xyzColorData[2].toFixed(2)})`;
            const labColor = `lab(${labColorData[0].toFixed(2)}, ${labColorData[1].toFixed(2)}, ${labColorData[2].toFixed(2)})`;

            const colorInfo = {
                rgb: rgbColor,
                xyz: xyzColor,
                lab: labColor,
                coords: `Координаты: ${x}, ${y}`,
                r: imageData[0],
                g: imageData[1],
                b: imageData[2],
            };

            if (e.button === 0 && (e.shiftKey || e.ctrlKey || e.altKey)) {
                updateEyedropperUI('2', colorInfo);
                updateColorValues('2', colorInfo);
            } else {
                updateEyedropperUI('1', colorInfo);
                updateColorValues('1', colorInfo);
            }

            checkContrastRatio(currentR1, currentR2, currentG1, currentG2, currentB1, currentB2);
        }
    });

    function updateEyedropperUI(swatchNumber, colorInfo) {
        document.querySelector(`#eyedropper-swatch-${swatchNumber}`).style.backgroundColor = colorInfo.rgb;
        document.querySelector(`#eyedropper-color-${swatchNumber}-rgb`).textContent = colorInfo.rgb;
        document.querySelector(`#eyedropper-color-${swatchNumber}-xyz`).textContent = colorInfo.xyz;
        document.querySelector(`#eyedropper-color-${swatchNumber}-lab`).textContent = colorInfo.lab;
        document.querySelector(`#eyedropper-position-info-${swatchNumber}`).textContent = colorInfo.coords;
    }

    function updateColorValues(swatchNumber, colorInfo) {
        if (swatchNumber === '1') {
            currentR1 = colorInfo.r;
            currentG1 = colorInfo.g;
            currentB1 = colorInfo.b;
        } else {
            currentR2 = colorInfo.r;
            currentG2 = colorInfo.g;
            currentB2 = colorInfo.b;
        }
    }

    let isDragging = false;
    let lastX, lastY;

    workingArea.addEventListener("mousedown", (e) => {
        if (activeTool === "hand") {
            isDragging = true;
            canvas.style.cursor = "grabbing";
            lastX = e.clientX;
            lastY = e.clientY;
        }
    });

    workingArea.addEventListener("mousemove", (e) => {
        if (isDragging && activeTool === "hand") {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;

            workingArea.scrollLeft -= dx;
            workingArea.scrollTop -= dy;

            lastX = e.clientX;
            lastY = e.clientY;
        }
    });

    workingArea.addEventListener("mouseup", () => {
        isDragging = false;
    });

    workingArea.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "h") {
            activateTool("hand");
        } else if (e.key === "e") {
            activateTool("eyedropper");
        }
    });
    
    function RGBtoXYZ([R, G, B]) {
        // Преобразование RGB к нормализованным значениям и затем в XYZ
        const [var_R, var_G, var_B] = [R, G, B].map(x => {
            const normalized = x / 255;
            return normalized > 0.04045
                ? Math.pow((normalized + 0.055) / 1.055, 2.4)
                : normalized / 12.92;
        }).map(x => x * 100);
    
        const X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805;
        const Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722;
        const Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505;
    
        return [X, Y, Z];
    }
    
    function XYZtoLAB([x, y, z]) {
        const ref_X = 95.047, ref_Y = 100.000, ref_Z = 108.883;
    
        const [var_X, var_Y, var_Z] = [x / ref_X, y / ref_Y, z / ref_Z].map(a => {
            return a > 0.008856
                ? Math.pow(a, 1 / 3)
                : (7.787 * a) + (16 / 116);
        });
    
        const CIE_L = (116 * var_Y) - 16;
        const CIE_a = 500 * (var_X - var_Y);
        const CIE_b = 200 * (var_Y - var_Z);
    
        return [CIE_L, CIE_a, CIE_b];
    }

    function checkContrastRatio(r1_8bit, r2_8bit, g1_8bit, g2_8bit, b1_8bit, b2_8bit) {
        function convertToLinearComponent(value) {
            const s = value / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        }
    
        if ([r1_8bit, r2_8bit, g1_8bit, g2_8bit, b1_8bit, b2_8bit].some(isNaN)) {
            return;
        }

        const [r1, g1, b1] = [r1_8bit, g1_8bit, b1_8bit].map(convertToLinearComponent);
        const [r2, g2, b2] = [r2_8bit, g2_8bit, b2_8bit].map(convertToLinearComponent);

        const l1 = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
        const l2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
    
        const contrastRatio = (l1 + 0.05) / (l2 + 0.05);
        const reverseContrastRatio = (l2 + 0.05) / (l1 + 0.05);
    
        const sufficientContrast = contrastRatio >= 4.5 || reverseContrastRatio >= 4.5;
        const contrastValue = sufficientContrast ? Math.max(contrastRatio, reverseContrastRatio) : Math.min(contrastRatio, reverseContrastRatio);
    
        eyedropperContrastInfo.textContent = `Контрастность: ${contrastValue.toFixed(2)} (${sufficientContrast ? 'Достаточная' : 'Недостаточная'})`;
        eyedropperContrastInfo.style.color = sufficientContrast ? "green" : "red";
    }
    
    document.getElementById("curvesBtn").addEventListener("click", function() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        try {
            if (!image.width) throw new Error("No image");
        } catch (error) {
            console.error("No image\n", error);
            return;
        }
    
        updateSVGCurve();
        generateHistogram(imageData);
    });
    
    let activePoint = null;
    let originalImageData = null;
    
    function resetValues() {
        point1InputIn.value = 0;
        point1InputOut.value = 0;
        point2InputIn.value = 255;
        point2InputOut.value = 255;
        updateSVGCurve();
    }
    
    function updateSVGCurve() {
        const x1 = parseInt(point1InputIn.value);
        const y1 = 255 - parseInt(point1InputOut.value);
        const x2 = parseInt(point2InputIn.value);
        const y2 = 255 - parseInt(point2InputOut.value);

        point1.setAttribute("cx", x1);
        point1.setAttribute("cy", y1);
        point2.setAttribute("cx", x2);
        point2.setAttribute("cy", y2);
    
        const curvePoints = `${x1},${y1} ${x2},${y2}`;
        curveLine.setAttribute("points", curvePoints);
    
        updateBoundaryLines(x1, y1, x2, y2);
    }
    
    function updateBoundaryLines(x1, y1, x2, y2) {
        const line1 = document.getElementById("line1");
        const line2 = document.getElementById("line2");
    
        line1.setAttribute("x1", x1);
        line1.setAttribute("y1", y1);
        line1.setAttribute("x2", -50);
        line1.setAttribute("y2", y1);
    
        line2.setAttribute("x1", x2);
        line2.setAttribute("y1", y2);
        line2.setAttribute("x2", 256);
        line2.setAttribute("y2", y2);
    }
    
    function validateInput() {
        if (parseInt(point1InputIn.value) >= parseInt(point2InputIn.value)) {
            point2InputIn.value = parseInt(point1InputIn.value) + 1;
        }
    }
    
    // Создание LUT (Look-Up Table) для коррекции кривых
    function createLUT(x1, y1, x2, y2) {
        let lut = new Array(256);
        for (let i = 0; i <= 255; i++) {
            if (i <= x1) {
                lut[i] = y1;
            } else if (i >= x2) {
                lut[i] = y2;
            } else {
                lut[i] = Math.round(((y2 - y1) / (x2 - x1)) * (i - x1) + y1);
            }
        }
        return lut;
    }
    
    // Применение коррекции по кривым
    function applyCurvesCorrection() {
        if (!originalImageData) {
            try {
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            } catch (error) {
                console.error("No image\n", error);
                return;
            }
        }
    
        const x1 = parseInt(point1InputIn.value);
        const y1 = parseInt(point1InputOut.value);
        const x2 = parseInt(point2InputIn.value);
        const y2 = parseInt(point2InputOut.value);
    
        const lut = createLUT(x1, y1, x2, y2);
    
        let imageData = ctx.createImageData(originalImageData.width, originalImageData.height);
        let data = imageData.data;
        let originalData = originalImageData.data;
    
        for (let i = 0; i < originalData.length; i += 4) {
            data[i] = lut[originalData[i]];         // Red
            data[i + 1] = lut[originalData[i + 1]]; // Green
            data[i + 2] = lut[originalData[i + 2]]; // Blue
            data[i + 3] = originalData[i + 3];      // Alpha
        }
    
        ctx.putImageData(imageData, 0, 0);
        updateThumbnail();
        generateHistogram(imageData);
    }
    
    function generateHistogram(imageData) {
        const histogram = {
            red: new Array(256).fill(0),
            green: new Array(256).fill(0),
            blue: new Array(256).fill(0),
        };
    
        const data = imageData.data;
    
        for (let i = 0; i < data.length; i += 4) {
            histogram.red[data[i]]++;
            histogram.green[data[i + 1]]++;
            histogram.blue[data[i + 2]]++;
        }
    
        drawHistogram(histogram);
    }
    
    function drawHistogram(histogram) {
        const histogramCanvas = document.getElementById("histogramCanvas");
        const histCtx = histogramCanvas.getContext("2d");
    
        histCtx.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);
    
        const maxCount = Math.max(...histogram.red, ...histogram.green, ...histogram.blue);
    
        const colors = ['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'];
        const histograms = [histogram.red, histogram.green, histogram.blue];
    
        histograms.forEach((hist, index) => {
            histCtx.fillStyle = colors[index];
            hist.forEach((count, i) => {
                const height = (count / maxCount) * histogramCanvas.height;
                histCtx.fillRect(i, histogramCanvas.height - height, 1, height);
            });
        });
    
        setHistogramBackground();
    }
    
    function setHistogramBackground() {
        const histogramCanvas = document.getElementById("histogramCanvas");
        const svgImage = document.querySelector("#curves-graph image");
    
        svgImage.setAttribute('href', histogramCanvas.toDataURL());
    }

    function resetImage() {
        if (!originalImageData) {
            console.error("No original image data available.");
            return;
        }
    
        const { width, height, data: originalData } = originalImageData;
        const lut = new Array(256);
        const x1 = 0, y1 = 0, x2 = 255, y2 = 255;
    
        for (let i = 0; i < 256; i++) {
            lut[i] = (i <= x1) ? y1 :
                     (i >= x2) ? y2 :
                     Math.round(((y2 - y1) / (x2 - x1)) * (i - x1) + y1);
        }
    
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
    
        for (let i = 0; i < originalData.length; i += 4) {
            data[i]     = lut[originalData[i]];
            data[i + 1] = lut[originalData[i + 1]];
            data[i + 2] = lut[originalData[i + 2]];
            data[i + 3] = originalData[i + 3];
        }
    
        ctx.putImageData(imageData, 0, 0);
    }

    point1.addEventListener("mousedown", function() {
        activePoint = "point1";
    });
    point2.addEventListener("mousedown", function() {
        activePoint = "point2";
    });

    document.addEventListener("mousemove", function(event) {
        if (activePoint) {
            const svgRect = svg.getBoundingClientRect();
            let x = event.clientX - svgRect.left;
            let y = event.clientY - svgRect.top;

            x = Math.max(0, Math.min(255, x));
            y = Math.max(0, Math.min(255, y));

            if (activePoint === "point1" && x < parseInt(point2InputIn.value)) {
                point1InputIn.value = Math.round(x);
                point1InputOut.value = Math.round(255 - y);
            } else if (activePoint === "point2" && x > parseInt(point1InputIn.value)) {
                point2InputIn.value = Math.round(x);
                point2InputOut.value = Math.round(255 - y);
            }

            updateSVGCurve();
            if (previewCurvesCheck.checked) {
                applyCurvesCorrection();
            }
        }
    });

    document.addEventListener("mouseup", function() {
        activePoint = null;
    });

    function handleInput() {
        validateInput();
        updateSVGCurve();
        if (previewCurvesCheck.checked) {
            applyCurvesCorrection();
        }
    }

    point1InputIn.addEventListener("input", handleInput);
    point1InputOut.addEventListener("input", handleInput);
    point2InputIn.addEventListener("input", handleInput);
    point2InputOut.addEventListener("input", handleInput);

    applyCurvesBtn.addEventListener("click", function() {
        applyCurvesCorrection();
        resetValues();
        previewCurvesCheck.checked = false
        curvesModal.style.display = "none";

        try {
            (function () {
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }
    });

    resetCurvesBtn.addEventListener("click", function() {
        resetValues();
        if (previewCurvesCheck.checked) {
            applyCurvesCorrection();
        }
    });

    previewCurvesCheck.addEventListener("click", function() {
        if (previewCurvesCheck.checked) {
            updateSVGCurve();
            applyCurvesCorrection();
        } else {
            resetImage()
        }
    })

    filterBtn.addEventListener("click", function() {
        try {
            (function () {
                image.width
            }())
        } catch (error) {
            console.error("No image\n",error)
            return
        }
    });

    presetSelect.addEventListener("change", handlePresetChange);

    resetFilterBtn.addEventListener("click", resetFilter);

    applyFilterBtn.addEventListener("click", function () {
        if (previewFilterCheck.checked == true) {
            originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } else {
            applyFilter(false);
        }
        resetFilter();
        previewFilterCheck.checked = false;
    });

    const presets = {
        identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
        sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
        gaussian: [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16],  // Gaussian Blur 3x3
        box: [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9]  // Box Blur 3x3
    };

    function resetFilter() {
        const canvas = document.getElementById("imageCanvas");
        const ctx = canvas.getContext("2d");
    
        if (originalPixels) {
            ctx.putImageData(originalPixels, 0, 0);
        } else {
            console.error("originalPixels is not set");
            return;
        }
    
        const preset = presets[presetSelect.value] || presets.identity;
        matrixInputs.forEach((input, index) => {
            input.value = preset[index] !== undefined ? preset[index] : 0;
        });
    
        if (previewFilterCheck.checked) {
            applyFilter(true);
        }
    }
    
    function handlePreview() {
        if (previewFilterCheck.checked) {
            applyFilter(true);
        } else {
            resetFilter();
        }
    }
    
    function handlePresetChange() {
        const preset = presets[presetSelect.value] || presets.identity;
        matrixInputs.forEach((input, index) => {
            input.value = preset[index] !== undefined ? preset[index] : 0;
        });
    
        if (previewFilterCheck.checked) {
            applyFilter(true);
        }
    }
    
    function applyFilter(isPreview = false) {
        const canvas = document.getElementById("imageCanvas");
        const ctx = canvas.getContext("2d");
        const kernel = Array.from(matrixInputs).map(input => parseFloat(input.value));
        const sourcePixels = isPreview ? originalPixels : ctx.getImageData(0, 0, canvas.width, canvas.height);
        const filteredPixels = applyConvolution(sourcePixels, kernel);
    
        ctx.putImageData(filteredPixels, 0, 0);
    
        if (!isPreview) {
            originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalImageData = originalPixels; // Можно оптимизировать, если это одно и то же
        }
    
        updateThumbnail();
    }
    
    previewFilterCheck.addEventListener("change", handlePreview);
    
    matrixInputs.forEach(input => {
        input.addEventListener("input", () => {
            if (previewFilterCheck.checked) {
                applyFilter(true);
            }
        });
    });
    
    presetSelect.addEventListener("change", handlePresetChange);

    function applyConvolution(imageData, kernel) {
        const canvas = document.getElementById("imageCanvas");
        const ctx = canvas.getContext("2d");
        const { data, width, height } = imageData;
        const side = Math.sqrt(kernel.length);
        const half = Math.floor(side / 2);
        const output = ctx.createImageData(width, height);
        const outputData = output.data;
    
        const getKernelValue = (ky, kx) => kernel[ky * side + kx];
        const getOffsetIndex = (x, y) => (y * width + x) * 4;
    
        function getPixel(x, y) {
            x = Math.min(Math.max(x, 0), width - 1);
            y = Math.min(Math.max(y, 0), height - 1);
            return {
                r: data[getOffsetIndex(x, y)],
                g: data[getOffsetIndex(x, y) + 1],
                b: data[getOffsetIndex(x, y) + 2]
            };
        }
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                let r = 0, g = 0, b = 0;
    
                for (let ky = 0; ky < side; ky++) {
                    for (let kx = 0; kx < side; kx++) {
                        const offsetX = x + kx - half;
                        const offsetY = y + ky - half;
                        const { r: pr, g: pg, b: pb } = getPixel(offsetX, offsetY);
                        const weight = getKernelValue(ky, kx);
    
                        r += pr * weight;
                        g += pg * weight;
                        b += pb * weight;
                    }
                }
    
                outputData[pixelIndex] = Math.min(Math.max(r, 0), 255);
                outputData[pixelIndex + 1] = Math.min(Math.max(g, 0), 255);
                outputData[pixelIndex + 2] = Math.min(Math.max(b, 0), 255);
                outputData[pixelIndex + 3] = data[pixelIndex + 3];
            }
        }
        return output;
    }
});