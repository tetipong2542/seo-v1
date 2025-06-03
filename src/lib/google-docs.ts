import { google } from 'googleapis';

interface GoogleDocResult {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  message: string;
}

interface ExportResult {
  success: boolean;
  buffer?: Buffer;
  message: string;
}

// Initialize Google Auth
function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

export async function createGoogleDoc(title: string, content: string): Promise<GoogleDocResult> {
  try {
    const auth = getGoogleAuth();
    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Create a new document
    const document = await docs.documents.create({
      requestBody: {
        title: `${title} - SEO Content`,
      },
    });

    const documentId = document.data.documentId;
    if (!documentId) {
      return {
        success: false,
        message: 'Failed to create document: No document ID returned',
      };
    }

    // Insert content into the document
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    });

    // Move document to specified folder if folder ID is provided
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      await drive.files.update({
        fileId: documentId,
        addParents: process.env.GOOGLE_DRIVE_FOLDER_ID,
        fields: 'id, parents',
      });
    }

    // Make the document viewable by anyone with the link
    await drive.permissions.create({
      fileId: documentId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    return {
      success: true,
      documentId,
      documentUrl,
      message: 'Document created successfully',
    };

  } catch (error) {
    console.error('Google Docs API Error:', error);
    return {
      success: false,
      message: `Failed to create Google Doc: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function exportDocumentAsPDF(documentId: string): Promise<ExportResult> {
  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.export({
      fileId: documentId,
      mimeType: 'application/pdf',
    }, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data as ArrayBuffer);

    return {
      success: true,
      buffer,
      message: 'Document exported successfully',
    };

  } catch (error) {
    console.error('Google Drive Export Error:', error);
    return {
      success: false,
      message: `Failed to export document: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
} 