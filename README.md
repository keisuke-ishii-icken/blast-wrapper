# blast-wrapper(ver 0.0.1)
Using blast-wrapper, you can do blast-search asynchronously.

## Install
### standalone
- download blast-wrapper and unzip html folder.
- open index.html

## Specification
- browser : chrome, ie(test on windows10)
- submit sequence to BLAST at interval at least 10 seconds
- poll BLAST every 1 min, until all searches finish
- csv is supported. if you want use it, drag&drop csv on window.
  note: the following format is allowed.
  
  - example1(none header)
  ```
  AATTT,sample1
  ```
  - example2(header(sequence, description))
  ```
  sequence, description
  AATTT,sample1
  GGGGG, sample2
  ```
  - example2(header(description, sequence))
  ```
  description, sequence
  sample1,AATTT
  sample2, GGGGG
  ```

## TODO
### high priority
- search option(like NCBI BLAST)
- save result(link or json) and its client(json only)

### low priority
- load result form RID
- config(e.g. blast server or polling interval...)
- improve UI(animation)
- validator  
  allow following sequence to be searched
  - unique sequence
  - valid sequence
- login system
- server mode
- git rebase commit as ver 0.1.0
- change project name
- change architecture(maybe by REACT)


### finished
- search asynchronously.
- load sequence from csv file(drag&drop).
