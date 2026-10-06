import { PrismaDriver } from "./driver/prismaDriver";
import { TodoGateway } from "./gateway/todoGateway";
import { TodoUseCase } from "./usecase/todoUsecase";

const driver = new PrismaDriver();
const todoGateway = new TodoGateway(driver);
export const todoUseCase = new TodoUseCase(todoGateway);
