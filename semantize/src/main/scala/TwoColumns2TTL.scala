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

  val linesBlockBeginnings = Seq(
      "Représentant principal",
      """Autre\(s\) représentant\(s\)""" )

  val commonMap = Map(
		".*wicket:bookmarkablePage.*" -> "",
    "^  ----.*"  -> "",

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
 
    "^  Adresse +(.*)" -> """ vcard:street-address ""\" $1 ""\" ;""",
    "^  Code Postal +(.*)" -> """ vcard:postal-code "$1" ;""",
    "^  Ville +(.*)" -> """ vcard:locality "$1" ;""",
    "^  Pays +(.*)" -> """ vcard:country-name  "$1" ;""",
    "^  Téléphone +(.*)" -> """ foaf:phone  "$1" """
  )
   
  val companyMap = Map(
    "^  Dénomination +(.*)" -> """ foaf:name "$1" ;""",
    "^  Sigle +(.*)" -> """ oxi:initials "$1" ;""",
    """^  \*\*""" + linesBlockBeginnings(0) + """\*\*""" -> """ oxi:manager ""\"""",
    """^  \*\*""" + linesBlockBeginnings(1) + """\*\*""" -> """ oxi:representative ""\"""",
    " *Aucun autre représentant enregistré." -> ""
   )
       
  val personMap = Map(
		  "^  Nom +(.*)" -> """ foaf:lastName "$1" ;""",
		  "^  Prénom +(.*)" -> """ foaf:firstName "$1" ;"""
  )
  
  // end of configuration
  
  var fileCount = 0

  def process1File(file: File) {
    if (file.exists()) {
      val lines = scala.io.Source.fromFile(file).getLines.toSeq
      val PERSONNE_PHYSIQUE = lines.exists { _ contains("PERSONNE PHYSIQUE") }
      println( "# " + file + " ; " + lines.size + " lines." )
      println(s"_:dr$fileCount")
      var precedingTriple = ""
      var lineblockOpened = false
      var lineNumber = 1
      var lineblockLineNumber = 0
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
        // hack for closing oxi:representative: manage 2 lines Block
//        log(s"line $line" )
        lineblockOpened = linesBlockBeginnings.exists { begining => line matches (".*" + begining + ".*" ) }
        val closeBlock = lineNumber == lineblockLineNumber + 2 && lineNumber != 2
//        log(s"lineblockOpened $lineblockOpened lineNumber $lineNumber lineblockLineNumber $lineblockLineNumber closeBlock $closeBlock")
        if( closeBlock ) {println( " \"\"\" ;" ); lineblockLineNumber=0 }
        if(lineblockOpened) lineblockLineNumber = lineNumber
        lineNumber = lineNumber + 1

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