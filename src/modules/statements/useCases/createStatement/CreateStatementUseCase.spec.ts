import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create deposit a value", async () => {
    const user: ICreateUserDTO = {
      name: "rafael",
      email: "rafael@email.com",
      password: "123"
    };

    const newUser = await createUserUseCase.execute(user);

    const statement: ICreateStatementDTO = {
      user_id: newUser.id as string,
      amount: 100,
      description: "Deposito de 100",
      type: OperationType.DEPOSIT,
    }

    const result = await createStatementUseCase.execute(statement);

    expect(result).toHaveProperty("id");
  });

  it("should be able to withdraw when has money", async () => {
    const user: ICreateUserDTO = {
      name: "rafael",
      email: "rafael@email.com",
      password: "123"
    };

    const newUser = await createUserUseCase.execute(user);

    const deposit: ICreateStatementDTO = {
      user_id: newUser.id as string,
      amount: 100,
      description: "Deposito de 100",
      type: OperationType.DEPOSIT,
    }

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id: newUser.id as string,
      amount: 100,
      description: "Saque de 100",
      type: OperationType.WITHDRAW,
    }

    const result = await createStatementUseCase.execute(withdraw)
  
    expect(result).toHaveProperty("id");
  });

  it("should not be able to deposit if user not exists", async () => {
    expect(async () => {
      const statement: ICreateStatementDTO = {
        user_id: "1",
        amount: 100,
        description: "Deposito de 100",
        type: OperationType.DEPOSIT,
      }
  
      const result = await createStatementUseCase.execute(statement);
  
      expect(result).toHaveProperty("id");
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to withdraw if user not exists", async () => {
    expect(async () => {
      const statement: ICreateStatementDTO = {
        user_id: "1",
        amount: 100,
        description: "Deposito de 100",
        type: OperationType.WITHDRAW,
      }
  
      const result = await createStatementUseCase.execute(statement);
  
      expect(result).toHaveProperty("id");
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to withdraw when has no money", async () => {
    const user: ICreateUserDTO = {
      name: "rafael",
      email: "rafael@email.com",
      password: "123"
    };

    const newUser = await createUserUseCase.execute(user);

    expect(async () => {
      const withdraw: ICreateStatementDTO = {
        user_id: newUser.id as string,
        amount: 100,
        description: "Saque de 100",
        type: OperationType.WITHDRAW,
      }
  
      await createStatementUseCase.execute(withdraw)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});