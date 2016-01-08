# Process book
*Jonathan Jeroen Beekman*
*10345019*

## Minimum viable product

In de schets is de visualisatie weergegeven zoals hij in het proposal document staat toegelicht. Het minimum viable product is het product waarbij van alle landen het totale aantal vluchtelingen in de landen staat weergegeven bij een hover-event, er niet-geschaalde lijnen worden getrokken van bekende migratiestromen, de tijdstappen van de bar discreet zijn in stappen van een jaar en alle landen zijn gekleurd (wanneer er geen hover-event is) met een kleur die geschaald aangeeft hoeveel vluchtenlingen er per 1000 inwoners in het land zijn.

## Framework mapping

* a list of classes and public methods

Ik zal hier alleen de opbouw van mijn map.js beschrijven, die de visualisatie zelf 'tekent'. De bootstrap-omgeving van de HTML-pagina laat ik buiten beschouwing omdat deze grotendeels een template is.

	* Op window.onload wordt een queue.awaitAll() functie aangeroepen waarbij eerst alle json's worden ingeladen. Deze data wordt doorgestuurd naar een functie drawMap() als alles ingeladen is
	* In drawMap() 
	* Vervolgens wordt de wereldkaart ingetekend via D3. Hierbij worden alle path's die met een land corresponderen apart aangeroepen en op de juiste manier gekleurd volgens de huidige datum.


* Advanced Sketches

![Sketch of the proposal](doc/proposal-sketch.jpg)

* API's and frameworks

Voor de visualisatie is in eerste plaatst een bootstrap template gebruikt, [Blue App](https://shapebootstrap.net/item/1524945-blue-app-free-one-page-responsive-html5-parallax-business-app-landing-page). Ik heb de template gestript zodat er (naast de bootstrap implementatie zelf natuurlijk) nu alleen gebruik wordt gemaakt van de fonts, een aantal jquery's voor het menu en twee bijbehorende css-bestanden. Ook was de library [modernizr](http://modernizr.com/) geimplementeerd, die zorgt voor een betere cross-browser werking. Verder wordt de library [Data Driven Documents (D3)](d3js.org) gebruikt om de wereldkaart in een svg te tekenen. De library zal ook gebruikt worden voor het implementeren van de immigratie-lijnen en grafieken bij een hover-event. Als aanvulling op D3's geo-classe is er ook een [topoJSON](http://d3js.org/topojson.v1.min.js) gebruikt, deze zorgt voor een aantal extra functies voor coördinaten en dergelijken. Tenslotte worden alle functies voor het tekenen van de wereldkaart met [queue.js](https://github.com/mbostock/queue) vastgehouden totdat alle data is ingeladen. Anders zouden er errors optreden omdat javascript functies probeert uit te voeren waar data voor nodig is.

Helaas zijn er geen API's met vluchtelingendata beschikbaar, voor zover ik heb kunnen vinden.

* Data sources

Alle data is van UNHCR verkregen, geselecteerd, opgeschoond en in handige JSON's geplaatst. Het is te verwachten dat er nog problemen met deze JSON's zullen optreden, zoals dat er dubbele of ontbrekende datapunten problemen blijken op te leveren, maar ik verwacht niet dat dit nog veel tijd kost omdat veel van deze problemen al opgelost zijn.