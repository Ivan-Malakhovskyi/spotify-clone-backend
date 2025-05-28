import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ArtistJwtAuthGuard extends AuthGuard('jwt') {}
