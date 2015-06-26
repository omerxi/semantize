extraction:
	./processOne.sh ./input.html ./output.xml && cat ./output.xml

extractions:
	./processAll.sh /media/webdav/vtc/licences/personne-morale/html /media/webdav/vtc/licences/personne-morale/xml/

rdf:
	saxonb-xslt -s:output.xml -xsl:xml-to-rdf.xsl -o:output.rdf ordinal=1
