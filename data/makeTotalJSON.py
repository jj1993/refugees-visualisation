import json

FILESSPACE = ['2010total', '2011total']
FILESCSV = ['2012total.csv', '2013total.csv', '2014total.csv', '2015total.csv','2016total.csv'] 
OUTPUTFILE = 'total.json'
          
def makeDictSpace(filename, l):
    """
    Leest de csv-file met de codeer data
    Zet de data om in een lijst van dictionaries
    """
    data=open(filename).read()
    y = filename[13:17]
    
    for line in data.split("\n"):
        country = "*"
        for n, c in enumerate(line):
            if country[-1] == " " and (c.isdigit() or c == "-"):
                if y == "2010":
                    country = "".join([i for i in country if not i.isdigit()])
                if y == "2011":
                    for p, i in enumerate(country):
                        if i.isdigit():
                            country = country[:p]
                country = country[1:-1]
                country = country.decode('ascii', errors='ignore')
            else:
                country += c
                continue
            values = "".join(line[n:])
            v = values.split(" ")[0]
            v = v.replace(",","").replace(")","").replace("-","0")
            v = float(v)
            for i in l:
                if i["asylum"] == country:
                    i[y] = v
                    break
            else:
                d = {}
                d["asylum"] = country
                d[y] = v
                l.append(d)
            break
        
    return l

def makeDictCSV(filename, l):
    """
    Leest de csv-file met de codeer data
    Zet de data om in een lijst van dictionaries
    """
    data=open(filename).read()
    y = filename[13:17]

    for line in data.split("\n"):
        c, v = line.split(";")[:2]
        c = "".join([i for i in c if not i.isdigit()])
        if c[-1] == " ":
            c = c[:-1]
        c = c.decode('ascii', errors='ignore')
        if v == "-":
            v = "0"
        v = float(v.replace(".",""))
        for i in l:
            if i["asylum"] == c:
                i[y] = v
                break
        else:
            d = {}
            d["asylum"] = c
            d[y] = v
            l.append(d)
        if c == "Zimbabwe":
            break
    return l

def makeJSON(dataList, filename):
    '''
    Slaat JSON bestand op met een dictionary voor elke landcode
    '''
    with open(filename, 'wb') as f:
        json.dump(dataList, f, indent=True)
        
if __name__ == '__main__':
    print "Sorting ISO data..."
    l = []
    for f in FILESSPACE:
        l = makeDictSpace('cleaned_data/'+f, l)
    for f in FILESCSV:
        l = makeDictCSV('cleaned_data/'+f, l)
    print "Compiling JSON..."
    makeJSON(l, OUTPUTFILE)
