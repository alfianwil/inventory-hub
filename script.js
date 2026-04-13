// 1. Select DOM Elements
const assetForm = document.getElementById('asset-form');
const assetList = document.getElementById('asset-list');
const totalAssetsEl = document.getElementById('total-assets');
const searchBar = document.getElementById('search-bar');
const exportBtn = document.getElementById('export-btn');

// 2. Initialize Asset Array (Load from LocalStorage or start empty)
let assets = JSON.parse(localStorage.getItem('it_assets')) || [];

// 3. Function to Render Assets to Table
function renderAssets(filterText = '') {
    assetList.innerHTML = '';

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(filterText.toLowerCase()) ||
        asset.sn.toLowerCase().includes(filterText.toLowerCase()) ||
        asset.category.toLowerCase().includes(filterText.toLowerCase())
    );

    filteredAssets.forEach((asset, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="fw-bold text-dark">${asset.name}</span></td>
            <td><span class="badge bg-light text-primary border">${asset.category}</span></td>
            <td class="text-secondary font-monospace">${asset.sn}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAsset(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        assetList.appendChild(row);
    });

    totalAssetsEl.innerText = filteredAssets.length;
    localStorage.setItem('it_assets', JSON.stringify(assets));
}

// 4. Handle Form Submission
assetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newAsset = {
        name: document.getElementById('asset-name').value,
        category: document.getElementById('asset-category').value,
        sn: document.getElementById('asset-sn').value
    };

    assets.push(newAsset);
    assetForm.reset();
    renderAssets();
    showToast("Asset added successfully!");
});

// 5. Delete Asset
window.deleteAsset = (index) => {
    assets.splice(index, 1);
    renderAssets();
    showToast("Asset removed.", "bg-danger");
};

// 6. Search/Filter Logic
searchBar.addEventListener('input', (e) => {
    renderAssets(e.target.value);
});


// 7. Export to CSV Logic (The "Bulletproof" Version)
exportBtn.addEventListener('click', () => {
    if (assets.length === 0) {
        return showToast("No data to export!", "bg-warning");
    }

    // 1. The "Magic Line" for Excel + the BOM for UTF-8
    const excelSeparatorInstruction = "sep=,\n";
    const BOM = "\uFEFF";

    // 2. Define headers
    const headers = ["Device Name", "Category", "Serial Number"];

    // 3. Build CSV string
    let csvContent = headers.join(",") + "\n";

    assets.forEach(asset => {
        // Use quotes to ensure internal spaces or commas don't break columns
        const row = [
            `"${asset.name}"`,
            `"${asset.category}"`,
            `"${asset.sn}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    // 4. Combine everything: BOM + Magic Line + Content
    const finalContent = BOM + excelSeparatorInstruction + csvContent;

    // 5. Create a Blob and trigger download
    const blob = new Blob([finalContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "IT_Asset_Inventory.csv");
    document.body.appendChild(link);

    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// 8. Helper: Show Toast Notifications
function showToast(message, colorClass = "bg-primary") {
    const toastEl = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toast-message');

    toastEl.classList.remove('bg-primary', 'bg-danger', 'bg-warning');
    toastEl.classList.add(colorClass);
    toastMsg.innerText = message;

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// Initial Load
renderAssets();