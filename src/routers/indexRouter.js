const express = require('express');
const showdown = require('showdown');
const path = require('path');
const fs = require('fs');

const router = new express.Router();

router.get('/', (req, res) => {
    fs.readFile(path.join(__dirname + '../../../README.md'), 'utf8', (err, data) => {
        if (err) {
            return res.send('<h1>Welcome to task-manager API!</h1>');
        }

        converter = new showdown.Converter(),
        html = converter.makeHtml(data);
        res.send(html);
    });
});

module.exports = router;