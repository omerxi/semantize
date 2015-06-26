#!/bin/sh
input=${1:-/media/webdav/vtc/licences/personne-physique/html}
output=${2:-/media/webdav/vtc/licences/personne-physique/xml}

for file in $input/*
  do
    out=$output/$(basename $file .html).xml
    ./processOne.sh $file $out
  done
