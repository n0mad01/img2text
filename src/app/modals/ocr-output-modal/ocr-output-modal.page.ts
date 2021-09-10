import { Component, OnInit } from '@angular/core'
import { ModalController, NavParams } from '@ionic/angular'

@Component({
  selector: 'app-ocr-output-modal',
  templateUrl: './ocr-output-modal.page.html',
  styleUrls: ['./ocr-output-modal.page.scss'],
})
export class OcrOutputModalPage implements OnInit {

  public modalTitle: string

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    // console.table(this.navParams)
    this.modalTitle = this.navParams.data.modalTitle
  }

  async closeModal() {
    const onClosedData: string = 'modal closing'
    await this.modalController.dismiss(onClosedData)
  }

}
