import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodosService } from './todos.service';
import { TodoList } from './todo-list/todoList.entity';
import { Todo } from './todo/todo.entity';

// A minimal mock of the repository methods the service touches. `create`
// mirrors TypeORM by returning its input, and `save` echoes the entity back.
type MockRepo<T extends object> = Pick<
  Repository<T>,
  'findOne' | 'create' | 'save' | 'delete'
>;

function mockRepo<T extends object>(): jest.Mocked<MockRepo<T>> {
  return {
    findOne: jest.fn(),
    // Return a fresh object, like TypeORM's real `create`, so a later mutation
    // of the entity does not retroactively change the recorded call argument.
    create: jest.fn((dto) => ({ ...(dto as object) }) as T),
    save: jest.fn((entity) => Promise.resolve(entity as T)),
    delete: jest.fn(),
  } as unknown as jest.Mocked<MockRepo<T>>;
}

describe('TodosService', () => {
  let service: TodosService;
  let todoLists: jest.Mocked<MockRepo<TodoList>>;
  let todos: jest.Mocked<MockRepo<Todo>>;

  beforeEach(async () => {
    todoLists = mockRepo<TodoList>();
    todos = mockRepo<Todo>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: getRepositoryToken(TodoList), useValue: todoLists },
        { provide: getRepositoryToken(Todo), useValue: todos },
      ],
    }).compile();

    service = moduleRef.get(TodosService);
  });

  describe('getTodoList', () => {
    it('returns the list with todos sorted newest-first', async () => {
      todoLists.findOne.mockResolvedValue({
        id: 1,
        uuid: 'u',
        name: 'list',
        todos: [
          { id: 1, completed: false, content: 'a' },
          { id: 3, completed: false, content: 'c' },
          { id: 2, completed: false, content: 'b' },
        ],
      });

      const result = await service.getTodoList('u');

      expect(result?.todos.map((t) => t.id)).toEqual([3, 2, 1]);
    });

    it('returns null when the list does not exist', async () => {
      todoLists.findOne.mockResolvedValue(null);
      await expect(service.getTodoList('missing')).resolves.toBeNull();
    });
  });

  describe('addTodo', () => {
    it('adds a todo to an existing list without nesting the list back', async () => {
      const list = { id: 1, uuid: 'u', name: 'list', todos: [] } as TodoList;
      todoLists.findOne.mockResolvedValue(list);

      const result = await service.addTodo('u', { content: 'buy milk' });

      expect(result.content).toBe('buy milk');
      expect(result.completed).toBe(false);
      expect(result.todoList).toBeUndefined();
      expect(todoLists.save).not.toHaveBeenCalled();
    });

    it('lazily creates an untitled list when none exists', async () => {
      todoLists.findOne.mockResolvedValue(null);

      await service.addTodo('fresh', { content: 'first' });

      expect(todoLists.create).toHaveBeenCalledWith({
        uuid: 'fresh',
        name: 'untitled',
        todos: [],
      });
      expect(todoLists.save).toHaveBeenCalled();
    });
  });

  describe('updateName', () => {
    it('renames an existing list', async () => {
      const list = {
        id: 1,
        uuid: 'u',
        name: 'old',
        todos: [{ id: 2 }, { id: 1 }],
      } as TodoList;
      todoLists.findOne.mockResolvedValue(list);

      const result = await service.updateName('u', { name: 'new' });

      expect(result.name).toBe('new');
      expect(result.todos.map((t) => t.id)).toEqual([2, 1]);
      expect(todoLists.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'new' }),
      );
    });

    it('lazily creates the list when renaming an unknown uuid', async () => {
      todoLists.findOne.mockResolvedValue(null);

      const result = await service.updateName('fresh', { name: 'named' });

      expect(todoLists.create).toHaveBeenCalledWith({
        uuid: 'fresh',
        name: 'untitled',
        todos: [],
      });
      expect(result.name).toBe('named');
    });
  });

  describe('updateCompleted', () => {
    it('toggles the completed flag', async () => {
      todos.findOne.mockResolvedValue({
        id: 5,
        completed: false,
        content: 'x',
      });

      const result = await service.updateCompleted(5);

      expect(result.completed).toBe(true);
      expect(todos.save).toHaveBeenCalled();
    });

    it('throws NotFound when the todo is missing', async () => {
      todos.findOne.mockResolvedValue(null);
      await expect(service.updateCompleted(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('deleteTodoById', () => {
    it('resolves when a row was deleted', async () => {
      todos.delete.mockResolvedValue({ affected: 1, raw: [] });
      await expect(service.deleteTodoById(1)).resolves.toBeUndefined();
    });

    it('throws NotFound when nothing was deleted', async () => {
      todos.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.deleteTodoById(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
