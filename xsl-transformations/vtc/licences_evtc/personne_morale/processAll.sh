#!/bin/sh
input=${1:-/media/webdav/vtc/licences/personne-morale/html}
output=${2:-/media/webdav/vtc/licences/personne-morale/xml}

for file in $input/*
  do
    out=$output/$(basename $file .html).xml
    if [ -f $out ]
      then
      echo "File $out already exists"
    else
      echo "File $out does not exist yet"
    fi
    ./processOne.sh $file $out
done
