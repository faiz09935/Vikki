// Default Logos and Photos (SVG Data URIs)
const DEFAULT_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120"><path d="M50 5 L90 25 L90 75 Q50 115 50 115 Q10 75 10 75 L10 25 Z" fill="%231e3a8a" stroke="%23f59e0b" stroke-width="3"/><path d="M50 25 L75 38 L75 70 Q50 98 50 98 Q25 70 25 70 L25 38 Z" fill="%23ffffff"/><polygon points="50,38 58,54 75,54 61,65 66,82 50,71 34,82 39,65 25,54 42,54" fill="%23f59e0b"/></svg>';
const DEFAULT_PHOTO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120" viewBox="0 0 100 120" fill="%23e2e8f0"><rect width="100" height="120" fill="%23e2e8f0"/><circle cx="50" cy="45" r="22" fill="%2394a3b8"/><path d="M20 110 C20 80 35 75 50 75 C65 75 80 80 80 110 Z" fill="%2394a3b8"/></svg>';

let uploadedLogo = DEFAULT_LOGO;
let uploadedPhoto = DEFAULT_PHOTO;

// Initial Dataset
const initialSubjects = [
  { name: 'Physics', hasPractical: true, writtenMax: 70, writtenObt: 62, practicalMax: 30, practicalObt: 26 },
  { name: 'Chemistry', hasPractical: true, writtenMax: 70, writtenObt: 58, practicalMax: 30, practicalObt: 27 },
  { name: 'Mathematics', hasPractical: false, writtenMax: 100, writtenObt: 91, practicalMax: 0, practicalObt: 0 },
  { name: 'Computer Programming', hasPractical: true, writtenMax: 60, writtenObt: 54, practicalMax: 40, practicalObt: 37 },
  { name: 'English Communication', hasPractical: false, writtenMax: 100, writtenObt: 84, practicalMax: 0, practicalObt: 0 }
];

document.addEventListener('DOMContentLoaded', () => {
  // Populate initial rows
  renderSubjectInputs(initialSubjects);

  // Bind Listeners
  document.getElementById('addSubjectBtn').addEventListener('click', () => addSubjectRow());
  document.getElementById('generateBtn').addEventListener('click', handleGenerateMarksheet);
  document.getElementById('loadSampleBtn').addEventListener('click', () => renderSubjectInputs(initialSubjects));
  
  const editBtn = document.getElementById('editInputsBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      document.getElementById('resultContainer').style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Handle Logo Upload
  document.getElementById('logoInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        uploadedLogo = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle Photo Upload
  document.getElementById('photoInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        uploadedPhoto = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Set issue date
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDateString').textContent = now.toLocaleDateString('en-US', options);
});

function renderSubjectInputs(subjects) {
  const container = document.getElementById('subjectInputRows');
  container.innerHTML = '';
  subjects.forEach(sub => addSubjectRow(sub));
}

function addSubjectRow(data = {}) {
  const container = document.getElementById('subjectInputRows');
  const tr = document.createElement('tr');
  const hasPrac = data.hasPractical !== undefined ? data.hasPractical : true;

  tr.innerHTML = `
    <td>
      <input type="text" class="sub-name" placeholder="Subject Name" value="${escapeHtml(data.name || '')}" />
    </td>
    <td>
      <select class="sub-has-practical">
        <option value="yes" ${hasPrac ? 'selected' : ''}>Yes</option>
        <option value="no" ${!hasPrac ? 'selected' : ''}>No</option>
      </select>
    </td>
    <td>
      <input type="number" class="sub-written-max" min="1" placeholder="Max" value="${data.writtenMax !== undefined ? data.writtenMax : 70}" />
    </td>
    <td>
      <input type="number" class="sub-written-obt" min="0" placeholder="Obtained" value="${data.writtenObt !== undefined ? data.writtenObt : 0}" />
    </td>
    <td>
      <input type="number" class="sub-practical-max" min="0" placeholder="Max" value="${hasPrac ? (data.practicalMax !== undefined ? data.practicalMax : 30) : 0}" ${!hasPrac ? 'disabled' : ''} />
    </td>
    <td>
      <input type="number" class="sub-practical-obt" min="0" placeholder="Obtained" value="${hasPrac ? (data.practicalObt !== undefined ? data.practicalObt : 0) : 0}" ${!hasPrac ? 'disabled' : ''} />
    </td>
    <td class="text-center">
      <button type="button" class="btn-remove">Remove</button>
    </td>
  `;

  // Toggle Practical Inputs
  const selectPrac = tr.querySelector('.sub-has-practical');
  const pMaxInput = tr.querySelector('.sub-practical-max');
  const pObtInput = tr.querySelector('.sub-practical-obt');

  selectPrac.addEventListener('change', () => {
    const isYes = selectPrac.value === 'yes';
    if (isYes) {
      pMaxInput.disabled = false;
      pObtInput.disabled = false;
      if (Number(pMaxInput.value) === 0) pMaxInput.value = 30;
    } else {
      pMaxInput.disabled = true;
      pObtInput.disabled = true;
      pMaxInput.value = 0;
      pObtInput.value = 0;
    }
  });

  // Remove row handler
  tr.querySelector('.btn-remove').addEventListener('click', () => {
    const totalRows = container.querySelectorAll('tr').length;
    if (totalRows <= 1) {
      alert('At least one subject is required.');
      return;
    }
    tr.remove();
  });

  container.appendChild(tr);
}

function handleGenerateMarksheet() {
  const errorBox = document.getElementById('errorBox');
  errorBox.style.display = 'none';
  errorBox.textContent = '';

  const rows = document.querySelectorAll('#subjectInputRows tr');
  const parsedSubjects = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const name = row.querySelector('.sub-name').value.trim() || `Subject ${rowNum}`;
    const hasPractical = row.querySelector('.sub-has-practical').value === 'yes';
    const writtenMax = parseFloat(row.querySelector('.sub-written-max').value);
    const writtenObt = parseFloat(row.querySelector('.sub-written-obt').value);
    const practicalMax = hasPractical ? parseFloat(row.querySelector('.sub-practical-max').value) : 0;
    const practicalObt = hasPractical ? parseFloat(row.querySelector('.sub-practical-obt').value) : 0;

    // Validations
    if (isNaN(writtenMax) || writtenMax <= 0) {
      errors.push(`Row ${rowNum} (${name}): Written Maximum marks must be greater than 0.`);
    }
    if (isNaN(writtenObt) || writtenObt < 0) {
      errors.push(`Row ${rowNum} (${name}): Written Obtained marks cannot be negative or blank.`);
    } else if (writtenObt > writtenMax) {
      errors.push(`Row ${rowNum} (${name}): Written Obtained (${writtenObt}) cannot exceed Written Maximum (${writtenMax}).`);
    }

    if (hasPractical) {
      if (isNaN(practicalMax) || practicalMax <= 0) {
        errors.push(`Row ${rowNum} (${name}): Practical Maximum marks must be greater than 0.`);
      }
      if (isNaN(practicalObt) || practicalObt < 0) {
        errors.push(`Row ${rowNum} (${name}): Practical Obtained marks cannot be negative or blank.`);
      } else if (practicalObt > practicalMax) {
        errors.push(`Row ${rowNum} (${name}): Practical Obtained (${practicalObt}) cannot exceed Practical Maximum (${practicalMax}).`);
      }
    }

    parsedSubjects.push({
      name,
      hasPractical,
      writtenMax: isNaN(writtenMax) ? 0 : writtenMax,
      writtenObt: isNaN(writtenObt) ? 0 : writtenObt,
      practicalMax: hasPractical ? (isNaN(practicalMax) ? 0 : practicalMax) : 0,
      practicalObt: hasPractical ? (isNaN(practicalObt) ? 0 : practicalObt) : 0
    });
  });

  if (errors.length > 0) {
    errorBox.textContent = errors.join('\n');
    errorBox.style.display = 'block';
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Populate Document
  populateMarksheet(parsedSubjects);
}

function getLetterGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

function populateMarksheet(subjects) {
  // Institutional & Candidate Meta
  document.getElementById('renderCollegeName').textContent = (document.getElementById('collegeName').value.trim() || 'INSTITUTION NAME').toUpperCase();
  document.getElementById('renderCollegeAddress').textContent = document.getElementById('collegeAddress').value.trim() || 'Institution Address Details';
  document.getElementById('renderStudentName').textContent = (document.getElementById('studentName').value.trim() || 'Candidate Name').toUpperCase();
  document.getElementById('renderRollNumber').textContent = document.getElementById('rollNumber').value.trim() || 'N/A';
  document.getElementById('renderCourseName').textContent = document.getElementById('courseName').value.trim() || 'Academic Course';
  document.getElementById('renderExamSession').textContent = document.getElementById('examSession').value.trim() || 'Annual / Semester Examination';

  // Images
  document.getElementById('renderLogo').src = uploadedLogo;
  document.getElementById('renderPhoto').src = uploadedPhoto;

  // Process Rows
  const tbody = document.getElementById('reportTableBody');
  tbody.innerHTML = '';

  let totalWrittenMax = 0;
  let totalWrittenObt = 0;
  let totalPracticalMax = 0;
  let totalPracticalObt = 0;
  let hasFailedSubject = false;

  subjects.forEach((sub, i) => {
    const rowTotalMax = sub.writtenMax + sub.practicalMax;
    const rowTotalObt = sub.writtenObt + sub.practicalObt;
    const rowPct = rowTotalMax > 0 ? (rowTotalObt / rowTotalMax) * 100 : 0;
    const grade = getLetterGrade(rowPct);
    
    // Pass threshold: minimum 33% overall and in practical if applicable
    const isSubjectPass = rowPct >= 33 && (!sub.hasPractical || (sub.practicalMax === 0 || (sub.practicalObt / sub.practicalMax) >= 0.33));
    if (!isSubjectPass) hasFailedSubject = true;

    totalWrittenMax += sub.writtenMax;
    totalWrittenObt += sub.writtenObt;
    totalPracticalMax += sub.practicalMax;
    totalPracticalObt += sub.practicalObt;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-center font-mono">${i + 1}</td>
      <td class="text-left font-weight-600">${escapeHtml(sub.name)}</td>
      <td class="text-center font-mono">${sub.writtenMax}</td>
      <td class="text-center font-mono">${sub.writtenObt}</td>
      <td class="text-center font-mono">${sub.hasPractical ? sub.practicalMax : '—'}</td>
      <td class="text-center font-mono">${sub.hasPractical ? sub.practicalObt : '—'}</td>
      <td class="text-center font-mono font-weight-bold">${rowTotalMax}</td>
      <td class="text-center font-mono font-weight-bold">${rowTotalObt}</td>
      <td class="text-center font-weight-bold">${grade}</td>
      <td class="text-center">
        <span class="status-badge ${isSubjectPass ? 'pass' : 'fail'}">${isSubjectPass ? 'PASS' : 'FAIL'}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const grandTotalMax = totalWrittenMax + totalPracticalMax;
  const grandTotalObt = totalWrittenObt + totalPracticalObt;
  const overallPercentage = grandTotalMax > 0 ? ((grandTotalObt / grandTotalMax) * 100) : 0;
  const overallGrade = getLetterGrade(overallPercentage);
  const finalResultStatus = hasFailedSubject ? 'FAIL / RE-APPEAR' : 'PASSED';

  // Table Totals
  document.getElementById('renderTotalWrittenMax').textContent = totalWrittenMax;
  document.getElementById('renderTotalWrittenObt').textContent = totalWrittenObt;
  document.getElementById('renderTotalPracticalMax').textContent = totalPracticalMax;
  document.getElementById('renderTotalPracticalObt').textContent = totalPracticalObt;
  document.getElementById('renderGrandTotalMax').textContent = grandTotalMax;
  document.getElementById('renderGrandTotalObt').textContent = grandTotalObt;
  document.getElementById('renderOverallGrade').textContent = overallGrade;
  document.getElementById('renderFinalStatus').innerHTML = `<span class="status-badge ${hasFailedSubject ? 'fail' : 'pass'}">${hasFailedSubject ? 'FAIL' : 'PASS'}</span>`;

  // Summary Card
  document.getElementById('summaryAggregate').textContent = `${grandTotalObt} / ${grandTotalMax}`;
  document.getElementById('summaryPercentage').textContent = `${overallPercentage.toFixed(2)}%`;
  document.getElementById('summaryGrade').textContent = overallGrade;
  
  const finalResBadge = document.getElementById('summaryFinalResult');
  finalResBadge.textContent = finalResultStatus;
  finalResBadge.style.color = hasFailedSubject ? '#b91c1c' : '#15803d';

  // Display result block and scroll
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.style.display = 'block';
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
