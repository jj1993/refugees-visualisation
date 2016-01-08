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