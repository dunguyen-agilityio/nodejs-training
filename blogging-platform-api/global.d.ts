import { Post, Category, PostTag, Tag } from "#models";
import {
  PostRepository,
  CategoryRepository,
  PostTagRepository,
  TagRepository,
} from "#repositories";
import { Result } from "#utils/result";
import {
  PostService,
  CategoryService,
  PostTagService,
  TagService,
  UserService,
} from "#services";
import { NextFunction, Request, Response } from "express";
import { Repository } from "typeorm";

enum UserRole {
  ADMIN = "admin",
  User = "user",
}

declare global {
  interface IPost extends Post {}
  interface ICategory extends Category {}
  interface IPostTag extends PostTag {}
  interface ITag extends Tag {}
  interface IUser {
    id: number;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
    dateOfBirth?: Date;
    address?: string;
    avatar?: string;
    role?: UserRole;
    createdAt: Date;
    updatedAt: Date;
    verified?: boolean;
  }

  type UserRegisterPayLoad = Pick<
    IUser,
    "email" | "password" | "firstName" | "lastName" | "phone" | "verified"
  >;

  interface IPostRepository extends PostRepository {}
  interface ICategoryRepository extends CategoryRepository {}
  interface IPostTagRepository extends PostTagRepository {}
  interface ITagRepository extends TagRepository {}
  interface IUserRepository extends Repository {
    getUserById(id: string): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser>;
    checkUserExistence(email?: string, phone?: string): Promise<boolean>;
  }
  interface IAuthRepository extends Repository {
    login(email: string, password: string): IUser;
    register(body: UserRegisterPayLoad): IUser;
    getProfile(): IUser;
  }

  interface IPostService extends PostService {}
  interface ICategoryService extends CategoryService {}
  interface ITagService extends TagService {}
  interface IPostTagService extends PostTagService {}
  interface IUserService {
    getUserById(id: string): Promise<Result<IUser>>;
  }
  interface IAuthService {
    login(email: string, password: string): Promise<Result<IUser>>;
    register(body: UserRegisterPayLoad): Promise<Result<IUser>>;
    logout(jwt: string): void;
    isLogined(): boolean;
  }

  type ControllerFunction = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => void;

  interface IUserController {
    me(request: Request, response: Response, next: NextFunction): void;
    register(request: Request, response: Response, next: NextFunction): void;
    login(request: Request, response: Response, next: NextFunction): void;
    logout(request: Request, response: Response, next: NextFunction): void;
  }
}
