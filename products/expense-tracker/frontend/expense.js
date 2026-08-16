// ===============================
// Travel Expense Tracker Script
// ===============================

// --- DOM Elements ---
const addBtn = document.getElementById("addExpense");
const exportBtn = document.getElementById("exportExcel");
const tableBody = document.getElementById("expenseTable");
const totalEl = document.getElementById("total");
const totalOverTimeEl = document.getElementById("totalOverTime");
const setEmployeeBtn = document.getElementById("setEmployee");
const employeeNameDisplay = document.getElementById("employeeNameDisplay");
const employeeNameInput = document.getElementById("employeeNameInput");
const cancelEditBtn = document.getElementById("cancelEdit");

let db;
let editingRecordId = null;
let employeeName = localStorage.getItem("employeeName") || "";

// ===============================
// IndexedDB Setup
// ===============================
const request = indexedDB.open("TravelDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("records")) {
    db.createObjectStore("records", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = function (event) {
  db = event.target.result;
  renderRecords();
};

request.onerror = function (event) {
  console.error("IndexedDB error:", event.target.errorCode);
};

// ===============================
// Employee Name Setup
// ===============================
if (employeeName) {
  employeeNameDisplay.textContent = "Employee: " + employeeName;
  employeeNameInput.style.display = "none";
  setEmployeeBtn.style.display = "none";
}

setEmployeeBtn.addEventListener("click", () => {
  const inputName = employeeNameInput.value.trim();

  if (inputName) {
    employeeName = inputName;
    employeeNameDisplay.textContent = "Employee: " + employeeName;
    localStorage.setItem("employeeName", employeeName);

    employeeNameInput.style.display = "none";
    setEmployeeBtn.style.display = "none";
  }
});

// ===============================
// Overtime Helpers
// 8 hours = 1 day
// 16 hours = 2 days
// 20 hours = 2 days 4 hours
// ===============================
function getOvertimeHours(value) {
  if (value === null || value === undefined || value === "") return 0;

  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatOvertime(hours) {
  const totalHours = getOvertimeHours(hours);
  const days = Math.floor(totalHours / 8);
  const remainingHours = totalHours % 8;

  if (days > 0 && remainingHours > 0) {
    return `${days} day${days !== 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
  }

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""}`;
  }

  return `${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
}

// ===============================
// Render Records in Table
// ===============================
function renderRecords() {
  const tx = db.transaction("records", "readonly");
  const store = tx.objectStore("records");
  const request = store.getAll();

  request.onsuccess = function () {
    const records = request.result;
    tableBody.innerHTML = "";

    let total = 0;
    let totalOvertimeHours = 0;

    records.forEach((rec) => {
      const amountDisplay = (typeof rec.amount === "number" && Number.isFinite(rec.amount))
        ? rec.amount
        : 0;


      if (typeof rec.amount === "number" && Number.isFinite(rec.amount)) {
        total += rec.amount;
      }

      totalOvertimeHours += getOvertimeHours(rec.overTime);

      const row = `
        <tr>
          <td data-label="Date">${rec.date || "N/A"}</td>
          <td data-label="From">${rec.from || "N/A"}</td>
          <td data-label="To">${rec.to || "N/A"}</td>
          <td data-label="Method">${rec.method || "N/A"}</td>
          <td data-label="Customer Name">${rec.customerName || "N/A"}</td>
          <td data-label="Amount" class="amount-cell">
            ${amountDisplay !== "N/A" ? `₹${Number(amountDisplay).toFixed(2)}` : "N/A"}
          </td>
          <td data-label="OverTime">
            ${rec.overTime !== undefined && rec.overTime !== "" ? `${rec.overTime} hours` : "N/A"}
          </td>
          <td data-label="Food">${rec.food || "N/A"}</td>
          <td data-label="Actions" class="actions-cell">
            <button type="button" onclick="editRecord(${rec.id})">Edit</button>
            <button type="button" onclick="deleteRecord(${rec.id})">Delete</button>
          </td>
        </tr>
      `;

      tableBody.innerHTML += row;
    });

    totalEl.textContent = `₹${total.toFixed(2)}`;
  };
}

// ===============================
// Add / Update Record
// ===============================
addBtn.addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const method = document.getElementById("method").value;
  const customerName = document.getElementById("customerName").value.trim();
  const amountValue = document.getElementById("amount").value;
  const overTimeValue = document.getElementById("overTime").value.trim();
  const food = document.getElementById("food").value;

  const amount = amountValue ? parseFloat(amountValue) : null;
  const overTime = overTimeValue ? parseFloat(overTimeValue) : 0;

  if (!employeeName) {
    alert("Please set employee name first.");
    return;
  }

  if (amountValue && (!Number.isFinite(amount) || amount < 0)) {
    alert("Please enter a valid amount.");
    return;
  }

  if (overTimeValue && (!Number.isFinite(overTime) || overTime < 0)) {
    alert("Please enter valid overtime hours (0 or more).");
    return;
  }

  const tx = db.transaction("records", "readwrite");
  const store = tx.objectStore("records");

  if (editingRecordId !== null) {
    const getRequest = store.get(editingRecordId);

    getRequest.onsuccess = function () {
      const existing = getRequest.result;

      if (!existing) {
        alert("Record not found.");
        return;
      }

      store.put({
        ...existing,
        from,
        to,
        method,
        customerName,
        amount,
        overTime,
        food,
        employee: employeeName
      });
    };
  } else {
    store.add({
      date: today,
      from,
      to,
      method,
      customerName,
      amount,
      overTime,
      food,
      employee: employeeName
    });
  }

  tx.oncomplete = () => {
    renderRecords();
    resetForm();
  };
});

// ===============================
// Edit Record
// ===============================
function editRecord(id) {
  const tx = db.transaction("records", "readonly");
  const store = tx.objectStore("records");
  const request = store.get(id);

  request.onsuccess = function () {
    const rec = request.result;
    if (!rec) return;

    editingRecordId = id;

    document.getElementById("from").value = rec.from || "";
    document.getElementById("to").value = rec.to || "";
    document.getElementById("method").value = rec.method || "";
    document.getElementById("customerName").value = rec.customerName || "";
    document.getElementById("amount").value = rec.amount ?? "";
    document.getElementById("overTime").value = rec.overTime ?? "";
    document.getElementById("food").value = rec.food || "";

    addBtn.textContent = "Update Travel Record";
    cancelEditBtn.style.display = "inline-block";

    document.getElementById("expense-form").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };
}

// ===============================
// Cancel Edit / Reset Form
// ===============================
function cancelEdit() {
  resetForm();
}

function resetForm() {
  editingRecordId = null;

  document.getElementById("from").value = "";
  document.getElementById("to").value = "";
  document.getElementById("method").value = "";
  document.getElementById("customerName").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("overTime").value = "";
  document.getElementById("food").value = "";

  addBtn.textContent = "Add Travel Record";
  cancelEditBtn.style.display = "none";
}

cancelEditBtn.addEventListener("click", cancelEdit);

// ===============================
// Delete Record
// ===============================
function deleteRecord(id) {
  const tx = db.transaction("records", "readwrite");
  const store = tx.objectStore("records");
  store.delete(id);

  tx.oncomplete = () => {
    if (editingRecordId === id) {
      cancelEdit();
    }
    renderRecords();
  };
}

// ===============================
// Export Records to Excel
// ===============================
exportBtn.addEventListener("click", () => {
  exportRecords();
});

// ===============================
// Export + Reset Logic
// ===============================
function exportRecords(auto = false) {
  const today = new Date();
  const day = today.getDate();
  let month = today.getMonth();
  let year = today.getFullYear();

  if (day === 1) {
    month = month - 1;
    if (month < 0) {
      month = 11;
      year = year - 1;
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = monthNames[month];

  const tx = db.transaction("records", "readonly");
  const store = tx.objectStore("records");
  const request = store.getAll();

  request.onsuccess = function () {
    const records = request.result;

    if (records.length === 0) {
      if (!auto) alert("No records to export.");
      return;
    }
    function excelValue(value) {
      return value === "" || value === null || value === undefined
        ? "N/A"
        : value;
    }
    const exportData = records.map(rest => ({
      date: excelValue(rest.date),
      from: excelValue(rest.from),
      to: excelValue(rest.to),
      method: excelValue(rest.method),
      customerName: excelValue(rest.customerName),

      // Ensure amount and overTime are valid numbers, defaulting to 0 if not //
      amount: (typeof rest.amount === "number" && Number.isFinite(rest.amount)) ? rest.amount : 0,
      overTime: (typeof rest.overTime === "number" && Number.isFinite(rest.overTime)) ? rest.overTime : 0,

      food: excelValue(rest.food),
      employee: excelValue(rest.employee)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Travel Records");

    const safeEmployee = employeeName || "Unknown";
    const fileName = `${safeEmployee}_${monthName}_${year}_travel_record.xlsx`;

    XLSX.writeFile(workbook, fileName);

    if (auto && day === 1) {
      const clearTx = db.transaction("records", "readwrite");
      clearTx.objectStore("records").clear();
      clearTx.oncomplete = () => {
        renderRecords();
        alert(`Exported ${monthName} ${year} records and cleared.`);
      };
    } else if (!auto) {
      alert(`Exported ${monthName} ${year} records.`);
    }
  };
}

// ===============================
// Auto Monthly Reset
// ===============================
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    const today = new Date();
    if (today.getDate() === 1) {
      exportRecords(true);
    }
  }
});

// ===============================
// Prevent export during shutdown
// ===============================
window.addEventListener("beforeunload", () => {
  if (db) db.close();
});
