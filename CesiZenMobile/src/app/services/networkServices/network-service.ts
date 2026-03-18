import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  isConnected : boolean = false
   async constructor () {
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
    })  
  }


async getCurrentNetworkStatus () {
  const status = await Network.getStatus();
  console.log('Network status:', status);
  this.isConnected = status.connected
};
}
