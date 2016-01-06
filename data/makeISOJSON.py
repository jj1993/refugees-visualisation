import json

FILE = 'UN_ISO_codes.csv'
OUTPUTFILE = 'iso.json'
            
def makeDict(filename):
    """
    Leest de csv-file met de codeer data
    Zet de data om in een lijst van dictionaries
    """
    data=open(filename).read()
    l = []
    t = []
    for flow in data.split("\r"):
        t = [e.decode('ascii', errors='ignore') for e in flow.split(";")]
        if len(t) == 3: l.append(t)
    return l
                      
def makeJSON(dataList, filename):
    '''
    Slaat JSON bestand op met een dictionary voor elke landcode
    '''
    with open(filename, 'wb') as f:
        json.dump(dataList, f, indent=True)
        
if __name__ == '__main__':
    print "Sorting ISO data..."
    data = makeDict(FILE)
    print "Compiling JSON..."
    makeJSON(data, OUTPUTFILE)
