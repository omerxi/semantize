#sudo apt-get insta libsaxonb-java

extraction:
	./processOne.sh ./input.html ./output.xml && cat ./output.xml

extractions:
	./processAll.sh /media/webdav/vtc/licences/personne-physique/html /media/webdav/vtc/licences/personne-physique/xml/

rdf:
	saxonb-xslt -s:output.xml -xsl:xml-to-rdf.xsl -o:output.rdf ordinal=1
