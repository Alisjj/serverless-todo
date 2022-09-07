import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getAllTodos(): Promise<TodoItem[]> {
    return todoAccess.getAllTodos()
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const newTodo: TodoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        ...createTodoRequest
    }

    return await todoAccess.createTodo(newTodo)
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    userId: string
): Promise<TodoItem> {
    const todo = await todoAccess.getTodoById(todoId)

    if (todo.userId !== userId) {
        throw new createError.Unauthorized('You are not authorized to update this todo')
    }

    if (updateTodoRequest.name) {
        todo.name = updateTodoRequest.name
    }

    if (updateTodoRequest.dueDate) {
        todo.dueDate = updateTodoRequest.dueDate
    }

    if (updateTodoRequest.done) {
        todo.done = updateTodoRequest.done
    }

    return await todoAccess.updateTodo(userId, todoId)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todoAccess.getTodosByUserId(userId)
}

export async function deleteTodo(
    todoId: string,
    userId: string
): Promise<string> {
    const todo = await todoAccess.getTodoById(todoId)

    if (todo.userId !== userId) {
        throw new createError.Unauthorized('You are not authorized to delete this todo')
    }

    return await todoAccess.deleteTodo(todoId)
}

export async function generateUploadUrl(
    todoId: string,
    userId: string
): Promise<string> {
    const todo = await todoAccess.getTodoById(todoId)

    if (todo.userId !== userId) {
        throw new createError.Unauthorized('You are not authorized to update this todo')
    }

    return await attachmentUtils.generateUploadUrl(todoId)
}