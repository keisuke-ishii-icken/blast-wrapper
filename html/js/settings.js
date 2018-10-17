const settings = {
  postUrl: 'https://blast.ncbi.nlm.nih.gov/blast/Blast.cgi',
  sample: 'CMD=Put&PROGRAM=blastn&DATABASE=nr&FORMAT_TYPE=JSON2&QUERY=${seq}',
  getUrl: 'https://blast.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Get&RID=${rid}',
  timeout: 60000,
  launch: 10000,
  polling: 60000,
  listen: 1000,
  status: {empty: 'EMPTY', ready: 'READY', processing: 'PROCESSING...', searching: 'SEARCHING...', finished: 'FINISHED!', error: 'ERROR!'}
};
