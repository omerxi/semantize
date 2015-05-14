/**
 * @author jmv
 */
package omerxi.semantize

import java.io.File

/**
 * Two Columns file to TTL ;
 *  TODO
 *  - make it more configurable
 *  - convert dates to XSD format
 *  - link to Open Data ( dbPedia ) ; maybe use Silk
 */
trait TwoColumns2TTL extends Utils {

  val prefixes = """
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix cob:  <http://cobusiness.fr/ontologies/barter.owl.n3#>.
  @prefix oxi:  <http://omerxi.co/ontologies/core.owl.ttl#> .
  @prefix dc: <http://purl.org/dc/elements/1.1/>.
  @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
"""
  val dbpediaFR = "http://fr.dbpedia.org/resource"

  val outputFile = "output.ttl"

  val commonMap = Map(
		".*wicket:bookmarkablePage.*" -> "",
    "^  -----.*"  -> "",

    """^\*Fiche mise à jour le (.*)\*""" -> """ dc:date "$1" ;""",

    "^  Marque / Nom commercial +(.*)" -> """ oxi:brand "$1" ;""",
    "^  Numéro SIRET +(.*)" -> """ cob:siren "$1" ;""",
    "^  Numéro d’immatriculation +(.*)" -> """ oxi:id "$1" ;""",
    "^  Date d’inscription +(.*)" -> """ oxi:join-date "$1" ;""", // 31/01/2012

    "^  Statut +PERSONNE MORALE" -> s""" oxi:status <$dbpediaFR/Personne_morale> ;""",
    "^  Statut +PERSONNE PHYSIQUE" -> s""" oxi:status <$dbpediaFR/Personne_physique> ;""",

    "^  (SARL.*)" -> s""" oxi:legal-form <$dbpediaFR/SARL> ;""",
    "^  (SAS.*)" -> s""" oxi:legal-form <$dbpediaFR/SAS> ;""",
    "^  (EURL.*)" -> s""" oxi:legal-form <$dbpediaFR/EURL> ;""",
    "^  (SA.*)" -> s""" oxi:legal-form <$dbpediaFR/SA> ;""",
    "^  (AUTRE.*)" -> s""" oxi:legal-form oxi:other ;""",
 
    "^  Code Postal +(.*)" -> """ vcard:postal-code "$1" ;""",
    "^  Ville +(.*)" -> """ vcard:locality "$1" ;""",
    "^  Pays +(.*)" -> """ vcard:country-name  "$1" """)

  val companyMap = Map(
    "^  Dénomination +(.*)" -> """ foaf:name "$1" ;""",
    "^  Sigle +(.*)" -> """ oxi:initials "$1" ;""",
    """^  \*\*Représentant principal\*\*""" -> """ oxi:manager ""\"""",
    """^  \*\*Autre\(s\) représentant\(s\)\*\*""" -> """""\" ;
       oxi:representative ""\"
       """,
    "Aucun autre représentant enregistré." -> "",
          "^  Adresse +(.*)" -> """""\" ;
       vcard:street-address "$1" ;"""
   )
       
  val personMap = Map(
		  "^  Nom +(.*)" -> """ foaf:lastName "$1" ;""",
		  "^  Prénom +(.*)" -> """ foaf:firstName "$1" ;""",
		  "^  Adresse +(.*)" -> """ vcard:street-address "$1" ;"""
  )

  var fileCount = 0

  def process1File(file: File) {
    if (file.exists()) {
      val lines = scala.io.Source.fromFile(file).getLines.toSeq
      val PERSONNE_PHYSIQUE = lines.exists { _ contains("PERSONNE PHYSIQUE") }
      println( "# " + file + " ; " + lines.size + " lines." )
      println(s"_:dr$fileCount")
      for (line <- lines) {
        var triple = line
        for (m <- commonMap) {
          triple = triple.replaceFirst(m._1, m._2)
        }
        if (PERSONNE_PHYSIQUE)
          for (m <- personMap) {
            triple = triple.replaceFirst(m._1, m._2)
          }
        else
          for (m <- companyMap) {
            triple = triple.replaceFirst(m._1, m._2)
          }
        println(triple)
      }
      println(".")
      fileCount = fileCount + 1
    }
  }

  val pr = new java.io.PrintWriter(outputFile)
  /*override*/ def println(s: String) = {
    pr.println(s)
  }

  def closeOutput() = pr.close(); log("Closed " + outputFile)
}