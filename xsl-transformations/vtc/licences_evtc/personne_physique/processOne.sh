#!/bin/sh
input=${1:-input.html}
output=${2:-output.xml}

echo -n "$input: "
saxonb-xslt -s:$input -xsl:../html-to-xml.xsl -o:$output label="personne physique"
if [ $? -eq 0 ]
then
    echo ok >&2
else
    echo failed >&2
fi
