#!/bin/sh
input=$1
output=$2
ordinal=$3

echo -n "$input: "
saxonb-xslt -s:$input -xsl:xml-to-rdf.xsl -o:$output ordinal=$ordinal
if [ $? -eq 0 ]
then
    echo ok
else
    echo failed >&2
fi
