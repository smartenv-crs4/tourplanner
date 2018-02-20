import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import { PoiListPage } from './poi-list';
import { MapPage } from './poi-map';

import { TranslateService } from 'ng2-translate';
import { PathwaysService } from '../../services/pathways.service';


@Component({
  templateUrl: 'poi.html',
  providers: [PathwaysService]

})
export class PoiRoot {
  //poiListPage = PoiListPage
  //poiMapPage = MapPage

  //poiParams :  Array<{title: string, description: string, thumbnail: string, images: string, lat: string, lng: string}>;

  tab1: any;
  tab2: any;

  poiParams : any;
  item : any;
  poiTitle: string;

  constructor(
      private navController: NavController,
      public params: NavParams,
      public pathwaysService: PathwaysService,
      public alertCtrl: AlertController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService
) {
    console.log("Poi root constructor")
    console.log("item param: " + JSON.stringify(params.get('path')))
    
    console.log("Pathway root constructor")
    console.log("item param: " + JSON.stringify(params.get('pathway')))
    

    if (params.get('path'))
      this.poiTitle  = params.get("path");
    else if (params.get("pathway"))
        this.poiTitle  = params.get("pathway").title;     
  
    this.poiParams = {pathway : params.get("pathway"), path : params.get("path") }; // i parametri sono passati nel template
    
    
    this.tab1 = PoiListPage;
    this.tab2 = MapPage;
  }



  insertOpenData()
  {
    
    let confirm = this.alertCtrl.create({
      title: this.translate.instant('PATHWAYS.POINT_OP_TITLE'), 
      message: this.translate.instant('PATHWAYS.POINT_OP_DESCRIPTION'), 
      buttons: [
        {
          text: this.translate.instant('PATHWAYS.NEW_CANCEL'),
          handler: data => {
            console.log('Cancel clicked');
  
          }
        },
        {
          text: this.translate.instant('PATHWAYS.NEW_SAVE'),
          handler: data => {
            
            this.pathwaysService.insert_OpenData(this.params.get('pathway'))
            .then( arr => {
              
              
              if (arr == 1)  //ok
              {
                let loading = this.loadingCtrl.create({
                  spinner: 'circles'
                });
                
                  loading.present();
                  setTimeout(() => {
                    loading.dismiss();
                  }, 1000);
              }
              
              console.log(arr);
              
            })
            
          }
        }
      ]
    });
    confirm.present();
    
    
  }

}
