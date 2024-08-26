import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventService } from './event.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindEventDto } from './dto/find-event.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('/')
  @UseInterceptors(FilesInterceptor('media', 5))
  async create(
    @Body() CreateEventDto: CreateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      return await this.eventService.create(CreateEventDto, files);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.eventService.findOne(id);
  }

  @Get('/')
  async find(@Query() findEventDto: FindEventDto) {
    return await this.eventService.find(findEventDto);
  }

  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('media', 5))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.eventService.update(id, updateDto, files);
  }

  @Delete('/:id')
  async deleteEvent(@Param('id') id: string) {
    return await this.eventService.delete(id);
  }
}
