import { Component } from '@angular/core'
import { Storage } from '@capacitor/storage'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  public selectedLanguage: string
  private options: Object = {}
  private STORAGE_OPTIONS: string = 'options'

  constructor() {}

  async ngOnInit() {
    const options = await Storage.get({ key: this.STORAGE_OPTIONS })
    this.options = JSON.parse(options.value) || {}
    if (this.options['tesseractlanguage'] === undefined) {
      this.options['tesseractlanguage'] = 'eng'
    }

    this.selectedLanguage = this.options['tesseractlanguage']
  }
  

  public async languageSelected(lang) {
    this.options = { 'tesseractlanguage' : this.selectedLanguage }
    // console.log(this.options, JSON.stringify(this.options))
    await Storage.set({
      key: this.STORAGE_OPTIONS,
      value: JSON.stringify(this.options)
    })

  }
}
