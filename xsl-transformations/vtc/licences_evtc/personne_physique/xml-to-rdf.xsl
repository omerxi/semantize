<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:vcard="http://www.w3.org/2006/vcard/ns#"
  xmlns:foaf="http://xmlns.com/foaf/0.1/"
  xmlns:oxi="http://omerxi.com/ontologies/core.owl.ttl#"
  xmlns:oxid="http://omerxi.com/resource/"
  xmlns:cob="http://cobusiness.fr/ontologies/barter.owl.n3#">

  <xsl:strip-space elements="*"/>

  <xsl:output indent="yes" method="xml"/>

  <xsl:template match="/data">
    <rdf:RDF
      xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:vcard="http://www.w3.org/2006/vcard/ns#"
      xmlns:foaf="http://xmlns.com/foaf/0.1/"
      xmlns:oxi="http://omerxi.com/ontologies/core.owl.ttl#"
      xmlns:oxid="http://omerxi.com/resource/"
      xmlns:cob="http://cobusiness.fr/ontologies/barter.owl.n3#">
      <rdf:Description rdf:about="http://omerxi.com/resource/driver">
        <rdf:type rdf:resource="http://omerxi.com/ontologies/core.owl.ttl#Ride-hailing-driver"/>
      </rdf:Description>
      <xsl:apply-templates/>
    </rdf:RDF>
  </xsl:template>

  <xsl:template match="label[text()='personne morale']">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver2">
      <oxi:status rdf:resource="http://fr.dbpedia.org/resource/Personne_physique"/>
    </rdf:Description>
  </xsl:template>

  <xsl:template match="text()"></xsl:template>

</xsl:stylesheet>
