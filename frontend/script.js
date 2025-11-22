const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const inputImagePreview = document.getElementById('inputImagePreview');
const removeFileBtn = document.getElementById('removeFile');
const formatBtns = document.querySelectorAll('.format-btn');
const convertBtn = document.getElementById('convertBtn');
const statusMessage = document.getElementById('statusMessage');

// Output Elements
const outputPlaceholder = document.getElementById('outputPlaceholder');
const outputImagePreview = document.getElementById('outputImagePreview');
const fileDetails = document.getElementById('fileDetails');
const downloadBtn = document.getElementById('downloadBtn');

let currentFile = null;
let selectedFormat = null;
let downloadUrl = null;

const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tiff'];

// --- Event Listeners ---

// Drag & Drop
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f1f5f9';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

// Remove File
removeFileBtn.addEventListener('click', resetInputState);

// Format Selection
formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = btn.dataset.format;
        checkConvertibility();
    });
});

// Convert
convertBtn.addEventListener('click', startConversion);

// Download
downloadBtn.addEventListener('click', () => {
    if (downloadUrl) {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `converted.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});

// --- Functions ---

function handleFile(file) {
    const ext = getExtension(file.name);
    if (!IMAGE_FORMATS.includes(ext) && ext !== 'pdf') {
        alert('Unsupported file type. Please upload an image or PDF.');
        return;
    }

    currentFile = file;

    // Show Input Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        inputImagePreview.src = e.target.result;
        inputImagePreview.style.display = 'block';
        dropZone.style.display = 'none';
        removeFileBtn.style.display = 'flex';
    };

    if (ext === 'pdf') {
        inputImagePreview.src = 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg';
        inputImagePreview.style.display = 'block';
        dropZone.style.display = 'none';
        removeFileBtn.style.display = 'flex';
    } else {
        reader.readAsDataURL(file);
    }

    // Reset Output side when new file is uploaded
    resetOutputState();
    checkConvertibility();
}

function resetInputState() {
    currentFile = null;
    selectedFormat = null;
    fileInput.value = '';
    inputImagePreview.src = '';
    inputImagePreview.style.display = 'none';
    dropZone.style.display = 'flex';
    removeFileBtn.style.display = 'none';
    formatBtns.forEach(b => b.classList.remove('active'));
    convertBtn.disabled = true;
    statusMessage.textContent = '';

    resetOutputState();
}

function resetOutputState() {
    outputPlaceholder.style.display = 'block';
    outputImagePreview.style.display = 'none';
    outputImagePreview.src = '';
    fileDetails.style.display = 'none';
    downloadBtn.disabled = true;
    if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
        downloadUrl = null;
    }
}

function checkConvertibility() {
    if (currentFile && selectedFormat) {
        const ext = getExtension(currentFile.name);
        if (ext === selectedFormat) {
            convertBtn.disabled = true;
            statusMessage.textContent = 'Source and target formats are the same.';
            statusMessage.className = 'status error';
        } else {
            convertBtn.disabled = false;
            statusMessage.textContent = '';
        }
    } else {
        convertBtn.disabled = true;
    }
}

async function startConversion() {
    if (!currentFile || !selectedFormat) return;

    const formData = new FormData();
    formData.append('file', currentFile);
    formData.append('target_format', selectedFormat);

    let endpoint = '';
    const ext = getExtension(currentFile.name);

    if (IMAGE_FORMATS.includes(ext) && IMAGE_FORMATS.includes(selectedFormat)) {
        endpoint = 'https://universal-converter-drug.onrender.com/convert-image';
    } else if (IMAGE_FORMATS.includes(ext) && selectedFormat === 'pdf') {
        endpoint = 'https://universal-converter-drug.onrender.com/image-to-pdf';
    } else if (ext === 'pdf' && IMAGE_FORMATS.includes(selectedFormat)) {
        endpoint = 'https://universal-converter-drug.onrender.com/pdf-to-image';
    } else {
        statusMessage.textContent = 'Unsupported conversion combo.';
        return;
    }

    statusMessage.textContent = 'Converting...';
    statusMessage.className = 'status loading';
    convertBtn.disabled = true;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Conversion failed');
        }

        const blob = await response.blob();
        if (downloadUrl) window.URL.revokeObjectURL(downloadUrl);
        downloadUrl = window.URL.createObjectURL(blob);

        // Update Output Panel
        showOutputResult(blob.size);
        statusMessage.textContent = '';

    } catch (error) {
        console.error(error);
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.className = 'status error';
    } finally {
        convertBtn.disabled = false;
    }
}

function showOutputResult(sizeBytes) {
    outputPlaceholder.style.display = 'none';
    outputImagePreview.style.display = 'block';

    if (selectedFormat === 'pdf') {
        outputImagePreview.src = 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg';
    } else {
        outputImagePreview.src = downloadUrl;
    }

    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    fileDetails.textContent = `${sizeMB} MB • ${selectedFormat.toUpperCase()}`;
    fileDetails.style.display = 'block';

    downloadBtn.disabled = false;
}

function getExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}
