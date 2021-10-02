import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OcrOutputModalPageRoutingModule } from './ocr-output-modal-routing.module';

import { OcrOutputModalPage } from './ocr-output-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OcrOutputModalPageRoutingModule,
  ],
  declarations: [OcrOutputModalPage],
})
export class OcrOutputModalPageModule {}
