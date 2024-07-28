import {
  MessageBody,
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Comment } from './entities/comment.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'comments',
})
export class CommentsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newComment')
  handleNewComment(@MessageBody() comment: Comment) {
    this.server.emit('newComment', { comment });
  }

  @SubscribeMessage('deleteComment')
  handleDeleteComment(@MessageBody() commentId: number) {
    this.server.emit('deleteComment', { commentId });
  }
}
