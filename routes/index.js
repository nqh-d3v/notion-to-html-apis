const express = require('express');
const NotionPageToHtml = require('notion-page-to-html');
const router = express.Router();

/* GET users listing. */
router.get('/html/:notionKey', async function(req, res, next) {
  try {
    const {notionKey} = req.params;
    if (!notionKey) {
      res.status(400).send('Error: Missing \'notion-key\'');
      return;
    }
    const url = notionKey.includes('https://') ?
      notionKey :
      `https://notion.so/${notionKey}`;
    const content = await NotionPageToHtml.convert(url);
    if (!content) {
      res.send(`Error: Convert Notion to HTML from '${url}'`);
      return;
    }
    const {html} = content;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    switch (err.name) {
      case 'MissingIdError':
      case 'InvalidPageUrlError':
        return res.status(400).send(err.message);
      case 'NotionPageAccessError':
        return res.status(400).send(err.message);
      default:
        return res.status(400).send(err.message);
    }
  }
});

module.exports = router;
