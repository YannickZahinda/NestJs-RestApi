import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user-dto';


@Controller('users')// /users
export class UsersController {

    constructor (private readonly usersService: UsersService){}
  
    @Get() /* GET /users */ //or /user?role=value
    findAll(@Query('role') role?: 'INTERN' | 'ENGINEER' | 'ADMIN'){
        return this.usersService.findAll(role)
    }

    @Get(':id') /*  GET /users/:id */
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id)
    }

    @Post()   /* POST /users */
    create(@Body(ValidationPipe) createUserDto: CreateUserDto){
        return this.usersService.create(createUserDto);
    }

    @Patch(':id') /*   PATCH /users/:id */
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto)
    }

    @Delete(':id')  /*DELETE /users/:id*/
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.delete(id)
    }

   
}
