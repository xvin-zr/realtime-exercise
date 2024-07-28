import express from 'express';
import bodyParser from 'body-parser';
import nanobuffer from 'nanobuffer';
import morgan from 'morgan';
import cors from 'cors';

// set up a limited array
const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

// feel free to take out, this just seeds the server with at least one message
msg.push({
    user: 'brian',
    text: 'hi',
    time: Date.now(),
});

// get express ready to run
const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

app.get('/poll', function (_, res) {
    res.json({
        msg: getMsgs(),
    });
});

app.post('/poll', function (req, res) {
    const { user, text } = req.body;

    msg.push({
        user,
        text,
        time: Date.now(),
    });

    res.json({
        status: 'ok',
    });
});

// start the server
const port = process.env.PORT || 5172;
app.listen(port);
console.log(`listening on http://localhost:${port}`);
