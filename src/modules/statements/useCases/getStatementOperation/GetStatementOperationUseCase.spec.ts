import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory,
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory,
    );
  });

  it("should be able to get statement operation", async () => {
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

    const newStatement = await createStatementUseCase.execute(deposit)

    const result = await getStatementOperationUseCase.execute({
      user_id: newUser.id as string,
      statement_id: newStatement.id as string,
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able to get statement operation of an unexistent user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "1",
        statement_id: "2",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get an unexistent statement operation", async () => {
    const user: ICreateUserDTO = {
      name: "rafael",
      email: "rafael@email.com",
      password: "123"
    };

    const newUser = await createUserUseCase.execute(user);

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: newUser.id as string,
        statement_id: "2",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});