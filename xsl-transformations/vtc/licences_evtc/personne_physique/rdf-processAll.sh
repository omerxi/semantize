#!/bin/sh
input=${1:-/media/webdav/vtc/licences/personne-physique/xml}
output=${2:-/media/webdav/vtc/licences/personne-physique/rdf}

ordinal=1;
for file in $input/*
  do
    out=$output/$(basename $file .xml).rdf;
    ./rdf-processOne.sh $file $out $ordinal;
    ordinal=$((ordinal+1))
  done
