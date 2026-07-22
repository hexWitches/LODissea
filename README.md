# LODissea
## The project
LODissea is an **exploratory research**, investigating the open and collaborative environment of **Europeana**. Specifically, we examine the scale and distribution of data providers, analyzing who they are and what institutional categories they represent, and the overall structural quality of their data.

The **selected countries** for this study are: Italy, Germany, Spain, Portugal, France, the Netherlands.

Data retrieved from Europeana are enriched using **Wikidata** and **Eurostat** databases.

## The notebook architecture
The analysis notebook is organized into a global setup phase followed by investigation blocks for each Research Question (RQ).

### Project Overview
Contains the project title, subtitles, abstract, and explicitly defines the core Research Questions.
  
### Global Setup 
Preliminary shared code cells containing all library imports, API key configurations, and styling variables.

### Modular Exploration
To maintain a clean Exploratory Data Analysis (EDA) pipeline, each Research Question is treated as an independent module. Every question strictly follows this three-step workflow:
- **Data Acquisition:** Fetching live data via REST APIs, SPARQL endpoints, or external datasets.
- **Data Filtering, Cleaning & Merging:** Processing the raw data and merging it into clean DataFrames.
- **Visual Representation:** The code required to render the interactive chart(s) and answer the specific question.

## The website 
Embark on a digital odyssey. Follow our journey as we navigate the vast sea of Europeana data. Website live at:.


# Team Members:
- [Miriana Pinto](https://github.com/mir-pin)
- [Sara Roggiani](https://github.com/sararoggi)
- [Martina Uccheddu](https://github.com/martinaucch)
