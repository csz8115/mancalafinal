import io, { Socket } from 'socket.io-client'

const URL = (process.env.SOCKET_URL || 'https://mancalasocket.onrender.com')
const socket: typeof Socket = io(URL);

export default socket;