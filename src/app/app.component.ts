import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subject, Subscription, tap } from 'rxjs';
import { FileUploading, FileUploadStatus } from './models/FileUploading';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);

  subscription = new Subscription

  progressPercent = 0;
  isUploading = false;
  fileName = '';
  fileReader: null | FileReader = null;

  fileUploadingMap = new Map<string, FileUploading>();

  public get fileUploads() : Array<FileUploading> {
    const result = Array.from(this.fileUploadingMap.values());
    console.log('sup, im file uploads', result, this.fileUploadingMap);
    return result;
  }

  public get isAllFilesFinished(): boolean {
    return this.fileUploads.every(file => file.status === FileUploadStatus.UPLOADED || file.status === FileUploadStatus.ERROR || file.status === FileUploadStatus.ABORTED);
  }

  formGroup = this.fb.group({
    file: [''],
  });

  fileListSubject = new Subject<FileList>();

  fileUpload$ = this.fileListSubject.pipe(
    tap(fileList => {
      console.log('we made it boys!');
      const file = fileList.item(0)!;

      this.isUploading = true;
      for (const file of Array.from(fileList)) {
        const fileName = file.name;
        const fileReader = new FileReader();

        this.fileUploadingMap.set(fileName, {
          name: fileName,
          progressPercent: 0,
          status: FileUploadStatus.UPLOADING,
          fileReader,
        })

        fileReader.onprogress = ({loaded, total}) => {
          console.log(`loaded: ${loaded} total: ${loaded} / ${total}`);
          this.fileUploadingMap.get(fileName)!.progressPercent = Math.round((loaded / total) * 100)
        }

        fileReader.onloadend = (event) => {
          const result = event.target?.result as ArrayBuffer | null | undefined;
          if (result){
            // do the things
          }
          this.fileUploadingMap.get(fileName)!.progressPercent = 100;
        }

        fileReader.readAsArrayBuffer(file);
      }
    }),
  )

  title = 'api-demo';

  ngOnInit(): void {
    const fileUploadSub = this.fileUpload$.subscribe();
    this.subscription.add(fileUploadSub);
  }

  handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.fileListSubject.next(files);
    }
  }

  handleProgress(event: ProgressEvent<EventTarget>) {
    console.log('huh');
    console.log(event);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleAbort(fileName: string) {
    this.fileUploadingMap.get(fileName)!.fileReader.abort();
    this.fileUploadingMap.get(fileName)!.status = FileUploadStatus.ABORTED;
  }
}
