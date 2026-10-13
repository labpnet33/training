var e={id:`tid-architecture`,h:{en:`Threat Intelligence Director: sources, elements, actions and incidents`,hi:`Threat Intelligence Director: sources, elements, actions aur incidents`},body:{en:`
<p>Threat Intelligence Director (TID) is a feature of the Secure Firewall Management Center. It takes the intelligence you learnt about in the previous chapter, stores it, and <b>publishes</b> the observables to the Threat Defense devices, which match them in traffic and report back. This chapter explains every moving part, so the lab in the next chapter is just clicking through a picture you already understand.</p>

<h3>An analogy: a news agency and its newspapers</h3>
<p>A news agency collects stories from reporters around the world (sources), edits them into a common format, and sends them to every newspaper that subscribes (elements). The newspapers print without waiting for the editor-in-chief to approve each edition (no Deploy). When a reader calls in about a story (a match), the newspaper reports it back to the agency, which opens a file on it (an incident).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="TID flow">
<rect x="10" y="30" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="52" text-anchor="middle" class="svg-ink" font-size="13">TAXII server</text><text x="85" y="70" text-anchor="middle" class="svg-muted" font-size="12">STIX collections</text>
<rect x="10" y="100" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="122" text-anchor="middle" class="svg-ink" font-size="13">Flat file</text><text x="85" y="140" text-anchor="middle" class="svg-muted" font-size="12">URL poll or upload</text>
<rect x="230" y="55" width="180" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">Management Center</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">TID: sources, indicators,</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">observables, incidents</text>
<rect x="480" y="30" width="150" height="45" rx="8" fill="#fed7aa"/><text x="555" y="57" text-anchor="middle" class="svg-ink" font-size="13">Element FTD1</text>
<rect x="480" y="110" width="150" height="45" rx="8" fill="#fed7aa"/><text x="555" y="137" text-anchor="middle" class="svg-ink" font-size="13">Element FTD2</text>
<line x1="160" y1="55" x2="230" y2="85" stroke="#64748b" stroke-width="2"/><line x1="160" y1="125" x2="230" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="85" x2="480" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="105" x2="480" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="445" y="180" text-anchor="middle" class="svg-accent" font-size="12">publish observables (no Deploy)</text>
<text x="445" y="200" text-anchor="middle" class="svg-accent" font-size="12">observations / incidents come back</text>
<text x="195" y="180" text-anchor="middle" class="svg-muted" font-size="12">poll every N minutes</text>
</svg><p class="cap">Sources feed the Management Center; TID publishes observables to every element and collects what they see.</p></div>

<h3>The building blocks</h3>
<dl class="terms">
<dt>Source</dt><dd>Where intelligence comes from. You choose the <b>delivery</b> (TAXII, URL or Upload), the <b>type</b> (STIX or Flat file), the default <b>action</b> (Block or Monitor), how often to <b>update</b> (for TAXII and URL sources), and a <b>TTL</b> after which observables expire. A flat-file source carries one content type (for example IPv4, domain, URL or SHA-256).</dd>
<dt>Indicator</dt><dd>Created by TID when it parses a source. Simple or complex, with the source's action inherited unless you override it.</dd>
<dt>Observable</dt><dd>The values extracted from indicators. You can change the action of a single observable — for example set one IP to Monitor while the rest of the source blocks.</dd>
<dt>Element</dt><dd>A managed Threat Defense that receives TID data. Registered devices appear automatically.</dd>
<dt>Incident</dt><dd>Opened when an element reports a match (an <b>observation</b>). A complex indicator stays <b>partially realized</b> until all its observables have been seen, then becomes <b>fully realized</b>. Analysts move incidents through statuses such as New, Open, Closed or Rejected.</dd>
<dt>Settings</dt><dd>Global switch to <b>pause publishing</b> to all elements — your emergency brake if a feed misbehaves.</dd>
</dl>
<p>On current Management Center releases you find all of this under <b>Integration → Intelligence</b> (tabs Sources, Elements, Settings and Incidents). The lab's Management Center places the same form under <b>Objects → Threat Intelligence Director</b>.</p>

<h3>Why TID needs no Deploy</h3>
<p>Normal policy changes — a new access rule, an intrusion policy edit — are compiled into a new policy and pushed with Deploy, which can briefly interrupt inspection. TID data is different: it is a <b>list</b> the devices consult, published straight to the elements in the background. That is the whole operational point: intelligence can change every few minutes without change windows. The access control policy only needs TID enabled (Access Control Policy → Advanced → Threat Intelligence Director, on by default) and must already be deployed.</p>

<h3>Actions and precedence</h3>
<p><b>Block</b> drops matching traffic and logs it; <b>Monitor</b> only logs. Settings cascade downward: the source's action applies to all its indicators and observables unless an indicator or an individual observable overrides it — the most specific setting wins. On the device, TID matching happens early, in the same Security Intelligence stage you met in sec-ftd-ips, so a blocked observable is stopped before access control rules are evaluated.</p>

<pre class="code"><span class="c">! Integration → Intelligence → Sources → + (a TAXII source)</span>
Delivery       : TAXII
URL            : taxii.cert.example/taxii2/        <span class="c">! no scheme shown here</span>
Username       : nwk-soc
Collections    : active-campaigns
Action         : Monitor            <span class="c">! review first, Block later</span>
Update Every   : 60 minutes
TTL            : 30 days
Publish        : On</pre>

<pre class="out">Integration &gt; Intelligence &gt; Sources
Name               Type       Delivery  Action   Published  Last Updated         Status
<span class="hl">CERT-Campaigns     STIX       TAXII     Monitor  Yes        2026-10-02 09:00     Completed</span>
Hunt-Team-Hashes   Flat File  Upload    Block    Yes        2026-10-01 17:42     Completed

Integration &gt; Intelligence &gt; Elements
Element   Type                     Registered   Publishing
<span class="hl">NK-FTD    Secure Firewall Threat Defense  Yes  Active</span></pre>

<div class="eg"><p><b>Worked example.</b> The hunting team uploads a flat file of 4 SHA-256 hashes as source Hunt-Team-Hashes with action Block. The elements receive the hashes within minutes. For a hash to match, the firewall must actually look at files, so the access rule that carries the traffic needs a file policy with malware cloud lookup or block malware (sec-ftd-ips). Without that, the hashes are published but never seen.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Expecting TID to match traffic that a prefilter Fastpath rule sends around Snort — it never gets inspected. (2) Expecting a full URL observable to match HTTPS without decryption — without decryption only the server name is visible. (3) Forgetting the TTL, so last year's IPs still block today.</p></div>

<div class="exam"><p><b>Exam trap.</b> "After adding a TID source, what must the administrator do for the devices to enforce it?" — nothing: TID publishes automatically, no Deploy. And remember the emergency brake: pausing publishing in TID Settings, not deleting the access control policy.</p></div>

<div class="scn"><h4>The feed that went wild</h4><p>A SOC's commercial TAXII collection suddenly delivered 40,000 new IPs in one poll, including large cloud ranges. Within minutes users complained that a collaboration suite was failing. The engineer opened Integration → Intelligence → Settings and paused publishing, which stopped the new data reaching the elements while keeping everything stored. He then set the source to Monitor, contacted the vendor, who confirmed a parsing error, and resumed publishing after the corrected collection arrived.</p><p><b>Lesson:</b> know where the brake is. Pausing publishing is faster and safer than deleting sources in a panic.</p></div>

<div class="iv"><p class="q">"Walk me through how Threat Intelligence Director gets an indicator from a CERT onto a firewall."</p><p>Strong answer: define a source in the Management Center — TAXII with the collection, or a flat file via URL or upload — with an action and a TTL. TID parses it into indicators and observables, then publishes the observables to the elements (the managed Threat Defense devices) without a Deploy. The devices match traffic against them in the Security Intelligence stage, block or monitor, and report observations; the Management Center turns those into incidents. Mention the access policy prerequisite and the file policy needed for SHA-256 matches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sources (TAXII, URL, upload; STIX or flat file) feed indicators and observables into TID.</li>
<li>Elements are the managed Threat Defense devices; observables are published to them without Deploy.</li>
<li>Actions are Block or Monitor; the most specific setting (observable &gt; indicator &gt; source) wins.</li>
<li>Matches create incidents; complex indicators are partially then fully realized.</li>
<li>Pause publishing is the emergency brake; TTL keeps stale intelligence out.</li>
</ul></div>
`,hi:`
<p>Threat Intelligence Director (TID) Secure Firewall Management Center ka ek feature hai. Yeh woh intelligence leta hai jiske baare mein aapne pichhle chapter mein seekha, use store karta hai, aur observables ko Threat Defense devices tak <b>publish</b> karta hai, jo traffic mein unhe match karke wapas report karte hain. Yeh chapter har moving part samjhata hai, taaki agle chapter ki lab bas ek aisi picture mein click karna ho jo aap pehle se samajhte ho.</p>

<h3>Ek analogy: news agency aur uske newspapers</h3>
<p>Ek news agency duniya bhar ke reporters se stories ikattha karti hai (sources), unhe ek common format mein edit karti hai, aur har subscribe karne wale newspaper ko bhejti hai (elements). Newspapers har edition ke liye editor-in-chief ke approval ka intezaar kiye bina chhaapte hain (Deploy nahi). Jab koi reader kisi story ke baare mein call karta hai (match), newspaper use agency ko wapas report karta hai, jo us par ek file kholti hai (incident).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="TID flow">
<rect x="10" y="30" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="52" text-anchor="middle" class="svg-ink" font-size="13">TAXII server</text><text x="85" y="70" text-anchor="middle" class="svg-muted" font-size="12">STIX collections</text>
<rect x="10" y="100" width="150" height="50" rx="8" fill="#bae6fd"/><text x="85" y="122" text-anchor="middle" class="svg-ink" font-size="13">Flat file</text><text x="85" y="140" text-anchor="middle" class="svg-muted" font-size="12">URL poll ya upload</text>
<rect x="230" y="55" width="180" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">Management Center</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">TID: sources, indicators,</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">observables, incidents</text>
<rect x="480" y="30" width="150" height="45" rx="8" fill="#fed7aa"/><text x="555" y="57" text-anchor="middle" class="svg-ink" font-size="13">Element FTD1</text>
<rect x="480" y="110" width="150" height="45" rx="8" fill="#fed7aa"/><text x="555" y="137" text-anchor="middle" class="svg-ink" font-size="13">Element FTD2</text>
<line x1="160" y1="55" x2="230" y2="85" stroke="#64748b" stroke-width="2"/><line x1="160" y1="125" x2="230" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="85" x2="480" y2="55" stroke="#64748b" stroke-width="2"/><line x1="410" y1="105" x2="480" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="445" y="180" text-anchor="middle" class="svg-accent" font-size="12">observables publish (Deploy nahi)</text>
<text x="445" y="200" text-anchor="middle" class="svg-accent" font-size="12">observations / incidents wapas aate hain</text>
<text x="195" y="180" text-anchor="middle" class="svg-muted" font-size="12">har N minute poll</text>
</svg><p class="cap">Sources Management Center ko feed karte hain; TID har element ko observables publish karta hai aur jo woh dekhte hain use collect karta hai.</p></div>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Source</dt><dd>Intelligence kahan se aati hai. Aap <b>delivery</b> (TAXII, URL ya Upload), <b>type</b> (STIX ya Flat file), default <b>action</b> (Block ya Monitor), kitni baar <b>update</b> karna hai (TAXII aur URL sources ke liye), aur ek <b>TTL</b> chunte ho jiske baad observables expire hote hain. Flat-file source ek content type leta hai (jaise IPv4, domain, URL ya SHA-256).</dd>
<dt>Indicator</dt><dd>TID ise source parse karte waqt banata hai. Simple ya complex, source ka action inherit karta hai jab tak aap override na karo.</dd>
<dt>Observable</dt><dd>Indicators se nikaali gayi values. Aap ek single observable ka action badal sakte ho — jaise ek IP ko Monitor par rakho jabki baaki source block kare.</dd>
<dt>Element</dt><dd>Ek managed Threat Defense jo TID data receive karta hai. Registered devices apne aap dikhte hain.</dd>
<dt>Incident</dt><dd>Tab khulta hai jab element match report karta hai (ek <b>observation</b>). Complex indicator tab tak <b>partially realized</b> rehta hai jab tak uske saare observables na dikh jaayein, phir <b>fully realized</b> ho jaata hai. Analysts incidents ko New, Open, Closed ya Rejected jaise statuses se le jaate hain.</dd>
<dt>Settings</dt><dd>Saare elements ko <b>publishing pause</b> karne ka global switch — agar koi feed gadbad kare to aapka emergency brake.</dd>
</dl>
<p>Current Management Center releases par yeh sab <b>Integration → Intelligence</b> ke neeche milta hai (tabs Sources, Elements, Settings aur Incidents). Lab ka Management Center yahi form <b>Objects → Threat Intelligence Director</b> ke neeche rakhta hai.</p>

<h3>TID ko Deploy kyun nahi chahiye</h3>
<p>Normal policy changes — nayi access rule, intrusion policy edit — ek nayi policy mein compile hokar Deploy se push hote hain, jo thodi der inspection rok sakta hai. TID data alag hai: yeh ek <b>list</b> hai jise devices consult karte hain, background mein seedha elements ko publish hoti hai. Poora operational point yahi hai: intelligence bina change windows ke har kuch minute mein badal sakti hai. Access control policy mein bas TID enabled hona chahiye (Access Control Policy → Advanced → Threat Intelligence Director, default on) aur woh pehle se deployed honi chahiye.</p>

<h3>Actions aur precedence</h3>
<p><b>Block</b> matching traffic drop karke log karta hai; <b>Monitor</b> sirf log karta hai. Settings neeche ki taraf cascade hoti hain: source ka action uske saare indicators aur observables par lagta hai jab tak koi indicator ya individual observable override na kare — sabse specific setting jeetti hai. Device par TID matching jaldi hoti hai, usi Security Intelligence stage mein jo aapne sec-ftd-ips mein dekha, isliye blocked observable access control rules evaluate hone se pehle hi ruk jaata hai.</p>

<pre class="code"><span class="c">! Integration → Intelligence → Sources → + (ek TAXII source)</span>
Delivery       : TAXII
URL            : taxii.cert.example/taxii2/        <span class="c">! yahan scheme nahi dikhaya</span>
Username       : nwk-soc
Collections    : active-campaigns
Action         : Monitor            <span class="c">! pehle review, Block baad mein</span>
Update Every   : 60 minutes
TTL            : 30 days
Publish        : On</pre>

<pre class="out">Integration &gt; Intelligence &gt; Sources
Name               Type       Delivery  Action   Published  Last Updated         Status
<span class="hl">CERT-Campaigns     STIX       TAXII     Monitor  Yes        2026-10-02 09:00     Completed</span>
Hunt-Team-Hashes   Flat File  Upload    Block    Yes        2026-10-01 17:42     Completed

Integration &gt; Intelligence &gt; Elements
Element   Type                     Registered   Publishing
<span class="hl">NK-FTD    Secure Firewall Threat Defense  Yes  Active</span></pre>

<div class="eg"><p><b>Worked example.</b> Hunting team 4 SHA-256 hashes ki flat file source Hunt-Team-Hashes ke roop mein action Block ke saath upload karti hai. Elements ko hashes minutes mein mil jaate hain. Hash match hone ke liye firewall ko files sach mein dekhni padti hain, isliye jo access rule traffic le jaata hai use malware cloud lookup ya block malware wali file policy chahiye (sec-ftd-ips). Uske bina hashes publish to hote hain par kabhi dikhte nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) TID se us traffic ko match karne ki ummeed jo prefilter Fastpath rule Snort ke bahar se bhej deta hai — woh kabhi inspect hi nahi hota. (2) Bina decryption ke HTTPS par poora URL observable match hone ki ummeed — decryption ke bina sirf server name dikhta hai. (3) TTL bhool jaana, jisse pichhle saal ke IPs aaj bhi block karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "TID source jodne ke baad devices use enforce karein iske liye administrator ko kya karna padega?" — kuch nahi: TID apne aap publish karta hai, Deploy nahi. Aur emergency brake yaad rakho: TID Settings mein publishing pause karna, access control policy delete karna nahi.</p></div>

<div class="scn"><h4>Woh feed jo bekaabu ho gayi</h4><p>Ek SOC ki commercial TAXII collection ne achanak ek hi poll mein 40,000 naye IPs de diye, jismein bade cloud ranges bhi the. Minutes mein users ne complain kiya ki ek collaboration suite fail ho raha hai. Engineer ne Integration → Intelligence → Settings khola aur publishing pause kar di, jisse naya data elements tak pahunchna ruk gaya jabki sab kuch stored raha. Phir usne source ko Monitor par set kiya, vendor se contact kiya, jisne parsing error confirm kiya, aur corrected collection aane ke baad publishing resume ki.</p><p><b>Seekh:</b> brake kahan hai yeh jaano. Publishing pause karna panic mein sources delete karne se tez aur safe hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao Threat Intelligence Director ek CERT ka indicator firewall tak kaise pahunchata hai."</p><p>Strong answer: Management Center mein ek source define karo — collection ke saath TAXII, ya URL ya upload se flat file — action aur TTL ke saath. TID use indicators aur observables mein parse karta hai, phir observables ko elements (managed Threat Defense devices) ko bina Deploy publish karta hai. Devices Security Intelligence stage mein traffic ko unse match karte hain, block ya monitor karte hain, aur observations report karte hain; Management Center unhe incidents mein badalta hai. Access policy prerequisite aur SHA-256 matches ke liye zaroori file policy ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sources (TAXII, URL, upload; STIX ya flat file) TID mein indicators aur observables feed karte hain.</li>
<li>Elements managed Threat Defense devices hain; observables unhe bina Deploy publish hote hain.</li>
<li>Actions Block ya Monitor hain; sabse specific setting (observable &gt; indicator &gt; source) jeetti hai.</li>
<li>Matches incidents banate hain; complex indicators pehle partially phir fully realized hote hain.</li>
<li>Pause publishing emergency brake hai; TTL purani intelligence ko bahar rakhta hai.</li>
</ul></div>
`}};export{e as default};