import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OcrOutputModalPage } from './ocr-output-modal.page';

const routes: Routes = [
  {
    path: '',
    component: OcrOutputModalPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OcrOutputModalPageRoutingModule {}
