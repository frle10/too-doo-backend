import { EntityRepository, Repository } from 'typeorm';
import { TodoList } from './todoList.entity';
import { UpdateNameDto } from './dto/update-name.dto';

@EntityRepository(TodoList)
export class TodoListRepository extends Repository<TodoList> {
  async getTodoList(uuid: string): Promise<TodoList> {
    const todoList = await this.findOne({ uuid });
    return todoList;
  }

  async createTodoList(uuid: string): Promise<TodoList> {
    const todoList = new TodoList();
    todoList.uuid = uuid;
    todoList.name = 'untitled';

    await todoList.save();
    return todoList;
  }

  async updateName(uuid: string, updateNameDto: UpdateNameDto) {
    const todoList = await this.findOne({ uuid }).then(tl => {
      if (!tl) {
        return this.createTodoList(uuid);
      }
    });

    todoList.name = updateNameDto.name;
    await todoList.save();
    return todoList;
  }
}
