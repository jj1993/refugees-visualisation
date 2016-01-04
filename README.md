# Proposal Document
*Jonathan Jeroen Beekman*
*10345019*

## Een interactieve visualisatie over de vluchtelingencrisis
In deze repository zal ik een interactieve visualisatie bouwen die de vluchtelingenstromen van begin 2010 tot eind 2015 zo inzichtelijk mogelijk weergeeft. 

### 1. Gebruikersfuncties

De visualisatie zal landkaard weergeven die is gefocust op Europa (het continent) en de omliggende landen. In elk land zal weergegeven worden hoeveel vluchtelingen en personen in vluchteling-achtige omstandigheden er in dat land aanwezig zijn.

De kleur van elk land zal aangeven welk deel (percentage) van de bevolking vluchteling is. Als de gebruiker zijn muis over een land beweegt, zal er in dat land een taartdiagram weergegeven worden, dat laat zien in welke verhouding de vluchtelingen uit welke verschillende landen komen. De kleur van het land zelf zal hierbij neutraal worden. Ook zullen er lijnen verschijnen tussen het geselecteerde land en de landen waar de vluchtelingen vandaan komen. Eventueel zal er met een andere kleur ook weergegeven kunnen worden hoeveel vluchtelingen vrijwillig terug keren naar hun thuisland. De dikte van de lijnen zal logaritmisch schalen met het aantal vluchtelingen, omdat ik verwacht dat de verschillen tussen de vluchtelingenstromen erg groot zullen zijn. Zie ook de schets in paragraaf 3. Mogelijk zullen er ook nog knoppen toegevoegd worden, die het kleurenschema laten wisselen tussen het aantal vluchtelingen per 1000 km2, het aantal vluchtelingen per 1000 inwoners en het aantal vluchtelingen per gemiddelde inkomen (GDP) in het betreffende land.

Naast de landkaart zal aan de ene kant een legenda staan, die de kleuren en dikte van de migratie-lijnen toelicht. Aan de andere kant staat een tijdlijn, waarop belangrijke gebeurtenissen weergegeven worden. De tijdlijn zal uit twee kleuren opgebouwd worden. De scheiding tussen de twee kleuren geeft de tijdsindicatie aan.

Onder de landkaart zal er tenslotte nog een balk gemaakt worden, waarmee de gebruiker tussen verschillende periodes kan verschuiven.

### 2. Het doel van de visualisatie

Het doel van de visualisatie is om de gebruiker inzicht te geven in de ingewikkelde migratiepatronen die naar Europa plaatsvinden. Zo hebben vluchtelingen uit verschillende landen mogelijk ook een voorkeur voor andere landen. Daarnaast moet de visualisatie inzicht geven in de relatieve verschuiving van deze pattronen (mogelijk reisden Eritreërs eerst liever naar Duitsland, maar nu liever naar Zweden). Ten slotte, en het meest belangrijk, moet de visualisatie de gebruiker inzicht geven in hoe grote gebeurtenissen de migratiestromen hebben beinvloed.

### 3. Een schets van de visualisatie

Hier is een schets weergegeven van de visualisatie zoals ik hem graag zou maken. De genoemde knoppen om tussen kleurenschema's te wisselen en getallen in de verschillende landen om het totale aantal vluchtelingen weer te geven zijn hier niet in opgenomen.
![Sketch of the proposal](doc/proposal-sketch.jpg)

### 4. Data

Er is erg veel data beschikbaar over vluchtelingenstromen. De meest volledige en betrouwbare databron lijkt echter de VN vluchtenlingen organisatie (UNHCR) te zijn. De UNHCR heeft van 2010 tot en met 2014 een zeer uitgebreid document met 'global migration trends' uitgegeven, hierin zijn alle 193 lidstaten van de VN opgenomen. In de documenten is een tabel beschikbaar waarin een land van oorsprong, land van asiel en het aantal vluchtelingen dat hier onder valt in het begin en het einde van het jaar. De rede van de toename/afname is ook opgenomen in de tabel. Hiernaast staan in de zelfde documenten ook tabellen opgenomen met het aantal vluchtelingen per 1000 km2, het aantal vluchtelingen per 1000 inwoners en het aantal vluchtelingen per gemiddelde inkomen (GDP) in het betreffende land, aan het einde van elk jaar. Ook is er een toelichting van de grootste vluchtelingenstromen in het document opgenomen.

De data is eenvoudig in excel te selecteren en in een nieuw excel bestand over te zetten. Vanaf daar kan de data met een kort python scriptje omgezet worden in twee handige json's. 

De opbouw van de json met vluchtelingenstromen:
* Een lijst van 5 lijsten: de 5 jaren waar naar gekeken wordt
* Elke lijst bevat een lange serie dictionaries
* Elke dictionarie bevat de volgende keys
	* Land van herkomst, "origin"
	* Land van asiel, "asylum"
	* Aantal vluchtelingen in het begin van het jaar, gemiddeld met de gegevens van het einde van het vorige jaar, "amount"

De opbouw van de json met de gegevens voor de kleuring van de landen:
* Een lijst van 5 lijsten: de 5 jaren waar naar gekeken wordt
* Elke lijst bevat een lange serie dictionaries
* Elke dictionarie bevat de volgende keys
	* Land, "country"
	* Vluchtelingen per inkomen, "gdp"
	* Vluchtelingen per 1000 inwoners, "inhibitans"
	* Vluchtelingen per 1000 km2, "surface"

Een svg-file van een wereldkaart is beschikbaar op [wikipedia.org](https://en.wikipedia.org/wiki/Wikipedia:Blank_maps).

### 5. Technische opbouw van de visualisatie en het platform

De hele visualisatie wordt in HTML opgebouwd door middel van javascript. Alle data zal vanuit de jsons in javascript omgezet worden in objecten. Hierbij zal ook de library Data Driven Documents (d3js.org) gebruikt worden. Hiermee kan bijvoorbeeld ook data in objecten omgezet worden en kunnen gemakkelijk schalen gemaakt worden.

Het is belangrijk dat de data wordt ingelezen voordat Javascript de hele visualisatie opbouwt. Dit kan doormiddel van de 'queue'-functie. Aan de hand van deze data zullen beide legenda's automatisch opgebouwd worden. De schaling van de kleuren vind ook met D3 plaats.

De wereldkaart wordt op een SVG-object opgebouwd vanuit een svg in json formaat. De link is genoemd in paragraaf 4. Deze kaart kan in SVG vorm gemakkelijk ingekleurd worden, omdat de losse landen als object terug te vinden zijn door middel van hun [ISO-code](https://nl.wikipedia.org/wiki/ISO_3166-1). Tegelijk zullen de landen een 'onmouseover' functie mee krijgen, waarbij het taartdiagram en de migratie-lijnen zullen gemaakt worden op het moment dat dit event naar boven komt. Het is in HTML en D3 niet erg lastig om dergelijke figuren op te bouwen. 

De tijdlijn met belangrijke gebeurtenissen is een gehardcode element, waarvan alleen de letters doorzichtig zijn. Door achter de tijdlijn een gekleurde rechthoek te laten verschijnen, lijkt het dan alsof de tijdlijn wordt ingekleurd naarmate de tijd vordert. 

Onder de wereldkaart staat een schuifbalk die met de muis bedient kan worden. Eventueel kan de balk automatisch gaan lopen bij het opstarten van de visualisatie. De data is discreet verdeelt en in eerste instantie zal deze balk dan ook ongeveer 5 discrete stappen kennen (1 jan van elk jaar). In een later stadium kan deze overgang continue gemaakt worden door de data lineair te schalen tussen de datapunten, of door een functie op deze datapunten te fitten en in te voeren in de code. Deze laatste optie maakt echter dat men niet simpelweg een andere dataset kan invoeren en komt dicht in de buurt van data-vervalsing omdat de fit niet door de daadwerkelijke datapunten hoeft te lopen.

### 7. Potentiele problemen

Het kan heel goed dat de data voor bepaalde landen niet beschikbaar blijkt te zijn. Zo bestond de VN voor 2011 nog niet uit 193 lidstaten en bevat het eerste document minder landen dan de latere documenten. Bovendien is de data an 2014-2015 van de VN nog niet in de genoemde vorm uitgegeven en zal deze dus op een andere manier verkregen moeten worden. De data van dit laatste jaar is erg belangrijk aangezien de migratiestromen nog steeds groeien. De visualisatie kan zo geprogrammeerd worden dat het slechts de beschikbare data weergeeft en niet verder zoekt. Zo nodig kan er een kleur of andere weergave gereserveerd worden voor landen zonder data.

Ik wil de legenda graag zichzelf laten opbouwen, maar ik zal een goede manier moeten vinden om het programma hierbij 'mooie' getallen te laten kiezen. Afronden is hierbij een mooi begin.

Mogelijk vraagt het opbouwen van het taartdiagram en de mitratiestroken enige rekentijd, wat storend kan zijn voor de gebruiker. In dit geval kunnen deze beter meteen bij het opstarten van de visualisatie opgebouwd worden, en onzichtbaar gemaakt worden.

Sommige landen van oorsprong zullen buiten de kaart liggen. Om dit deels op te lossen zal ik de namen van de landen van oorsprong op/naast de migratiestroken weergeven. Om verwarring te voorkomen zullen de stroken wel duidelijk de kaart uit moeten lopen. Zie hiervoor ook de afbeelding in paragraaf 3.

### 8. Vergelijkbare visualisaties

De eerste visualisatie die ik had gevonden is [the flow towards Europe](http://www.lucify.com/the-flow-towards-europe/) en lijkt erg op het idee dat ik voor mezelf had. Waarschijnlijk is dit ook de reden dat ik deze visualisatie als eerste vond. Door het gebruik van losse, bewegende punten in plaats van statische lijnen is het geheel echter erg onoverzichtelijk geworden. De vluchtenlingenstromen worden tot in detail weergegeven en met kleuren en getallen worden de absolute aantallen vluchtelingen weergegeven. De terugkerende personen en vluchtenlingen van europa naar andere landen zijn niet weergegeven. Dit zie ik als een tekortkoming en ik zal zelf wel alle beschikbare data meenemen. De visualisatie biedt echter wel een duidelijk beeld van hoe de verschillende migratiestromen zich ontwikkeld hebben over de afgelopen jaren.

Op [de volgende afbeelding](http://sargasso.nl/wvdd/dit-de-reisroute-die-vluchtelingen-naar-nederland-afleggen/) zijn de vluchtenlingenroutes weergegeven in de bekende stijl van een metrokaart. Hier is het echter onduidelijk of de dikte van de lijnen iets betekent en zijn de afstanden tussen de 'haltes' en hun richting niet realistisch weergegeven. De kaart biedt wel een duidelijk overzicht van de route die verschillende groepen vluchtenlingen veelal nemen. Het is helaas niet duidelijk of het figuur ook echt uit harde data is opgebouwd, ik vermoed van niet.
![Vluchtenlingenroutes metrokaart](http://sargasso.nl/wp-content/uploads/2015/01/vluchtelingenroutes_metrokaart_klein.png)

NOS heeft de [vluchtelingen routes](http://app.nos.nl/datavisualisatie/vluchtelingen-routes/) op de wereldkaart weergegeven. Hierbij zijn hun eigen items als punaises op de kaart geprikt. De visualisatie biedt een heel duidelijk overzicht op de herkomst van de verschillende items en is fijn te lezen en gebruiken. Ook hier ontbreekt helaas harde data.

[The refugee project](http://www.therefugeeproject.org/#/2011) heeft een uitgebreide visualisatie gemaakt waarop de landen met het meeste vluchtelingen duidelijk zijn weergegeven en er een tijdverloop geimplementeerd is. De handigste implementatie van deze visualisatie is dat de gebruiker door middel van tekstbalonnetjes kan zien, waarom bepaalde migratiestromen op gang zijn gekomen. Het geeft een duidelijk inzicht in de geschiedenis van vluchtelingenstromen overal op aarde, maar het gebruik van grote roze ringen laat wel wat na in het scheppen van inzicht.

Tenslotte heeft *Doctors of the World* de visualisatie [Journey of a Refugee](http://www.refugeeswelcome.space/) gemaakt. Dit is een wereldkaart waarop grof de migratiestromen geschetst zijn, en op de kaart live twitterberichten verschijnen die vluchtelingen supporten. De kaart geeft geen inzicht in het vluchtelingenprobleem, behalve dat het een vorm van positieve propaganda is.