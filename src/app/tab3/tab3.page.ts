import { Component } from '@angular/core'
import { Storage } from '@capacitor/storage'

import { PhotoService } from '../services/photo.service'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  public selectedLanguage: string
  private options: Object = {}
  private STORAGE_OPTIONS: string = 'options'

  constructor(
    public photoService: PhotoService
  ) { }

  async ngOnInit() {
    const options = await Storage.get({ key: this.STORAGE_OPTIONS })
    this.options = JSON.parse(options.value) || {}
    if (this.options['tesseractlanguage'] === undefined) {
      this.options['tesseractlanguage'] = 'eng'
    }
    this.selectedLanguage = this.options['tesseractlanguage']
  }


  public async languageSelected() {
    this.options = { 'tesseractlanguage': this.selectedLanguage }
    await Storage.set({
      key: this.STORAGE_OPTIONS,
      value: JSON.stringify(this.options)
    })
    // console.log('languageSelected workerReady', this.photoService.workerReady)
    // console.log('cancelOCRWorker start')
    await this.photoService.cancelOCRWorker()
    // console.log('cancelOCRWorker done')
  }
}
