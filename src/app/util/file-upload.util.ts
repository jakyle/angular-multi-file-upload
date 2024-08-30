import { fromEvent, map, merge, Observable } from "rxjs";

export enum ProgressEventType {
	LoadStart = 'loadstart',
	Progress = 'progress',
	Load = 'load',
	LoadEnd = 'loadend',
	Abort = 'abort',
	Error = 'error',
}

type FileProgress = {
	event: ProgressEvent<FileReader>, 
	type: ProgressEventType, 
	file: File, 
	fileReader: FileReader
}

export function createFileReaderObservable(file: File): Observable<FileProgress> {
	const fileReader = new FileReader();

	const events: Array<ProgressEventType> = [
		ProgressEventType.LoadStart,
		ProgressEventType.Progress,
		ProgressEventType.Load,
		ProgressEventType.LoadEnd,
		ProgressEventType.Abort,
		ProgressEventType.Error,
	];

	const eventObservables = events.map(eventType => 
		fromEvent<ProgressEvent<FileReader>>(fileReader, eventType).pipe(
		map((event) => ({ event, type: eventType, file, fileReader }))
	));

	const fileReaderObservable = merge(...eventObservables);

	fileReader.readAsArrayBuffer(file);

	return fileReaderObservable;
}
