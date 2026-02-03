/**
 * GDrive Backup Repository
 * Handles all Google API and Drive operations.
 */
class GDriveBackupRepository {
    constructor() {
        this.CLIENT_ID = ''; // Must be configured by the user
        this.API_KEY = '';   // Must be configured by the user
        this.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
        this.SCOPES = "https://www.googleapis.com/auth/drive.file";
        this.tokenClient = null;
    }

    async init() {
        return new Promise((resolve) => {
            gapi.load('client', async () => {
                await gapi.client.init({
                    apiKey: this.API_KEY,
                    discoveryDocs: this.DISCOVERY_DOCS,
                });

                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.CLIENT_ID,
                    scope: this.SCOPES,
                    callback: '', // To be defined when needed
                });

                resolve();
            });
        });
    }

    setToken(token) {
        gapi.client.setToken({ access_token: token });
    }

    async fetchUserInfo(token) {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.json();
    }

    requestAccessToken(callback, prompt = '') {
        this.tokenClient.callback = callback;
        this.tokenClient.requestAccessToken({ prompt: prompt });
    }

    revokeToken(token) {
        google.accounts.oauth2.revoke(token);
    }

    async findFile(fileName) {
        const response = await gapi.client.drive.files.list({
            q: `name = '${fileName}' and trashed = false`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });
        return response.result.files && response.result.files.length > 0 ? response.result.files[0] : null;
    }

    async createFile(fileName, content) {
        const metadata = {
            name: fileName,
            mimeType: 'application/json',
        };

        const response = await gapi.client.drive.files.create({
            resource: metadata,
            media: {
                mimeType: 'application/json',
                body: content,
            },
            fields: 'id',
        });
        return response.result.id;
    }

    async updateFile(fileId, content) {
        await gapi.client.drive.files.update({
            fileId: fileId,
            media: {
                mimeType: 'application/json',
                body: content
            }
        });
    }

    async getFileContent(fileId) {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        return response.result;
    }
}

const gdriveBackupRepository = new GDriveBackupRepository();
