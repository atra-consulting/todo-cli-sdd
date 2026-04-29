import { Todo, ServiceResult } from '../types/Todo';
import { TodoStorage } from '../storage/TodoStorage';

export class TodoService {
  private storage: TodoStorage;

  constructor(storage: TodoStorage) {
    this.storage = storage;
  }

  addTodo(title: string): ServiceResult<Todo> {
    if (!title || title.trim().length === 0) {
      return { success: false, error: 'Der Titel darf nicht leer oder nur aus Leerzeichen bestehen.' };
    }

    const todos = this.storage.load();
    const id = Math.max(0, ...todos.map(t => t.id)) + 1;
    const newTodo: Todo = {
      id,
      title,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    todos.push(newTodo);
    this.storage.save(todos);

    return { success: true, data: newTodo };
  }

  listTodos(filter?: 'pending' | 'completed'): ServiceResult<Todo[]> {
    const todos = this.storage.load();
    const filteredTodos = filter ? todos.filter(t => t.status === filter) : todos;
    return { success: true, data: filteredTodos };
  }

  completeTodo(id: number): ServiceResult<Todo> {
    const todos = this.storage.load();
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return { success: false, error: `Todo mit ID ${id} nicht gefunden.` };
    }

    if (todo.status === 'completed') {
      return { success: false, error: `Todo mit ID ${id} ist bereits als erledigt markiert.` };
    }

    const updatedTodo: Todo = { ...todo, status: 'completed' };
    const updatedTodos = todos.map(t => (t.id === id ? updatedTodo : t));
    this.storage.save(updatedTodos);

    return { success: true, data: updatedTodo };
  }

  deleteTodo(id: number): ServiceResult<Todo> {
    const todos = this.storage.load();
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return { success: false, error: `Todo mit ID ${id} nicht gefunden.` };
    }

    const updatedTodos = todos.filter(t => t.id !== id);
    this.storage.save(updatedTodos);

    return { success: true, data: todo };
  }
}
