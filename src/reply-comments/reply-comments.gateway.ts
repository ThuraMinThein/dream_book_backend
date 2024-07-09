import {
  MessageBody,
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ReplyComment } from './entities/reply-comment.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'reply-comments',
})
export class ReplyCommentsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newReply')
  handleNewComment(@MessageBody() replyComment: ReplyComment) {
    this.server.emit('newReply', { replyComment });
  }

  @SubscribeMessage('deleteReply')
  handleDeleteComment(@MessageBody() replyCommentId: number) {
    this.server.emit('deleteReply', { replyCommentId });
  }
}
