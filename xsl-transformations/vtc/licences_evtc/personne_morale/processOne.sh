#!/bin/sh 
input=${1:-input.html}
output=${2:-output.xml}
java net.sf.saxon.Transform -s:$input -xsl:../transformation.xsl -o:$output
