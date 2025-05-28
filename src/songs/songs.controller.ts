import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';

import { Connection } from 'src/common/constants/connection';
import { SongsService } from './songs.service';
import { CreateSongDTO } from './dto/create-song.dto';
import { Song } from './song.entity';
import { UpdateSongDTO } from './dto/update-song-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RequestUser } from 'src/users/types';

@Controller('songs')
export class SongsController {
  //! with private can use songsService in methods this class only
  constructor(
    private songsService: SongsService,
    @Inject('CONNECTION')
    private connection: Connection,
  ) {
    console.log('THIS IS CONNECTION ', this.connection.DB);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Song>> {
    try {
      limit = limit > 100 ? 100 : limit;

      return this.songsService.paginate({ page, limit });
    } catch (error) {
      console.log('From catch', error);
      throw new HttpException(
        'server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  @Get(':songId')
  findById(
    @Param(
      'songId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    songId: number,
  ): Promise<Song> {
    return this.songsService.findById(songId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() newSongDTO: CreateSongDTO,
    @Request() request: { user: RequestUser },
  ): Promise<Song> {
    console.log('USER', request.user);

    return this.songsService.create(newSongDTO);
  }

  @Patch(':songId')
  update(
    @Param('songId', ParseIntPipe)
    songId: number,
    @Body() updateSongDTO: UpdateSongDTO,
  ): Promise<UpdateResult> {
    return this.songsService.update(songId, updateSongDTO);
  }

  @Delete(':songId')
  deleteById(
    @Param(
      'songId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    songId: number,
  ): Promise<DeleteResult> {
    return this.songsService.deleteById(songId);
  }
}
