import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
  })
  export class MockService {
  
	constructor() { }
  
	postData(data: any): Observable<any> {
	  const mockResponse = { success: true, data: data };
	  const randomDelay = Math.floor(Math.random() * 2000) + 500; // Random delay between 500ms and 2500ms
  
	  return new Observable(observer => {
		setTimeout(() => {
		  observer.next(mockResponse);
		  observer.complete();
		}, randomDelay);
	  });
	}
  }