"use strict";

const settings = {
  targetUrl: 'https://blast.ncbi.nlm.nih.gov/blast/Blast.cgi',
  timeout: 60000,
  launch: 10000,
  polling: 60000,
  listen: 1000,
  status: {empty: 'EMPTY', ready: 'READY', processing: 'PROCESSING...', searching: 'SEARCHING...', finished: 'FINISHED!', error: 'ERROR!'},
  database:'nr',
  program:'{"program":"blastn","megablast":true, "discontiguous":false}',
  excludeUncultured:false
};
