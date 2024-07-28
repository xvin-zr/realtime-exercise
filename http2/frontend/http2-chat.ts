const chat = document.getElementById('chat') as HTMLFormElement;
const msgs = document.getElementById('msgs') as HTMLUListElement;
const presence = document.getElementById(
    'presence-indicator'
) as HTMLDivElement;

// let's store all current messages here
let allChat: Chat[] = [];

const PORT = 5172;
const baseUrl = `http://localhost:${PORT}`;

// a submit listener on the form in the HTML
chat.addEventListener('submit', function (e) {
    e.preventDefault();

    const userInput = (chat.elements.namedItem('user') as HTMLInputElement)
        .value;
    const textInput = (chat.elements.namedItem('text') as HTMLInputElement)
        .value;

    postNewMsg(userInput, textInput);
    (chat.elements.namedItem('text') as HTMLInputElement).value = '';
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

    await fetch(`${baseUrl}/msgs`, options).then((res) => res.json());
}

async function getNewMsgs() {}

function render() {
    // as long as allChat is holding all current messages, this will render them
    // into the ui. yes, it's inefficent. yes, it's fine for this example
    const html = allChat.map(({ user, text }) => template(user, text));
    msgs.innerHTML = html.join('\n');
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user: string, msg: string) =>
    `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
