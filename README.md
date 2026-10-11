# IE Toolkit

IE Toolkit is a small web workspace of calculators for industrial engineering students and professionals. It runs entirely in the browser: there is no server, no account and no installation.

The interface is available in English and Turkish, with light and dark themes.

## The four tools

| Tool | What it does |
|---|---|
| **ConvertLab** | Unit converter for length, mass, pressure, energy and temperature (34 units in total), with a swap button and automatic conversion as you type. |
| **Production Efficiency & OEE** | Calculates Availability, Performance, Quality and Overall Equipment Effectiveness from planned time, downtime, ideal cycle time, units produced and defective units. Names the lowest component and gives a general improvement hint. |
| **Inventory Management** | Economic Order Quantity (EOQ), safety stock, reorder point and total relevant annual inventory cost for one stocked item, with an optional comparison against your own order quantity. |
| **Capacity Planning** | Utilization and efficiency from design capacity, effective capacity and actual output, plus a bottleneck analysis for a serial production line of 1 to 12 stations. |

## Main features

- **Two languages.** English and Turkish, switchable at any time without losing what you have typed. The choice is remembered.
- **Locale-aware numbers.** English uses `1,234.56`; Turkish uses `1.234,56`. Inputs accept the decimal separator of the selected language, and values are re-formatted when you switch.
- **Light and dark themes.** The site follows your system setting on the first visit and remembers your choice afterwards.
- **Input validation.** Each calculator rejects missing, non-numeric, negative or inconsistent values with a message next to the field, and does not show a result built on invalid input.
- **Visible assumptions.** Results that depend on a model state their assumptions on the page (see below).
- **Responsive layout** for desktop, tablet and phone widths.
- **No tracking and no data upload.** Calculator inputs stay in the page and are not saved. Only the theme and language preferences are stored, in the browser's local storage.

A pricing section appears on the page for demonstration only. There are no payments, subscriptions or accounts.

## Formulas

**OEE**

- Operating time = planned production time − downtime
- Availability = operating time ÷ planned production time
- Performance = (ideal cycle time × total units) ÷ operating time
- Quality = (total units − defective units) ÷ total units
- OEE = Availability × Performance × Quality

**Inventory**

- EOQ = √(2DS ÷ H), where D is annual demand, S the cost per order and H the annual holding cost per unit
- Safety stock = z × σd × √L, where z comes from the service level, σd is the standard deviation of daily demand and L the lead time in days
- Reorder point = d × L + safety stock, where d is average daily demand
- Annual ordering cost = (D ÷ Q) × S; annual holding cost = (Q ÷ 2) × H; total relevant cost is their sum

**Capacity**

- Utilization = actual output ÷ design capacity
- Efficiency = actual output ÷ effective capacity
- Station capacity (units/hour) = number of machines × 60 ÷ processing time (minutes per unit)
- Line throughput = the lowest station capacity; every station at that minimum is reported as a bottleneck

## Engineering assumptions and limitations

These calculators are simplified textbook models intended for learning and quick estimates. They are not a substitute for a detailed study of a real operation.

**ConvertLab**

- Results are shown to six significant digits.
- The calorie is the thermochemical calorie (4.184 J), the BTU is the International Table BTU, and the ton options are the metric ton and the US short ton.

**OEE**

- One production run with a single ideal cycle time; no product mix.
- Performance above 100% is shown as calculated, with a warning that the inputs may be inconsistent. It is not capped.
- The improvement hint is general guidance based on the lowest component, not a diagnosis.

**Inventory**

- EOQ assumes steady demand, fixed ordering and holding costs, and no quantity discounts.
- Safety stock assumes daily demand is roughly normally distributed and independent from day to day, with a constant lead time. Only demand varies.
- Service level means the probability of not running out during one replenishment cycle, not the share of demand filled. Available levels are 90%, 95%, 97.5%, 99% and 99.9%.
- Safety stock and reorder point are rounded up to whole units; EOQ is rounded to the nearest whole unit.
- Purchase cost is excluded from the annual cost. Costs carry no currency: they are in whatever currency you enter.
- "Days between orders" uses a 365-day year.

**Capacity planning**

- The three capacity figures must cover the same reporting period.
- Output above effective or design capacity is shown as calculated, with a warning. It is not capped.
- The bottleneck analysis is a theoretical model: one product type; a serial line in which every unit passes through every station; identical parallel machines within a station; no breakdowns, setup losses, material shortages or rework; all stations working for the same period. Real throughput will be lower.

**General**

- Inputs are not saved between visits.
- There is no export, printing layout or saved-scenario feature.

## Technologies

- HTML, CSS and plain JavaScript. No framework, no build step and no package dependencies.
- Inline SVG for the logo and illustrations.
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) and [Inter](https://fonts.google.com/specimen/Inter), loaded from Google Fonts. Without an internet connection the site falls back to system fonts and works otherwise unchanged.
- The browser's `localStorage` for the theme and language preferences.

## Project structure

```
index.html   Page structure, text (in English) and SVG illustrations
style.css    All styling; every colour is a CSS variable, with a light and a dark set
app.js       Unit data, translations, calculation functions and page behaviour
```

Inside `app.js` the calculation functions are kept separate from the code that updates the page, and are exported when the file is loaded in Node so they can be tested without a browser.

## Running locally

Download or clone the repository and open `index.html` in a browser. Nothing else is required.

To serve it over HTTP instead, run a static server from the project folder, for example:

```
python -m http.server 8000
```

and open `http://localhost:8000`.

## Testing and browser support

The site was developed and checked in Microsoft Edge (Chromium). It has not been systematically tested in other browsers or with screen readers. The repository does not include an automated test suite.

## Status

The site is not yet published. It is a static site with relative file paths, so it can be hosted on GitHub Pages or any static host without changes.
