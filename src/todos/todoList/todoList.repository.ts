import { EntityRepository, Repository } from 'typeorm';
import { TodoList } from './todoList.entity';

@EntityRepository(TodoList)
export class TodoListRepository extends Repository<TodoList> {
  async getTodoList(uuid: string): Promise<TodoList> {
    const todoList = await this.findOne({ uuid });
    return todoList;
  }
}
