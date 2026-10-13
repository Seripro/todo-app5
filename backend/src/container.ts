import { DrizzleDriver } from "./driver/drizzleDriver";
import { TodoGateway } from "./gateway/todoGateway";
import { TodoUseCase } from "./usecase/todoUsecase";

const driver = new DrizzleDriver();
const todoGateway = new TodoGateway(driver);
export const todoUseCase = new TodoUseCase(todoGateway);
