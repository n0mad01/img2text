import { Component } from '@angular/core'
import { ActionSheetController } from '@ionic/angular'
// import { Subscription } from 'rxjs'

import { Photo, PhotoService } from '../services/photo.service'
import { SharedService } from '../services/shared.service'

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  // private progressSubscription: Subscription
  public captureProgress: number

  constructor(
    private shared: SharedService,
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController) {
  }

  async ngOnInit() {
    await this.photoService.loadSaved()
    // this.progressSubscription = this.shared.progressMessage.subscribe(message => this.captureProgress = message)
  }

  async ngOnDestroy() {
    // this.progressSubscription.unsubscribe()
  }

  public addPhotoToGallery() {
    this.photoService.addNewToGallery()
  }

  public removeImage(photo) {
    this.photoService.removePicture(photo)
  }

  public async showActionSheet(photo: Photo, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Extract text',
        role: 'action',
        icon: 'cube-outline',
        handler: () => {
          // this.openModal()
          this.photoService.recognizeImage(photo.webviewPath)
        }
      }, {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position)
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        }
      }]
    })
    await actionSheet.present()
  }
}
