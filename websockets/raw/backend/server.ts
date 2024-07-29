import http from 'node:http';
import handler from 'serve-handler';
// @ts-ignore
import nanobuffer from 'nanobuffer';

// these are helpers to help you deal with the binary data that websockets use
import objToResponse from './obj-to-response.ts';
import generateAcceptValue from './generate-accept-value.ts';
import parseMessage from './parse-message.ts';
import internal from 'node:stream';

type Msg = {
    user: string;
    text: string;
    time: number;
};

let connections: internal.Duplex[] = [];
const msg = new nanobuffer(50) as Msg[];
const getMsgs = () => Array.from(msg).reverse();

msg.push({
    user: 'brian',
    text: 'hi',
    time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
    return handler(request, response, {
        public: './frontend',
    });
});

server.on('upgrade', (req, socket) => {
    if (req.headers.upgrade !== 'websocket') {
        socket.end('HTTP/1.1 400 Bad Request');
        return;
    }

    const acceptKey = req.headers['sec-websocket-key'];
    const acceptValue = generateAcceptValue(acceptKey);
    const headers = [
        'HTTP/1.1 101 Web Socket Protocol Handshake',
        'Upgrade: WebSocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptValue}`,
        'Sec-WebSocket-Protocol: json',
        '\r\n',
    ];

    socket.write(headers.join('\r\n'));
    socket.write(objToResponse({ msg: getMsgs() }));
    connections.push(socket);

    socket.on('data', (buffer: Buffer) => {
        const message = parseMessage(buffer);

        if (message) {
            msg.push({
                user: message.user as string,
                text: message.text as string,
                time: Date.now(),
            });
        } else if (message === null) {
            // connection closed
            socket.end();
        }

        connections.forEach((s) => {
            s.write(objToResponse({ msg: getMsgs() }));
        });
    });

    socket.on('end', () => {
        connections = connections.splice(connections.indexOf(socket), 1);
    });
});

const port = process.env.PORT || 8080;
server.listen(port, () =>
    console.log(`Server running at http://localhost:${port}`)
);
