<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:strip-space elements="*"/>
  <xsl:output indent="yes" method="xml"/>
  <xsl:template match="/html">
    <root>
      <xsl:apply-templates select="body"/>
    </root>
  </xsl:template>
<!-- date de mise à jour de la fiche -->
  <xsl:template match="//table[@class='ficheDescrLinks']/tbody/tr[2]/td/i/span/text()">
    <data>
      <property>Fiche mise à jour le</property>
      <value>
        <xsl:value-of select='.'/>
      </value>
    </data>
  </xsl:template>
<!-- tout le reste -->
  <xsl:template match="//table[@class='formStyle']/tbody/tr">
    <data>
      <property>
        <xsl:value-of select='./td[1]'/>
      </property>
      <value>
        <xsl:value-of select='./td[2]/normalize-space()'/>
      </value>
    </data>
  </xsl:template>
  <xsl:template match="text()"></xsl:template>
</xsl:stylesheet>
