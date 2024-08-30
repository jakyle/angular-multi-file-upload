export enum FileUploadStatus {
	UPLOADING = 'Uploading',
	UPLOADED = 'Uploaded',
	ERROR = 'Error',
	ABORTED = 'Aborted'
}

export type FileUploading = {
	name: string;
	progressPercent: number;
	status: FileUploadStatus;
	fileReader: FileReader;
	data?: ArrayBuffer;
}