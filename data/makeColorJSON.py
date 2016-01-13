import json

FILES = ['2010color.csv', '2011color.csv', '2012color.csv',
         '2013color.csv' ,'2014color.csv', '2015color.csv']
OUTPUTFILE = 'colorvalues.json'
            
def makeDict(filename):
    """
    Leest de csv-file met de rooster data
    Zet de data om in een lijst van dictionaries
    """
    y = filename[13:17]
    data=open(filename).read()
    l = []
    
    for flow in data.split("\n")[1:]:
        t = []
        for e in flow.split(";"):
            if len(e) > 0:
                if len(t) < 1:
                    e = ''.join(i for i in e if not i.isdigit())
                    e = e.decode('ascii', errors='replace')
                else:
                    if y == "2010":
                        try: e = float(e.replace(",",""))
                        except: e = "NaN"
                    else:
                        try: e = float(e.strip(".").replace(",","."))
                        except: e = "NaN"
                t.append(e)
        if len(t) > 0:
            d = {}
            d["origin"], d["gdp"+y], d["inhibitans"+y], d["km2"+y], d["gdprank"+y], d["inhibitansrank"+y], d["km2rank"+y] = t
            l.append(d)
            
    return l

def combine(data):
    newList = []

    for d in data:
        for e in d:
            for i in newList:
                if i["origin"] == e["origin"]:
                    for key in e:
                        if key != "origin":
                            i[key] = e[key]
                    break
            else:
                newList.append(e)
    
    return newList
                      
def makeJSON(dataList, filename):
    '''
    Slaat JSON bestand op met een dictionary voor elk land
    '''
    with open(filename, 'wb') as f:
        json.dump(dataList, f, indent=True)
        
if __name__ == '__main__':
    print "Sorting courses data..."
    data = []
    for f in FILES:
        year = makeDict('cleaned_data/'+f)
        data.append(year)
    c = combine(data)
    print "Compiling JSON..."
    makeJSON(c, OUTPUTFILE)
