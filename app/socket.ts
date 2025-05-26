import io, { Socket } from 'socket.io-client'

const URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

const socket: typeof Socket = io(URL);

export default socket;
