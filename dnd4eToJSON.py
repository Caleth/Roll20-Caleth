import lxml.etree as ET
from joblib import Parallel, delayed
import os, traceback

def parseFile(file):
    try:
        dom = ET.parse(file)
        xslt = ET.parse('dnd4eToJSON.xslt')
        transform = ET.XSLT(xslt)
        newdom = transform(dom)
    except Exception as e:
        return '{0} {1}'.format(file, repr(e))
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
    xslt = ET.parse('dnd4eToJSON.xslt')
    transform = ET.XSLT(xslt)
    Parallel(n_jobs=7)(delayed(parseFile)(file) for file in getFiles())
    #os.remove('XF Group\\Charlie Humphreys.js')
    #parseFile('XF Group\\Charlie Humphreys.dnd4e')
