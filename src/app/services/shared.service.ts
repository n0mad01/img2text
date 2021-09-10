import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private messageSource = new BehaviorSubject('init')
  currentMessage = this.messageSource.asObservable()

  private progressSource = new BehaviorSubject(0)
  progressMessage = this.progressSource.asObservable()

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  updateProgress(message: number) {
    this.progressSource.next(message)
  }
}
