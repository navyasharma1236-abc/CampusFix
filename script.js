
const form = document.getElementById("complaintForm");
const issueList = document.getElementById("issueList");

let complaints = JSON.parse(localStorage.getItem("campusFixComplaints")) || [];

function saveComplaints() {
    localStorage.setItem("campusFixComplaints", JSON.stringify(complaints));
}

function safeText(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!name || !category || !location || !description) {
        return;
    }

    const complaint = {
        id: "CF" + Date.now().toString().slice(-7),
        name,
        category,
        location,
        description,
        status: "Pending",
        date: new Date().toLocaleString()
    };

    complaints.unshift(complaint);
    saveComplaints();
    renderComplaints();

    document.getElementById("formMessage").textContent =
        "✓ Complaint submitted successfully! ID: " + complaint.id;

    form.reset();

    setTimeout(() => {
        document.getElementById("formMessage").textContent = "";
    }, 5000);
});

function updateStatus(id, newStatus) {
    complaints = complaints.map(complaint => {
        if (complaint.id === id) {
            return { ...complaint, status: newStatus };
        }
        return complaint;
    });

    saveComplaints();
    renderComplaints();
}

function deleteComplaint(id) {
    if (!confirm("Are you sure you want to delete this complaint?")) {
        return;
    }

    complaints = complaints.filter(complaint => complaint.id !== id);
    saveComplaints();
    renderComplaints();
}

function renderComplaints() {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === "Pending").length;
    const progress = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("progressCount").textContent = progress;
    document.getElementById("resolvedCount").textContent = resolved;

    const search = document.getElementById("searchInput").value.toLowerCase();
    const filter = document.getElementById("filterStatus").value;

    const filtered = complaints.filter(c => {
        const matchesSearch =
            [c.id, c.name, c.category, c.location, c.description]
                .some(value => value.toLowerCase().includes(search));

        const matchesStatus = filter === "All" || c.status === filter;

        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        issueList.innerHTML = `
            <div class="empty-state">
                <h3>📭 No complaints found</h3>
                <p>Submitted campus issues will appear here.</p>
            </div>`;
        return;
    }

    issueList.innerHTML = filtered.map(c => `
        <div class="issue-card">
            <div class="issue-info">
                <span class="issue-meta">${safeText(c.id)} | ${safeText(c.category)}</span>
                <h3>${safeText(c.location)}</h3>
                <p>${safeText(c.description)}</p>
                <p><strong>Reported by:</strong> ${safeText(c.name)}</p>
                <p><strong>Date:</strong> ${safeText(c.date)}</p>
                <p><strong>Status:</strong> ${safeText(c.status)}</p>
            </div>

            <div class="issue-actions">
                <select aria-label="Change complaint status"
                    onchange="updateStatus('${safeText(c.id)}', this.value)">
                    <option value="Pending" ${c.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="In Progress" ${c.status === "In Progress" ? "selected" : ""}>In Progress</option>
                    <option value="Resolved" ${c.status === "Resolved" ? "selected" : ""}>Resolved</option>
                </select>

                <button class="delete-btn"
                    onclick="deleteComplaint('${safeText(c.id)}')">
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}

document.getElementById("searchInput").addEventListener("input", renderComplaints);
document.getElementById("filterStatus").addEventListener("change", renderComplaints);

renderComplaints();
