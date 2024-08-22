import { Body, Controller, Delete, Get, InternalServerErrorException, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user-dto';

@Controller('users')
export class UsersController {
  private readonly logger: Logger;

  constructor(private readonly usersService: UsersService) {
    this.logger = new Logger(UsersController.name)
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    try {
      const user = await this.usersService.getUserFromExternalApi(userId);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to fetch user data');
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id/avatar')
  // async getAvatar(@Param('id') id: string): Promise<{ avatar: string }> {
  //   const avatar = await this.usersService.getAvatar(id);
  //   return { avatar };
  // }
  async getAvatar(@Param('id') id: string) {
    try {
      this.logger.log(`Attempting to fetch avatar for user id: ${id}`)
      const base64Avatar = await this.usersService.getAvatar(id);
      this.logger.log(`Successfylly fetched avatar for user id: ${id}`)
      return { avatar: base64Avatar };
    } catch (error) {
      this.logger.error(`Error occured while fetching avatar for user id: ${id}`)
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to fetch or process avatar');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

}
