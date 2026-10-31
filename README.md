# Kallion kalja

[Julkinen sivu](https://backtooth.github.io/kallion-kalja/) · Kallion ja lähikortteleiden tuoppivertailu. Tavoitteena enintään viisi halvinta ravintolan omasta lähteestä vahvistettua normaalihintaa. Jos vahvistettuja hintoja on vähemmän, sivu kertoo määrän ja näyttää muut paikat lähdetilanteineen.

## Lähteiden järjestys

1. **Paikat Google Mapsista.** `data/places.json` sisältää 31.10.2026 käsin kartoitetut paikat, osoitteet ja suorat Maps-lähdelinkit. Käyttäjän valinnan mukaan Google Places API -avainta ei käytetä. Uusien paikkojen löytäminen ei ole automaattista.
2. **Hinnat ravintolan omilta verkkosivuilta.** Jokaisen paikan `website` ja `sourcePages` määrittävät tarkistettavat omat sivut. Tunnettu verkkosivu valitaan myös silloin, kun hinta puuttuu tai haku epäonnistuu. Tällöin ei siirrytä Facebookiin.
3. **Facebook, jos omaa verkkosivua ei löydy.** Sivustottomille paikoille on etsitty oma Facebook-sivu. Pelkkä Facebook-paikkasivu voi olla epävirallinen: esimerkiksi Iltakoulun löytynyttä epävirallista sivua ei hyväksytä omaksi hintalähteeksi. B12:n, Virkavapaan ja Roskapankin julkisia julkaisuja on tarkistettu selaimella; Kurvittaren sivu vaati kirjautumisen 18+ sisältöön. Näistä ei löytynyt vahvistettavaa tuoretta normaalihintaa. FB:n automaattinen HTTP-haku ei luotettavasti lue julkaisuja, joten päiväys, annoskoko ja tarjouksen voimassaolo tarkistetaan käsin ennen hintojen lisäämistä. Sivulle tallentuu tämä rajoite.

Google Mapsin hintaluokkaa tai asiakasarvosteluja ei käytetä hintana. Vanha Groteskin baarikierros ei ole enää aktiivinen hintalähde. Vanha lähtöaineisto säilyy `data/historical-observations.json`-arkistossa eikä kuulu julkisen vertailun aineistoon.

## Päivittäinen päivitys

GitHub Actionsin `.github/workflows/pages.yml` tarkistaa kaikkien rekisterin paikkojen määritetyt hintalähteet ja julkaisee GitHub Pagesiin päivittäin klo 07 UTC (Suomessa talvella klo 9, kesällä klo 10). GitHub voi viivästyttää ajoa. Paikallisen Codex-ajastuksen tilana on PAUSED. Pilviajo toimii koneen ollessa kiinni.

Työn voi käynnistää myös Actions-välilehden Run workflow -painikkeella; push `main`-haaraan julkaisee sivun. Päivittäjä tallentaa `data/venues.json`-tiedostoon hintahavainnot ja jokaisen lähdeyrityksen tuloksen. `attemptedAt` ja `fetchedAt` ovat lähdesivun haun aikoja. Vain hinnan onnistunut poiminta päivittää `checkedAt`-kentän. Virhe, puuttuva hinta tai Facebookin kirjautumissivu ei vahvista vanhaa hintaa.

Snadi Pubille on tarkka menulukija. Muilta omilta sivuilta hyväksytään vain selvästi nimetyn hanaolutosion täydet HTML-lista- tai taulukkorivit, joissa on sekä 0,4/0,5 litran annoskoko että normaalihinta. Ruoat, pullot, alkoholittomat ja tarjoushinnat jäävät vertailusta pois. Epäselvä sisältö, kuva-, PDF- tai JavaScript-menu merkitään tarkistettavaksi. Gate H11:n After Work -Aura luetaan erillisenä tarjouksena; annoskokoa ei ole lähteessä, joten se ei pääse normaalihintavertailuun. Myöskään tarjousten voimassaoloa juuri nyt ei väitetä.

Julkaisun oletusrajaus näyttää enintään 30 päivää vanhat omista lähteistä saadut hinnat. Hintahavaintojen ja paikkojen määrät ovat erilliset. Sivulla voi avata jokaisen paikan lähteet ja nähdä, löytyikö hintaa vai epäonnistuiko haku. Määräaikaisen Facebook-tarjouksen hinnaksi ei saa asettaa normaalihintaa; lähteeksi tarvitaan suora julkaisulinkki, julkaisupäivä ja selkeät voimassaoloehdot.

## Paikallinen käyttö

Node.js 22 tai uudempi. Ei asennettavia riippuvuuksia.

```sh
node --test
node scripts/update.mjs
node scripts/build.mjs
node scripts/serve.mjs
```

Esikatselu: http://127.0.0.1:4173. Päivittäjä tarvitsee verkkoyhteyden. Jos jokin lähdehaku epäonnistuu, päivätty aineisto kirjoitetaan silti ja päivittäjän exit-koodi on 1. Workflow julkaisee osittaisen tuloksen varoituksen kanssa. Testi-, tallennus- tai julkaisuvirhe pysäyttää työn.

## Julkaisu

Repositorio: `backtooth/kallion-kalja`. Settings → Pages → Source: GitHub Actions. Workflow käyttää GitHubin lyhytikäistä GITHUB_TOKEN-tunnusta, eikä erillisiä salaisuuksia tarvita. Suhteelliset URL-osoitteet tukevat `/kallion-kalja/`-alipolkua. Julkisten repositorioiden ajastukset voivat pysähtyä 60 päivän toimettomuuden jälkeen; käynnistä ne tällöin uudelleen Actions-välilehdeltä. Aiemman yksityisen Sites-julkaisun tunniste on säilytetty `.openai/hosting.json`-tiedostossa, mutta sitä ei päivitetä tässä työnkulussa.
