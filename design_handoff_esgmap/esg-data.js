/* ESGMap — representative sustainability dataset.
   NOTE: Figures are illustrative/representative for prototype purposes,
   compiled to be directionally realistic but NOT official.
   Keyed for matching against Natural Earth 110m `name` property. */
(function () {
  "use strict";

  // status enums:
  //  paris:  'ratified' | 'signed' | 'withdrawn' | 'none'
  //  ifrs:   'mandatory' | 'adopting' | 'roadmap' | 'consulting' | 'none'
  // mix percentages are share of electricity generation (sum ~100).

  const RICH = [
    // ---- Nordics / high-renewable ----
    { name: "Norway", region: "Europe", capital: "Oslo", renewable: 98, mix: { hydro: 88, wind: 9, solar: 0.5, nuclear: 0, fossil: 2, other: 0.5 }, carbon: 30, co2pc: 7.5, paris: "ratified", parisYear: 2016, ndc: "−55% vs 1990 by 2030", netZero: 2030, ifrsS1: "adopting", ifrsS2: "adopting", esg: "EEA / CSRD-aligned", score: 88 },
    { name: "Iceland", region: "Europe", capital: "Reykjavík", renewable: 100, mix: { hydro: 69, wind: 0, solar: 0, nuclear: 0, fossil: 0, other: 31 }, carbon: 28, co2pc: 8.9, paris: "ratified", parisYear: 2016, ndc: "−55% vs 1990 by 2030", netZero: 2040, ifrsS1: "adopting", ifrsS2: "adopting", esg: "EEA / CSRD-aligned", score: 84 },
    { name: "Sweden", region: "Europe", capital: "Stockholm", renewable: 68, mix: { hydro: 43, wind: 19, solar: 2, nuclear: 29, fossil: 3, other: 4 }, carbon: 45, co2pc: 3.6, paris: "ratified", parisYear: 2016, ndc: "Net-zero, EU −55% by 2030", netZero: 2045, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 86 },
    { name: "Denmark", region: "Europe", capital: "Copenhagen", renewable: 81, mix: { hydro: 0, wind: 56, solar: 11, nuclear: 0, fossil: 18, other: 15 }, carbon: 110, co2pc: 4.4, paris: "ratified", parisYear: 2016, ndc: "−70% vs 1990 by 2030", netZero: 2045, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 83 },
    { name: "Finland", region: "Europe", capital: "Helsinki", renewable: 53, mix: { hydro: 19, wind: 18, solar: 1, nuclear: 35, fossil: 9, other: 18 }, carbon: 68, co2pc: 6.8, paris: "ratified", parisYear: 2016, ndc: "EU −55% by 2030", netZero: 2035, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 80 },
    // ---- Western Europe ----
    { name: "France", region: "Europe", capital: "Paris", renewable: 26, mix: { hydro: 11, wind: 9, solar: 5, nuclear: 65, fossil: 8, other: 2 }, carbon: 56, co2pc: 4.2, paris: "ratified", parisYear: 2016, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 80 },
    { name: "Germany", region: "Europe", capital: "Berlin", renewable: 52, mix: { hydro: 4, wind: 27, solar: 12, nuclear: 0, fossil: 45, other: 12 }, carbon: 350, co2pc: 7.7, paris: "ratified", parisYear: 2016, ndc: "−65% vs 1990 by 2030", netZero: 2045, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 71 },
    { name: "United Kingdom", region: "Europe", capital: "London", renewable: 46, mix: { hydro: 2, wind: 29, solar: 5, nuclear: 14, fossil: 38, other: 10 }, carbon: 230, co2pc: 4.7, paris: "ratified", parisYear: 2016, ndc: "−68% vs 1990 by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "UK SRS (endorsement)", score: 74 },
    { name: "Netherlands", region: "Europe", capital: "Amsterdam", renewable: 48, mix: { hydro: 0, wind: 25, solar: 18, nuclear: 3, fossil: 49, other: 5 }, carbon: 270, co2pc: 8.0, paris: "ratified", parisYear: 2017, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 68 },
    { name: "Belgium", region: "Europe", capital: "Brussels", renewable: 30, mix: { hydro: 1, wind: 17, solar: 9, nuclear: 41, fossil: 28, other: 4 }, carbon: 160, co2pc: 7.5, paris: "ratified", parisYear: 2017, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 70 },
    { name: "Austria", region: "Europe", capital: "Vienna", renewable: 80, mix: { hydro: 60, wind: 11, solar: 7, nuclear: 0, fossil: 18, other: 4 }, carbon: 110, co2pc: 6.5, paris: "ratified", parisYear: 2016, ndc: "EU −55% by 2030", netZero: 2040, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 80 },
    { name: "Switzerland", region: "Europe", capital: "Bern", renewable: 62, mix: { hydro: 57, wind: 0.2, solar: 6, nuclear: 29, fossil: 2, other: 6 }, carbon: 45, co2pc: 4.0, paris: "ratified", parisYear: 2017, ndc: "−50% vs 1990 by 2030", netZero: 2050, ifrsS1: "roadmap", ifrsS2: "roadmap", esg: "Swiss Climate Ordinance", score: 82 },
    { name: "Spain", region: "Europe", capital: "Madrid", renewable: 52, mix: { hydro: 10, wind: 24, solar: 18, nuclear: 20, fossil: 24, other: 4 }, carbon: 170, co2pc: 4.9, paris: "ratified", parisYear: 2017, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 75 },
    { name: "Italy", region: "Europe", capital: "Rome", renewable: 44, mix: { hydro: 16, wind: 8, solar: 12, nuclear: 0, fossil: 52, other: 8 }, carbon: 290, co2pc: 5.4, paris: "ratified", parisYear: 2016, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 69 },
    { name: "Portugal", region: "Europe", capital: "Lisbon", renewable: 61, mix: { hydro: 23, wind: 25, solar: 9, nuclear: 0, fossil: 35, other: 4 }, carbon: 150, co2pc: 4.1, paris: "ratified", parisYear: 2016, ndc: "EU −55% by 2030", netZero: 2045, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 76 },
    { name: "Ireland", region: "Europe", capital: "Dublin", renewable: 40, mix: { hydro: 2, wind: 33, solar: 3, nuclear: 0, fossil: 56, other: 6 }, carbon: 290, co2pc: 7.7, paris: "ratified", parisYear: 2016, ndc: "−51% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 67 },
    { name: "Poland", region: "Europe", capital: "Warsaw", renewable: 27, mix: { hydro: 2, wind: 15, solar: 8, nuclear: 0, fossil: 71, other: 4 }, carbon: 600, co2pc: 7.6, paris: "ratified", parisYear: 2016, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 51 },
    { name: "Czechia", region: "Europe", capital: "Prague", renewable: 17, mix: { hydro: 3, wind: 1, solar: 6, nuclear: 40, fossil: 50, other: 7 }, carbon: 410, co2pc: 8.4, paris: "ratified", parisYear: 2017, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 54 },
    { name: "Romania", region: "Europe", capital: "Bucharest", renewable: 44, mix: { hydro: 28, wind: 11, solar: 5, nuclear: 19, fossil: 35, other: 2 }, carbon: 240, co2pc: 3.9, paris: "ratified", parisYear: 2017, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 63 },
    { name: "Greece", region: "Europe", capital: "Athens", renewable: 48, mix: { hydro: 9, wind: 22, solar: 16, nuclear: 0, fossil: 50, other: 3 }, carbon: 320, co2pc: 5.7, paris: "ratified", parisYear: 2016, ndc: "EU −55% by 2030", netZero: 2050, ifrsS1: "adopting", ifrsS2: "adopting", esg: "CSRD / ESRS", score: 64 },
    // ---- Eastern Europe / Eurasia ----
    { name: "Ukraine", region: "Europe", capital: "Kyiv", renewable: 12, mix: { hydro: 7, wind: 3, solar: 2, nuclear: 55, fossil: 33, other: 0 }, carbon: 230, co2pc: 4.5, paris: "ratified", parisYear: 2016, ndc: "−65% vs 1990 by 2030", netZero: 2060, ifrsS1: "consulting", ifrsS2: "consulting", esg: "EU candidate / NSSDR", score: 55 },
    { name: "Russia", region: "Eurasia", capital: "Moscow", renewable: 18, mix: { hydro: 17, wind: 0.5, solar: 0.5, nuclear: 20, fossil: 62, other: 0 }, carbon: 360, co2pc: 11.5, paris: "ratified", parisYear: 2019, ndc: "−30% vs 1990 by 2030", netZero: 2060, ifrsS1: "none", ifrsS2: "none", esg: "Voluntary", score: 38 },
    // ---- Asia ----
    { name: "China", region: "Asia", capital: "Beijing", renewable: 32, mix: { hydro: 14, wind: 10, solar: 7, nuclear: 5, fossil: 63, other: 1 }, carbon: 540, co2pc: 8.0, paris: "ratified", parisYear: 2016, ndc: "Peak before 2030", netZero: 2060, ifrsS1: "roadmap", ifrsS2: "roadmap", esg: "CSRC sustainability guidelines", score: 48 },
    { name: "India", region: "Asia", capital: "New Delhi", renewable: 22, mix: { hydro: 9, wind: 5, solar: 7, nuclear: 3, fossil: 75, other: 1 }, carbon: 630, co2pc: 1.9, paris: "ratified", parisYear: 2016, ndc: "−45% intensity by 2030", netZero: 2070, ifrsS1: "consulting", ifrsS2: "consulting", esg: "SEBI BRSR", score: 44 },
    { name: "Japan", region: "Asia", capital: "Tokyo", renewable: 24, mix: { hydro: 8, wind: 1, solar: 11, nuclear: 8, fossil: 68, other: 4 }, carbon: 480, co2pc: 8.5, paris: "ratified", parisYear: 2016, ndc: "−46% vs 2013 by 2030", netZero: 2050, ifrsS1: "roadmap", ifrsS2: "roadmap", esg: "SSBJ / TCFD", score: 58 },
    { name: "South Korea", region: "Asia", capital: "Seoul", renewable: 9, mix: { hydro: 1, wind: 1, solar: 5, nuclear: 30, fossil: 60, other: 3 }, carbon: 430, co2pc: 11.6, paris: "ratified", parisYear: 2016, ndc: "−40% vs 2018 by 2030", netZero: 2050, ifrsS1: "roadmap", ifrsS2: "roadmap", esg: "KSSB (draft)", score: 52 },
    { name: "Indonesia", region: "Asia", capital: "Jakarta", renewable: 19, mix: { hydro: 7, wind: 0.3, solar: 0.7, nuclear: 0, fossil: 80, other: 11 }, carbon: 620, co2pc: 2.5, paris: "ratified", parisYear: 2016, ndc: "−32% by 2030 (CM2)", netZero: 2060, ifrsS1: "consulting", ifrsS2: "consulting", esg: "OJK TCFD roadmap", score: 43 },
    { name: "Vietnam", region: "Asia", capital: "Hanoi", renewable: 39, mix: { hydro: 30, wind: 4, solar: 5, nuclear: 0, fossil: 60, other: 1 }, carbon: 420, co2pc: 3.5, paris: "ratified", parisYear: 2016, ndc: "−15.8% (unconditional) by 2030", netZero: 2050, ifrsS1: "none", ifrsS2: "none", esg: "Voluntary", score: 50 },
    { name: "Thailand", region: "Asia", capital: "Bangkok", renewable: 18, mix: { hydro: 5, wind: 2, solar: 4, nuclear: 0, fossil: 75, other: 7 }, carbon: 470, co2pc: 3.8, paris: "ratified", parisYear: 2016, ndc: "−30% by 2030", netZero: 2065, ifrsS1: "consulting", ifrsS2: "consulting", esg: "SET 56-1 One Report", score: 48 },
    { name: "Pakistan", region: "Asia", capital: "Islamabad", renewable: 30, mix: { hydro: 25, wind: 3, solar: 2, nuclear: 9, fossil: 60, other: 1 }, carbon: 430, co2pc: 1.0, paris: "ratified", parisYear: 2016, ndc: "−50% by 2030 (conditional)", netZero: null, ifrsS1: "none", ifrsS2: "none", esg: "Voluntary", score: 46 },
    { name: "Bangladesh", region: "Asia", capital: "Dhaka", renewable: 3, mix: { hydro: 1, wind: 0.2, solar: 2, nuclear: 0, fossil: 97, other: 0 }, carbon: 580, co2pc: 0.6, paris: "ratified", parisYear: 2016, ndc: "−21.8% by 2030 (conditional)", netZero: null, ifrsS1: "none", ifrsS2: "none", esg: "Voluntary", score: 41 },
    { name: "Kazakhstan", region: "Eurasia", capital: "Astana", renewable: 12, mix: { hydro: 8, wind: 2, solar: 2, nuclear: 0, fossil: 85, other: 3 }, carbon: 680, co2pc: 14.0, paris: "ratified", parisYear: 2016, ndc: "−15% vs 1990 by 2030", netZero: 2060, ifrsS1: "none", ifrsS2: "none", esg: "AIX guidance", score: 35 },
    // ---- Middle East ----
    { name: "Iran", region: "Middle East", capital: "Tehran", renewable: 6, mix: { hydro: 5, wind: 0.5, solar: 0.5, nuclear: 1, fossil: 93, other: 0 }, carbon: 550, co2pc: 8.2, paris: "signed", parisYear: null, ndc: "−4% (conditional 12%)", netZero: null, ifrsS1: "none", ifrsS2: "none", esg: "Voluntary", score: 33 },
    { name: "Saudi Arabia", region: "Middle East", capital: "Riyadh", renewable: 1, mix: { hydro: 0, wind: 0.3, solar: 0.7, nuclear: 0, fossil: 99, other: 0 }, carbon: 600, co2pc: 18.0, paris: "ratified", parisYear: 2016, ndc: "278 Mt avoided by 2030", netZero: 2060, ifrsS1: "none", ifrsS2: "none", esg: "Tadawul ESG guide", score: 31 },
    { name: "United Arab Emirates", region: "Middle East", capital: "Abu Dhabi", renewable: 7, mix: { hydro: 0, wind: 0, solar: 7, nuclear: 20, fossil: 73, other: 0 }, carbon: 410, co2pc: 20.0, paris: "ratified", parisYear: 2016, ndc: "−40% by 2030", netZero: 2050, ifrsS1: "roadmap", ifrsS2: "roadmap", esg: "ADX / DFM guidance", score: 41 },
    { name: "Turkey", region: "Eurasia", capital: "Ankara", renewable: 42, mix: { hydro: 20, wind: 11, solar: 6, nuclear: 0, fossil: 56, other: 5 }, carbon: 410, co2pc: 5.3, paris: "ratified", parisYear: 2021, ndc: "−41% by 2030", netZero: 2053, ifrsS1: "consulting", ifrsS2: "consulting", esg: "TSRS (KGK)", score: 52 },
    // ---- Africa ----
    { name: "South Africa", region: "Africa", capital: "Pretoria", renewable: 14, mix: { hydro: 2, wind: 6, solar: 5, nuclear: 5, fossil: 81, other: 1 }, carbon: 700, co2pc: 7.0, paris: "ratified", parisYear: 2016, ndc: "350–420 Mt by 2030", netZero: 2050, ifrsS1: "consulting", ifrsS2: "consulting", esg: "JSE Sustainability Guidance", score: 40 },
    { name: "Egypt", region: "Africa", capital: "Cairo", renewable: 12, mix: { hydro: 7, wind: 3, solar: 2, nuclear: 0, fossil: 88, other: 0 }, carbon: 480, co2pc: 2.4, paris: "ratified", parisYear: 2017, ndc: "42% renewable power by 2030", netZero: null, ifrsS1: "none", ifrsS2: "none", esg: "EGX listing rules", score: 45 },
    { name: "Morocco", region: "Africa", capital: "Rabat", renewable: 21, mix: { hydro: 5, wind: 13, solar: 3, nuclear: 0, fossil: 79, other: 0 }, carbon: 600, co2pc: 1.9, paris: "ratified", parisYear: 2016, ndc: "−45.5% by 2030 (conditional)", netZero: null, ifrsS1: "none", ifrsS2: "none", esg: "AMMC guidance", score: 48 },
    { name: "Nigeria", region: "Africa", capital: "Abuja", renewable: 22, mix: { hydro: 21, wind: 0, solar: 1, nuclear: 0, fossil: 78, other: 0 }, carbon: 380, co2pc: 0.6, paris: "ratified", parisYear: 2017, ndc: "−20% (47% conditional) by 2030", netZero: 2060, ifrsS1: "adopting", ifrsS2: "adopting", esg: "FRC early ISSB adopter", score: 42 },
    { name: "Kenya", region: "Africa", capital: "Nairobi", renewable: 89, mix: { hydro: 23, wind: 16, solar: 4, nuclear: 0, fossil: 11, other: 46 }, carbon: 110, co2pc: 0.4, paris: "ratified", parisYear: 2016, ndc: "−32% by 2030", netZero: null, ifrsS1: "consulting", ifrsS2: "consulting", esg: "NSE ESG manual", score: 62 },
    // ---- Americas ----
    { name: "United States", ne: "United States of America", region: "Americas", capital: "Washington, D.C.", renewable: 23, mix: { hydro: 6, wind: 10, solar: 6, nuclear: 18, fossil: 58, other: 1 }, carbon: 380, co2pc: 14.4, paris: "ratified", parisYear: 2021, ndc: "−50–52% vs 2005 by 2030", netZero: 2050, ifrsS1: "consulting", ifrsS2: "consulting", esg: "SEC / CA SB-253", score: 54 },
    { name: "Canada", region: "Americas", capital: "Ottawa", renewable: 68, mix: { hydro: 60, wind: 6, solar: 1, nuclear: 13, fossil: 18, other: 1 }, carbon: 130, co2pc: 14.2, paris: "ratified", parisYear: 2016, ndc: "−40–45% vs 2005 by 2030", netZero: 2050, ifrsS1: "roadmap", ifrsS2: "roadmap", esg: "CSDS (CSSB)", score: 66 },
    { name: "Mexico", region: "Americas", capital: "Mexico City", renewable: 24, mix: { hydro: 9, wind: 6, solar: 6, nuclear: 4, fossil: 70, other: 3 }, carbon: 430, co2pc: 3.6, paris: "ratified", parisYear: 2016, ndc: "−35% by 2030", netZero: null, ifrsS1: "none", ifrsS2: "none", esg: "BMV guidance", score: 50 },
    { name: "Brazil", region: "Americas", capital: "Brasília", renewable: 89, mix: { hydro: 60, wind: 13, solar: 9, nuclear: 2, fossil: 9, other: 7 }, carbon: 110, co2pc: 2.2, paris: "ratified", parisYear: 2016, ndc: "−53% vs 2005 by 2030", netZero: 2050, ifrsS1: "mandatory", ifrsS2: "mandatory", esg: "CVM ISSB (mandatory 2026)", score: 70 },
    { name: "Argentina", region: "Americas", capital: "Buenos Aires", renewable: 33, mix: { hydro: 19, wind: 11, solar: 2, nuclear: 7, fossil: 60, other: 1 }, carbon: 350, co2pc: 4.0, paris: "ratified", parisYear: 2016, ndc: "Cap 349 Mt by 2030", netZero: 2050, ifrsS1: "none", ifrsS2: "none", esg: "CNV guidance", score: 55 },
    { name: "Chile", region: "Americas", capital: "Santiago", renewable: 58, mix: { hydro: 24, wind: 12, solar: 20, nuclear: 0, fossil: 40, other: 2 }, carbon: 320, co2pc: 4.5, paris: "ratified", parisYear: 2017, ndc: "Cap 95 Mt by 2030", netZero: 2050, ifrsS1: "roadmap", ifrsS2: "roadmap", esg: "CMF NCG 461", score: 64 },
    { name: "Colombia", region: "Americas", capital: "Bogotá", renewable: 70, mix: { hydro: 66, wind: 1, solar: 3, nuclear: 0, fossil: 30, other: 0 }, carbon: 200, co2pc: 1.6, paris: "ratified", parisYear: 2018, ndc: "−51% by 2030", netZero: 2050, ifrsS1: "consulting", ifrsS2: "consulting", esg: "SFC Circular 031", score: 65 },
    { name: "Peru", region: "Americas", capital: "Lima", renewable: 55, mix: { hydro: 50, wind: 3, solar: 2, nuclear: 0, fossil: 44, other: 1 }, carbon: 250, co2pc: 1.8, paris: "ratified", parisYear: 2016, ndc: "−40% by 2030", netZero: 2050, ifrsS1: "none", ifrsS2: "none", esg: "SMV guidance", score: 60 },
    // ---- Oceania ----
    { name: "Australia", region: "Oceania", capital: "Canberra", renewable: 39, mix: { hydro: 6, wind: 13, solar: 16, nuclear: 0, fossil: 60, other: 4 }, carbon: 480, co2pc: 15.0, paris: "ratified", parisYear: 2016, ndc: "−43% vs 2005 by 2030", netZero: 2050, ifrsS1: "mandatory", ifrsS2: "mandatory", esg: "AASB S1/S2 (mandatory)", score: 56 },
    { name: "New Zealand", region: "Oceania", capital: "Wellington", renewable: 88, mix: { hydro: 57, wind: 7, solar: 1, nuclear: 0, fossil: 12, other: 23 }, carbon: 100, co2pc: 6.3, paris: "ratified", parisYear: 2016, ndc: "−50% vs 2005 by 2030", netZero: 2050, ifrsS1: "mandatory", ifrsS2: "mandatory", esg: "NZ CS (mandatory)", score: 78 },
  ];

  // Base tier — coloured on the map, lighter detail in the panel.
  const BASE = [
    { name: "Algeria", region: "Africa", renewable: 1, carbon: 560, co2pc: 3.9, score: 34 },
    { name: "Angola", region: "Africa", renewable: 72, carbon: 180, co2pc: 0.6, score: 52 },
    { name: "Ghana", region: "Africa", renewable: 38, carbon: 330, co2pc: 0.6, score: 49 },
    { name: "Ethiopia", region: "Africa", renewable: 98, carbon: 40, co2pc: 0.2, score: 58 },
    { name: "Tanzania", region: "Africa", renewable: 42, carbon: 350, co2pc: 0.2, score: 47 },
    { name: "Mozambique", region: "Africa", renewable: 81, carbon: 130, co2pc: 0.3, score: 53 },
    { name: "Zambia", region: "Africa", renewable: 85, carbon: 110, co2pc: 0.4, score: 54 },
    { name: "Zimbabwe", region: "Africa", renewable: 48, carbon: 420, co2pc: 0.8, score: 41 },
    { name: "Sudan", region: "Africa", renewable: 55, carbon: 290, co2pc: 0.5, score: 38 },
    { name: "Tunisia", region: "Africa", renewable: 6, carbon: 470, co2pc: 2.6, score: 44 },
    { name: "Libya", region: "Africa", renewable: 1, carbon: 580, co2pc: 8.4, score: 28 },
    { name: "Dem. Rep. Congo", region: "Africa", renewable: 96, carbon: 30, co2pc: 0.03, score: 50 },
    { name: "Iraq", region: "Middle East", renewable: 5, carbon: 530, co2pc: 4.6, score: 30 },
    { name: "Qatar", region: "Middle East", renewable: 0, carbon: 490, co2pc: 35.0, score: 27 },
    { name: "Kuwait", region: "Middle East", renewable: 0, carbon: 540, co2pc: 25.0, score: 27 },
    { name: "Oman", region: "Middle East", renewable: 3, carbon: 470, co2pc: 15.0, score: 33 },
    { name: "Israel", region: "Middle East", renewable: 12, carbon: 440, co2pc: 6.5, score: 47 },
    { name: "Jordan", region: "Middle East", renewable: 29, carbon: 380, co2pc: 2.3, score: 49 },
    { name: "Syria", region: "Middle East", renewable: 8, carbon: 510, co2pc: 1.6, score: 26 },
    { name: "Afghanistan", region: "Asia", renewable: 80, carbon: 130, co2pc: 0.2, score: 35 },
    { name: "Myanmar", region: "Asia", renewable: 52, carbon: 330, co2pc: 0.7, score: 36 },
    { name: "Philippines", region: "Asia", renewable: 22, carbon: 510, co2pc: 1.3, score: 48 },
    { name: "Malaysia", region: "Asia", renewable: 19, carbon: 540, co2pc: 8.2, score: 46 },
    { name: "Sri Lanka", region: "Asia", renewable: 44, carbon: 360, co2pc: 1.0, score: 51 },
    { name: "Nepal", region: "Asia", renewable: 99, carbon: 25, co2pc: 0.5, score: 57 },
    { name: "Mongolia", region: "Asia", renewable: 8, carbon: 640, co2pc: 7.1, score: 30 },
    { name: "Uzbekistan", region: "Eurasia", renewable: 11, carbon: 540, co2pc: 3.4, score: 36 },
    { name: "Turkmenistan", region: "Eurasia", renewable: 0, carbon: 560, co2pc: 12.0, score: 25 },
    { name: "Azerbaijan", region: "Eurasia", renewable: 7, carbon: 480, co2pc: 3.5, score: 37 },
    { name: "Georgia", region: "Eurasia", renewable: 78, carbon: 150, co2pc: 2.6, score: 58 },
    { name: "Belarus", region: "Europe", renewable: 6, carbon: 400, co2pc: 6.0, score: 42 },
    { name: "Bulgaria", region: "Europe", renewable: 23, carbon: 410, co2pc: 5.9, score: 57 },
    { name: "Hungary", region: "Europe", renewable: 18, carbon: 200, co2pc: 4.5, score: 62 },
    { name: "Slovakia", region: "Europe", renewable: 23, carbon: 130, co2pc: 5.6, score: 64 },
    { name: "Serbia", region: "Europe", renewable: 32, carbon: 540, co2pc: 5.4, score: 50 },
    { name: "Croatia", region: "Europe", renewable: 65, carbon: 180, co2pc: 4.0, score: 68 },
    { name: "Bolivia", region: "Americas", renewable: 34, carbon: 410, co2pc: 1.6, score: 47 },
    { name: "Venezuela", region: "Americas", renewable: 70, carbon: 200, co2pc: 3.4, score: 42 },
    { name: "Ecuador", region: "Americas", renewable: 79, carbon: 160, co2pc: 2.4, score: 58 },
    { name: "Paraguay", region: "Americas", renewable: 100, carbon: 25, co2pc: 1.2, score: 66 },
    { name: "Uruguay", region: "Americas", renewable: 94, carbon: 90, co2pc: 1.9, score: 74 },
    { name: "Cuba", region: "Americas", renewable: 5, carbon: 560, co2pc: 2.3, score: 39 },
    { name: "Guatemala", region: "Americas", renewable: 65, carbon: 280, co2pc: 1.1, score: 53 },
  ];

  // ---- supplementary indicators merged onto every record ----
  //  pm25:   annual mean PM2.5 air pollution (µg/m³, lower better)
  //  forest: forest cover (% of land area, higher better)
  //  energy: electricity use per capita (kWh/yr)
  //  ev:     new-car sales that are electric (%, rich tier only)
  const EXTRA = {
    "Norway": { pm25: 7, forest: 40, energy: 23000, ev: 88 },
    "Iceland": { pm25: 6, forest: 2, energy: 52000, ev: 60 },
    "Sweden": { pm25: 6, forest: 69, energy: 12500, ev: 55 },
    "Denmark": { pm25: 10, forest: 16, energy: 5800, ev: 39 },
    "Finland": { pm25: 6, forest: 73, energy: 14500, ev: 38 },
    "France": { pm25: 11, forest: 31, energy: 6700, ev: 27 },
    "Germany": { pm25: 12, forest: 33, energy: 6100, ev: 25 },
    "United Kingdom": { pm25: 10, forest: 13, energy: 4600, ev: 24 },
    "Netherlands": { pm25: 12, forest: 11, energy: 6300, ev: 35 },
    "Belgium": { pm25: 12, forest: 23, energy: 7100, ev: 28 },
    "Austria": { pm25: 12, forest: 47, energy: 7400, ev: 20 },
    "Switzerland": { pm25: 10, forest: 32, energy: 7000, ev: 30 },
    "Spain": { pm25: 10, forest: 37, energy: 5300, ev: 12 },
    "Italy": { pm25: 16, forest: 32, energy: 5000, ev: 9 },
    "Portugal": { pm25: 9, forest: 36, energy: 4600, ev: 20 },
    "Ireland": { pm25: 8, forest: 11, energy: 6000, ev: 24 },
    "Poland": { pm25: 20, forest: 31, energy: 4200, ev: 6 },
    "Czechia": { pm25: 18, forest: 35, energy: 5800, ev: 5 },
    "Romania": { pm25: 16, forest: 30, energy: 2800, ev: 6 },
    "Greece": { pm25: 16, forest: 32, energy: 4900, ev: 8 },
    "Ukraine": { pm25: 18, forest: 16, energy: 3200, ev: 3 },
    "Russia": { pm25: 14, forest: 50, energy: 7300, ev: 1 },
    "China": { pm25: 35, forest: 23, energy: 5500, ev: 38 },
    "India": { pm25: 55, forest: 24, energy: 1300, ev: 2 },
    "Japan": { pm25: 12, forest: 68, energy: 7700, ev: 3 },
    "South Korea": { pm25: 24, forest: 64, energy: 11000, ev: 10 },
    "Indonesia": { pm25: 32, forest: 49, energy: 1100, ev: 2 },
    "Vietnam": { pm25: 30, forest: 47, energy: 2500, ev: 4 },
    "Thailand": { pm25: 26, forest: 39, energy: 2900, ev: 12 },
    "Pakistan": { pm25: 60, forest: 5, energy: 650, ev: 1 },
    "Bangladesh": { pm25: 78, forest: 11, energy: 500, ev: 0.5 },
    "Kazakhstan": { pm25: 18, forest: 1, energy: 6500, ev: 1 },
    "Iran": { pm25: 38, forest: 7, energy: 3700, ev: 0.5 },
    "Saudi Arabia": { pm25: 50, forest: 0.5, energy: 9900, ev: 1 },
    "United Arab Emirates": { pm25: 42, forest: 4, energy: 13000, ev: 13 },
    "Turkey": { pm25: 30, forest: 29, energy: 3700, ev: 8 },
    "South Africa": { pm25: 25, forest: 14, energy: 3900, ev: 1 },
    "Egypt": { pm25: 45, forest: 0.05, energy: 1900, ev: 0.5 },
    "Morocco": { pm25: 30, forest: 13, energy: 1100, ev: 1 },
    "Nigeria": { pm25: 50, forest: 24, energy: 150, ev: 0.2 },
    "Kenya": { pm25: 22, forest: 8, energy: 180, ev: 1 },
    "United States of America": { pm25: 9, forest: 34, energy: 12200, ev: 10 },
    "Canada": { pm25: 7, forest: 39, energy: 14300, ev: 13 },
    "Mexico": { pm25: 20, forest: 34, energy: 2300, ev: 2 },
    "Brazil": { pm25: 12, forest: 59, energy: 2700, ev: 3 },
    "Argentina": { pm25: 14, forest: 10, energy: 3000, ev: 1 },
    "Chile": { pm25: 24, forest: 24, energy: 4000, ev: 4 },
    "Colombia": { pm25: 18, forest: 53, energy: 1300, ev: 2 },
    "Peru": { pm25: 24, forest: 57, energy: 1400, ev: 1 },
    "Australia": { pm25: 8, forest: 17, energy: 9500, ev: 8 },
    "New Zealand": { pm25: 7, forest: 38, energy: 8800, ev: 16 },
    // base tier (no ev)
    "Algeria": { pm25: 38, forest: 0.8, energy: 1500 },
    "Angola": { pm25: 28, forest: 53, energy: 350 },
    "Ghana": { pm25: 30, forest: 35, energy: 450 },
    "Ethiopia": { pm25: 32, forest: 15, energy: 100 },
    "Tanzania": { pm25: 28, forest: 52, energy: 110 },
    "Mozambique": { pm25: 22, forest: 47, energy: 480 },
    "Zambia": { pm25: 24, forest: 60, energy: 750 },
    "Zimbabwe": { pm25: 24, forest: 45, energy: 600 },
    "Sudan": { pm25: 40, forest: 10, energy: 270 },
    "Tunisia": { pm25: 34, forest: 7, energy: 1500 },
    "Libya": { pm25: 42, forest: 0.1, energy: 4200 },
    "Dem. Rep. Congo": { pm25: 36, forest: 56, energy: 110 },
    "Iraq": { pm25: 50, forest: 1.9, energy: 1800 },
    "Qatar": { pm25: 76, forest: 0, energy: 17000 },
    "Kuwait": { pm25: 55, forest: 0.4, energy: 16000 },
    "Oman": { pm25: 48, forest: 0.01, energy: 6800 },
    "Israel": { pm25: 20, forest: 7, energy: 6700 },
    "Jordan": { pm25: 34, forest: 1.1, energy: 2200 },
    "Syria": { pm25: 36, forest: 2.7, energy: 1300 },
    "Afghanistan": { pm25: 56, forest: 1.9, energy: 150 },
    "Myanmar": { pm25: 30, forest: 42, energy: 350 },
    "Philippines": { pm25: 18, forest: 27, energy: 900 },
    "Malaysia": { pm25: 19, forest: 58, energy: 4900 },
    "Sri Lanka": { pm25: 26, forest: 34, energy: 600 },
    "Nepal": { pm25: 46, forest: 41, energy: 250 },
    "Mongolia": { pm25: 62, forest: 8, energy: 2200 },
    "Uzbekistan": { pm25: 28, forest: 8, energy: 1700 },
    "Turkmenistan": { pm25: 24, forest: 8, energy: 2700 },
    "Azerbaijan": { pm25: 22, forest: 14, energy: 2400 },
    "Georgia": { pm25: 20, forest: 41, energy: 3000 },
    "Belarus": { pm25: 16, forest: 43, energy: 4000 },
    "Bulgaria": { pm25: 20, forest: 36, energy: 4700 },
    "Hungary": { pm25: 16, forest: 23, energy: 4200 },
    "Slovakia": { pm25: 18, forest: 40, energy: 5200 },
    "Serbia": { pm25: 26, forest: 31, energy: 4600 },
    "Croatia": { pm25: 18, forest: 35, energy: 3900 },
    "Bolivia": { pm25: 24, forest: 51, energy: 800 },
    "Venezuela": { pm25: 20, forest: 53, energy: 2500 },
    "Ecuador": { pm25: 18, forest: 50, energy: 1500 },
    "Paraguay": { pm25: 18, forest: 39, energy: 1600 },
    "Uruguay": { pm25: 10, forest: 11, energy: 3000 },
    "Cuba": { pm25: 20, forest: 31, energy: 1400 },
    "Guatemala": { pm25: 28, forest: 33, energy: 600 },
  };

  // climate-risk / vulnerability index (0–100, higher = more exposed & less ready; lower is better)
  const CLIMATE = {
    "Norway": 18, "Iceland": 20, "Sweden": 19, "Denmark": 22, "Finland": 20, "France": 28, "Germany": 27,
    "United Kingdom": 26, "Netherlands": 30, "Belgium": 28, "Austria": 26, "Switzerland": 24, "Spain": 34,
    "Italy": 33, "Portugal": 33, "Ireland": 25, "Poland": 32, "Czechia": 31, "Romania": 36, "Greece": 36,
    "Ukraine": 40, "Russia": 38, "China": 45, "India": 62, "Japan": 30, "South Korea": 30, "Indonesia": 58,
    "Vietnam": 60, "Thailand": 52, "Pakistan": 70, "Bangladesh": 75, "Kazakhstan": 45, "Iran": 55,
    "Saudi Arabia": 50, "United Arab Emirates": 45, "Turkey": 40, "South Africa": 50, "Egypt": 58, "Morocco": 52,
    "Nigeria": 65, "Kenya": 62, "United States of America": 30, "Canada": 26, "Mexico": 45, "Brazil": 42,
    "Argentina": 38, "Chile": 40, "Colombia": 48, "Peru": 50, "Australia": 38, "New Zealand": 28,
    "Algeria": 50, "Angola": 62, "Ghana": 55, "Ethiopia": 68, "Tanzania": 64, "Mozambique": 72, "Zambia": 62,
    "Zimbabwe": 66, "Sudan": 72, "Tunisia": 48, "Libya": 55, "Dem. Rep. Congo": 70, "Iraq": 62, "Qatar": 42,
    "Kuwait": 45, "Oman": 48, "Israel": 35, "Jordan": 52, "Syria": 60, "Afghanistan": 78, "Myanmar": 68,
    "Philippines": 60, "Malaysia": 45, "Sri Lanka": 55, "Nepal": 64, "Mongolia": 58, "Uzbekistan": 50,
    "Turkmenistan": 52, "Azerbaijan": 45, "Georgia": 40, "Belarus": 34, "Bulgaria": 36, "Hungary": 33,
    "Slovakia": 30, "Serbia": 38, "Croatia": 33, "Bolivia": 58, "Venezuela": 55, "Ecuador": 50, "Paraguay": 48,
    "Uruguay": 34, "Cuba": 50, "Guatemala": 60,
  };

  // ---- deterministic PRNG keyed by name (stable history per country) ----
  function seedRand(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6d2b79f5; let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const Y0 = 2000, Y1 = 2025;

  function buildHistory(c) {
    const r = seedRand(c.name);
    const span = Y1 - Y0;
    const startRen = Math.max(0, c.renewable - (10 + r() * 28));
    const startCarb = c.carbon * (1.12 + r() * 0.45);
    const years = [], ren = [], carb = [];
    for (let y = Y0; y <= Y1; y++) {
      const t = (y - Y0) / span;
      const ease = t * t * (3 - 2 * t);
      const rv = startRen + (c.renewable - startRen) * ease + (r() - 0.5) * 2.4;
      const cv = startCarb + (c.carbon - startCarb) * ease + (r() - 0.5) * 16;
      years.push(y);
      ren.push(Math.max(0, Math.min(100, Math.round(rv * 10) / 10)));
      carb.push(Math.max(0, Math.round(cv)));
    }
    return { years: years, renewable: ren, carbon: carb };
  }

  const byName = {};   // matchName -> record
  const all = [];

  function register(c, tier) {
    c.tier = tier;
    c.match = c.ne || c.name;
    var ex = EXTRA[c.match] || EXTRA[c.name];
    if (ex) { for (var k in ex) { if (c[k] == null) c[k] = ex[k]; } }
    if (c.climate == null) c.climate = CLIMATE[c.match] != null ? CLIMATE[c.match] : CLIMATE[c.name];
    c.history = buildHistory(c);
    byName[c.match] = c;
    all.push(c);
  }
  RICH.forEach(function (c) { register(c, "rich"); });
  BASE.forEach(function (c) { register(c, "base"); });

  // common alias spellings -> Natural Earth match name
  const ALIAS = {
    "United States of America": "United States of America",
    "USA": "United States of America",
    "Czech Republic": "Czechia",
    "Republic of Korea": "South Korea",
    "Korea": "South Korea",
    "Democratic Republic of the Congo": "Dem. Rep. Congo",
    "DR Congo": "Dem. Rep. Congo",
    "Congo (Kinshasa)": "Dem. Rep. Congo",
    "Türkiye": "Turkey",
    "Russian Federation": "Russia",
    "UK": "United Kingdom",
    "UAE": "United Arab Emirates",
  };

  function lookupByName(n) {
    if (!n) return null;
    if (byName[n]) return byName[n];
    if (ALIAS[n] && byName[ALIAS[n]]) return byName[ALIAS[n]];
    return null;
  }

  // ---- colour scales (built on d3) ----
  function buildScales() {
    const d3 = window.d3;
    return {
      renewable: d3.scaleLinear()
        .domain([0, 20, 40, 60, 80, 100])
        .range(["#7a4a1e", "#a06a22", "#c2982e", "#9bbf4a", "#5aae54", "#2f9e57"])
        .clamp(true).interpolate(d3.interpolateRgb),
      carbon: d3.scaleLinear()
        .domain([0, 150, 300, 600, 900, 1200])
        .range(["#2f9e57", "#9bbf4a", "#e0c542", "#e08a3c", "#d4503e", "#7a2d28"])
        .clamp(true).interpolate(d3.interpolateRgb),
      score: d3.scaleLinear()
        .domain([20, 40, 60, 80, 95])
        .range(["#b34334", "#d4823c", "#e0c542", "#7fb35a", "#2f9e57"])
        .clamp(true).interpolate(d3.interpolateRgb),
      co2pc: d3.scaleLinear()
        .domain([0, 2, 6, 12, 20, 35])
        .range(["#2f9e57", "#9bbf4a", "#e0c542", "#e08a3c", "#d4503e", "#7a2d28"])
        .clamp(true).interpolate(d3.interpolateRgb),
      pm25: d3.scaleLinear()
        .domain([0, 10, 25, 40, 60, 100])
        .range(["#2f9e57", "#9bbf4a", "#e0c542", "#e08a3c", "#d4503e", "#7a2d28"])
        .clamp(true).interpolate(d3.interpolateRgb),
      forest: d3.scaleLinear()
        .domain([0, 15, 35, 55, 80])
        .range(["#8a6a3a", "#bfa24a", "#9bbf4a", "#4fa85a", "#1f7a44"])
        .clamp(true).interpolate(d3.interpolateRgb),
      climate: d3.scaleLinear()
        .domain([15, 30, 45, 60, 80])
        .range(["#2f9e57", "#9bbf4a", "#e0c542", "#e08a3c", "#b34334"])
        .clamp(true).interpolate(d3.interpolateRgb),
    };
  }

  // metric metadata
  const METRICS = {
    renewable: { key: "renewable", label: "Renewable electricity", short: "Renewables", unit: "%", domain: [0, 100], ticks: [0, 20, 40, 60, 80, 100], hasHistory: true, better: "high", fmt: function (v) { return Math.round(v) + "%"; } },
    carbon: { key: "carbon", label: "Grid carbon intensity", short: "Carbon intensity", unit: "gCO₂/kWh", domain: [0, 1200], ticks: [0, 300, 600, 900, 1200], hasHistory: true, better: "low", fmt: function (v) { return Math.round(v) + ""; } },
    co2pc: { key: "co2pc", label: "CO₂ emissions per capita", short: "CO₂ / capita", unit: "t/yr", domain: [0, 35], ticks: [0, 10, 20, 30], hasHistory: false, better: "low", fmt: function (v) { return (v != null ? v : "—") + ""; } },
    pm25: { key: "pm25", label: "Air quality (PM2.5)", short: "Air quality", unit: "µg/m³", domain: [0, 100], ticks: [0, 25, 50, 75, 100], hasHistory: false, better: "low", fmt: function (v) { return (v != null ? Math.round(v) : "—") + ""; } },
    forest: { key: "forest", label: "Forest cover", short: "Forest", unit: "% land", domain: [0, 100], ticks: [0, 25, 50, 75, 100], hasHistory: false, better: "high", fmt: function (v) { return (v != null ? Math.round(v) : "—") + "%"; } },
    climate: { key: "climate", label: "Climate-risk exposure", short: "Climate risk", unit: "/100", domain: [0, 100], ticks: [0, 25, 50, 75, 100], hasHistory: false, better: "low", fmt: function (v) { return (v != null ? Math.round(v) : "—") + ""; } },
    score: { key: "score", label: "Sustainability score", short: "Sustainability", unit: "/100", domain: [0, 100], ticks: [0, 25, 50, 75, 100], hasHistory: false, better: "high", fmt: function (v) { return Math.round(v) + ""; } },
  };

  function valueAt(rec, metricKey, year) {
    if (!rec) return null;
    if ((metricKey === "renewable" || metricKey === "carbon") && rec.history && year != null && year < Y1) {
      const i = Math.max(0, Math.min(rec.history.years.length - 1, year - Y0));
      return rec.history[metricKey][i];
    }
    var v = rec[metricKey];
    return v == null ? null : v;
  }

  // average a history metric across the rich countries of each region, per year
  function regionalTrend(metricKey) {
    var regions = ["Europe", "Asia", "Americas", "Africa", "Middle East", "Oceania", "Eurasia"];
    var years = [];
    for (var y = Y0; y <= Y1; y++) years.push(y);
    var out = [];
    regions.forEach(function (rg) {
      var members = RICH.filter(function (c) { return c.region === rg && c.history; });
      if (!members.length) return;
      var values = years.map(function (_, i) {
        var s = 0;
        members.forEach(function (c) { s += c.history[metricKey][i]; });
        return Math.round((s / members.length) * 10) / 10;
      });
      out.push({ region: rg, years: years, values: values, n: members.length });
    });
    return out;
  }

  window.ESG = {
    RICH: RICH, BASE: BASE, all: all, byName: byName,
    lookupByName: lookupByName,
    buildScales: buildScales,
    METRICS: METRICS,
    valueAt: valueAt,
    regionalTrend: regionalTrend,
    YEAR_MIN: Y0, YEAR_MAX: Y1,
    NO_DATA: "#222a26",
  };
})();
