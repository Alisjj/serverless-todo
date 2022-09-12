import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const uuid4 = require('uuid/v4');
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const s3BucketName = process.env.ATTACHMENT_S3_BUCKET;

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todoAccess.getTodosByUserId(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    const todoId = uuid4()
    const createdAt = new Date().toISOString()
    const newTodo: TodoItem = {
        userId,
        todoId,
        attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
        createdAt,
        done: false,
        ...createTodoRequest,
    }

    return await todoAccess.createTodo(newTodo)
}

// create update todo function
export async function updateTodo(
    todoId: string,
    userId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {

    const todoUpdate = updateTodoRequest as TodoUpdate

    return await todoAccess.updateTodo(userId, todoId, todoUpdate)
}



export async function deleteTodo(
    userId: string,
    todoId: string
): Promise<string> {
    return await todoAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(
    todoId: string
): Promise<string> {
    return attachmentUtils.generateUploadUrl(todoId)
}
