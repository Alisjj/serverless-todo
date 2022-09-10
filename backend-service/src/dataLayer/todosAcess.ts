import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
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
        private readonly todoTable = process.env.TODOS_TABLE
    ) {}

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

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {

        logger.info(`updating todo ${todoId} for user ${userId}`)

        const result =  await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                todoId: todoId,
                userId: userId,
            },
            UpdateExpression: "SET #N=:name, #DD=:dueDate, #D=:done",
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done,
            },
            ReturnValues: "ALL_NEW",
        }).promise()

        const updatedTodo = result.Attributes
        return updatedTodo as TodoItem
    }

    async createAttchmentUrl(userId: string, todoId: string, url: string)
        : Promise<TodoItem> {
        logger.info(`set URL for todo ${todoId} for user ${userId}`)

        const result = await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                todoId: todoId,
                userId: userId,
            },
            UpdateExpression: "SET #URL=:url",
            ExpressionAttributeValues: {
                ":url": url,
            },
            ReturnValues: "ALL_NEW",
        }).promise()

        const attachment = result.Attributes
        return attachment as TodoItem
    }

    async deleteTodo(userId:string, todoId: string): Promise<string> {
        await this.docClient.delete({
            
            Key: {
                todoId: todoId,
                userId: userId,
            },
            TableName: this.todoTable
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

    
}

function createDynamoDBClient() {
    if(process.env.IS_OFFLINE){
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}