// Global Variables
let bookmarks = [];
const secretKey = 'secretKey'; // Secret key for XOR encryption

// Simple XOR-based encryption/decryption function
function xorEncryptDecrypt(input, key) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return output;
}

// Render bookmarks to the DOM
function renderBookmarks() {
    const bookmarkList = document.getElementById('bookmark-list');
    bookmarkList.innerHTML = '';

    // Group bookmarks by folder
    const groupedBookmarks = {};
    bookmarks.forEach(bookmark => {
        const folder = bookmark.folder || 'Uncategorized';
        if (!groupedBookmarks[folder]) {
            groupedBookmarks[folder] = [];
        }
        groupedBookmarks[folder].push(bookmark);
    });

    // Render each folder
    for (const [folder, folderBookmarks] of Object.entries(groupedBookmarks)) {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';

        // Folder Header
        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';
        folderHeader.innerHTML = `
            <h2>${folder}</h2>
            <button class="dropdown-btn" onclick="toggleFolder(this)">▼</button>
        `;
        folderDiv.appendChild(folderHeader);

        // Folder Content
        const folderContent = document.createElement('ul');
        folderContent.className = 'folder-content';
        folderBookmarks.forEach((bookmark, index) => {
            const li = document.createElement('li');
            li.className = 'bookmark-item';
            li.innerHTML = `
                <a href="${bookmark.url}" target="_blank">
                    <img src="https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}" alt="Favicon">
                    ${bookmark.name}
                </a>
                <div class="details">
                    <span><strong>Description:</strong> ${bookmark.description}</span>
                </div>
                <div>
                    <button onclick="editBookmark(${index})">Edit</button>
                    <button onclick="deleteBookmark(${index})">Delete</button>
                </div>
            `;
            folderContent.appendChild(li);
        });
        folderDiv.appendChild(folderContent);

        bookmarkList.appendChild(folderDiv);
    }
}

// Toggle folder dropdown
function toggleFolder(button) {
    const folderContent = button.parentElement.nextElementSibling;
    folderContent.style.display = folderContent.style.display === 'none' ? 'block' : 'none';
    button.textContent = folderContent.style.display === 'none' ? '▼' : '▲';
}

// Add a new bookmark
document.getElementById('add-bookmark-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('bookmark-name');
    const urlInput = document.getElementById('bookmark-url');
    const descriptionInput = document.getElementById('bookmark-description');
    const folderInput = document.getElementById('bookmark-folder');
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    const description = descriptionInput.value.trim();
    const folder = folderInput.value.trim() || 'Uncategorized'; // Default to "Uncategorized"

    if (name && url) {
        const bookmark = {
            name: name,
            url: url,
            description: description,
            folder: folder,
            id: Date.now().toString()
        };
        bookmarks.push(bookmark);
        renderBookmarks();
        nameInput.value = '';
        urlInput.value = '';
        descriptionInput.value = '';
        folderInput.value = '';
    } else {
        alert('Please enter a name and URL!');
    }
});

// Search bookmarks
function searchBookmarks() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredBookmarks = bookmarks.filter(bookmark =>
        bookmark.name.toLowerCase().includes(searchTerm) ||
        bookmark.url.toLowerCase().includes(searchTerm) ||
        bookmark.description.toLowerCase().includes(searchTerm)
    );
    renderFilteredBookmarks(filteredBookmarks);
}

// Render filtered bookmarks
function renderFilteredBookmarks(filteredBookmarks) {
    const bookmarkList = document.getElementById('bookmark-list');
    bookmarkList.innerHTML = '';
    filteredBookmarks.forEach((bookmark, index) => {
        const li = document.createElement('li');
        li.className = 'bookmark-item';
        li.innerHTML = `
            <a href="${bookmark.url}" target="_blank">
                <img src="https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}" alt="Favicon">
                ${bookmark.name}
            </a>
            <div class="details">
                <span><strong>Description:</strong> ${bookmark.description}</span>
            </div>
            <div>
                <button onclick="editBookmark(${index})">Edit</button>
                <button onclick="deleteBookmark(${index})">Delete</button>
            </div>
        `;
        bookmarkList.appendChild(li);
    });
}

// Edit a bookmark
function editBookmark(index) {
    const bookmark = bookmarks[index];
    const nameInput = document.getElementById('bookmark-name');
    const urlInput = document.getElementById('bookmark-url');
    const descriptionInput = document.getElementById('bookmark-description');
    const folderInput = document.getElementById('bookmark-folder');

    nameInput.value = bookmark.name;
    urlInput.value = bookmark.url;
    descriptionInput.value = bookmark.description;
    folderInput.value = bookmark.folder || '';

    // Remove the bookmark after editing
    bookmarks.splice(index, 1);
    renderBookmarks();
}

// Delete a bookmark
function deleteBookmark(index) {
    bookmarks.splice(index, 1);
    renderBookmarks();
}

// Export bookmarks in Chrome/Firefox HTML format
document.getElementById('export-btn').addEventListener('click', () => {
    let htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. It will be read and overwritten. DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\n`;

    // Group bookmarks by folder
    const groupedBookmarks = {};
    bookmarks.forEach(bookmark => {
        const folder = bookmark.folder || 'Uncategorized';
        if (!groupedBookmarks[folder]) {
            groupedBookmarks[folder] = [];
        }
        groupedBookmarks[folder].push(bookmark);
    });

    for (const [folder, folderBookmarks] of Object.entries(groupedBookmarks)) {
        htmlContent += `    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}">${folder}</H3>\n`;
        htmlContent += `    <DL><p>\n`;

        folderBookmarks.forEach(bookmark => {
            htmlContent += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${Math.floor(Date.now() / 1000)}">${bookmark.name}</A>\n`;
        });

        htmlContent += `    </DL><p>\n`;
    }

    htmlContent += `</DL><p>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.html';
    a.click();
    URL.revokeObjectURL(url);
});

// Import bookmarks from HTML or JSON file
document.getElementById('import-btn').addEventListener('click', () => {
    const importPopup = document.getElementById('import-popup');
    importPopup.style.display = 'flex';
});

document.getElementById('import-cancel-btn').addEventListener('click', () => {
    const importPopup = document.getElementById('import-popup');
    importPopup.style.display = 'none';
});

document.getElementById('import-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.type === 'text/html') {
                    // Parse HTML bookmarks
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(e.target.result, 'text/html');
                    const folders = doc.querySelectorAll('h3');
                    const importedBookmarks = [];

                    folders.forEach(folder => {
                        const folderName = folder.textContent || 'Uncategorized';
                        const links = folder.nextElementSibling?.querySelectorAll('a') || [];
                        links.forEach(link => {
                            importedBookmarks.push({
                                name: link.textContent || 'Untitled',
                                url: link.href || '#',
                                description: '',
                                folder: folderName,
                                id: Date.now().toString()
                            });
                        });
                    });

                    if (importedBookmarks.length > 0) {
                        bookmarks = [...bookmarks, ...importedBookmarks];
                        renderBookmarks();
                    } else {
                        alert('No valid bookmarks found in the file!');
                    }
                } else if (file.type === 'application/json') {
                    // Parse JSON bookmarks
                    const data = JSON.parse(e.target.result);

                    if (Array.isArray(data)) {
                        const validBookmarks = data.map(item => ({
                            name: item.name || 'Untitled',
                            url: item.url || '#',
                            description: item.description || '',
                            folder: item.folder || 'Uncategorized',
                            id: Date.now().toString()
                        }));

                        if (validBookmarks.length > 0) {
                            bookmarks = [...bookmarks, ...validBookmarks];
                            renderBookmarks();
                        } else {
                            alert('No valid bookmarks found in the file!');
                        }
                    } else {
                        alert('Invalid bookmark file format!');
                    }
                } else {
                    alert('Unsupported file format!');
                }
            } catch (error) {
                alert('Error importing bookmarks!');
            }
        };
        reader.readAsText(file);
    }
    const importPopup = document.getElementById('import-popup');
    importPopup.style.display = 'none';
});

// Share Bookmarks via URL with Password Protection
document.getElementById('share-btn').addEventListener('click', () => {
    const sharePopup = document.getElementById('share-popup');
    sharePopup.style.display = 'flex';

    // Prompt user for password
    const password = prompt('Enter a password to protect the shared link:');
    if (!password) {
        alert('Password is required to share bookmarks.');
        return;
    }

    // Serialize bookmarks to JSON
    const serializedBookmarks = JSON.stringify(bookmarks);
    const encryptedBookmarks = xorEncryptDecrypt(serializedBookmarks, secretKey);
    const encryptedPassword = xorEncryptDecrypt(password, secretKey);

    // Check URL length
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encryptedBookmarks)}&password=${encodeURIComponent(encryptedPassword)}`;
    if (shareUrl.length > 1800) {
        document.getElementById('share-link-message').textContent = 'Error: Encrypted data exceeds 1800 characters!';
        return;
    }

    // Copy URL to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        document.getElementById('share-link-message').textContent = 'Shareable link copied to clipboard!';
    }).catch(err => {
        document.getElementById('share-link-message').textContent = 'Failed to copy link. Please try again.';
    });
});

// Load bookmarks from URL on page load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const encryptedData = urlParams.get('data');
    const encryptedPassword = urlParams.get('password');

    if (encryptedData && encryptedPassword) {
        const password = prompt('Enter the password to access the shared bookmarks:');
        if (!password) {
            alert('Password is required to access the shared bookmarks.');
            return;
        }

        try {
            const decryptedPassword = xorEncryptDecrypt(decodeURIComponent(encryptedPassword), secretKey);
            if (password !== decryptedPassword) {
                alert('Incorrect password!');
                return;
            }

            const decryptedData = xorEncryptDecrypt(decodeURIComponent(encryptedData), secretKey);
            const loadedBookmarks = JSON.parse(decryptedData);

            if (Array.isArray(loadedBookmarks)) {
                bookmarks = loadedBookmarks;
                renderBookmarks();
            } else {
                alert('Invalid bookmark data in URL!');
            }
        } catch (error) {
            alert('Error loading bookmarks from URL!');
        }
    }
});