import { Component, OnInit, Input } from '@angular/core'
import { ModalController, NavParams } from '@ionic/angular'
import { Subscription } from 'rxjs'
import { Clipboard } from '@ionic-native/clipboard/ngx'

import { SharedService } from '../../services/shared.service'

@Component({
  selector: 'app-ocr-output-modal',
  templateUrl: './ocr-output-modal.page.html',
  styleUrls: ['./ocr-output-modal.page.scss'],
})
export class OcrOutputModalPage implements OnInit {

  @Input() modalTitle: string
  @Input() closeModalButton: string
  // @Input() ocrResultComplete: any
  // @Input() captureProgress: number

  private progressSubscription: Subscription
  private ocrResultSubscription: Subscription

  public captureProgress: number
  public ocrResultComplete: Object = {}

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private shared: SharedService,
    private clipboard: Clipboard,
  ) { }

  ngOnInit() {
    // console.table(this.navParams)
    // this.modalTitle = this.navParams.data.modalTitle
    // this.captureProgress = this.navParams.data.captureProgress
    // this.ocrResultComplete = this.navParams.data.ocrResultComplete
    this.progressSubscription = this.shared.progressMessage.subscribe(message => this.captureProgress = message)
    this.ocrResultSubscription = this.shared.anyMessage.subscribe(message => this.ocrResultComplete = message)
  }

  async closeModal() {
    const onClosedData: string = 'modal closing'
    await this.modalController.dismiss(onClosedData)
  }

  public copyTextToClipboard(text) {
    // console.log(text)
    this.clipboard.copy(text)
  }

}
