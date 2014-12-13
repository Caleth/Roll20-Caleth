import lxml.etree as ET
from joblib import Parallel, delayed
import os
import codecs
import sys 
UTF8Writer = codecs.getwriter('utf8')
sys.stdout = UTF8Writer(sys.stdout)
namespaces = {'exslt':'http://exslt.org/common'}

def parseFile(file):
    dom = ET.parse(file)
    xslt = ET.parse('dnd4eToJSON.xslt')
    transform = ET.XSLT(xslt)
    newdom = transform(dom)
    newfile = file.replace('.dnd4e', '.js')
    with open(newfile, 'w') as outfile:
        outfile.write(str(newdom))
    return newfile

def getFiles():
    for root, subdirs, files in os.walk('.'):
        for file in files:
            base, ext = os.path.splitext(file)
            if ext == '.dnd4e':
                yield os.path.join(root, file)
            elif ext == '.js':
                os.remove(os.path.join(root, file))
    
if __name__ == '__main__':
    Parallel(n_jobs=8)(delayed(parseFile)(file) for file in getFiles())
    #parseFile(files[-2])

