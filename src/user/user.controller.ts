import { Controller, Request, Get, Post, Body, Patch, Param, Delete, UseGuards, NotFoundException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../decorators/role.decorator";
import { PartnerJob, UserRoles } from "../enums/roles";
import { RolesGuard } from "../auth/roles.guard";
import { User } from "../entities/User";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
     constructor(private readonly userService: UserService) {}

     @Post()
     @Roles(UserRoles.ADMIN)
     create(@Body() createUserDto: CreateUserDto) {
          const user = this.userService.create(createUserDto);
          return user;
     }

     // @Post()
     // createPartner(@Body() createPartnerDto: CreatePartnerDto) {
     //      return this.userService.createPartner(createPartnerDto);
     // }

     @Get("/me")
     @Roles(UserRoles.ALL)
     async getMe(@Request() req) {
          const user: User = await this.userService.findOne({ userId: req.user.userId });
          if (user) {
               return { success: true, data: user };
          }
          throw new NotFoundException({ success: false, message: "USER_NOT_FOUND" });
     }

     @Roles(UserRoles.ADMIN)
     @Get()
     async findAll() {
          try {
               const users: User[] = await this.userService.findAll();

               if (users) {
                    return { success: true, data: users };
               }
               return { success: false, message: "USERS_NULL" };
          } catch (err) {
               throw new BadRequestException({ success: false, ...err });
          }
     }

     @Get("types")
     @Roles(UserRoles.ADMIN)
     async getTypesList(@Request() req) {
          const { user } = req;

          let type: string[] = [];

          switch (user.type) {
               case UserRoles.ADMIN:
                    type = Object.keys(UserRoles).splice(1);
                    break;
               case UserRoles.PARTNER:
                    type = Object.keys(PartnerJob);
                    break;
               default:
                    throw new UnauthorizedException({ success: false, message: "NOT_PERMISSION" });
          }
          return { success: true, data: type };
     }

     @Get(":id")
     @Roles(UserRoles.ADMIN)
     findOne(@Param("id") id: string) {
          return this.userService.findOne(id);
     }

     @Patch(":id")
     @Roles(UserRoles.ADMIN)
     update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
          return this.userService.update(id, updateUserDto);
     }

     @Delete(":id")
     @Roles(UserRoles.ADMIN)
     remove(@Param("id") id: string) {
          return this.userService.remove(id);
     }
}
