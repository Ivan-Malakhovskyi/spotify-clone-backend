import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  //   async canActivate(context: ExecutionContext): Promise<any> {
  //     const activate = await super.canActivate(context);
  //     console.log(activate);
  //     const req = context.switchToHttp().getRequest();
  //     await super.logIn(req);
  //   }
}
