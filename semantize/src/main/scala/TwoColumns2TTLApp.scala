package omerxi.semantize

import java.io.File

object TwoColumns2TTLApp extends App with TwoColumns2TTL with HTML2Cells with Utils {

  val input = new File(args(0))
  if (input.isFile())
    processCellFileAlone()
  else
    processSingleDirectory()

  def processSingleDirectory() {
    println(prefixes)
    val directory = new File(args(0))
    val files = directory.listFiles().sorted
    for (file <- files) {
      log(file.toString())
      val cellsFile = convertHTML2Cells(file.toString())
      process1File(cellsFile)
    }
    closeOutput()
  }

  def processCellFileAlone() {
    println(prefixes)
    process1File(new File(args(0)))
    closeOutput()
  }
}