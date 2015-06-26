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

  <xsl:param name="ordinal"/>

  <xsl:template match="/data">
    <rdf:RDF>
      <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
        <rdf:type rdf:resource="http://omerxi.com/ontologies/core.owl.ttl#Ride-hailing-driver"/>
      </rdf:Description>
      <xsl:apply-templates/>
    </rdf:RDF>
  </xsl:template>

  <xsl:template match="label[text()='personne physique']">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <oxi:status rdf:resource="http://fr.dbpedia.org/resource/Personne_physique"/>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="data[label[text()='Fiche mise à jour le']]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <dc:date>
        <xsl:value-of select="./value"/>
      </dc:date>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="data[label[text()='Nom']]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <foaf:lastName>
        <xsl:value-of select="./value"/>
      </foaf:lastName>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="data[label[text()='Prénom']]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <foaf:firstName>
        <xsl:value-of select="./value"/>
      </foaf:firstName>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="data[label[text()='Marque / Nom commercial']]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <oxi:brand>
        <xsl:value-of select="./value"/>
      </oxi:brand>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="data[label[text()='Numéro d’immatriculation']]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <oxi:id>
        <xsl:value-of select="./value"/>
      </oxi:id>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="data[label[text()='Date d’inscription']]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <!-- could use dublin core ? -->
      <oxi:join-date>
        <xsl:value-of select="./value"/>
      </oxi:join-date>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- TODO remove [1] restriction later on -->
  <xsl:template match="data[label[text()='Adresse']][1]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <vcard:street-address>
        <xsl:value-of select="./value"/>
      </vcard:street-address>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- TODO remove [1] restriction later on -->
  <xsl:template match="data[label[text()='Code Postal']][1]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <vcard:postal-code>
        <xsl:value-of select="./value"/>
      </vcard:postal-code>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- TODO remove [1] restriction later on -->
  <xsl:template match="data[label[text()='Ville']][1]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <vcard:locality>
        <xsl:value-of select="./value"/>
      </vcard:locality>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <!-- TODO remove [1] restriction later on -->
  <xsl:template match="data[label[text()='Pays']][1]">
    <rdf:Description rdf:about="http://omerxi.com/resource/driver{$ordinal}">
      <vcard:country-name>
        <xsl:value-of select="./value"/>
      </vcard:country-name>
    </rdf:Description>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="text()"></xsl:template>

</xsl:stylesheet>
