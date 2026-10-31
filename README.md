# Kallion kalja

Suomenkielinen, responsiivinen tuoppivertailu Kallion ja lähikortteleiden viidelle löydetylle hintahavainnolle. Ei väitettä koko alueen halvimmista: lähtöaineistossa on yksi tuore ravintolan menu ja neljä historiallista havaintoa 30.4.2025.

## Paikallinen käyttö

Node.js 22 tai uudempi. Ei asennettavia riippuvuuksia.

```sh
node --test
node scripts/update.mjs
node scripts/build.mjs
node scripts/serve.mjs
```

Esikatselu: http://127.0.0.1:4173. Päivittäjä tarvitsee verkkoyhteyden. Sivun suodattimet ja hintajärjestys toimivat selaimessa.

## Tietojen luotettavuus

`data/venues.json` on tietolähde. Jokaisella havainnolla on lähde, havaintopäivä, hinta ja annoskoko tai eksplisiittinen `null`. Normaalihinnat määräävät järjestyksen. Happy hour näytetään erillisenä huomautuksena. Tuntematon annoskoko sijoittuu litrahintajärjestyksessä viimeiseksi. Yli 30 päivän havainnot merkitään vanhoiksi.

Menulukija poimii Snadi Pubin normaalihinnan rajatusta Hanasta-osiosta. Muuttunut rakenne tai puuttuva hinta aiheuttaa virheen: vanhaa hintaa ja sen päiväystä ei muuteta. Vain onnistunut lukeminen päivittää `checkedAt`-kentän. Historiallisen artikkelin uudelleenlukeminen ei vahvista tämän päivän hintaa. Ulkoinen HTML on käsiteltävä datana.

Lähtölähteet: https://snadipub.fi/fi/menu ja https://www.groteski-magazine.fi/2025/04/30/groteski-testaa-helsingin-halvimmat-baarit/ . Kartat ovat Google Maps -hakulinkkejä; tässä versiossa ei ole Google Places API -paikkahakua eikä Facebook API -integraatiota. Uusien paikkojen löytämistä ja somehintojen lukemista ei ole automatisoitu. Kirjautumisen takana olevia julkaisuja ei kierretä.

## Päivittäinen päivitys

GitHub Actionsin `.github/workflows/pages.yml` tarkistaa menun ja julkaisee GitHub Pagesiin päivittäin klo 07 UTC (Suomessa talvella klo 9, kesällä klo 10). GitHub voi viivästyttää ajastettua ajoa. Päivitys toimii pilvessä koneen ollessa kiinni. Työn voi käynnistää myös Actions-välilehden Run workflow -painikkeella; push `main`-haaraan julkaisee myös sivun. Havaintoaineisto ja tarkistuksen tulos tallennetaan git-committiin. Epäonnistunut lähdehaku julkaisee vanhan havainnon alkuperäisellä päiväyksellä ja virhetilan. Testi-, tallennus- tai julkaisuvirhe pysäyttää työn.

Pääjulkaisu on GitHub Pagesissa. Repositorion Settings → Pages → Source: GitHub Actions. Workflow käyttää GitHubin lyhytikäistä GITHUB_TOKEN-tunnusta, eikä erillisiä salaisuuksia tarvita. Sivun suhteelliset URL-osoitteet tukevat `/kallion-kalja/`-alipolkua. Julkisten repositorioiden ajastukset voivat pysähtyä 60 päivän toimettomuuden jälkeen; käynnistä ne tällöin uudelleen Actions-välilehdeltä. Aiemman yksityisen Sites-julkaisun tunniste on säilytetty `.openai/hosting.json`-tiedostossa, mutta sitä ei päivitetä tämän työnkulun kautta.
