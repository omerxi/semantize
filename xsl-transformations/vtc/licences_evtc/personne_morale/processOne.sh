#!/bin/sh
input=${1:-input.html}
output=${2:-output.xml}

echo -n "$input: "
java net.sf.saxon.Transform -s:$input -xsl:../transformation.xsl -o:$output
if [ $? -eq 0 ]
then
    echo ok >&2
else
    echo failed >&2
fi
