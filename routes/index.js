const axios = require('axios');
const express = require('express');
const NotionPageToHtml = require('notion-page-to-html');
const router = express.Router();

router.get('/test', async function(req, res, next) {
  const {title, icon, cover, html} = await NotionPageToHtml.convert('https://www.notion.so/asnunes/Simple-Page-Text-4d64bbc0634d4758befa85c5a3a6c22f');
  console.log(title, icon, cover, html);
  res.send(html);
});

router.get('/external-html', async function(req, res) {
  const {notionKey} = req.query;
  try {
    const key = notionKey.includes('https://') ?
      notionKey.split('-')[notionKey.split('-').length - 1] :
      notionKey;
    const response = await axios.get(`https://notion-page-to-html-api.vercel.app/html?id=${key}`, {
      responseType: 'text',
    });
    console.log(response.data);
    if (!response || !response.data) {
      res.status(400).send('Can not get content');
      return;
    }
    res.status(200).send(response.data);
  } catch (err) {
    res.status(400).send(err);
  }
});


router.get('/html', async function(req, res, next) {
  const {notionKey} = req.query;
  try {
    if (!notionKey) {
      res.status(400).send('Error: Missing \'notion-key\'');
      return;
    }
    const notionId = notionKey.includes('https://') ?
      notionKey.split('-')[notionKey.split('-').length - 1] :
      notionKey;
    const notionURL = `https://notion.so/${notionId}`;
    const content = await NotionPageToHtml.convert(notionURL);
    if (!content) {
      res.send(`Error: Convert Notion to HTML from '${notionURL}'`);
      return;
    }
    const {html} = content;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    switch (err.name) {
      case 'MissingIdError':
      case 'InvalidPageUrlError':
        return res.status(400).send(`${err.message} - "${notionKey}"`);
      case 'NotionPageAccessError':
        return res.status(400).send(`${err.message} - "${notionKey}"`);
      default:
        return res.status(400).send(`${err.message} - "${notionKey}"`);
    }
  }
});

module.exports = router;
