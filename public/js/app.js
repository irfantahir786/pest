document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const fileInfo = document.getElementById('fileInfo');
  const fileName = document.getElementById('fileName');
  const fileType = document.getElementById('fileType');
  const fileSize = document.getElementById('fileSize');
  const uploadForm = document.getElementById('uploadForm');
  const extractBtn = document.getElementById('extractBtn');
  const btnText = extractBtn.querySelector('.btn-text');
  const btnLoading = extractBtn.querySelector('.btn-loading');
  const statusMessage = document.getElementById('statusMessage');
  const resultSection = document.getElementById('resultSection');
  const structuredData = document.getElementById('structuredData');
  const rawText = document.getElementById('rawText');
  const warningsList = document.getElementById('warningsList');
  const warningsSection = document.getElementById('warningsSection');

  // File selection handler
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      fileName.textContent = file.name;
      fileType.textContent = file.type || 'Unknown';
      fileSize.textContent = formatFileSize(file.size);
      fileInfo.style.display = 'block';
    }
  });

  // Form submission handler
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const file = fileInput.files[0];
    if (!file) {
      showStatus('Please select a file first', 'error');
      return;
    }

    // Show loading state
    setLoading(true);
    hideStatus();
    resultSection.style.display = 'none';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        displayResults(result.data, result.rawText);
        showStatus('Extraction completed successfully!', 'success');
      } else {
        showStatus(result.error || 'Extraction failed', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus('An error occurred while processing the file', 'error');
    } finally {
      setLoading(false);
    }
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      
      // Update buttons
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Update content
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(tabName + 'Tab').classList.add('active');
    });
  });

  function setLoading(loading) {
    extractBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnLoading.style.display = loading ? 'inline' : 'none';
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    statusMessage.style.display = 'block';
  }

  function hideStatus() {
    statusMessage.style.display = 'none';
  }

  function displayResults(data, raw) {
    // Update metadata
    document.getElementById('extractionMethod').textContent = data.extraction.method;
    document.getElementById('extractionConfidence').textContent = (data.extraction.confidence * 100).toFixed(1) + '%';
    document.getElementById('extractionPages').textContent = data.extraction.pages;

    // Display structured data
    structuredData.innerHTML = renderStructuredData(data.document);

    // Display raw text
    rawText.textContent = raw;

    // Display warnings
    if (data.extraction.warnings && data.extraction.warnings.length > 0) {
      warningsList.innerHTML = data.extraction.warnings.map(w => '<li>' + escapeHtml(w) + '</li>').join('');
      warningsSection.style.display = 'block';
    } else {
      warningsSection.style.display = 'none';
    }

    resultSection.style.display = 'block';
  }

  function renderStructuredData(doc) {
    const sections = [
      { key: 'policy', title: 'Policy Information' },
      { key: 'insurer', title: 'Insurer Information' },
      { key: 'insured', title: 'Insured / Policyholder' },
      { key: 'vehicle', title: 'Vehicle Information' },
      { key: 'coverage', title: 'Coverage Details' },
      { key: 'premium', title: 'Premium Details' },
      { key: 'idv', title: 'IDV / Vehicle Value' },
      { key: 'ncb', title: 'No Claim Bonus' },
      { key: 'financier', title: 'Financier / Hypothecation' },
      { key: 'previousInsurance', title: 'Previous Insurance' },
      { key: 'driver', title: 'Driver Information' },
      { key: 'regulatory', title: 'Regulatory Information' }
    ];

    let html = '';
    for (const section of sections) {
      const data = doc[section.key];
      if (data) {
        html += '<div class="data-section">';
        html += '<h3>' + section.title + '</h3>';
        html += '<div class="data-grid">';
        
        for (const [key, value] of Object.entries(data)) {
          const label = formatLabel(key);
          const val = value && value.value ? value.value : null;
          const confidence = value && value.confidence !== undefined ? value.confidence : 0;
          
          html += '<div class="data-field">';
          html += '<label>' + escapeHtml(label) + '</label>';
          if (val) {
            html += '<div class="value">' + escapeHtml(val) + '</div>';
            html += '<div class="confidence ' + getConfidenceClass(confidence) + '">';
            html += 'Confidence: ' + (confidence * 100).toFixed(0) + '%';
            html += '</div>';
          } else {
            html += '<div class="value null">Not found</div>';
          }
          html += '</div>';
        }
        
        html += '</div></div>';
      }
    }
    
    return html;
  }

  function formatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  function getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.5) return 'confidence-medium';
    return 'confidence-low';
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
