import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { AppModule } from './../src/app.module';

// Full integration test against a real Postgres. Bring the database up first:
//   docker compose up -d
// It is intentionally excluded from the CI run (which needs no database) and is
// run locally with `pnpm test:e2e`.
describe('Todos (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => app.getHttpServer();

  it('walks a list through its full lifecycle', async () => {
    const uuid = randomUUID();

    // An unknown list is empty (200, empty body).
    await request(server()).get(`/todos/${uuid}`).expect(200).expect('');

    // Naming an unknown list creates it lazily.
    await request(server())
      .patch(`/todos/${uuid}`)
      .send({ name: 'groceries' })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('groceries');
        expect(res.body.todos).toEqual([]);
      });

    // Add two todos; the response carries the todo, not the nested list.
    const first = await request(server())
      .post(`/todos/todo/${uuid}`)
      .send({ content: 'apples' })
      .expect(201);
    expect(first.body.completed).toBe(false);
    expect(first.body.todoList).toBeUndefined();

    const second = await request(server())
      .post(`/todos/todo/${uuid}`)
      .send({ content: 'bread' })
      .expect(201);

    // The list returns todos newest-first.
    await request(server())
      .get(`/todos/${uuid}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.map((t: { id: number }) => t.id)).toEqual([
          second.body.id,
          first.body.id,
        ]);
      });

    // Toggle and delete.
    await request(server())
      .patch(`/todos/todo/${first.body.id}`)
      .expect(200)
      .expect((res) => expect(res.body.completed).toBe(true));

    await request(server())
      .delete(`/todos/todo/${second.body.id}`)
      .expect(200);
  });

  it('rejects an empty todo body with 400 (ValidationPipe active)', async () => {
    const uuid = randomUUID();
    await request(server())
      .post(`/todos/todo/${uuid}`)
      .send({ content: '' })
      .expect(400);
  });

  it('rejects a malformed uuid with 400', async () => {
    await request(server()).get('/todos/not-a-uuid').expect(400);
  });
});
