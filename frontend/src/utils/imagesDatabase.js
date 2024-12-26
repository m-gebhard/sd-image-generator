const dbVersion = 1;

const openDatabase = (dbName) =>
    new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open(dbName, dbVersion);

        dbRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', { keyPath: 'id' });
            }
        };

        dbRequest.onsuccess = (event) => resolve(event.target.result);
        dbRequest.onerror = (event) => reject(event.target.error);
    });

export const saveImageToDatabase = async (id, base64, meta, dbName = 'FavoriteImages') => {
    const db = await openDatabase(dbName);
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');

    return new Promise((resolve, reject) => {
        const request = store.put({ id, base64, meta: JSON.stringify(meta) });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

export const getAllDatabaseImages = async (dbName = 'FavoriteImages') => {
    const db = await openDatabase(dbName);
    const transaction = db.transaction('images', 'readonly');
    const store = transaction.objectStore('images');

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const allImages = request.result.map((item) => ({
                id: item.id,
                base64: item.base64,
                meta: item.meta ? JSON.parse(item.meta) : null,
            }));
            resolve(allImages);
        };
        request.onerror = (event) => reject(event.target.error);
    });
};

export const deleteDatabaseImage = async (id, dbName = 'FavoriteImages') => {
    const db = await openDatabase(dbName);
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

export const clearDatabase = async (dbName = 'FavoriteImages') => {
    const db = await openDatabase(dbName);
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');

    return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};
