<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:strip-space elements="*"/>
  <xsl:output indent="yes" method="xml"/>
  <xsl:template match="/html">
    <data>
      <label>personne morale</label>
      <value>
        <xsl:apply-templates select="body"/>
      </value>
    </data>
  </xsl:template>
<!-- date de mise à jour de la fiche -->
  <xsl:template match="//table[@class='ficheDescrLinks']/tbody/tr[2]/td/i/span/text()">
    <data>
      <label>Fiche mise à jour le</label>
      <value>
        <xsl:value-of select='.'/>
      </value>
    </data>
  </xsl:template>
  <xsl:template match="fieldset[legend[text()='Forme juridique']]">
    <data>
      <label>
        <xsl:value-of select='./legend'/>
      </label>
      <value>
        <xsl:value-of select='./table'/>
      </value>
    </data>
  </xsl:template>
  <xsl:template match="table/tbody/tr/td[@colspan='2']">
    <data>
      <label>
        <xsl:value-of select='./b'/>
      </label>
      <value>
        <xsl:value-of select='./div'/>
      </value>
    </data>
  </xsl:template>
  <xsl:template match="//table[@class='formStyle']/tbody/tr[td[not(@colspan='2')]]">
    <data>
      <label>
        <xsl:value-of select='./td[1]'/>
      </label>
      <value>
        <xsl:value-of select='./td[2]/normalize-space()'/>
      </value>
    </data>
  </xsl:template>
  <xsl:template match="fieldset">
    <data>
      <label>
        <xsl:value-of select='./legend'/>
      </label>
      <value>
        <xsl:apply-templates/>
      </value>
    </data>
  </xsl:template>
  <xsl:template match="text()"></xsl:template>
</xsl:stylesheet>
