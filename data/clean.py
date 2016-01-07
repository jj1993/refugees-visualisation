import json

FILES = ['total.json', 'colorvalues.json',  'refugees.json'] 
ISO = "iso.json"


def clean(name):
    name = name.replace("Rep.","Republic")
    name = name.replace("Dem.","Democratic")
    name = name.replace("Congo, Republic of","Congo")
    name = name.replace("Occupied Palestinian Territory","State of Palestine")
    name = name.replace("Serbia and Kosovo","Serbia")
    name = name.replace("Curacao","Curaao")
    name = name.replace("Georgia ","Georgia")
    name = name.replace("Iran, Islamic Republic of","Iran (Islamic Republic of)")
    name = name.replace("Peoples","People's")
    name = name.replace("Bonaire, Sint Eustatius and Saba, Sint Eustatius and Saba","Bonaire, Sint Eustatius and Saba")
    name = name.replace("Bonaire, Sint Eustatius and Saba, Sint Eustatius and Saba, Saint Eustatius and Saba","Bonaire, Sint Eustatius and Saba")
    name = name.replace("United Kingdom","United Kingdom of Great Britain and Northern Ireland")
    name = name.replace("Cte dIvoire","Cte d'Ivoire")
    name = name.replace("United States", "United States of America")
    name = name.replace("United Kingdom of Great Britain and Northern Ireland of Great Britain and Northern Ireland of Great Britain and Northern Ireland","United Kingdom of Great Britain and Northern Ireland")
    name = name.replace("United States of America of America of America of America","United States of America")
    name = name.replace("Saint Maarten","Saint Martin (French part)")
    name = name.replace("United States of America of America of America","United States of America")
    name = name.replace("United States of America of America","United States of America")
    name = name.replace("Bonaire, Sint Eustatius and Saba, Saint Eustatius and Saba","Bonaire, Sint Eustatius and Saba")
    name = name.replace("United Kingdom of Great Britain and Northern Ireland of Great Britain and Northern Ireland","United Kingdom of Great Britain and Northern Ireland")
    name = name.replace("Syrian Arab Republic ","Syrian Arab Republic")
    name = name.replace("the Grenadines","Grenada")
    name = name.replace("Venezuela (Boliv. Republic of)","Venezuela (Bolivarian Republic of)")
    name = name.replace("Saint Vincent and Grenada","Saint Vincent and the Grenadines")
    name = name.replace("Libyan Arab Jamahiriya","Libya")
    name = name.replace("Turcs","Turks")
    name = name.replace("C?te","Cte")
    name = name.replace("Cote","Cte")
    name = name.replace("Islamic Republic of Iran","Iran (Islamic Republic of)")
    name = name.replace("Fed.","Federation")
    name = name.replace("  (S/RES/ ())","" )
    name = name.replace("Serbia ","Serbia")
    name = name.replace("Palestinian","State of Palestine")
    name = name.replace("H.","Herzegovina")
    name = name.replace("Saint Martin","Saint Martin (French part)")
    name = name.replace("Saint Martin (French part) (French part)","Saint Martin (French part)")
    name = name.replace("Saint Martin (French part) (French part) (French part)","Saint Martin (French part)")
    name = name.replace("Saint Martin (French part) (French part)","Saint Martin (French part)")
    name = name.replace("Cabo","Cape")
    name = name.replace("The former Yogoslav Republic of Macedonia","The former Yugoslav Republic of Macedonia")
    name = name.replace("Moldova","Moldavia")
    return name
        
def giveIso(f):
    iso = open(ISO).read()
    d = json.loads(iso)  
    
    for n, line in enumerate(f):
        try:
            line["origin"] = clean(line["origin"])
            origin = line["origin"]
        except:
            origin = None
        try:
            line["asylum"] = clean(line["asylum"])
            asylum = line["asylum"]
        except:
            asylum = None
        
        for e in d:
            if asylum == e[1]:
                line["codeAsylum"] = int(e[0])
                break
        else:
            if asylum != None:
                del f[n]
            
        for e in d:
            if origin == e[1]:
                line["codeOrigin"] = int(e[0])
                break
        else:
            if origin != None:
                del f[n]
    return
        
if __name__ == '__main__':
    print "Sorting ISO data..."

    for fName in FILES:
        raw = open(fName).read()
        data = json.loads(raw)
        giveIso(data)
        with open(fName, 'wb') as f:
            json.dump(data, f, indent=True)

