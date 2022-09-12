import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const userId = getUserId(event)
    const deletedItem = await deleteTodo (userId, todoId)
    return {
      statusCode: 204,
      body: deletedItem
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
