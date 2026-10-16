var e={id:`url-categories`,h:{en:`URL filtering categories`,hi:`URL filtering categories`},body:{en:`
<p>Inspection looks for bad patterns. URL filtering asks a different question: <i>is this kind of site allowed here at all?</i> A company may allow staff to read technology news but not to stream video during work hours. This chapter shows how URL categories work as part of an Access rule, and why their order and breadth matter.</p>

<h3>Start with an analogy: a library with sections</h3>
<p>A library does not judge each book one by one at the door. Books are sorted into sections (fiction, medicine, children). The policy says "children may not enter the adult section". The guard needs to know only the section. A URL category is a section of the Internet: Social Media, Streaming Media, Shopping, Banking, Gambling, Malicious sites and so on. A site belongs to a category, and the rule talks about categories, not about thousands of domains.</p>

<h3>Categories as the Service of a rule</h3>
<p>In the Access policy, the Service column normally holds protocols and ports (HTTP, HTTPS, DNS). The NGFW also lets you put a <b>URL category</b> in that column, shown in the simulator as a Service named URL followed by the category, for example URL: Social Media. A rule with that Service says: for web traffic to sites in this category, take this action. A typical rule is Discard for URL: Social Media, source net-staff, destination any.</p>
<p>The category list in this course is an <b>original learning table</b>: for example facebook.com is Social Media, netbank.example is Banking, casino.example is Gambling, badware.example is Malicious sites, and unknown sites are Uncategorized. A real deployment uses a vendor categorisation database whose categories and update method depend on your NGFW version, so check the documentation. The simulator does not model that database.</p>

<h3>Evaluated after the connection starts</h3>
<p>The engine cannot know the category when the first packet arrives: it sees an IP address and a port, not a site name. It first lets the TCP connection start under the ordinary port-based rules, reads the host name from the request (for HTTPS, the name needs to be visible, which is where chapter 4 helps), looks up the category, and only then takes the final web decision. So the category decision happens <b>after the connection starts</b>. This is also why a category rule shows up in the log with the web request and not as a bare connection.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Rule order with categories">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Staff to Internet rules, top to bottom</text>
<rect x="60" y="34" width="520" height="40" rx="8" fill="#fed7aa"/><text x="320" y="59" text-anchor="middle" class="svg-ink" font-size="13">1  Discard   net-staff to any   URL: Social Media</text>
<rect x="60" y="82" width="520" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="13">2  Allow     net-staff to any   HTTP, HTTPS (deep + https flags)</text>
<rect x="60" y="130" width="520" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">   implicit discard (no match)</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">facebook.com: category known, rule 1 wins over the broader Allow in rule 2</text>
<text x="320" y="216" text-anchor="middle" class="svg-muted" font-size="12">If the order were swapped, rule 2 would match first and the category rule would never be reached</text>
</svg><p class="cap">A category Discard must sit above the general Allow.</p></div>

<h3>Order decides: the category Discard wins when it is above</h3>
<p>Access rules are first match wins. If the Discard for a category is above the Allow for web browsing, the engine discards sites in that category and allows the rest. If the Allow is above the Discard, the Allow matches first and the category rule never takes effect (a shadowed rule warning appears at install, but it does not block). Remember the rule for the lab: category rules above, general web Allow below.</p>

<h3>The risk: over-blocking</h3>
<p>Categories are broad. Blocking Social Media may also block the recruiting page or the marketing team's work. Blocking Streaming Media can break training videos. Before you publish a category block:</p>
<ul>
<li>Ask the owner which teams legitimately need the category.</li>
<li>Scope the rule by source (a user network, a time range, an authenticated group) instead of everyone.</li>
<li>Check the log for a week in a permissive state first; URL logging gives you the category counts.</li>
<li>Keep a short process for a permitted site: an Allow rule above the Discard for that exact destination, or a documented exception.</li>
</ul>

<div class="eg"><p><b>Worked example (lab fp-inspection-4).</b> At Pune, HR asks to block Social Media for the Staff LAN. Place a Discard rule with Service URL: Social Media, source net-staff, destination any, above the web Allow rule. Install policy. In Tools, run a Web test from STAFF-PC against the Internet cloud: facebook.com is discarded, wikipedia.org (Technology) still loads, and mypnetlab.vercel.app (Business) loads. The log shows the Discard with the rule name and the category.</p></div>

<pre class="out">Web test from STAFF-PC (10.1.1.10)
facebook.com     category: Social Media   <span class="hl">Discard by rule Block-social</span>
wikipedia.org    category: Technology     Allow by rule Staff-web
netbank.example  category: Banking        Allow by rule Staff-web</pre>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Putting the category Discard below the general Allow.</li>
<li>Thinking the category is known from the first packet. It is not; it needs the host name.</li>
<li>Blocking a category for everyone when only one department needs it.</li>
<li>Expecting category rules to see names inside undecrypted HTTPS without checking what the engine can read.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> "Where is the URL category configured?" As the Service of an Access rule. "When is it evaluated?" After the connection starts, once the category is known. "Which wins?" First match, so a category Discard above an Allow wins.</p></div>

<div class="scn"><h4>The Discard that did nothing</h4><p>Management asked to block Social Media. An admin added the Discard rule at the bottom of the staff policy, installed, and tested from a laptop. Facebook still opened. The install showed a shadowed-rule warning that nobody read. The engineer checked the rule counters and the log: every request matched the web Allow rule above. They moved the Discard rule above the Allow, installed, retested, and saw Discard in the log. They also asked HR to name the marketing team, which got an Allow rule above the Discard for its own source range.</p><p><b>Lesson:</b> read install warnings, and prove an access change with a test and a log line.</p></div>

<div class="iv"><p class="q">"How would you block a website category for staff without breaking the business?"</p><p>Strong answer: use a category Service in a Discard rule above the general web Allow, scope it to the right source, test with sample sites from each category, review logs before and after, and have a process to permit individual sites or teams. Mention the category is known only after the request is seen.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A URL category is a section of the Internet, used as the Service of an Access rule.</li>
<li>The category is known after the connection starts, from the host name.</li>
<li>Rule order: a category Discard must sit above the general Allow to win.</li>
<li>Over-blocking is the main risk; scope by source and check the log.</li>
<li>The category table here is an original learning table; real databases depend on your version.</li>
</ul></div>
`,hi:`
<p>Inspection bad patterns dhundhta hai. URL filtering alag sawaal poochta hai: <i>kya is tarah ki site yahan allowed hai bhi?</i> Company staff ko technology news padhne de sakti hai lekin kaam ke ghanton mein video stream karne nahi. Yeh chapter dikhata hai ki URL categories Access rule ke hisse ke roop mein kaise kaam karti hain, aur unka order aur breadth kyun maayne rakhte hain.</p>

<h3>Ek analogy se shuru karo: sections wali library</h3>
<p>Library darwaze par har kitaab ko alag alag judge nahi karti. Kitaabein sections mein sorted hoti hain (fiction, medicine, children). Policy kehti hai "bachche adult section mein nahi jaa sakte". Guard ko sirf section pata hona chahiye. URL category Internet ka ek section hai: Social Media, Streaming Media, Shopping, Banking, Gambling, Malicious sites waghera. Site ek category ki hoti hai, aur rule categories ke baare mein baat karta hai, hazaaron domains ke baare mein nahi.</p>

<h3>Categories rule ke Service ke roop mein</h3>
<p>Access policy mein Service column mein normally protocols aur ports hote hain (HTTP, HTTPS, DNS). NGFW is column mein <b>URL category</b> bhi rakhne deta hai, jo simulator mein Service ke roop mein URL aur category ke naam se dikhti hai, jaise URL: Social Media. Us Service wala rule kehta hai: is category ki sites ke web traffic par yeh action lo. Typical rule hai URL: Social Media par Discard, source net-staff, destination any.</p>
<p>Is course ki category list ek <b>original learning table</b> hai: jaise facebook.com Social Media hai, netbank.example Banking hai, casino.example Gambling hai, badware.example Malicious sites hai, aur unknown sites Uncategorized hain. Real deployment vendor ka categorisation database use karti hai jiski categories aur update method aapke NGFW version par depend karte hain, isliye documentation check karo. Simulator woh database model nahi karta.</p>

<h3>Connection start hone ke baad evaluate hota hai</h3>
<p>Engine ko pehle packet par category pata nahi hoti: use IP address aur port dikhta hai, site ka naam nahi. Pehle woh ordinary port-based rules ke tahat TCP connection start hone deta hai, request se host name padhta hai (HTTPS ke liye naam visible hona chahiye, jahan chapter 4 madad karta hai), category lookup karta hai, aur tabhi final web decision leta hai. Isliye category decision <b>connection start hone ke baad</b> hota hai. Isi wajah se category rule log mein web request ke saath dikhta hai, sirf connection ke roop mein nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Categories ke saath rule order">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Staff se Internet rules, upar se neeche</text>
<rect x="60" y="34" width="520" height="40" rx="8" fill="#fed7aa"/><text x="320" y="59" text-anchor="middle" class="svg-ink" font-size="13">1  Discard   net-staff to any   URL: Social Media</text>
<rect x="60" y="82" width="520" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="13">2  Allow     net-staff to any   HTTP, HTTPS (deep + https flags)</text>
<rect x="60" y="130" width="520" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">   implicit discard (koi match nahi)</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">facebook.com: category pata hai, rule 1 broader Allow (rule 2) par jeetta hai</text>
<text x="320" y="216" text-anchor="middle" class="svg-muted" font-size="12">Order ulta ho to rule 2 pehle match hoga aur category rule tak baat hi nahi pahunchegi</text>
</svg><p class="cap">Category Discard general Allow ke upar hona chahiye.</p></div>

<h3>Order decide karta hai: upar wala category Discard jeetta hai</h3>
<p>Access rules mein first match wins. Agar category ka Discard web browsing ke Allow se upar hai, to engine us category ki sites discard karta hai aur baaki allow karta hai. Agar Allow Discard se upar hai, to Allow pehle match hota hai aur category rule kabhi effect mein nahi aata (install par shadowed rule warning aati hai, lekin woh block nahi karti). Lab ke liye rule yaad rakho: category rules upar, general web Allow neeche.</p>

<h3>Risk: over-blocking</h3>
<p>Categories broad hoti hain. Social Media block karne se recruiting page ya marketing team ka kaam bhi block ho sakta hai. Streaming Media block karne se training videos toot sakte hain. Category block publish karne se pehle:</p>
<ul>
<li>Owner se poochho ki kin teams ko category sach mein chahiye.</li>
<li>Rule ko sabke liye nahi, source (user network, time range, authenticated group) se scope karo.</li>
<li>Pehle ek hafte permissive state mein log dekho; URL logging aapko category counts deti hai.</li>
<li>Permitted site ke liye chhota process rakho: us exact destination ke liye Discard ke upar Allow rule, ya documented exception.</li>
</ul>

<div class="eg"><p><b>Worked example (lab fp-inspection-4).</b> Pune mein HR Staff LAN ke liye Social Media block karne ko kehta hai. Service URL: Social Media, source net-staff, destination any wala Discard rule web Allow rule ke upar rakho. Install policy karo. Tools mein STAFF-PC se Internet cloud ke against Web test chalao: facebook.com discard hoti hai, wikipedia.org (Technology) ab bhi load hoti hai, aur mypnetlab.vercel.app (Business) load hoti hai. Log mein rule ke naam aur category ke saath Discard dikhta hai.</p></div>

<pre class="out">Web test from STAFF-PC (10.1.1.10)
facebook.com     category: Social Media   <span class="hl">Discard by rule Block-social</span>
wikipedia.org    category: Technology     Allow by rule Staff-web
netbank.example  category: Banking        Allow by rule Staff-web</pre>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Category Discard ko general Allow ke neeche rakhna.</li>
<li>Yeh sochna ki category pehle packet se pata hoti hai. Nahi hoti; host name chahiye.</li>
<li>Category sabke liye block karna jabki sirf ek department ko chahiye.</li>
<li>Bina dekhe ki engine kya padh sakta hai, undecrypted HTTPS ke andar ke naam category rules ko dikhne ki ummeed rakhna.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> "URL category kahan configure hoti hai?" Access rule ke Service ke roop mein. "Kab evaluate hoti hai?" Connection start hone ke baad, jab category pata ho. "Kaun jeetta hai?" First match, isliye Allow ke upar wala category Discard jeetta hai.</p></div>

<div class="scn"><h4>Discard jisne kuch nahi kiya</h4><p>Management ne Social Media block karne ko kaha. Ek admin ne Discard rule staff policy ke sabse neeche add kiya, install kiya, aur laptop se test kiya. Facebook phir bhi khuli. Install ne shadowed-rule warning dikhayi thi jo kisi ne nahi padhi. Engineer ne rule counters aur log check kiye: har request upar wale web Allow rule se match hui. Unhone Discard rule ko Allow ke upar move kiya, install kiya, retest kiya, aur log mein Discard dekha. Unhone HR se marketing team ka naam bhi poocha, jise apni source range ke liye Discard ke upar Allow rule mila.</p><p><b>Lesson:</b> install warnings padho, aur access change ko test aur log line se prove karo.</p></div>

<div class="iv"><p class="q">"Business tode bina staff ke liye website category kaise block karoge?"</p><p>Strong answer: general web Allow ke upar Discard rule mein category Service use karo, sahi source tak scope karo, har category ki sample sites se test karo, pehle aur baad ke logs review karo, aur individual sites ya teams ko permit karne ka process rakho. Batao ki category tabhi pata hoti hai jab request dikh jaaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URL category Internet ka ek section hai, jo Access rule ke Service ke roop mein use hoti hai.</li>
<li>Category connection start hone ke baad, host name se pata hoti hai.</li>
<li>Rule order: jeetne ke liye category Discard general Allow ke upar ho.</li>
<li>Over-blocking main risk hai; source se scope karo aur log dekho.</li>
<li>Yahan ki category table original learning table hai; real databases version par depend karte hain.</li>
</ul></div>
`}};export{e as default};