 // Configurar pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';

// Tamaños de página en milímetros
const pageSizes = {
    carta: { width: 216, height: 279 },
    oficio: { width: 216, height: 356 }
};

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const convertBtn = document.getElementById('convert-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const pageSizeRadios = document.querySelectorAll('input[name="page-size"]');
    
    let pdfDoc = null;
    let pdfName = '';
    
    // Actualizar valor de calidad
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = `${this.value}%`;
    });
    
    // Eventos para la zona de carga
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });
    
    function handleFile(file) {
        if (file.type !== 'application/pdf') {
            alert('Por favor, seleccione un archivo PDF.');
            return;
        }
        
        // Actualizar la interfaz
        uploadArea.innerHTML = `
            <div class="upload-icon">✅</div>
            <p class="upload-text">${file.name}</p>
            <p class="upload-subtext">Haz clic en convertir para continuar</p>
        `;
        
        pdfName = file.name.replace('.pdf', '');
        const fileReader = new FileReader();
        
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            
            pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                pdfDoc = pdf;
                convertBtn.disabled = false;
                statusText.textContent = `PDF cargado: ${pdf.numPages} páginas detectadas.`;
                progressContainer.style.display = 'block';
            }).catch(error => {
                console.error('Error al cargar el PDF:', error);
                alert('Error al cargar el PDF. Asegúrese de que el archivo no esté corrupto.');
                resetUploadArea();
            });
        };
        
        fileReader.readAsArrayBuffer(file);
    }
    
    function resetUploadArea() {
        uploadArea.innerHTML = `
            <div class="upload-icon">📄</div>
            <p class="upload-text">Haz clic o arrastra tu archivo PDF aquí</p>
            <p class="upload-subtext">El procesamiento se realiza completamente en tu navegador</p>
        `;
        convertBtn.disabled = true;
        progressContainer.style.display = 'none';
    }
    
    // Obtener el tamaño de página seleccionado
    function getSelectedPageSize() {
        for (const radio of pageSizeRadios) {
            if (radio.checked) {
                return radio.value;
            }
        }
        return 'carta';
    }
    
    convertBtn.addEventListener('click', async () => {
        if (!pdfDoc) return;
        
        convertBtn.disabled = true;
        progressBar.value = 0;
        statusText.textContent = 'Comenzando conversión...';
        
        try {
            const selectedSize = getSelectedPageSize();
            const pageSize = pageSizes[selectedSize];
            const { jsPDF } = window.jspdf;
            const resultPdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pageSize.width, pageSize.height]
            });
            
            const totalPages = pdfDoc.numPages;
            const quality = parseInt(qualitySlider.value) / 100;
            const scale = 2.0;
            
            for (let i = 1; i <= totalPages; i++) {
                statusText.textContent = `Procesando página ${i} de ${totalPages}...`;
                
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                const imgData = canvas.toDataURL('image/jpeg', quality);
                
                if (i > 1) {
                    resultPdf.addPage();
                }
                
                const pdfWidth = resultPdf.internal.pageSize.getWidth();
                const pdfHeight = resultPdf.internal.pageSize.getHeight();
                const imgRatio = canvas.width / canvas.height;
                let imgWidth = pdfWidth;
                let imgHeight = pdfWidth / imgRatio;
                
                if (imgHeight > pdfHeight) {
                    imgHeight = pdfHeight;
                    imgWidth = pdfHeight * imgRatio;
                }
                
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;
                
                resultPdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
                progressBar.value = (i / totalPages) * 100;
                
                canvas.width = 0;
                canvas.height = 0;
            }
            
            statusText.textContent = 'Finalizando...';
            const sizeLabel = selectedSize === 'carta' ? 'carta' : 'oficio';
            resultPdf.save(`${pdfName}_${sizeLabel}.pdf`);
            
            statusText.textContent = '¡Conversión completada! PDF descargado.';
            convertBtn.textContent = 'Convertir otro PDF';
            convertBtn.disabled = false;
            
            setTimeout(() => {
                progressContainer.style.display = 'none';
                resetUploadArea();
                convertBtn.textContent = 'Convertir a PDF de imágenes';
            }, 5000);
            
        } catch (error) {
            console.error('Error durante la conversión:', error);
            statusText.textContent = 'Error durante la conversión.';
            convertBtn.disabled = false;
            resetUploadArea();
        }
    });
});