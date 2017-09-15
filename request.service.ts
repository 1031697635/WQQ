
/**

 * Created by QQ Wang on 2017/8/31

 */
import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';
import { SpinnerService } from './spinner.service';
import { NavigationExtras, Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/finally';

@Injectable()
export class RequestService {
  constructor (private router: Router, private http: Http, private spinnerService: SpinnerService) {}
  handleError (err: any) {
    if (err instanceof TypeError) {
      console.log(`%c ------↓ TypeError Start ↓------ `, 'color: #fff; background: #ff6363;');
      console.log(err);
      console.log(`%c ------↑  TypeError End  ↑------ `, 'color: #fff; background: #ff6363;');
    } else {
      console.log(`%c [ API ERROR: ${err.url} --> ${err.status} --> ${err.statusText} ] `, 'color: #fff; background: #ff6363;');
    }
  }
  handleResponse (response: Response, cb: (params: any) => any): any {
    const res: any = response.json();
    if (res && typeof res.status !== 'undefined') {
      if (res.status === -11) {
        const navigationExtras: NavigationExtras = {
          queryParams: {
            redirect: this.router.url
          }
        };
        this.router.navigate(['/login'], navigationExtras);
        return false;
      }
      return cb(res);
    } else {
      console.log(`%c API CALL SUCCESS, BUT RESPONSE STATUS ERROR, URL: ${response.url}` , 'color: #fff; background: #ef8400;');
    }
  }
  get (...args): Promise<any> {
    return this.send.apply(this, ['get', ...args]);
  }
  post (...args): Promise<any> {
    return this.send.apply(this, ['post', ...args]);
  }
  send (method, ...args): Promise<any> {
    this.spinnerService.show();
    const cb = args.pop();
    const data = args[1];
    if (data) {
      const params = new URLSearchParams();
      Object.keys(data).map((key) => {
        params.set(key, data[key]);
      });
      args[1] = method === 'post' ? params : {search: params};
    }
    return this.http[method](...args).finally(() => {
      this.spinnerService.hide();
    }).toPromise().then((response: Response) => {
      return this.handleResponse(response, cb);
    }).catch(this.handleError);
  }
}
