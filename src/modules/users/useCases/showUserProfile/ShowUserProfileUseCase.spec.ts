import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it("should be able to show user profile", async () => {
    const user: ICreateUserDTO = {
      name: "rafael",
      email: "rafael@email.com",
      password: "123"
    };

    const result = await createUserUseCase.execute(user);

    const profile = await showUserProfileUseCase.execute(result.id as string);

    expect(profile).toHaveProperty("id")
  });

  it("should not be able to show user profile when user not exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("1");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});