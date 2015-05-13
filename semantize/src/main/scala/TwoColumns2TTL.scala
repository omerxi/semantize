/**
 * @author jmv
 */
package omerxi.semantize

/** Two Columns file to TTL ;
 *  TODO
 *  - make it more configurable
 *  - convert dates to XSD format
 *  - link to Open Data ( dbPedia ) ; maybe use Silk */
object TwoColumns2TTL extends App {

  val prefixes = """
  @prefix foaf: <http://xmlns.com/foaf/0.1/> .
  @prefix cob:  <http://cobusiness.fr/ontologies/barter.owl.n3#> .
  @prefix oxi:  <http://omerxi.co/ontologies/core.owl.ttl#> .
  @prefix dc: <http://purl.org/dc/elements/1.1/>.
  @prefix vcard: <http://www.w3.org/2006/vcard/ns#>.
"""
val dbpediaFR = "http://fr.dbpedia.org/resource"

  val map = Map(
    """^\*Fiche mise à jour le (.*)\*""" -> """ dc:date "$1" ;""",
    "^  Dénomination +(.*)" -> """ foaf:name "$1" ;""",
    "^  Sigle +(.*)" -> """ oxi:initials "$1" ;""",
    "^  Marque / Nom commercial +(.*)" -> """ oxi:brand "$1" ;""",
    "^  Numéro SIRET +(.*)" -> """ cob:siren "$1" ;""",
    "^  Numéro d’immatriculation +(.*)" -> """ oxi:id "$1" ;""",
    "^  Date d’inscription +(.*)" -> """ oxi:join-date "$1" ;""", // 31/01/2012
 
    "^  Statut +PERSONNE MORALE" -> s""" oxi:status <$dbpediaFR/Personne_morale> ;""",
    "^  Statut +PERSONNE PHYSIQUE" -> s""" oxi:status <$dbpediaFR/Personne__physique> ;""",

    "^  (SARL.*)" -> s""" oxi:legal-form <$dbpediaFR/SARL> ;""",
    "^  (SAS.*)" -> s""" oxi:legal-form <$dbpediaFR/SAS> ;""",
    "^  (EURL.*)" -> s""" oxi:legal-form <$dbpediaFR/EURL> ;""",
    "^  (SA.*)" -> s""" oxi:legal-form <$dbpediaFR/SA> ;""",
    "^  (Autre.*)" -> s""" oxi:legal-form oxi:other ;""",

    """^  \*\*Représentant principal\*\*""" -> """ oxi:manager ""\"""",
    """^  \*\*Autre\(s\) représentant\(s\)\*\*""" -> """""\" ;
       oxi:representative ""\"
       """ , 
    "Aucun autre représentant enregistré." -> "" ,
    "^  Adresse +(.*)" -> """""\" ;
       vcard:street-address "$1" ;""",
    "^  Code Postal +(.*)" -> """ vcard:postal-code "$1" ;""",
    "^  Ville +(.*)" -> """ vcard:locality "$1" ;""",
    "^  Pays +(.*)" -> """ vcard:country-name  "$1" """
  )

  println(prefixes)
  var i = 0
  val lines = scala.io.Source.fromFile( args(0) ).getLines
  println( s"_:dr$i")
  for (l <- lines) {
    var triple = l
    for (m <- map) {
      triple = triple.replaceFirst(m._1, m._2)
    }
    println(triple)
    i = i+1
  }
  println( ".")
}