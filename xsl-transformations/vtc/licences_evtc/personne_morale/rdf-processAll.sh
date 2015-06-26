#!/bin/sh
input=${1:-/media/webdav/vtc/licences/personne-morale/xml}
output=${2:-/media/webdav/vtc/licences/personne-morale/rdf}

ordinal=1;
for file in $input/*
  do
    out=$output/$(basename $file .xml).rdf;
    if [ -f $out ]
      then
      echo "File $out already exists"
    else
      echo "File $out does not exist yet"
    fi
    ./rdf-processOne.sh $file $out $ordinal;
    ordinal=$((ordinal+1))
  done
