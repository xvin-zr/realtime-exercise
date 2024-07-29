const chat = document.getElementById('chat');
const msgs = document.getElementById('msgs');
const presence = document.getElementById('presence-indicator');

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener('submit', function (e) {
    e.preventDefault();
    postNewMsg(chat.elements.user.value, chat.elements.text.value);
    chat.elements.text.value = '';
});

async function postNewMsg(user, text) {
    const data = {
        user,
        text,
    };

    // request options
    const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // send POST request
    // we're not sending any json back, but we could
    await fetch('/msgs', options);
}

async function getNewMsgs() {
    let reader;
    const utf8Decoder = new TextDecoder('utf-8');
    try {
        const res = await fetch(`/msgs`);
        reader = res.body?.getReader();
    } catch (err) {
        console.error(`connection error: ${err}`);
    }
    presence.innerText = '🟢';

    let readerResp;
    let done;
    do {
        try {
            readerResp = await reader?.read();
        } catch (err) {
            console.error(`reader fail ${err}`);
            presence.innerText = '🔴';
            return;
        }
        const chunk = utf8Decoder.decode(readerResp?.value, {
            stream: true,
        });
        done = readerResp?.done;

        if (chunk) {
            try {
                const json = JSON.parse(chunk);
                allChat = json.msg;
                render();
            } catch (err) {
                console.error(`json parse error: ${err}`);
            }
        }
    } while (!done);
    presence.innerText = '🔴';
}

function render() {
    const html = allChat.map(({ user, text, time, id }) =>
        template(user, text, time, id)
    );
    msgs.innerHTML = html.join('\n');
}

const template = (user, msg) =>
    `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();