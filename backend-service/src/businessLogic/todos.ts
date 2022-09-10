import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';
import { createLogger } from '../utils/logger'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('TodosAccess')

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todoAccess.getTodosByUserId(userId)
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

// create update todo function
export async function updateTodo(
    todoId: string,
    userId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {
    const todo = await todoAccess.getTodoById(todoId)

    if (!todo) {
        throw new createError.NotFound(`Todo with id ${todoId} not found`)
    }

    if (todo.userId !== userId) {
        throw new createError.Unauthorized(`User ${userId} is not authorized to update todo ${todoId}`)
    }

    const todoUpdate = updateTodoRequest as TodoUpdate

    return await todoAccess.updateTodo(userId, todoId, todoUpdate)
}



export async function deleteTodo(
    userId: string,
    todoId: string
): Promise<string> {
    const todo = await todoAccess.getTodoById(todoId)

    if (todo.userId !== userId) {
        throw new createError.Unauthorized('You are not authorized to delete this todo')
    }

    return await todoAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(
    todoId: string,
    userId: string
): Promise<string> {
    const todo = await todoAccess.getTodoById(todoId)

    if (todo.userId !== userId) {
        throw new createError.Unauthorized('You are not authorized to update this todo')
    }

    const generatedUrl = await attachmentUtils.generateUploadUrl(todoId)
    const url = getPathFromUrl(generatedUrl)
    logger.info(`generated upload url ${generatedUrl} for todo ${todoId} and path ${url}`)
    await todoAccess.createAttchmentUrl(userId, todoId, url)
    return url

}

function getPathFromUrl(url: string): string
{
    return url.split(/[#?]/)[0]
}

