const chat = document.getElementById('chat') as HTMLFormElement;
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

    await fetch(`${baseUrl}/poll`, options).then((res) => res.json());
}

async function getNewMsgs() {
    try {
        const res = await fetch(`${baseUrl}/poll`);
        var json = await res.json();

        if (res.status >= 400) {
            throw new Error('request did not succeed:' + res.status);
        }
        allChat = json?.msg;
        render();
        failedTries = 0;
    } catch (err) {
        console.error('polling error', err);
        failedTries++;
    }
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

const BACKOFF = 5_000;
let failedTries = 0;
let timeToMakeNextReq = 0;
const rafTimer: FrameRequestCallback = async function rafTimer(time) {
    if (timeToMakeNextReq <= time) {
        await getNewMsgs();
        timeToMakeNextReq =
            performance.now() + INTERVAL + failedTries * BACKOFF;
    }

    requestAnimationFrame(rafTimer);
};

requestAnimationFrame(rafTimer);
