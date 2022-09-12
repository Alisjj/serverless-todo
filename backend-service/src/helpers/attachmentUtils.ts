import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET
    ) {}
    
    getAttachmentUrl(todoId: string): string {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    }
    
    async generateUploadUrl(todoId: string): Promise<string> {
        console.log(todoId);
        const url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: 300
        })
        return url as string
    }
    }