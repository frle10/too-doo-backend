import { EntityRepository, Repository } from 'typeorm';
import { TodoList } from './todoList.entity';
import { UpdateNameDto } from './dto/update-name.dto';

@EntityRepository(TodoList)
export class TodoListRepository extends Repository<TodoList> {
  async getTodoList(uuid: string): Promise<TodoList> {
    const todoList = await this.findOne({ uuid });

    if (todoList) {
      todoList.todos.sort((todo1, todo2) => todo2.id - todo1.id);
    }

    return todoList;
  }

  async createTodoList(uuid: string): Promise<TodoList> {
    const todoList = new TodoList();
    todoList.uuid = uuid;
    todoList.name = 'untitled';
    todoList.todos = [];

    await todoList.save();
    return todoList;
  }

  async updateName(
    uuid: string,
    updateNameDto: UpdateNameDto,
  ): Promise<TodoList> {
    const todoList = await this.findOne({ uuid }).then(tl =>
      tl ? tl : this.createTodoList(uuid),
    );

    todoList.name = updateNameDto.name;
    await todoList.save();

    todoList.todos.sort((todo1, todo2) => todo2.id - todo1.id);
    return todoList;
  }
}
