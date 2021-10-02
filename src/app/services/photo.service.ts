import { Injectable } from '@angular/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Storage } from '@capacitor/storage'
import { Capacitor } from '@capacitor/core'
import { Platform } from '@ionic/angular'
import { AppGlobals } from '../shared/app.globals'

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = []
  private STORAGE_PHOTOS: string = this.globals.STORAGE_PHOTOS

  constructor(
    private globals: AppGlobals,
    public platform: Platform,
  ) {
    console.log()
  }

  async ngOnInit() {

  }

  async ngOnDestroy() {
  }

  /**
   *  Image operations
   */
  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      quality: 5,
      source: CameraSource.Camera,
      resultType: CameraResultType.Uri,
    }).catch((e) => {
      // error or taking picture cancelled
      throw new Error(e)
    })

    const savedImageFile = await this.savePicture(capturedPhoto)
    this.photos.unshift(savedImageFile)

    await Storage.set({
      key: this.STORAGE_PHOTOS,
      value: JSON.stringify(this.photos)
    })
  }

  public async loadSaved() {
    // Retrieve cached photo array data
    const photoList = await Storage.get({ key: this.STORAGE_PHOTOS })
    this.photos = JSON.parse(photoList.value) || []

    // when the platform is NOT hybrid, do this:
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

    const photoList = await Storage.get({ key: this.STORAGE_PHOTOS })
    let photos = JSON.parse(photoList.value) || []

    photos.forEach(function (photo, i) {
      if (photo.filepath === to_delete.filepath) {
        photos.splice(i, 1)
      }
    })

    await Storage.set({
      key: this.STORAGE_PHOTOS,
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
    await Storage.set({
      key: this.STORAGE_PHOTOS,
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
      // Read the file in base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      })
      return file.data
    }
    else {
      // Fetch photo, read as blob, then convert to base64
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
}

export interface Photo {
  filepath: string
  webviewPath: string
}
