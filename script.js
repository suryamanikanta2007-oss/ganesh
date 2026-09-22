/**
 * Mattaparthi Vari Pallem - Vinayaka Chavithi 5 KG Laddu Event (Bandarulanka)
 * Technology: Pure Vanilla JavaScript • GitHub Pages Compatible
 * Features: Sequential Serial Allocation, Full Admin Participant Management
 * (Edit Name/Mobile/Status, Soft-Cancel & Hard-Delete, Search/Filter, CSV Export & Backup).
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  // Public Registration Form
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

  // Ticket Action Buttons
  const copyRefBtn = document.getElementById('copyRefBtn');
  const whatsappShareBtn = document.getElementById('whatsappShareBtn');
  const printTicketBtn = document.getElementById('printTicketBtn');
  const registerAnotherBtn = document.getElementById('registerAnotherBtn');

  // Public Participant Directory & Search
  const participantSearchInput = document.getElementById('participantSearchInput');
  const participantsTableBody = document.getElementById('participantsTableBody');
  const participantCount = document.getElementById('participantCount');
  const tableEmptyState = document.getElementById('tableEmptyState');

  // Admin Dashboard Elements & Stats
  const adminTotalCount = document.getElementById('adminTotalCount');
  const adminActiveCount = document.getElementById('adminActiveCount');
  const adminNextSerial = document.getElementById('adminNextSerial');
  const adminSlotsLeft = document.getElementById('adminSlotsLeft');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearLocalDataBtn = document.getElementById('clearLocalDataBtn');

  // Admin Search, Filters & Management Table
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminStatusFilter = document.getElementById('adminStatusFilter');
  const adminSortFilter = document.getElementById('adminSortFilter');
  const adminTableBody = document.getElementById('adminTableBody');
  const adminTableEmptyState = document.getElementById('adminTableEmptyState');

  // Edit Modal Elements
  const editModalBackdrop = document.getElementById('editModalBackdrop');
  const editParticipantForm = document.getElementById('editParticipantForm');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const editSerialNo = document.getElementById('editSerialNo');
  const editRefId = document.getElementById('editRefId');
  const editFullName = document.getElementById('editFullName');
  const editPhoneNumber = document.getElementById('editPhoneNumber');
  const editAreaLocation = document.getElementById('editAreaLocation');
  const editStatusSelect = document.getElementById('editStatusSelect');
  const editRegDate = document.getElementById('editRegDate');
  const editNameError = document.getElementById('editNameError');
  const editPhoneError = document.getElementById('editPhoneError');

  // Delete / Cancel Modal Elements
  const deleteModalBackdrop = document.getElementById('deleteModalBackdrop');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
  const cancelDeleteActionBtn = document.getElementById('cancelDeleteActionBtn');
  const confirmSoftCancelBtn = document.getElementById('confirmSoftCancelBtn');
  const confirmHardDeleteBtn = document.getElementById('confirmHardDeleteBtn');
  const deleteParticipantName = document.getElementById('deleteParticipantName');
  const deleteParticipantSerial = document.getElementById('deleteParticipantSerial');
  const deleteParticipantRef = document.getElementById('deleteParticipantRef');

  // Navigation & Floating Particles
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const primaryNav = document.getElementById('primaryNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const toggleMotionBtn = document.getElementById('toggleMotionBtn');
  const canvas = document.getElementById('festiveCanvas');
  const toastContainer = document.getElementById('toastContainer');

  // State
  let activeTicketData = null;
  let currentlySelectedParticipant = null;
  let particlesActive = true;
  let animationFrameId = null;

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
     2. Data Storage & Sequential Serial Allocation
     ========================================================================== */
  function getStoredParticipants() {
    try {
      const stored = localStorage.getItem('mmp_participants_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable');
    }
    return [];
  }

  function saveParticipants(dataList) {
    try {
      localStorage.setItem('mmp_participants_list', JSON.stringify(dataList));
    } catch (e) {
      console.warn('Could not save to LocalStorage', e);
    }
  }

  function getNextSerialInfo(currentList) {
    let maxSerial = 0;
    currentList.forEach((p) => {
      const num = parseInt(p.serialNo, 10);
      if (!isNaN(num) && num > maxSerial) {
        maxSerial = num;
      }
    });
    const nextNumber = maxSerial + 1;
    const formattedSerial = String(nextNumber).padStart(3, '0');
    const formattedRef = `MMP-${formattedSerial}`;
    return { serialNo: formattedSerial, refId: formattedRef };
  }

  function formatCurrentDate() {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
  }

  function maskPhone(phone) {
    if (!phone) return 'N/A';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)}-XXXXX`;
    }
    return phone;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ==========================================================================
     3. Synchronized Stats Dashboard Updater
     ========================================================================== */
  function updateDashboardStats() {
    const list = getStoredParticipants();
    const activeList = list.filter((p) => p.status !== 'Cancelled');
    const nextInfo = getNextSerialInfo(list);

    if (participantCount) participantCount.textContent = String(list.length);
    if (adminTotalCount) adminTotalCount.textContent = String(list.length);
    if (adminActiveCount) adminActiveCount.textContent = String(activeList.length);
    if (adminNextSerial) adminNextSerial.textContent = nextInfo.serialNo;
    if (adminSlotsLeft) adminSlotsLeft.textContent = String(Math.max(0, 99 - list.length));
  }

  /* ==========================================================================
     4. Public Participant Directory Rendering
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
      if (tableEmptyState) {
        tableEmptyState.style.display = 'block';
        if (cleanFilter) {
          tableEmptyState.innerHTML = '<div class="empty-icon-sm">🔍</div><p>No matching participants found for your search.</p>';
        } else {
          tableEmptyState.innerHTML = '<div class="empty-icon-sm">📝</div><p>No registrations yet. Be the first to register using the form above!</p>';
        }
      }
    } else {
      if (tableEmptyState) tableEmptyState.style.display = 'none';

      filtered.forEach((item) => {
        const isCancelled = item.status === 'Cancelled';
        const statusClass = isCancelled ? 'status-badge-cancelled' : 'status-badge-rcv';
        const statusLabel = isCancelled ? 'Cancelled' : 'Received';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="serial-cell"><strong>${item.serialNo}</strong></td>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td><span class="ref-tag">${item.refId}</span></td>
          <td><span class="${statusClass}">${statusLabel}</span></td>
        `;
        participantsTableBody.appendChild(tr);
      });
    }

    updateDashboardStats();
  }

  if (participantSearchInput) {
    participantSearchInput.addEventListener('input', (e) => {
      renderParticipantTable(e.target.value);
    });
  }

  /* ==========================================================================
     5. Admin Participant Management Table Rendering
     ========================================================================== */
  function renderAdminTable() {
    if (!adminTableBody) return;

    const list = getStoredParticipants();
    adminTableBody.innerHTML = '';

    const searchTerm = adminSearchInput ? adminSearchInput.value.trim().toLowerCase() : '';
    const statusFilter = adminStatusFilter ? adminStatusFilter.value : 'ALL';
    const sortOrder = adminSortFilter ? adminSortFilter.value : 'SERIAL_ASC';

    // 1. Filter
    let filtered = list.filter((p) => {
      // Search match
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm) ||
        p.refId.toLowerCase().includes(searchTerm) ||
        p.serialNo.includes(searchTerm) ||
        (p.phone && p.phone.includes(searchTerm)) ||
        (p.location && p.location.toLowerCase().includes(searchTerm));

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'Active') {
        matchesStatus = p.status !== 'Cancelled';
      } else if (statusFilter === 'Cancelled') {
        matchesStatus = p.status === 'Cancelled';
      }

      return matchesSearch && matchesStatus;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      if (sortOrder === 'SERIAL_ASC') {
        return parseInt(a.serialNo, 10) - parseInt(b.serialNo, 10);
      } else if (sortOrder === 'SERIAL_DESC') {
        return parseInt(b.serialNo, 10) - parseInt(a.serialNo, 10);
      } else if (sortOrder === 'NAME_ASC') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    if (filtered.length === 0) {
      if (adminTableEmptyState) {
        adminTableEmptyState.style.display = 'block';
        if (searchTerm || statusFilter !== 'ALL') {
          adminTableEmptyState.innerHTML = '<div class="empty-icon-sm">🔍</div><p>No participant records match the current filter criteria.</p>';
        } else {
          adminTableEmptyState.innerHTML = '<div class="empty-icon-sm">📝</div><p>No participant records found in the database. Registrations will appear here in real-time.</p>';
        }
      }
    } else {
      if (adminTableEmptyState) adminTableEmptyState.style.display = 'none';

      filtered.forEach((item) => {
        const isCancelled = item.status === 'Cancelled';
        const statusClass = isCancelled ? 'status-badge-cancelled' : 'status-badge-rcv';
        const displayStatus = isCancelled ? 'Cancelled' : (item.status || 'Received');

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="serial-cell"><strong>${item.serialNo}</strong></td>
          <td><span class="ref-tag">${item.refId}</span></td>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td><span title="Private Admin View">${maskPhone(item.phone)}</span></td>
          <td>${escapeHtml(item.location || 'Bandarulanka')}</td>
          <td><span class="${statusClass}">${displayStatus}</span></td>
          <td class="admin-actions-cell">
            <button type="button" class="btn-action-edit" data-serial="${item.serialNo}" title="Edit participant name & details">
              ✏️ Edit
            </button>
            <button type="button" class="btn-action-delete" data-serial="${item.serialNo}" title="Cancel or delete registration">
              🗑️ Delete
            </button>
          </td>
        `;
        adminTableBody.appendChild(tr);
      });

      // Attach row action listeners
      adminTableBody.querySelectorAll('.btn-action-edit').forEach((btn) => {
        btn.addEventListener('click', () => {
          const serial = btn.getAttribute('data-serial');
          openEditModal(serial);
        });
      });

      adminTableBody.querySelectorAll('.btn-action-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const serial = btn.getAttribute('data-serial');
          openDeleteModal(serial);
        });
      });
    }

    updateDashboardStats();
  }

  // Admin filter event listeners
  if (adminSearchInput) adminSearchInput.addEventListener('input', renderAdminTable);
  if (adminStatusFilter) adminStatusFilter.addEventListener('change', renderAdminTable);
  if (adminSortFilter) adminSortFilter.addEventListener('change', renderAdminTable);

  /* ==========================================================================
     6. Edit Participant Workflow & Modal
     ========================================================================== */
  function openEditModal(serialNo) {
    const list = getStoredParticipants();
    const target = list.find((p) => p.serialNo === serialNo);

    if (!target) {
      showToast('Participant record not found.', '⚠️', 2500);
      return;
    }

    currentlySelectedParticipant = target;

    // Populate Modal Form Fields
    editSerialNo.value = target.serialNo;
    editRefId.value = target.refId;
    editFullName.value = target.name || '';
    editPhoneNumber.value = target.phone ? target.phone.replace(/\D/g, '') : '';
    editAreaLocation.value = target.location || 'Bandarulanka';
    editStatusSelect.value = target.status || 'Registration Received';
    editRegDate.value = target.date || formatCurrentDate();

    // Clear previous errors
    if (editNameError) editNameError.textContent = '';
    if (editPhoneError) editPhoneError.textContent = '';
    document.getElementById('editNameGroup').classList.remove('has-error');
    document.getElementById('editPhoneGroup').classList.remove('has-error');

    // Show Modal
    if (editModalBackdrop) {
      editModalBackdrop.style.display = 'flex';
      editFullName.focus();
    }
  }

  function closeEditModal() {
    if (editModalBackdrop) {
      editModalBackdrop.style.display = 'none';
      currentlySelectedParticipant = null;
    }
  }

  if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  // Close on backdrop click
  if (editModalBackdrop) {
    editModalBackdrop.addEventListener('click', (e) => {
      if (e.target === editModalBackdrop) closeEditModal();
    });
  }

  if (editParticipantForm) {
    editParticipantForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentlySelectedParticipant) return;

      const newName = editFullName.value.trim();
      const newPhone = editPhoneNumber.value.trim().replace(/\D/g, '');
      const newArea = editAreaLocation.value.trim() || 'Bandarulanka';
      const newStatus = editStatusSelect.value;

      // Validation
      let isValid = true;
      if (!newName || newName.length < 2 || !/^[a-zA-Z\s\.]+$/.test(newName)) {
        document.getElementById('editNameGroup').classList.add('has-error');
        if (editNameError) editNameError.textContent = 'Enter a valid participant name (min 2 characters, letters only).';
        isValid = false;
      } else {
        document.getElementById('editNameGroup').classList.remove('has-error');
        if (editNameError) editNameError.textContent = '';
      }

      if (newPhone && !/^[6-9]\d{9}$/.test(newPhone)) {
        document.getElementById('editPhoneGroup').classList.add('has-error');
        if (editPhoneError) editPhoneError.textContent = 'Enter a valid 10-digit Indian mobile number.';
        isValid = false;
      } else {
        document.getElementById('editPhoneGroup').classList.remove('has-error');
        if (editPhoneError) editPhoneError.textContent = '';
      }

      if (!isValid) return;

      // Update in stored array
      const list = getStoredParticipants();
      const idx = list.findIndex((p) => p.serialNo === currentlySelectedParticipant.serialNo);

      if (idx !== -1) {
        list[idx].name = newName;
        if (newPhone) list[idx].phone = newPhone;
        list[idx].location = newArea;
        list[idx].status = newStatus;

        saveParticipants(list);

        // Synchronize active pass if currently displayed
        try {
          const activeSaved = localStorage.getItem('mmp_active_ticket');
          if (activeSaved) {
            const parsed = JSON.parse(activeSaved);
            if (parsed && parsed.serialNo === list[idx].serialNo) {
              parsed.name = newName;
              parsed.location = newArea;
              parsed.status = newStatus;
              renderTicketPass(parsed);
            }
          }
        } catch (err) {}

        closeEditModal();
        renderAdminTable();
        renderParticipantTable();

        showToast(`✅ Participant "${newName}" (Serial ${list[idx].serialNo}) updated successfully!`, '✓', 3500);
      }
    });
  }

  /* ==========================================================================
     7. Delete / Cancel Workflow & Modal
     ========================================================================== */
  function openDeleteModal(serialNo) {
    const list = getStoredParticipants();
    const target = list.find((p) => p.serialNo === serialNo);

    if (!target) {
      showToast('Participant record not found.', '⚠️', 2500);
      return;
    }

    currentlySelectedParticipant = target;

    deleteParticipantName.textContent = target.name;
    deleteParticipantSerial.textContent = `Serial: ${target.serialNo}`;
    deleteParticipantRef.textContent = target.refId;

    if (deleteModalBackdrop) {
      deleteModalBackdrop.style.display = 'flex';
    }
  }

  function closeDeleteModal() {
    if (deleteModalBackdrop) {
      deleteModalBackdrop.style.display = 'none';
      currentlySelectedParticipant = null;
    }
  }

  if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  if (cancelDeleteActionBtn) cancelDeleteActionBtn.addEventListener('click', closeDeleteModal);

  if (deleteModalBackdrop) {
    deleteModalBackdrop.addEventListener('click', (e) => {
      if (e.target === deleteModalBackdrop) closeDeleteModal();
    });
  }

  // Action 1: Soft-Cancel (Recommended)
  if (confirmSoftCancelBtn) {
    confirmSoftCancelBtn.addEventListener('click', () => {
      if (!currentlySelectedParticipant) return;

      const list = getStoredParticipants();
      const idx = list.findIndex((p) => p.serialNo === currentlySelectedParticipant.serialNo);

      if (idx !== -1) {
        list[idx].status = 'Cancelled';
        saveParticipants(list);

        const targetName = list[idx].name;
        const targetSerial = list[idx].serialNo;

        closeDeleteModal();
        renderAdminTable();
        renderParticipantTable();

        showToast(`🚫 Registration for "${targetName}" (Serial ${targetSerial}) marked as Cancelled.`, 'ℹ️', 4000);
      }
    });
  }

  // Action 2: Hard Delete (Permanent)
  if (confirmHardDeleteBtn) {
    confirmHardDeleteBtn.addEventListener('click', () => {
      if (!currentlySelectedParticipant) return;

      const targetName = currentlySelectedParticipant.name;
      const targetSerial = currentlySelectedParticipant.serialNo;

      let list = getStoredParticipants();
      list = list.filter((p) => p.serialNo !== targetSerial);
      saveParticipants(list);

      // If active ticket matches, remove it
      try {
        const activeSaved = localStorage.getItem('mmp_active_ticket');
        if (activeSaved) {
          const parsed = JSON.parse(activeSaved);
          if (parsed && parsed.serialNo === targetSerial) {
            localStorage.removeItem('mmp_active_ticket');
            if (ticketEmptyState) ticketEmptyState.style.display = 'block';
            if (digitalTicketCard) digitalTicketCard.style.display = 'none';
          }
        }
      } catch (err) {}

      closeDeleteModal();
      renderAdminTable();
      renderParticipantTable();

      showToast(`🗑️ Participant "${targetName}" (Serial ${targetSerial}) permanently removed.`, '✓', 4000);
    });
  }

  /* ==========================================================================
     8. Public Form Validation & Sequential Registration
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
        phone: phoneInput.value.trim(),
        location: areaInput ? (areaInput.value.trim() || 'Bandarulanka') : 'Bandarulanka',
        status: 'Registration Received',
        date: formatCurrentDate()
      };

      currentList.push(newEntry);
      saveParticipants(currentList);

      renderTicketPass(newEntry);
      renderParticipantTable();
      renderAdminTable();

      submitRegBtn.disabled = false;
      submitRegBtn.innerHTML = '<span class="btn-text">Registered Successfully ✓</span> <span class="btn-icon">🎟️</span>';

      showToast(`🎉 Confirmed! Serial: ${newEntry.serialNo} • Ref: ${newEntry.refId}`, '🪔', 4500);

      if (window.innerWidth < 992 && digitalTicketCard) {
        digitalTicketCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 550);
  }

  if (regForm) {
    regForm.addEventListener('submit', handleRegistration);
  }

  /* ==========================================================================
     9. Digital Ticket Pass Card Display
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
    } catch (e) {}
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
    } catch (e) {}
  }

  /* ==========================================================================
     10. Ticket Action Buttons (Copy, WhatsApp, Print, Reset)
     ========================================================================== */
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

  if (printTicketBtn) {
    printTicketBtn.addEventListener('click', () => {
      window.print();
    });
  }

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
      } catch (e) {}

      showToast('Form cleared for new registration', '↺', 2500);
      nameInput.focus();
    });
  }

  /* ==========================================================================
     11. Admin Export & 2-Step Safe Database Reset
     ========================================================================== */
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const list = getStoredParticipants();
      if (!list || list.length === 0) {
        showToast('No records available to export.', '⚠️', 2500);
        return;
      }

      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Serial No,Registration Reference,Participant Name,Location,Status,Date\n';

      list.forEach((row) => {
        const nameClean = `"${row.name.replace(/"/g, '""')}"`;
        csvContent += `${row.serialNo},${row.refId},${nameClean},${row.location || 'Bandarulanka'},${row.status},${row.date}\n`;
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
      const currentList = getStoredParticipants();

      if (currentList.length === 0) {
        showToast('Participant directory is already clean (0 registrations).', 'ℹ️', 2500);
        return;
      }

      const firstConfirm = confirm(
        `⚠️ ADMIN RESET CONFIRMATION (Step 1 of 2)\n\n` +
        `You are about to reset the participant directory.\n` +
        `Current registrations: ${currentList.length} participant(s).\n\n` +
        `An automatic safety backup CSV will be downloaded before clearing.\n` +
        `Do you want to proceed to the confirmation step?`
      );

      if (!firstConfirm) return;

      const verificationInput = prompt(
        `🔒 FINAL VERIFICATION (Step 2 of 2)\n\n` +
        `To prevent accidental data loss, please type "RESET" (without quotes) below to confirm:`
      );

      if (!verificationInput || verificationInput.trim().toUpperCase() !== 'RESET') {
        showToast('Reset cancelled. Verification text did not match.', '🛡️', 3500);
        return;
      }

      try {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Serial No,Registration Reference,Participant Name,Location,Status,Date\n';
        currentList.forEach((row) => {
          const nameClean = `"${row.name.replace(/"/g, '""')}"`;
          csvContent += `${row.serialNo},${row.refId},${nameClean},${row.location},${row.status},${row.date}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const backupLink = document.createElement('a');
        backupLink.setAttribute('href', encodedUri);
        backupLink.setAttribute('download', `Safety_Backup_Mattaparthi_Participants_${formatCurrentDate()}.csv`);
        document.body.appendChild(backupLink);
        backupLink.click();
        document.body.removeChild(backupLink);
      } catch (backupErr) {
        console.warn('Backup export note', backupErr);
      }

      saveParticipants([]);
      try {
        localStorage.removeItem('mmp_active_ticket');
      } catch (e) {}

      if (ticketEmptyState) ticketEmptyState.style.display = 'block';
      if (digitalTicketCard) digitalTicketCard.style.display = 'none';
      if (regForm) {
        regForm.reset();
        document.querySelectorAll('.form-group').forEach((g) => {
          g.classList.remove('has-success', 'has-error');
        });
        document.querySelectorAll('.error-msg').forEach((e) => {
          e.textContent = '';
        });
      }

      renderParticipantTable();
      renderAdminTable();
      showToast('✅ All records backed up and database safely reset to 0.', '🗑️', 4000);
    });
  }

  /* ==========================================================================
     12. Floating Particle Canvas & Accessibility
     ========================================================================= */
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
     13. Mobile Navigation Drawer
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
  renderAdminTable();
  loadActiveTicket();
});
