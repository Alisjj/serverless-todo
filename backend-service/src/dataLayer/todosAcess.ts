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
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
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
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        }).promise()

        const updatedTodo = result.Attributes
        return updatedTodo as TodoItem
    }

    async deleteTodo(userId:string, todoId: string): Promise<string> {
        console.log("Deleting todo");

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return "" as string;
    }

    
}