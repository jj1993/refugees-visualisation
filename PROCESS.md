# Process book
*Jonathan Jeroen Beekman*
*10345019*

#Dag 2, 5 januari

Ik heb data van het UNHCR van de afgelopen 5 jaar opgeschoond en via python in handige JSONS gezet. Resultaat:

* Lijst met dictionaries waarbij er een land van herkomst, land van aankomst en een grootte van een stroom wordt weergegeven (JSON)
* Lijst met landen en hun respectievelijke 'score' op het gebied van vluchtelingen opvangen (JSON)
* Lijst met iso codes in VN stijl (JSON)

Ook heb ik een wereldkaard die van kleur veranderd per land als je er over heen hovert met je muis
De dataset blijkt wel veel gaten te hebben. Ik denk echter niet dat dit een probleem vormt.

#Dag 3, 6 januari

Naast de hier boven genoemde datasets is nu ook een dataset opgeschoond en omgezet in JSON met het totale aantal asielzoekers in 
verschillende landen op elk moment. Ook is er aan alle datapunten met landennamen een code van de respectievelijke landen toegevoegd

Dit bleek veel tijd te kosten omdat de landen in de tabellen telkens net andere punktuatie ect bleken te hebben. Uiteindelijk is het
wel gelukt om de data op te schonen.

#Dag 4, 7 januari

Vandaag heb ik met een bootstrap template een prototype van mijn visualisatie opgezet. Ook heb ik geprobeerd data in de landkaart in
te lezen. Dit lukte niet, het probleem lijkt te zijn dat ik geen keys kan aanroepen in javascript waar getallen in staan. Ook heb ik
geprobeerd een schuifbalk in te voegen in de HTML. Dit is gelukt, maar om onbekende reden kan ik deze niet bewegen.

#Dag 5, 8 januari

De bootstrap template is verder uitgewerkt en opgeschoond. Er zitten nu geen overbodige jquery's ed. meer in. De wereldkaart is gekleurd
en de getallen van het totale aantal vluchtelingen wordt weergegeven. De data van alle jaren en 3 verschillende types kan nu ingelezen
worden. De volgende stap is om de weergave te koppelen aan het aangevraagde jaar met de slider-bar. Het design-document is opgesteld en 
ingeleverd.

#Dag 6, 11 januari

Ik heb een slider bar ingevoegd waarmee de datum kan worden aangepast. De locatie van de slider bar wordt geupdate als deze wordt 
verschoven. De x-positie wordt via een d3-scale omgezet in een datum en van deze datum wordt het jaar opgevraagt. De data op de wereldkaart
wordt geupdate naar de data van het betreffende jaar. De kaart wordt ook geupdate al de bar nog aan het verschuiven is.

#Dag 7, 12 januari

Nu is ook de data van de vluchtelingenstromen aan de DOM-elementen van de landen gekoppeld. Bovendien is de dat van elk jaar gekoppeld.
De lokatie van de landen bepalen blijkt nog een probleem te zijn. Aangezien de herkostlanden van de vluchtelingen de te bepalen locaties
zijn, en deze vaak uit één stuk land bestaan, gaat het bepalen van de lokatie hier wel goed. Ik laat het dus nog even voor wat het is.

Door op de landen te klikken wordt er nu een functie aangeroepen die de locatie van de muis (op het moment van klikken) bepaald, de locatie
van de landen waar vluchtelingen dat jaar vandaan kwamen en het aantal vluchtelingen op deze route. Morgen ga ik hier lijnen tussen proberen
te trekken.

#Dag 8, 13 januari

De gekoppelde data wordt bij het klikken op een land nu omgezet in visuele lijnen. Hun dikte wordt kwadratisch geschaald naar aantal
vluchtelingen. Ik had vandaag veel problemen met een 'ghost-file'. Ik had een databestand verwijderd, maar de javascript file bleef het
zelfde bestand lezen. Later kon ik opgeslagen wijzigingen in de javascript ook niet meer uitvoeren, de server bleef zich gedragen
alsof er een oudere versie is ingeladen. Met de begeleiding is uitgesloten dat er ergens naar een verkeerde locatie verwezen werd, ook
is de laptop opnieuw opgestart, enz. Kortom, alles geprobeerd, uiteindelijk het probleem opgelost door naar een nieuwe git-repository te verhuizen

https://github.com/jj1993/vluchtelingen-in-europa

#Dag 9, 14 januari

Ik ben weer terug naar mijn oude repository. Alles lijkt weer te werken. Nu komt er bij het klikken op een land ook een popup omhoog die 
de ontwikkeling van het aantal vluchtelingen over de jaren heen weergeeft. Met de data van Duitsland lijkt nog iets mis te zijn. 
Niet alle landen hebben data, wat kan zorgen voor een error bij het klikken op een land. Alleen een goede legenda ontbreekt nog van de
minimum viable product, zoals beschreven in het design document.

#Dag 11, 18 januari

Naar aanleiding van de feedback van afgelopen vrijdag heb ik een checklist gemaakt met dingen die ik nog wil afronden deze week.
Vandaag heb ik een legenda ingevoegd, bij het hoveren over een lang waar migranten vandaan komen licht deze lijn op, bij het hoveren over een
land komt de naam van dat land naar boven en ik heb twee checkboxes ingevoegd waarmee de migrantenstromen of de popup-grafiek uitgezet kunnen worden.

Wat ik nog moet doen deze week:
* Een knop onder de popup-grafiek, waarbij de popup groeit tot het grootste deel van het scherm en er de volgende gegevens inkomen:
	* Een lijngrafiek met uitgebreide informatie over de totale migratiestromen in de wereld
	* Een piechard waarop de vluchtelingenpopulatie uiteengezet wordt naar afkomst
	* De 'rank' van het land in het aantal vluchtelingen per inwoner, GDP of km2 ten opzichten van de rest van de wereld
* Een tweede tabblad in de HTML met
	* Een sorted-barchard waarin de 20 hoogst scorende landen in het aantal vluchtelingen per inwoner, GDP of km2 weergegeven worden
	* Een lijngrafiek met uitgebreide informatie over de totale migratiestromen in de wereld
* Een scrollfunctie in de wereldkaart

#Dag 12, 19 januari

De knop onder de grafiek waarmee de grafiek uitklapt en een multilineplot geeft is af. Ik probeer nu ook de andere informatie en een taart-
diagram toe te voegen.

#Dag 13, 20 januari

In de uitgeklapte grafiek wordt nu ook de rank weergegeven en een interactieve pie-chard waarmee de gebruiker het relatieve aantal vluchtelingen per land kan zien.

#Dag 14, 21 januari

In de uitgeklapte grafiek is een pie-chart toegevoegd waarmee de gebruiker het relatieve aandeel van de vluchtelingen uit een bepaald land van oorsprong, aan het totale aantal vluchtelingen, kan zien in een bepaald jaar. De pie-chard heeft nog wel een bugg, waardoor hij niet altijd rond is

#Dag 15, 22 januari

De bugs in de pie-chard zijn verholpen. In het menu is een link naar een nieuwe pagina ingevoegd, waarin een sorted-bar-chard weergegeven wordt. De gebruiker kan wisselen tussen de relatieve weergave ten opzichten van het totale aantal inwoners, het totalen inkomen of het oppervlak van het land. Door opnieuw te sorteren kunnen deze relaties beter bestudeerd worden. De sorteer functie van de bar-graph is nog wat buggy en de schalen lijken niet altijd goed te werken.

#Zaterdag 23 januari

De bar-chard is nu debugged en er is meer structuur aangebracht in de repository. De wereldkaart en sorted-barchard kleuren nu mee wanneer een ander datatype wordt geselecteerd.

#Dag 16, 25 januari

Namen van functies en variabelen verduidelijkt. Een paar kleine bugs verholpen. Functies beter opgesteld.

#Dag 17, 26 januari

Verder gegaan met opschonen en verduidelijken van code. Bronvermelding op website beschikbaar gemaakt. Knop toegevoegd waarmee de tijd afgespeeld kan worden. Laadscherm ingevoegd.