import { Injectable } from '@angular/core'
import { LoadingController } from '@ionic/angular'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Storage } from '@capacitor/storage'

import { ModalController } from '@ionic/angular'
// import { Capacitor } from '@capacitor/core'
import { createWorker } from 'tesseract.js'
import * as Tesseract from 'tesseract.js'
// import { Platform } from '@ionic/angular'
import { Subscription } from 'rxjs'

import { AppGlobals } from '../../shared/app.globals'
import { SharedService } from '../shared.service'
import { OcrOutputModalPage } from '../../modals/ocr-output-modal/ocr-output-modal.page'


@Injectable({
  providedIn: 'root'
})
export class TesseractService {

  public workerReady: boolean = false

  private STORAGE_OPTIONS: string = this.globals.STORAGE_OPTIONS
  private selectedLanguage: string
  private options: Object = {}
  private worker: Tesseract.Worker
  private ocrResultComplete: Object = {}
  private captureProgress: number = 0
  private progressSubscription: Subscription
  private loadingWait

  constructor(
    private globals: AppGlobals,
    private shared: SharedService,
    public modalController: ModalController,
    public loadingController: LoadingController,
  ) {
    if (!this.workerReady) {
      this.restartOCRWorker()
    }
  }

  async ngOnInit() {
    this.progressSubscription = this.shared.progressMessage.subscribe(message => this.captureProgress = message)
  }

  async ngOnDestroy() {
    this.progressSubscription.unsubscribe()
  }

  public async recognizeImage(path) {

    this.openModal()

    if (!this.workerReady) {
      await this.restartOCRWorker()
    }
    const result = await this.worker.recognize(path)
    this.shared.updateAny(result)
  }

  private async loadOptions() {
    const options = await Storage.get({ key: this.STORAGE_OPTIONS })
    this.options = JSON.parse(options.value) || {}
    if (this.options['tesseractlanguage'] === undefined) {
      this.options['tesseractlanguage'] = 'eng'
    }
    this.selectedLanguage = this.options['tesseractlanguage']
  }

  /**
   *  Text recognition operations
   */
  public async loadWorker() {

    this.workerReady = false
    await this.loadOptions()
    this.worker = createWorker({
      logger: progress => {
        if (progress.status == 'recognizing text') {
          this.captureProgress = progress.progress.toFixed(2)
          this.shared.updateProgress(this.captureProgress)
        }
      }
    })
    await this.worker.load()
    await this.worker.loadLanguage(this.selectedLanguage)
    await this.worker.initialize(this.selectedLanguage)
    this.workerReady = true
  }

  public async restartOCRWorker() {
    this.initLoadingWait()
    if (typeof this.worker !== 'undefined') {
      await this.worker.terminate()
    }
    await this.loadWorker()
    this.dismissLoadingWait()
  }

  /**
  *  view operations
  */
  public async openModal() {
    const modal = await this.modalController.create({
      component: OcrOutputModalPage,
      componentProps: {
        'modalTitle': 'Text extraction',
        'closeModalButton': 'Close Modal',
        'captureProgress': this.captureProgress,
        'ocrResultComplete': this.ocrResultComplete
      }
    })

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.shared.updateAny({})
      }
    })

    return await modal.present()
  }

  private async initLoadingWait() {
    this.loadingWait = await this.loadingController.create({
      spinner: 'crescent',
      message: 'Please wait...'
    })
    await this.loadingWait.present()
  }

  private async dismissLoadingWait() {
    this.loadingWait.dismiss()
  }
}
