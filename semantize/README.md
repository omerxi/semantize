This Scala code transforms a directory of HTML files with 2 columns of data into RDF Turtle data.
In a fisrst stage, the HTML files are converted in Markdown with pandoc.

The code is not very generic yet, but can be adapted by editing the maps in src/main/scala/TwoColumns2TTL.scala .


Dependencies:

pandoc:

    sudo apt-get install pandoc
