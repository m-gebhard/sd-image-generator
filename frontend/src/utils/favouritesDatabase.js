const dbName = 'FavoriteImages';
const dbVersion = 1;

const openDatabase = () =>
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

export const saveImageToFavorites = async (id, base64, meta) => {
    const db = await openDatabase();
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');

    return new Promise((resolve, reject) => {
        const request = store.put({ id, base64, meta: JSON.stringify(meta) });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

export const getFavoriteImage = async (id) => {
    const db = await openDatabase();
    const transaction = db.transaction('images', 'readonly');
    const store = transaction.objectStore('images');

    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result?.base64);
        request.onerror = (event) => reject(event.target.error);
    });
};

export const getAllFavoriteImages = async () => {
    const db = await openDatabase();
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

export const deleteFavoriteImage = async (id) => {
    const db = await openDatabase();
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};
