import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { combineLatest, concatMap, filter, fromEvent, map, Subject, Subscription } from 'rxjs';
import { createFileReaderObservable, ProgressEventType } from './util/file-upload.util';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy, AfterViewInit {

  private fb = inject(FormBuilder);
  private subscription = new Subscription;
  fileListSubject = new Subject<Array<File>>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  fileUploads$ = this.fileListSubject.pipe(
    concatMap(files => combineLatest(files.map(file => createFileReaderObservable(file)))),
  );

  moveToOcr$ = this.fileUploads$.pipe(
    filter(files => files.every(file => file.type === ProgressEventType.LoadEnd)),
    // switchMap(files => {
    //   of(files)
    // })   TODO: Implement making calls to validate files for OCR
  )

  public progresses$ = this.fileUploads$.pipe(
    map(results => {
      return results
        .filter(event =>  event.type !== ProgressEventType.Error && event.type)
        .map(({file, type, fileReader, event}) => ({
          name: file.name,
          progressPercentage: type === ProgressEventType.Abort ? 0 : Math.round((event.loaded / event.total) * 100),
          fileReader
      }))
    })
  );

  public formGroup = this.fb.group({file: ''});

  ngAfterViewInit(): void {
    const clickSub = fromEvent(this.fileInput.nativeElement, 'change')
      .pipe(filter(event => (event.target as HTMLInputElement).files !== null))
      .subscribe((event) => this.fileListSubject.next(Array.from((event.target as HTMLInputElement).files!)));

    this.subscription.add(clickSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleAbort(fileReader: FileReader) {
    console.log(fileReader);
    fileReader.abort();
  }

  trackByFn(index: number, item: any) {
    return item.name; // or any unique identifier
  }
}
