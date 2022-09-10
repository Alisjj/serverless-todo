import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { TodoItem } from '../../models/TodoItem'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Process event:', event);
    const userId = getUserId(event)
    
    // Write your code here
    const items = await getTodosForUser(userId) as TodoItem[]
    return {
      'statusCode': 200,
      'body': JSON.stringify({
        items: items
      })  
    }
  }
).use(cors({
  credentials: true
}))