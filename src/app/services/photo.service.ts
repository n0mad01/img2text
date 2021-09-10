import { Injectable } from '@angular/core'
import { Camera, CameraResultType, CameraSource/*, Photo */ } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Storage } from '@capacitor/storage'
import * as Tesseract from 'tesseract.js'
import { createWorker } from 'tesseract.js'
import { Platform } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'
import { SharedService } from './shared.service'
import { Subscription } from 'rxjs'
import { ModalController } from '@ionic/angular'
import { OcrOutputModalPage } from '../modals/ocr-output-modal/ocr-output-modal.page'

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private platform: Platform
  private photos: Photo[] = []
  private PHOTO_STORAGE: string = 'photos'
  private worker: Tesseract.Worker
  private workerReady: boolean = false
  private ocrResult: string = ''
  private ocrResultComplete: Object = {}
  private captureProgress: number = 0
  private progressSubscription: Subscription
  private ocrResultSubscription: Subscription

  constructor(platform: Platform,
    private shared: SharedService,
    public modalController: ModalController) {
    this.platform = platform
    this.loadWorker()
  }

  async ngOnInit() {
    this.progressSubscription = this.shared.progressMessage.subscribe(message => this.captureProgress = message)
    this.ocrResultSubscription = this.shared.anyMessage.subscribe(message => this.ocrResultComplete = message)
  }

  async ngOnDestroy() {
    this.progressSubscription.unsubscribe()
    // this.ocrResultSubscription.unsubscribe()
  }

  public async loadWorker() {
    this.worker = createWorker({
      logger: progress => {
        // console.log(progress)
        if (progress.status == 'recognizing text') {
          this.captureProgress = parseInt('' + progress.progress * 100)
          this.shared.updateProgress(this.captureProgress)
        }
      }
    })
    await this.worker.load()
    await this.worker.loadLanguage('eng')
    await this.worker.initialize('eng')
    this.workerReady = true
  }

  public async recognizeImage(path) {
    // console.log('recog init')
    this.openModal()
    const result = await this.worker.recognize(path)
    // console.log(result)
    // this.ocrResult = result.data.text
    // console.log(this.ocrResult)
    this.shared.updateProgress(0)
    this.shared.updateAny(result)
  }

  /**
   *  Image operations
   */
  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    })

    const savedImageFile = await this.savePicture(capturedPhoto)
    this.photos.unshift(savedImageFile)

    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    })
  }

  public async loadSaved() {
    // Retrieve cached photo array data
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE })
    this.photos = JSON.parse(photoList.value) || []

    // Easiest way to detect when running on the web:
    // “when the platform is NOT hybrid, do this”
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data
        });

        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`
      }
    }
  }

  public async removePicture(to_delete) {

    const photoList = await Storage.get({ key: this.PHOTO_STORAGE })
    let photos = JSON.parse(photoList.value) || []

    photos.forEach(function (photo, i) {
      if (photo.filepath === to_delete.filepath) {
        photos.splice(i, 1)
      }
    })

    await Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(photos)
    })

    this.photos = photos

    const fileDeleted = await Filesystem.deleteFile({
      path: to_delete.filepath,
      directory: Directory.Data
    })
  }

  private async savePicture(cameraPhoto) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto)

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg'
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    })

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      }
    }
    else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      }
    }
  }

  public async deletePicture(photo: Photo, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1)

    // Update photos array cache by overwriting the existing photo array
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    // delete photo file from filesystem
    const filename = photo.filepath
      .substr(photo.filepath.lastIndexOf('/') + 1)

    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data
    })
  }

  private async readAsBase64(cameraPhoto) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      })
      return file.data
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader
    reader.onerror = reject
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(blob)
  })

  /**
   *  view operations
   */
  public async openModal() {
    // console.log(await this.ocrResultComplete)
    const modal = await this.modalController.create({
      component: OcrOutputModalPage,
      componentProps: {
        'modalTitle': 'OCR Text Extraction',
        'closeModalButton': 'Close Modal',
        'captureProgress': this.captureProgress,
        'ocrResultComplete': this.ocrResultComplete
      }
    })

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        // console.log('modal close', dataReturned)
        // this.dataReturned = dataReturned.data
      }
    })

    return await modal.present()
  }
}

export interface Photo {
  filepath: string
  webviewPath: string
}
