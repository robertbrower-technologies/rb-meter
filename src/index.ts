import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RbMeterComponent } from './rb-meter.component';

export * from './rb-meter.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RbMeterComponent
  ],
  exports: [
    RbMeterComponent
  ]
})
export class RbMeterModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RbMeterModule,
      providers: []
    };
  }
}
