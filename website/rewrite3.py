with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '<div class="conclusion-grid">'
end_marker = '<!-- Back to top button -->'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_html = """<div class="conclusion-text-col" style="max-width: 64rem; text-align: center; margin-bottom: 3rem;">
        <h2 class="conclusion-title">Emerging <br /> <span>from the depths</span></h2>
        <p class="conclusion-subtitle">Reflecting on the journey</p>
        <p>
          When we set sail on this exploratory journey to map how European cultural heritage 
          (GLAM) institutions navigate the Europeana ecosystem, our voyage uncovered a digital 
          landscape defined by stark disparities and untapped potential. We first encountered a 
          severe participation deficit, realizing that only a drop in the vast ocean of European 
          institutions actively shares their collections on the platform. Crucially, our analysis 
          revealed that macroeconomic cultural investment does not steer digital volume; 
          high-spending leaders like France contribute surprisingly few data providers and artifacts. 
          As we charted the pattern of these contributions, we observed the "Flagship" phenomenon, 
          where almost every nation's digital fleet is dominated by a single, massive lead provider 
          anchored heavily in capital cities and primary cultural hubs. Further exploration across 
          providers typology uncovered that while libraries command the highest overall volume 
          of shared objects, specialized repositories like Audiovisual archives emerge as 
          exceptionally active navigators. Finally, looking beneath the surface of the data, 
          we struck the quality and openness shallow: the vast majority of artifacts floating 
          on the platform remain trapped in low Content Tiers and restrictive copyright schemas.  
        </p>
      </div>

      <div class="conclusion-grid">
        <div class="conclusion-stats-col">
          <div class="stat-box">
            <h4>Reconsider</h4>
            <p>
              Reconsider the assumption that high national cultural spending automatically 
              results in digital openness, and recognize that financial investment must 
              be paired with intentional open-data strategies. 
            </p>
          </div>
          <div class="stat-box">
            <h4>Collaborate</h4>
            <p>
              Collaborate across borders and institutional scales—connecting major national 
              "flagships" with peripheral archives to share technical infrastructure and 
              data-mapping expertise. 
            </p>
          </div>
          <div class="stat-box">
            <h4>Empower</h4>
            <p>
              Empower smaller and specialized cultural institutions by providing them 
              with the tools to share their catalogs directly on the European stage. 
            </p>
          </div>
          <div class="stat-box">
            <h4>Promote and Implement</h4>
            <p>
              Promote and implement policies that prioritize high-tier data quality and 
              true legal openness, ensuring that digital heritage is not merely stored, 
              but can be actively reused by the global community. 
            </p>
          </div>
        </div>

        <div class="conclusion-text-col">
          <p>
            Europeana is an extraordinary collaborative infrastructure—a vessel designed not just for data storage, 
            but for cross-border knowledge discovery. However, an empty harbor serves no maritime trade. If Member 
            States don’t participate in an active collaborative ecosystem, the immense financial and technical effort 
            behind European Linked Open Data is lost.  European and national policymakers should first understand 
            the underlying frictions currently impeding institutional participation.  
          </p>
          <p>
            At present peripheral and regional heritage remains digitally invisible because smaller organizations 
            often lack the technical infrastructure and knowledge required to independently map, standardize, 
            and ingest their catalogs into European aggregators. This exclusionary dynamic extends beyond 
            geography into institution type. The same concentration that determines who contributes also shapes what 
            gets preserved: cultural heritage on Europeana skews toward traditional, document-based forms 
            at the expense of a genuinely diverse range of heritage types. What appears on the platform seems 
            shaped less by deliberate curatorial choice than by structural and external factors that have 
            little to do with what a country actually values as heritage.  As a result, Europeana's national 
            profiles cannot be read as a reliable reflection of cultural identity: what looks like a country's 
            heritage priorities may instead be an artifact of which institutions happened to digitize the most. 
          </p>
          <p>
            Finally, even when collections successfully reach the platform, many remain anchored by low-quality 
            metadata and restrictive copyright licenses. While improving metadata requires technical expertise, 
            institutional resources and investment, it’s ultimately a challenge that can be addressed through 
            training and digital infrastructure. Openness, by contrast, depends largely on the broader national 
            legal framework governing copyright and reuse. By embracing both Linked Open Data principles 
            and more permissive licensing policies, cultural institutions could move closer to Europeana's original vision: a shared cultural commons where access to heritage empowers people and benefits society. 
          </p>
        </div>
      </div>

      """

new_content = content[:start_idx] + new_html + content[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("done")
