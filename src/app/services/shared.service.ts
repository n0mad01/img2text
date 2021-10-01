import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private textSource = new BehaviorSubject('init')
  public textMessage = this.textSource.asObservable()

  private progressSource = new BehaviorSubject(0)
  public progressMessage = this.progressSource.asObservable()

  private progressAny = new BehaviorSubject({})
  public anyMessage = this.progressAny.asObservable()

  constructor() {}

  updateTextMessage(message: string) {
    this.textSource.next(message)
  }

  updateProgress(message: number) {
    this.progressSource.next(message)
  }

  updateAny(message: any) {
    this.progressAny.next(message)
  }
}
