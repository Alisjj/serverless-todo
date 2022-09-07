import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.GROUPS_TABLE
    ) {}

    async getAllTodos(): Promise<TodoItem[]> {
        logger.info('Getting all todos')

        const result = await this.docClient.scan({
            TableName: this.todoTable
        }).promise()
        
        const items = result.Items
        return items as TodoItem[]      
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodo(todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                todoId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            }
        }).promise()

        return todoUpdate
    }

    async deleteTodo(todoId: string): Promise<string> {
        await this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                todoId
            }
        }).promise()

        return todoId
    }

    async getTodoById(todoId: string): Promise<TodoItem> {
        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: {
                todoId
            }
        }).promise()

        return result.Item as TodoItem
    }

    async getTodosByUserId(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: process.env.INDEX_NAME,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }
}

function createDynamoDBClient() {
    if(process.env.IS_OFFLINE){
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient
}