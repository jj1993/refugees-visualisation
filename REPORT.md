# FINAL REPORT
*Jonathan Jeroen Beekman*
*10345019*

## Refugees in Europe
In deze repository staat de visualisatie "Refugees in Europe". Het is een visualisatie die de vluchtelingenstromen van begin 2010 tot eind 2015 zo inzichtelijk mogelijk weergeeft. De visualisatie bestaat uit twee tab-bladen: een interactieve wereldkaart, geconcentreerd rondom Europa, en een interactieve bar-grafiek.

### 1. User functions

De visualisatie bestaat uit twee tab-bladen. *In het eerste tab-blad* geeft de webpagina een landkaart weer die is gefocust op Europa (het continent) en de omliggende landen. In elk land wordt weergegeven hoeveel vluchtelingen en personen in vluchteling-achtige omstandigheden er in dat land aanwezig zijn.

De kleur van elk land geeft aan welk deel (percentage) van de bevolking vluchteling is. Als de gebruiker een land aanklikt wordt er een lijngrafiek weergegeven waarop de ontwikkeling van de totale vluchtelingen populatie vanaf 2010 weergegeven wordt. Ook worden er lijnen getrokken tussen het geselecteerde land en de landen, waar de belangrijkste vluchtelingenstromen NAAR het geselecteerde land vandaan komen. De dikte van deze lijnen is kwadratisch geschaald naar het aantal vluchtelingen dat deze route gebruikt. Bij de lijngrafiek krijgt de gebruiker de keuze om de grafiek uit te breiden. Hierbij wordt het grootste deel van het scherm ingekomen door een popup scherm met de volgende functies:
* Een lijndiagram waarop de grootte van de vluchtelingenstromen vanuit verschillende landen NAAR het aangeklikte land aangegeven worden van 2010 tot 2015.
* Een taartdiagram waarin het proportionele aandeel van alle vluchtelingenstromen in het geselecteerde land weergegeven worden
	* De kleuren van de lijnen en 'slices' van het taartdiagram voor eenzelfde land zijn gelijk, voor meer gebruikersgemak
* Het aantal vluchtelingen per 1000 inwoners, per GDP en per 1000 km2 in het geselecteerde land
* Een 'rang' die het land inneemt ten opzichten van alle andere bij de VN-aangesloten landen in het geselecteerde jaar, op basis van deze drie selectors, waarbij de rang 1 betekent dat het land het 'hoogste' getal heeft (bijvoorbeeld Libanon heeft de meeste vluchtelingen per inwoner in 2015, en neemt in dat jaar voor die selector de rang 1 aan).

Als de gebruiker de muis over een land beweegt verschijnt de naam. In de menubalk kan er gewisseld worden tussen drie kleurenwaardes: het aantal vluchtelingen per 1000 inwoners, per GDP en per 1000km2. Voor meer gebruikersgemak worden deze drie selectors in verschillende kleurencoderingen weergegeven na geselecteerd te zijn. De gebruiker kan doormiddel van het verschuiven van een slider de datum aanpassen. Ook kan er door middel van een play/stop-button gekozen worden om de tijd constant te laten afspelen.

*In het tweede tab-blad* wordt een interactieve bar-grafiek weergegeven. De gebruiker ziet bij het initialiseren van de grafiek de 15 hoogst scorende landen in 2010 op de selector "vluchtelingen per 1000 inwoners". De gebruiker kan wisselen naar de selectors "vluchtelingen per GDP" en "vluchtelingen per 1000km2". Hierbij veranderd de kleurencodering naar de zelfde waardes als die van de wereldkaart bij deze selectors. De datum kan op dezelfde manier als bij de wereldkaart gewijzigt worden: door middel van het handmatig hanteren van de slider, of het gebruiken van de stop/play-button. Op elk moment (ook tijdens het wijzigen van de tijd door middel van de stop/play-button) kan de data opnieuw gesorteerd worden, waarbij de 15 landen die op dat moment het hoogste scoren op de selector weergegeven worden.

Het doel van de visualisatie is om de gebruiker inzicht te geven in de ingewikkelde migratiepatronen die naar Europa plaatsvinden. Zo hebben vluchtelingen uit verschillende landen mogelijk ook een voorkeur voor andere landen. Daarnaast moet de visualisatie inzicht geven in de relatieve verschuiving van deze pattronen (mogelijk reisden Eritreërs eerst liever naar Duitsland, maar nu liever naar Zweden). Ten slotte, en het meest belangrijk, moet de visualisatie de gebruiker inzicht geven in hoe grote gebeurtenissen de migratiestromen hebben beinvloed.

### 2. Technical design van de wereldkaart

**Bestaat uit de bestanden**

* main.js

De global variables worden hier gedefinieerd, de wereldkaart wordt geinitialiseerd en de legenda wordt ingetekend. Ook zijn er enkele regels jQuery gebruikt om de events van de checkboxes en slider-bar aan hun functie te koppelen.

De initialisatie:

	Op window.onload wordt een queue.awaitAll() functie aangeroepen waarbij eerst alle json's worden ingeladen. 
	Deze data wordt doorgestuurd naar een functie drawMap() als alles ingeladen is. In drawMap() laat ik ook 
	alle visualisaties en grafieken getekent worden. Mogelijk kan ik in drawMap() zelf een queue implementeren 
	die een laadbalk over de SVG heen plaats tot de visualisatie geladen is.

	In drawMap():
	* De wereldkaart wordt ingetekend via D3. Hierbij worden alle path's die met een land corresponderen 
	apart aangeroepen en op de juiste manier gekleurd volgens de huidige datum. De path-objecten krijgen hun
	ISO-landcode als data mee.
	* Er wordt door de path-elementen (landen) heengelooped met de functie getCountryData(countries *lijst van paths*), zie data.js. 
	Hierbij wordt de data die correspondeert met de landcode per jaar uit alle JSON's gezocht en in een lijst gereturned.
	* Met deze datalijst wordt automatisch een legenda aangemaakt met drawLegend(countryData *lijst van strings en floats*)
	* Omdat de datalijst nu automatisch in de goede volgorde staat, kan er opnieuw door de path-elementen worden
	geloopt, door de datalijst uit getCountryData(countries) aan de landen toe te wijzen. Hierbij krijgt
	elk path-object (land) nu de volgende waardes als data mee.
		* De landnaam (ipv de code)
		* Zijn x/y middelpunt (getCentre(country *path object*)
		* Het totale aantal asielzoekers (getTotal(ISO code *float*, jaar *string*))
		* Het aantal vluchtelingen per 1000 inwoners, per 1000km2 en per GDP, corresponderende met de kleur
	die het land zal krijgen (getColor(ISO code *float*, jaar *string* en type *string*))
		* De grootte en herkomst van de asielstromen naar het betreffende land toe (getFlows(ISO code *float*, jaar *string*)), zie migration-flows.js
	* Hierbij word het land gekleurd in de correcte kleur en een text-element geplaatst met het aantal vluchtelingen in het 
	betreffende land op het jaar waarop de visualisatie wordt geinitialiseerd.

* data.js

De JSON-bestanden worden in een nieuwe vorm in lijsten geplaatst zodat de data beter aan de path-objecten van de landen gekoppeld kan worden en de d3-templates van de grafieken niet aangepast hoeven te worden.

*functies:*
getCountryData(idArr *list*), voegt de JSON's die in de queue zijn ingeladen samen. Gebruikt de functies getTotal(), getColor(), getRefugeeFlows(), getName() en getCentre(). Elke functie geeft voor elk jaar en elk land een datapunt mee. Returned een lijst van lijsten

reformatData(d), ontvangt de data gebonden aan een geklikt land en zet dit in de vorm van de d3 line chard-template (zie linechard.js). Gebruikt de functie parseData(). Returned een lijst van dictionaries.

* update.js

Functies die wijzigingen doorvoeren bij het wisselen van selector of het veranderen van de tijd. 

*functies:*
update(n *integer*) wordt aangeroepen bij alle events (zie main.js). Hij update de dateKey (seletDate(), returned een string) en zorgt dat de map opnieuw ingekleurd wordt en de legenda geupdate wordt (updateLegenda(), geen return). Gebruikt jQuery functies. Geen return.

* playbutton.js

Functies die de slider verschuiven en update functies aanroepen als de play-button gebruikt wordt

*functies:*
setInterval(), checkt 10x per seconden de staat van de stop/play knop. Als de knop ingedrukt is, wordt de slider verschoven en de update() functie (zie update.js) aangeroepen.

buttonPlayPress(), wordt aangeroepen bij een click-event op de play/stop knop. Update de toestand van de knop, *buttonState*, een boolean.

* migration-flows.js

De functies die de migratie-lijnen tekenen en bijhouden

*functies:*
drawLines(), tekent de migratie lijnen voor het geselecteerde land. Voegt hover-events toe die de lijnen opvallend kleuren.

* popup-graph.js

Functies die nieuw DIV-object aanmaken en invullen met tekstelementen en een svg-object dat ingedeeld wordt. Zowel het kleine (drawInfo()) als grote popupscherm (drawExtendInfo())	worden hier bijgehouden. In het popup scherm worden in de uitgebreide-modus een taartdiagram (zie piechard.js) en een lijndiagram (zie linechard.js) weergegeven. Ook worden de selector-waardes weergegeven met hun respectievelijke worldrank (drawRank()). Er zijn geen returns in dit bestand.
	* piechard.js, het taartdiagram zelf, d3 template waarbij ik mijn data in de vorm van de template heb gezet. Zie sources in README.md voor de bron.
	* linechard.js, de lijndiagrammen van het kleine en grote popup-scherm, d3 template waarbij ik mijn data in de vorm van de template heb gezet. Zie sources in README.md voor de bron.

**Globale variabelen**
* currentDate, de huidige datum, zoals weergegeven door de slider
* dateKey, de variabele die bijhoud uit welk jaar de data geselecteerd dient te worden (bijvoorbeeld "20155", juni 2015), vastgesteld aan de hand van currentDate
* type, de huidige selector (bijvoorbeeld 'km2')
* YEARS, een dictionary van dateKey-datum combinaties
* STARTDATE, de begindatum. Eerste element van YEARS bij default.
* SHOWGRAPH en SHOWFLOWS, twee booleans die weergeven of de migratie-lijnen en popup-windows weergegeven moeten worden.
* scaleToDate, scaleToColor, scaleToFlow; de d3-schaal-objecten gebruikt om de data in kleuren en lijnen om te zetten en de positie van de slider in een datum te vertalen
* countryData, alle data van de JSON-files samengevoegt in één lijst die op volgorde van de country-path-objecten staat (het n'de element van de lijst correspondeert met het n'de land)


**Events**
*Hover over land*
De landnaam wordt weergegeven, op een positie relatief ten opzichten van de muis
De kleur van het land wordt wit

*Mouse klik op een land*
De vluchtelingenstromen en pop up worden zichtbaargemaakt. Alle andere stromen en popups worden onzichtbaar gemaakt. Zie popup-graph.js
Het geselecteerde land wordt rood-omrand

*Slider-bar die het jaar aangeeft wordt verschoven*
De kleuren (fill) van de path-elementen wordt geupdate
Alle zichtbare popups, tekstvakken, en asielstromen worden onzichtbaar gemaakt tot het volgende hover-event

*Een andere selector wordt geselecteerd in de menu-balk*
De globale variabele die de gebruikte selector aangeeft, *type*, wordt geupdate. De kleuren van de landen worden bijgewerkt. Bij een klik event wordt nu automatisch de correcte data weergegeven.

*De play-button wordt ingedrukt*
De slider bar wordt landzaam en constant bewogen
Als de slider bar het volgende data punt bereikt, wordt de data geupdate


### 3. Technical design van de bar-grafiek.
De bar grafiek wordt in een andere HTML-file weergegeven dan de wereldkaart.

**Werking**
Met een aantal jQuery codes worden de events aan de slider en buttons in de HTML gekoppeld. 

Met en queue.js wordt de colorValue.json data ingeladen. Dit is de data die bij de selectors hoort.

Met deze data wordt drawSortedBarChard(data) aangeroepen. De data wordt omgezet in de format van een d3 sorted-bar chard template. Er wordt vervolgt met de ongewijzigde template zelf. Zie sources in README.md voor de bron. 

De barchard wordt geupdate met de zelfgeschreven functie updateBarChard(), die zorgt dat de bars geupdate worden maar niet verschuiven.

Verder zijn de functies defineColorScale(), update() en selectDateKey() ingevoegt. Hiermee wordt respectievelijk de kleur geupdate bij het selecteren van een nieuwe selector, de datum in de HTML geupdate en de dateKey geselecteerd, zoals beschreven in paragraaf 2.


**Globale variabelen**
* currentDate, de huidige datum, zoals weergegeven door de slider
* dateKey, de variabele die bijhoud uit welk jaar de data geselecteerd dient te worden (bijvoorbeeld "20155", juni 2015), vastgesteld aan de hand van currentDate
* type, de huidige selector (bijvoorbeeld 'km2')
* YEARS, een dictionary van dateKey-datum combinaties
* STARTDATE, de begindatum. Eerste element van YEARS bij default.

**Events**
*Slider-bar die het jaar aangeeft wordt verschoven*
De dateKey wordt geupdate, en de update() functie wordt aangeroepen. De grootte van de bars wordt bijgewerkt. Note: dit is dus niet de update functie van de wereldkaart!

*Een andere selector wordt geselecteerd in de menu-balk*
De globale variabele die de gebruikte selector aangeeft, *type*, wordt geupdate. De kleuren van de bars worden bijgewerkt. Bij een klik event wordt nu automatisch de correcte data weergegeven.

*De play-button wordt ingedrukt*
De slider bar wordt landzaam en constant bewogen
Als de slider bar het volgende data punt bereikt, wordt de data geupdate.


### 4. Changes with respect to DESIGN-document

De belangrijkste verandering is het tweede tab-blad: in het originele plan was er slechts één pagina.

Er is een knop ingevoegd waarmee de tijd automatisch verloopt

Bij een klik op een land komt er eerst een simpele lijngrafiek met alleen een totaal omhoog. Bij het klikken op een extentie-button worden pas de lijngrafiek en taartgrafiek zoals bedoeld in het design-document weergegeven. In het uitgeklapte scherm wordt nu ook de score van het land in het geselecteerde jaar op de drie selectors met hun rang gegeven.

**Kleine veranderingen**

* De grafieken komen alleen bij een click-event omhoog, niet bij hover-events. 
* De legenda wordt onder de wereldkaart geplaatst in plaats van er op.
* Als er een andere selector gekozen wordt, wordt er van kleurencodering veranderd, zodat het duidelijk is welke selector geselecteerd is.
* De landen worden rood-omrand als ze geselecteerd zijn
* Bij een hover-event wordt de naam van een land weergegeven
* Er zijn twee check-boxes ingevoegt waarmee de gebruiker de popup-schermen en migratielijnen kan uitzetten.

Al deze veranderingen zijn doorgevoerd op basis van advies bij de daily-standups of de wekelijkse presentatie.


### 5. Challenges and decisions

* Namen van landen in dataset
De namen waren niet consistent opgemaakt, waardoor Python (waarmee de data omgezet werd in JSON's) niet herkende dat het om dezelfde landen ging. Ook was het linken van de landen aan hun ISO-codes een probleem. Dit probleem is deels opgelost door een land/ISO-code vertaalsleutel van de VN zelf te gebruiken. Hierbij kwam de opmaak grotendeels overeen. De rest van de conflicten zijn 'met de hand' opgelost.
* Python's SimpleHTTPServer
Gooit cache niet weg
* Centroids van landen
Niet in dataset. Lastig te vinden
* Het cijfer van het totale aantal vluchtelingen per land
Dit cijfer wordt niet meer weergegeven in de landen maar alleen in de lijngrafiek bij het klikken op een land. De wereldkaart werd te druk (onoverzichtelijk!) van alle cijfers en de cijfers werden op de verkeerde plek geplaatst omdat de centroids van de landen onbekend zijn.
* y-as van de bar-grafiek
Verstoort de plaatsing van andere text-objecten