const chat = document.getElementById('chat');
const msgs = document.getElementById('msgs') as HTMLUListElement;

// let's store all current messages here
let allChat: Chat[] = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

const PORT = 5172;
const baseUrl = `http://localhost:${PORT}`;

// a submit listener on the form in the HTML
chat.addEventListener('submit', function (e) {
    e.preventDefault();
    postNewMsg(chat.elements.user.value, chat.elements.text.value);
    chat.elements.text.value = '';
});

async function postNewMsg(user: string, text: string) {
    const data = { user, text };

    const options: RequestInit = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    await fetch(`${baseUrl}/poll`, options).then((res) => res.json());
}

async function getNewMsgs() {
    try {
        const res = await fetch(`${baseUrl}/poll`);
        var json = await res.json();
    } catch (err) {
        console.error('polling error', err);
    }
    allChat = json?.msg;
    render();
    setTimeout(getNewMsgs, INTERVAL);
}

function render() {
    // as long as allChat is holding all current messages, this will render them
    // into the ui. yes, it's inefficent. yes, it's fine for this example
    const html = allChat.map(({ user, text, time, id }: Chat) =>
        template(user, text, time, id)
    );
    msgs.innerHTML = html.join('\n');
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user: string, msg: string) =>
    `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

// make the first request
getNewMsgs();
