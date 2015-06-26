#!/bin/sh
input=${1:-/media/webdav/vtc/licences/personne-morale/html}
output=${2:-/media/webdav/vtc/licences/personne-morale/xml}

for file in $input/*
do
out=$output/$(basename $file .html).xml
./processOne.sh $file $out
done
