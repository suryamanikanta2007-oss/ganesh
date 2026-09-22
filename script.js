/**
 * Mattaparthi Vari Pallem - Vinayaka Chavithi 5 KG Laddu Event (Bandarulanka)
 * Technology: Pure Vanilla JavaScript • GitHub Pages Compatible
 * Features: Sequential Serial Allocation, Client-side Prototype Storage,
 * Privacy-Shielded Public Participant Directory, WhatsApp Sharing & CSV Export.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const regForm = document.getElementById('registrationForm');
  const nameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phoneNumber');
  const areaInput = document.getElementById('areaLocation');
  const consentCheckbox = document.getElementById('consentCheckbox');
  const submitRegBtn = document.getElementById('submitRegBtn');

  // Confirmation Ticket Elements
  const ticketEmptyState = document.getElementById('ticketEmptyState');
  const digitalTicketCard = document.getElementById('digitalTicketCard');
  const displayTicketId = document.getElementById('displayTicketId');
  const displaySerialNo = document.getElementById('displaySerialNo');
  const displayName = document.getElementById('displayName');
  const displayRegDate = document.getElementById('displayRegDate');
  const displayBarcodeText = document.getElementById('displayBarcodeText');

  // Buttons
  const copyRefBtn = document.getElementById('copyRefBtn');
  const whatsappShareBtn = document.getElementById('whatsappShareBtn');
  const printTicketBtn = document.getElementById('printTicketBtn');
  const registerAnotherBtn = document.getElementById('registerAnotherBtn');

  // Participant Directory & Search
  const participantSearchInput = document.getElementById('participantSearchInput');
  const participantsTableBody = document.getElementById('participantsTableBody');
  const participantCount = document.getElementById('participantCount');
  const tableEmptyState = document.getElementById('tableEmptyState');

  // Admin Dashboard Preview Elements
  const adminTotalCount = document.getElementById('adminTotalCount');
  const adminSlotsLeft = document.getElementById('adminSlotsLeft');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearLocalDataBtn = document.getElementById('clearLocalDataBtn');

  // Navigation & Particles
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const primaryNav = document.getElementById('primaryNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const toggleMotionBtn = document.getElementById('toggleMotionBtn');
  const canvas = document.getElementById('festiveCanvas');
  const toastContainer = document.getElementById('toastContainer');

  // State
  let activeTicketData = null;
  let particlesActive = true;
  let animationFrameId = null;

  // Initial Sample Data for Prototype Evaluation
  const initialSampleData = [
    { serialNo: '001', refId: 'MMP-001', name: 'Manikanta', location: 'Bandarulanka', status: 'Registration Received', date: '22-Sep-2026' },
    { serialNo: '002', refId: 'MMP-002', name: 'Ravi Kumar', location: 'Bandarulanka', status: 'Registration Received', date: '22-Sep-2026' },
    { serialNo: '003', refId: 'MMP-003', name: 'Suresh Varma', location: 'Bandarulanka', status: 'Registration Received', date: '22-Sep-2026' }
  ];

  /* ==========================================================================
     1. Toast Notification Utility
     ========================================================================== */
  function showToast(message, icon = '✨', duration = 3500) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, duration);
  }

  /* ==========================================================================
     2. Data Storage & Sequential Serial Management
     ========================================================================== */
  function getStoredParticipants() {
    try {
      const stored = localStorage.getItem('mmp_participants_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using initial data');
    }
    // Fallback to sample data
    saveParticipants(initialSampleData);
    return [...initialSampleData];
  }

  function saveParticipants(dataList) {
    try {
      localStorage.setItem('mmp_participants_list', JSON.stringify(dataList));
    } catch (e) {
      console.warn('Could not save to LocalStorage', e);
    }
  }

  function getNextSerialInfo(currentList) {
    const nextNumber = currentList.length + 1;
    const formattedSerial = String(nextNumber).padStart(3, '0');
    const formattedRef = `MMP-${formattedSerial}`;
    return { serialNo: formattedSerial, refId: formattedRef };
  }

  function formatCurrentDate() {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
  }

  /* ==========================================================================
     3. Render Participant Directory Table
     ========================================================================== */
  function renderParticipantTable(filterTerm = '') {
    const list = getStoredParticipants();
    if (!participantsTableBody) return;

    participantsTableBody.innerHTML = '';
    const cleanFilter = filterTerm.trim().toLowerCase();

    const filtered = list.filter((p) => {
      if (!cleanFilter) return true;
      return (
        p.name.toLowerCase().includes(cleanFilter) ||
        p.refId.toLowerCase().includes(cleanFilter) ||
        p.serialNo.includes(cleanFilter)
      );
    });

    if (filtered.length === 0) {
      if (tableEmptyState) tableEmptyState.style.display = 'block';
    } else {
      if (tableEmptyState) tableEmptyState.style.display = 'none';

      filtered.forEach((item) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="serial-cell"><strong>${item.serialNo}</strong></td>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td><span class="ref-tag">${item.refId}</span></td>
          <td><span class="status-badge-rcv">Received</span></td>
        `;
        participantsTableBody.appendChild(tr);
      });
    }

    // Update Counts
    if (participantCount) participantCount.textContent = String(list.length);
    if (adminTotalCount) adminTotalCount.textContent = String(list.length);
    if (adminSlotsLeft) adminSlotsLeft.textContent = String(Math.max(0, 99 - list.length));
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Real-time directory search
  if (participantSearchInput) {
    participantSearchInput.addEventListener('input', (e) => {
      renderParticipantTable(e.target.value);
    });
  }

  /* ==========================================================================
     4. Form Validation & Registration Handler
     ========================================================================== */
  function validateName() {
    const group = document.getElementById('nameGroup');
    const errorMsg = document.getElementById('nameError');
    const val = nameInput.value.trim();

    if (!val) {
      setFieldError(group, errorMsg, 'Please enter the participant\'s full name.');
      return false;
    }
    if (val.length < 2) {
      setFieldError(group, errorMsg, 'Name must be at least 2 characters long.');
      return false;
    }
    if (!/^[a-zA-Z\s\.]+$/.test(val)) {
      setFieldError(group, errorMsg, 'Please use standard letters, dots, and spaces only.');
      return false;
    }
    setFieldSuccess(group, errorMsg);
    return true;
  }

  function validatePhone() {
    const group = document.getElementById('phoneGroup');
    const errorMsg = document.getElementById('phoneError');
    const val = phoneInput.value.trim().replace(/\D/g, '');

    if (!val) {
      setFieldError(group, errorMsg, 'Please enter a 10-digit mobile number.');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(val)) {
      setFieldError(group, errorMsg, 'Enter a valid 10-digit Indian mobile number (starts with 6-9).');
      return false;
    }
    setFieldSuccess(group, errorMsg);
    return true;
  }

  function validateConsent() {
    const group = document.getElementById('consentGroup');
    const errorMsg = document.getElementById('consentError');

    if (!consentCheckbox.checked) {
      setFieldError(group, errorMsg, 'You must accept the terms and event rules to submit.');
      return false;
    }
    setFieldSuccess(group, errorMsg);
    return true;
  }

  function setFieldError(group, errorEl, msg) {
    if (group) {
      group.classList.remove('has-success');
      group.classList.add('has-error');
    }
    if (errorEl) errorEl.textContent = msg;
  }

  function setFieldSuccess(group, errorEl) {
    if (group) {
      group.classList.remove('has-error');
      group.classList.add('has-success');
    }
    if (errorEl) errorEl.textContent = '';
  }

  // Real-time phone sanitization
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      if (e.target.value.length === 10) validatePhone();
    });
    phoneInput.addEventListener('blur', validatePhone);
  }

  if (nameInput) {
    nameInput.addEventListener('blur', validateName);
    nameInput.addEventListener('input', () => {
      if (document.getElementById('nameGroup').classList.contains('has-error')) {
        validateName();
      }
    });
  }

  if (consentCheckbox) {
    consentCheckbox.addEventListener('change', validateConsent);
  }

  function handleRegistration(e) {
    e.preventDefault();

    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isConsentValid = validateConsent();

    if (!isNameValid || !isPhoneValid || !isConsentValid) {
      showToast('Please correct highlighted errors before submitting.', '⚠️', 3000);
      return;
    }

    const currentList = getStoredParticipants();
    if (currentList.length >= 99) {
      showToast('Registration limit (99 participants) has been reached.', '⚠️', 4000);
      return;
    }

    submitRegBtn.disabled = true;
    submitRegBtn.innerHTML = '<span class="btn-text">Allocating Serial...</span> <span>⏳</span>';

    setTimeout(() => {
      const nextInfo = getNextSerialInfo(currentList);
      const newEntry = {
        serialNo: nextInfo.serialNo,
        refId: nextInfo.refId,
        name: nameInput.value.trim(),
        location: 'Bandarulanka',
        status: 'Registration Received',
        date: formatCurrentDate()
      };

      // Add to array & save
      currentList.push(newEntry);
      saveParticipants(currentList);

      // Render Confirmation Pass
      renderTicketPass(newEntry);

      // Refresh directory table
      renderParticipantTable();

      submitRegBtn.disabled = false;
      submitRegBtn.innerHTML = '<span class="btn-text">Registered Successfully ✓</span> <span class="btn-icon">🎟️</span>';

      showToast(`🎉 Registration Confirmed! Serial: ${newEntry.serialNo} • Ref: ${newEntry.refId}`, '🪔', 4500);

      // Scroll to ticket on mobile view
      if (window.innerWidth < 992 && digitalTicketCard) {
        digitalTicketCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 550);
  }

  if (regForm) {
    regForm.addEventListener('submit', handleRegistration);
  }

  /* ==========================================================================
     5. Render Digital Ticket Pass Card
     ========================================================================== */
  function renderTicketPass(data) {
    if (!digitalTicketCard || !ticketEmptyState) return;

    activeTicketData = data;

    displayTicketId.textContent = data.refId;
    displaySerialNo.textContent = data.serialNo;
    displayName.textContent = data.name;
    displayRegDate.textContent = data.date;
    displayBarcodeText.textContent = `${data.refId}-BANDARULANKA`;

    ticketEmptyState.style.display = 'none';
    digitalTicketCard.style.display = 'block';

    try {
      localStorage.setItem('mmp_active_ticket', JSON.stringify(data));
    } catch (e) {
      // Ignore
    }
  }

  function loadActiveTicket() {
    try {
      const saved = localStorage.getItem('mmp_active_ticket');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.refId && parsed.name) {
          renderTicketPass(parsed);
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  /* ==========================================================================
     6. Ticket Actions (Copy, WhatsApp Share, Print, Reset)
     ========================================================================== */
  // 6.1 Copy Reference
  if (copyRefBtn) {
    copyRefBtn.addEventListener('click', () => {
      if (!activeTicketData) return;
      const ref = activeTicketData.refId;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ref).then(() => {
          showToast(`📋 Copied: ${ref}`, '✓', 3000);
        }).catch(() => fallbackCopy(ref));
      } else {
        fallbackCopy(ref);
      }
    });
  }

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast(`📋 Copied: ${text}`, '✓', 3000);
    } catch (e) {
      showToast(`Reference: ${text}`, '🎟️', 3500);
    }
    document.body.removeChild(input);
  }

  // 6.2 WhatsApp Share (Exact Required Format)
  if (whatsappShareBtn) {
    whatsappShareBtn.addEventListener('click', () => {
      if (!activeTicketData) return;

      const message = 
`🙏 Vinayaka Chavithi Greetings! 🙏
Mattaparthi Vari Pallem
5 KG Laddu Event
📍 Location: Bandarulanka
🎟️ Registration Reference: ${activeTicketData.refId}
👤 Participant: ${activeTicketData.name}

This is a registration confirmation for the event. It is not proof of payment or a guaranteed prize-winning ticket.`;

      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // 6.3 Print Action
  if (printTicketBtn) {
    printTicketBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 6.4 Register Another Participant
  if (registerAnotherBtn) {
    registerAnotherBtn.addEventListener('click', () => {
      if (regForm) {
        regForm.reset();
        document.querySelectorAll('.form-group').forEach((g) => {
          g.classList.remove('has-success', 'has-error');
        });
        document.querySelectorAll('.error-msg').forEach((e) => {
          e.textContent = '';
        });
      }
      submitRegBtn.innerHTML = '<span class="btn-text">Submit Registration</span> <span class="btn-icon">🎟️</span>';
      
      ticketEmptyState.style.display = 'block';
      digitalTicketCard.style.display = 'none';
      activeTicketData = null;

      try {
        localStorage.removeItem('mmp_active_ticket');
      } catch (e) {
        // Ignore
      }

      showToast('Form cleared for new registration', '↺', 2500);
      nameInput.focus();
    });
  }

  /* ==========================================================================
     7. Admin Preview Actions (CSV Export & Data Reset)
     ========================================================================== */
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const list = getStoredParticipants();
      if (!list || list.length === 0) {
        showToast('No records available to export.', '⚠️', 2500);
        return;
      }

      // Prepare CSV (strictly without phone numbers to preserve privacy)
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Serial No,Participant Name,Registration Reference,Location,Status,Date\n';

      list.forEach((row) => {
        const nameClean = `"${row.name.replace(/"/g, '""')}"`;
        csvContent += `${row.serialNo},${nameClean},${row.refId},${row.location},${row.status},${row.date}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Mattaparthi_Vari_Pallem_Participants_${formatCurrentDate()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('📥 Participant CSV exported successfully!', '✓', 3500);
    });
  }

  if (clearLocalDataBtn) {
    clearLocalDataBtn.addEventListener('click', () => {
      if (confirm('Reset participant records to default sample data?')) {
        saveParticipants(initialSampleData);
        renderParticipantTable();
        showToast('Sample data restored.', '↺', 2500);
      }
    });
  }

  /* ==========================================================================
     8. Particle Canvas Engine & Reduced Motion
     ========================================================================== */
  function initParticleCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const count = window.innerWidth < 768 ? 20 : 42;
    const particles = [];
    const colors = [
      'rgba(255, 215, 0, ',
      'rgba(255, 152, 0, ',
      'rgba(255, 245, 157, ',
      'rgba(255, 109, 0, '
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.8 + 1;
        this.speedY = Math.random() * 0.7 + 0.25;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.baseAlpha = Math.random() * 0.7 + 0.3;
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        this.pulsing = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.04 + 0.02;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.pulsing += this.pulseSpeed;
        this.alpha = this.baseAlpha * (0.6 + 0.4 * Math.sin(this.pulsing));

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset(false);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorBase}${this.alpha})`;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function render() {
      if (!particlesActive) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(render);
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      particlesActive = false;
      if (toggleMotionBtn) {
        toggleMotionBtn.innerHTML = '<span class="motion-icon">✨</span> <span class="motion-text">Sparks OFF</span>';
      }
    } else {
      render();
    }

    if (toggleMotionBtn) {
      toggleMotionBtn.addEventListener('click', () => {
        particlesActive = !particlesActive;
        if (particlesActive) {
          toggleMotionBtn.innerHTML = '<span class="motion-icon">✨</span> <span class="motion-text">Sparks ON</span>';
          showToast('Festive sparkles activated', '✨', 2000);
          render();
        } else {
          toggleMotionBtn.innerHTML = '<span class="motion-icon">⏸️</span> <span class="motion-text">Sparks OFF</span>';
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          ctx.clearRect(0, 0, width, height);
          showToast('Festive sparkles paused', '⏸️', 2000);
        }
      });
    }
  }

  /* ==========================================================================
     9. Mobile Navigation Toggle
     ========================================================================== */
  if (mobileNavToggle && primaryNav) {
    mobileNavToggle.addEventListener('click', () => {
      const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
      mobileNavToggle.setAttribute('aria-expanded', String(!isExpanded));
      primaryNav.classList.toggle('nav-open');
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (primaryNav.classList.contains('nav-open')) {
          primaryNav.classList.remove('nav-open');
          mobileNavToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // --- Initial Launch Calls ---
  initParticleCanvas();
  renderParticipantTable();
  loadActiveTicket();
});
