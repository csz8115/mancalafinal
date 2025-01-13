import io, { Socket } from 'socket.io-client'

const URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

let socket: typeof Socket;

socket = io(URL);

export default socket;
