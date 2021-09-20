import { Component, OnInit, Input } from '@angular/core'
import { Clipboard } from '@ionic-native/clipboard/ngx'
import { ModalController } from '@ionic/angular'
import { Subscription } from 'rxjs'

import { PhotoService } from '../../services/photo.service'
import { SharedService } from '../../services/shared.service'

@Component({
  selector: 'app-ocr-output-modal',
  templateUrl: './ocr-output-modal.page.html',
  styleUrls: ['./ocr-output-modal.page.scss'],
})
export class OcrOutputModalPage implements OnInit {

  @Input() modalTitle: string
  @Input() closeModalButton: string

  public captureProgress: number
  public ocrResultComplete: any = {}
  
  private progressSubscription: Subscription
  private ocrResultSubscription: Subscription

  constructor(
    private modalController: ModalController,
    private shared: SharedService,
    private clipboard: Clipboard,
    public photoService: PhotoService,
  ) {}

  async ngOnInit() {
    this.progressSubscription = this.shared.progressMessage.subscribe(message => this.captureProgress = message)
    this.ocrResultSubscription = this.shared.anyMessage.subscribe(message => this.ocrResultComplete = message)
  }

  async ngOnDestroy() {
    this.progressSubscription.unsubscribe()
    this.ocrResultSubscription.unsubscribe()
  }

  async closeModal() {
    this.photoService.cancelOCRWorker()
    const onClosedData: string = 'modal closing'
    await this.modalController.dismiss(onClosedData)
  }

  public copyTextToClipboard(text: string) {
    this.clipboard.copy(text)
  }

}
