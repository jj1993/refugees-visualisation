import json

FILES = ['2010.csv', '2011.csv', '2012.csv', '2013.csv' ,'2014.csv', '2015.csv']
OUTPUTFILE = '../refugees.json'
            
def makeDict(filename):
    """
    Leest de csv-file met de migratie-stromen data
    Zet de data om in een lijst van dictionaries
    """
    data=open(filename).read()
    l = []
    for flow in data.split("\n")[1:]:
        t = []
        for e in flow.split(";"):
            if len(e) > 0:
                if len(t) < 2:
                    e = ''.join(i for i in e if not i.isdigit())
                    e = e.decode('ascii', errors='replace')
                else:
                    if e == "*" or e == "-": e = 0
                    e = int(str(e).replace('.', ''))
                t.append(e)
        if len(t) > 0:
            d = {}
            d["origin"], d["asylum"], d["start"], d["repart"], d["end"] = t
            l.append(d)
    return l

def combine(data):
    """
    Combineert de variabelen tot een lijst
    """
    newList = []
    
    for n, year in enumerate(data):
        key = FILES[n][:4]
        nextKey = str(int(key) + 1)
        rep = key+"rep"
        for y in year:
            for e in newList:
                if (y["origin"] == e["origin"]
                    and y["asylum"] == e["asylum"]):
                    try:
                        e[key] = int((e[key] + y["start"])/2.0)
                    except:
                        e[key] = y["start"]
                    e[nextKey] = y["end"]
                    e[rep] = y["repart"]
                    break
            else:
                d = {}
                d["origin"], d["asylum"], d[key], d[nextKey], d[rep] = (
                    y["origin"], y["asylum"], y["start"], y["end"], y["repart"]
                    )
                newList.append(d)
    return newList
                      
def makeJSON(dataList, filename):
    '''
    Slaat JSON bestand op met een dictionary voor elke vluchtelingenstroom
    '''
    with open(filename, 'wb') as f:
        json.dump(dataList, f, indent=True)
        
if __name__ == '__main__':
    print "Sorting courses data..."
    data = []
    for f in FILES:
        year = makeDict('../cleaned_data/'+f)
        data.append(year)
    c = combine(data)

    print "Compiling JSON..."
    makeJSON(c, OUTPUTFILE)
