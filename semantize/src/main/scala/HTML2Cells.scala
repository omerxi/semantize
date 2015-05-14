package omerxi.semantize

import java.io.File
import java.io._

trait HTML2Cells extends Utils {

  /**
   * convert HTML to simple rows and columns through MarkDown
   *  TODO : maybe replace system calls to grep with Scala regex
   */
  def convertHTML2Cells(htmlFile: String): File = {
    if (htmlFile.endsWith(".html")) {
      val usr = "/usr/bin"
      val command1 = s"""$usr/pandoc -f html -t markdown $htmlFile -o $htmlFile.md"""
      runCommand(command1)
      import scala.sys.process._
      val ret = s"""cat $htmlFile.md""" #|
        Seq("egrep", "^  |Fiche mise à jour le ") #>
        new File(s"$htmlFile.txt") !

      println(s"$htmlFile : return $ret")
      new File(s"$htmlFile.txt")
    } else new File("/tmp/null")
  }

  def runCommand(command: String): Int = {
    log(command)
    //      import scala.language.postfixOps
    import scala.sys.process._
    val ret: Int = command.!
    ret
  }

}