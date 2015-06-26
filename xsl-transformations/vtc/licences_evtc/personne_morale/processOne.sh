#!/bin/sh
input=${1:-input.html}
output=${2:-output.xml}

echo -n "$input: "
saxonb-xslt -s:$input -xsl:../html-to-xml.xsl -o:$output label="personne morale"
if [ $? -eq 0 ]
then
    echo ok
else
    echo failed >&2
fi
