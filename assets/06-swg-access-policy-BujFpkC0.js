var e={id:`swg-policy`,h:{en:`Secure web gateway and the access policy: internet rules, security profiles and decryption`,hi:`Secure web gateway aur access policy: internet rules, security profiles aur decryption`},body:{en:`
<p>A building's reception desk has a printed list of rules on the counter, read from top to bottom. "Delivery staff: ground floor only." "Visitors for Finance: sign in, then lift 3." "Everyone else: wait here." The receptionist stops at the <b>first line that fits</b> the visitor. The Secure Access <b>access policy</b> works exactly like that list, and the <b>secure web gateway (SWG)</b> is the receptionist for web traffic.</p>

<h3>What the SWG adds to DNS security</h3>
<p>The SWG is a full forward proxy in the cloud. Where DNS sees only a name, the SWG sees the <b>whole request</b>: URL path, application, file being downloaded or uploaded, and (after decryption) the content. That allows URL categories per path, application controls, file inspection and sandboxing, tenant controls, DLP and AI guardrails, plus friendly block and warn pages.</p>

<h3>One access policy, two rule sets</h3>
<p>Open <b>Secure, Access Policy</b>. The page has two tabs, <b>Internet access</b> and <b>Private access</b>, and states the most important rule of all: <b>rules are evaluated top-down; the first match wins</b>. Global destination lists (Global Allow List and Global Block List) are checked before the internet rules.</p>
<p>An internet access rule has:</p>
<ul>
<li><b>From (sources)</b>: Any, All roaming computers, groups, users or network tunnel groups.</li>
<li><b>To (destinations)</b>: Any, content categories (Gambling, Social Networking, SaaS and B2B, Cloud Storage, Generative AI...), applications (SalesFlow CRM, ChatAI, Cloudbox...) or destination lists.</li>
<li><b>Action</b>: <b>Allow</b>, <b>Warn</b> (a caution page the user may click through; logged as Warned, then Proceeded), or <b>Block</b>. The real product also offers <b>Isolate</b> with remote browser isolation.</li>
<li><b>Security profile</b> for Allow and Warn rules, an optional <b>tenant control</b>, and a <b>Position</b>: Bottom (above default) or Top (rule 1).</li>
</ul>
<p>Below all rules sits <b>Default Internet Access</b>, Allow with the Default Security Profile in the lab. Whatever matches no rule lands there.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Rule evaluation order">
<rect x="10" y="10" width="300" height="34" rx="6" fill="#e2e8f0"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="12">Global Allow List / Global Block List</text>
<rect x="10" y="54" width="300" height="34" rx="6" fill="#bbf7d0"/><text x="160" y="76" text-anchor="middle" class="svg-ink" font-size="12">1 Allow Sales CRM (Sales, CRM)</text>
<rect x="10" y="98" width="300" height="34" rx="6" fill="#fed7aa"/><text x="160" y="120" text-anchor="middle" class="svg-ink" font-size="12">2 Legacy - Block SaaS (Any, SaaS)</text>
<rect x="10" y="142" width="300" height="34" rx="6" fill="#fed7aa"/><text x="160" y="164" text-anchor="middle" class="svg-ink" font-size="12">3 Block Gambling  4 Warn Social</text>
<rect x="10" y="186" width="300" height="34" rx="6" fill="#bae6fd"/><text x="160" y="208" text-anchor="middle" class="svg-ink" font-size="12">Default Internet Access (Allow)</text>
<line x1="330" y1="20" x2="330" y2="210" stroke="#64748b" stroke-width="2"/><polygon points="324,205 336,205 330,218" fill="#64748b"/>
<rect x="360" y="60" width="270" height="140" rx="8" fill="#ddd6fe"/><text x="495" y="85" text-anchor="middle" class="svg-ink" font-size="12">Inside an Allow or Warn match:</text><text x="495" y="108" text-anchor="middle" class="svg-muted" font-size="12">1. security categories block?</text><text x="495" y="128" text-anchor="middle" class="svg-muted" font-size="12">2. warn page shown?</text><text x="495" y="148" text-anchor="middle" class="svg-muted" font-size="12">3. tenant, file, DLP, AI checks</text><text x="495" y="168" text-anchor="middle" class="svg-muted" font-size="12">(need decryption for HTTPS)</text>
</svg><p class="cap">Top-down, first match wins. An Allow rule still blocks threats through its security profile.</p></div>

<h3>Security profiles and decryption</h3>
<p><b>Secure, Security Profiles</b> holds reusable profiles. Each has <b>Security categories (block)</b> toggles, <b>Decryption</b> ("Inspect HTTPS with the Secure Access root CA. Needed for DLP, file inspection, tenant controls and AI guardrails"), <b>File inspection</b> (scan downloads with Secure Endpoint and sandboxing) and a <b>Used by</b> list. Block rules do not use a profile: there is nothing to inspect.</p>
<p>More than 90% of web traffic is HTTPS. Without decryption the SWG sees only the server name (SNI), which is enough for domain, category and application blocking but <b>not</b> for anything that needs the content. Decryption requires the Secure Access root certificate to be trusted on endpoints (pushed with Secure Client, group policy or MDM). Exclude privacy-sensitive categories such as banking and health, and certificate-pinned applications, with a Do Not Decrypt list.</p>

<h3>Lab walk-through: Secure Internet Access</h3>
<p>The proof of concept left two traps: a rule <b>Legacy - Block SaaS</b> (Any, SaaS and B2B, Block) and a Default Security Profile with Malware, Phishing and Command and Control switched off.</p>
<ol>
<li><b>Add rule</b> "Block Gambling": From Any, To content category Gambling, Action Block.</li>
<li>In <b>Security Profiles, Default Security Profile</b>, switch Malware, Phishing and Command and Control back on. Now free-codec-update.example, secure-login-micros0ft.example and k7x2qvz9lm.example are blocked for every Allow and Warn rule using the profile.</li>
<li><b>Add rule</b> "Warn Social": Any, Social Networking, Warn.</li>
<li><b>Add rule</b> "Allow Sales CRM": From group Sales, To application SalesFlow CRM, Allow. Because the CRM is in the SaaS and B2B category, rule "Legacy - Block SaaS" would match first. Use Position Top, or the Up arrow, so the new rule sits above it.</li>
</ol>
<pre class="out">PC-BR1&gt; curl royal-casino.example
&lt;h1&gt;This site is blocked&lt;/h1&gt;&lt;p&gt;&lt;b&gt;royal-casino.example&lt;/b&gt;&lt;/p&gt;
&lt;p&gt;Access to this site is blocked by the Network Kings acceptable use policy.&lt;/p&gt;
&lt;p&gt;Reason: Content Category: Gambling · <span class="hl">Rule: Block Gambling</span>&lt;/p&gt;
&lt;p&gt;Identity: BRANCH-DEL · Request ID 5c1e09a2&lt;/p&gt;

PC-BR1&gt; curl friendbook.example
&lt;h1&gt;<span class="hl">Proceed with caution</span>&lt;/h1&gt;&lt;p&gt;&lt;b&gt;friendbook.example&lt;/b&gt; (Social Networking) is allowed for business use only. Activity is logged.&lt;/p&gt;
&lt;p&gt;Rule: Warn Social&lt;/p&gt;

ROAM1&gt; curl crm.salesflow.example
&lt;h1&gt;<span class="hl">SalesFlow CRM · Sign in</span>&lt;/h1&gt;</pre>
<p>In <b>Monitor, Activity Search</b> the royal-casino.example event shows identity BRANCH-DEL, action Blocked and rule <b>Block Gambling</b>, the answer to the lab question. The CRM event shows vikram.singh@nwkings.example, Allowed, rule Allow Sales CRM. The same CRM request from PC-BR1 is still blocked by the legacy rule, because the branch identity is the tunnel group, not group Sales.</p>

<div class="eg"><p><b>Worked example: which rule wins?</b> Rules in order: 1 Allow Sales CRM (group Sales, app SalesFlow CRM), 2 Legacy - Block SaaS (Any, SaaS and B2B), 3 Block Gambling, 4 Warn Social, default Allow. Vikram (Sales) to the CRM: rule 1, Allow. PC-BR1 to the CRM: rule 1 does not match (not Sales), rule 2 matches, Block. Vikram to friendbook.example: rules 1 to 3 do not match, rule 4, Warn. Anyone to news.daily.example: default, Allow with the Default Security Profile.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adding an exception at the bottom, below the broad block it should override. Turning off security categories "temporarily" in the default profile during a test and forgetting them. Expecting DLP or file inspection to work on HTTPS with decryption off.</p></div>

<div class="exam"><p><b>Exam traps.</b> First match wins, not most specific. Warn is logged and the user may continue; Block is final. Security categories apply even under an Allow rule. Without decryption: category and domain blocking work; DLP, file inspection, tenant controls and AI prompt inspection do not.</p></div>

<div class="scn"><h4>Sales cannot open the CRM</h4><p>After a new rule "Allow Sales CRM" was added, Sales users still got a block page. Activity Search showed the blocking rule as "Legacy - Block SaaS", rule 1, while the new rule sat at position 2. The engineer moved the exception above the broad block with the Up arrow, and the next request from vikram.singh@nwkings.example was Allowed by Allow Sales CRM.</p><p><b>Lesson:</b> when a rule seems ignored, read the Rule column in Activity Search; it names the rule that really matched.</p></div>

<div class="iv"><p class="q">"Your security team wants DLP on uploads, but the web proxy only sees domains. What is missing and what are the trade-offs?"</p><p>Strong answer: HTTPS decryption. Enable it in the security profile used by the matching rule, distribute the Secure Access root CA to endpoints, and exclude privacy-sensitive categories and certificate-pinned apps. Without it you still have DNS, domain, category and app controls, but no content inspection. Mention user privacy notice and performance testing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The SWG is a cloud proxy that sees full requests, files and (decrypted) content.</li>
<li>Internet rules: sources, destinations, action Allow, Warn or Block (Isolate with RBI), top-down, first match wins.</li>
<li>Allow and Warn rules attach a security profile with security categories, decryption and file inspection.</li>
<li>Decryption is required for DLP, file inspection, tenant controls and AI guardrails.</li>
<li>Activity Search's Rule column shows which rule really decided.</li>
</ul></div>
`,hi:`
<p>Building ke reception desk par counter par rules ki ek printed list hoti hai, upar se neeche padhi jaati hai. "Delivery staff: sirf ground floor." "Finance ke visitors: sign in karo, phir lift 3." "Baaki sab: yahan wait karo." Receptionist visitor par fit hone wali <b>pehli line</b> par ruk jaata hai. Secure Access ki <b>access policy</b> bilkul usi list ki tarah kaam karti hai, aur <b>secure web gateway (SWG)</b> web traffic ka receptionist hai.</p>

<h3>SWG DNS security mein kya jodta hai</h3>
<p>SWG cloud mein ek poora forward proxy hai. Jahan DNS sirf naam dekhta hai, SWG <b>poori request</b> dekhta hai: URL path, application, download ya upload ho rahi file, aur (decryption ke baad) content. Isse per-path URL categories, application controls, file inspection aur sandboxing, tenant controls, DLP aur AI guardrails, aur friendly block aur warn pages possible hote hain.</p>

<h3>Ek access policy, do rule sets</h3>
<p><b>Secure, Access Policy</b> kholo. Page par do tabs hain, <b>Internet access</b> aur <b>Private access</b>, aur sabse important rule likha hai: <b>rules top-down evaluate hote hain; first match wins</b>. Global destination lists (Global Allow List aur Global Block List) internet rules se pehle check hoti hain.</p>
<p>Internet access rule mein hota hai:</p>
<ul>
<li><b>From (sources)</b>: Any, All roaming computers, groups, users ya network tunnel groups.</li>
<li><b>To (destinations)</b>: Any, content categories (Gambling, Social Networking, SaaS and B2B, Cloud Storage, Generative AI...), applications (SalesFlow CRM, ChatAI, Cloudbox...) ya destination lists.</li>
<li><b>Action</b>: <b>Allow</b>, <b>Warn</b> (caution page jise user click karke aage badh sakta hai; Warned aur phir Proceeded ki tarah log hota hai), ya <b>Block</b>. Real product mein remote browser isolation ke saath <b>Isolate</b> bhi hai.</li>
<li>Allow aur Warn rules ke liye <b>Security profile</b>, optional <b>tenant control</b>, aur <b>Position</b>: Bottom (above default) ya Top (rule 1).</li>
</ul>
<p>Saare rules ke neeche <b>Default Internet Access</b> hai, lab mein Default Security Profile ke saath Allow. Jo kisi rule se match nahi karta woh yahan aata hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Rule evaluation order">
<rect x="10" y="10" width="300" height="34" rx="6" fill="#e2e8f0"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="12">Global Allow List / Global Block List</text>
<rect x="10" y="54" width="300" height="34" rx="6" fill="#bbf7d0"/><text x="160" y="76" text-anchor="middle" class="svg-ink" font-size="12">1 Allow Sales CRM (Sales, CRM)</text>
<rect x="10" y="98" width="300" height="34" rx="6" fill="#fed7aa"/><text x="160" y="120" text-anchor="middle" class="svg-ink" font-size="12">2 Legacy - Block SaaS (Any, SaaS)</text>
<rect x="10" y="142" width="300" height="34" rx="6" fill="#fed7aa"/><text x="160" y="164" text-anchor="middle" class="svg-ink" font-size="12">3 Block Gambling  4 Warn Social</text>
<rect x="10" y="186" width="300" height="34" rx="6" fill="#bae6fd"/><text x="160" y="208" text-anchor="middle" class="svg-ink" font-size="12">Default Internet Access (Allow)</text>
<line x1="330" y1="20" x2="330" y2="210" stroke="#64748b" stroke-width="2"/><polygon points="324,205 336,205 330,218" fill="#64748b"/>
<rect x="360" y="60" width="270" height="140" rx="8" fill="#ddd6fe"/><text x="495" y="85" text-anchor="middle" class="svg-ink" font-size="12">Allow ya Warn match ke andar:</text><text x="495" y="108" text-anchor="middle" class="svg-muted" font-size="12">1. security categories block?</text><text x="495" y="128" text-anchor="middle" class="svg-muted" font-size="12">2. warn page dikhaya?</text><text x="495" y="148" text-anchor="middle" class="svg-muted" font-size="12">3. tenant, file, DLP, AI checks</text><text x="495" y="168" text-anchor="middle" class="svg-muted" font-size="12">(HTTPS ke liye decryption chahiye)</text>
</svg><p class="cap">Top-down, first match wins. Allow rule bhi apne security profile se threats block karta hai.</p></div>

<h3>Security profiles aur decryption</h3>
<p><b>Secure, Security Profiles</b> mein reusable profiles hain. Har ek mein <b>Security categories (block)</b> toggles, <b>Decryption</b> ("Inspect HTTPS with the Secure Access root CA. Needed for DLP, file inspection, tenant controls and AI guardrails"), <b>File inspection</b> (Secure Endpoint aur sandboxing se downloads scan) aur <b>Used by</b> list hoti hai. Block rules profile use nahi karte: inspect karne ko kuch hai hi nahi.</p>
<p>90% se zyada web traffic HTTPS hai. Decryption ke bina SWG sirf server name (SNI) dekhta hai, jo domain, category aur application blocking ke liye kaafi hai par content chahiye wali kisi cheez ke liye <b>nahi</b>. Decryption ke liye Secure Access root certificate endpoints par trusted hona chahiye (Secure Client, group policy ya MDM se push). Banking aur health jaisi privacy-sensitive categories, aur certificate-pinned applications ko Do Not Decrypt list se exclude karo.</p>

<h3>Lab walk-through: Secure Internet Access</h3>
<p>Proof of concept ne do traps chhode: ek rule <b>Legacy - Block SaaS</b> (Any, SaaS and B2B, Block) aur ek Default Security Profile jismein Malware, Phishing aur Command and Control off the.</p>
<ol>
<li><b>Add rule</b> "Block Gambling": From Any, To content category Gambling, Action Block.</li>
<li><b>Security Profiles, Default Security Profile</b> mein Malware, Phishing aur Command and Control wapas on karo. Ab profile use karne wale har Allow aur Warn rule ke liye free-codec-update.example, secure-login-micros0ft.example aur k7x2qvz9lm.example blocked hain.</li>
<li><b>Add rule</b> "Warn Social": Any, Social Networking, Warn.</li>
<li><b>Add rule</b> "Allow Sales CRM": From group Sales, To application SalesFlow CRM, Allow. Kyunki CRM SaaS and B2B category mein hai, rule "Legacy - Block SaaS" pehle match karega. Position Top, ya Up arrow use karo, taaki naya rule uske upar baithe.</li>
</ol>
<pre class="out">PC-BR1&gt; curl royal-casino.example
&lt;h1&gt;This site is blocked&lt;/h1&gt;&lt;p&gt;&lt;b&gt;royal-casino.example&lt;/b&gt;&lt;/p&gt;
&lt;p&gt;Access to this site is blocked by the Network Kings acceptable use policy.&lt;/p&gt;
&lt;p&gt;Reason: Content Category: Gambling · <span class="hl">Rule: Block Gambling</span>&lt;/p&gt;
&lt;p&gt;Identity: BRANCH-DEL · Request ID 5c1e09a2&lt;/p&gt;

PC-BR1&gt; curl friendbook.example
&lt;h1&gt;<span class="hl">Proceed with caution</span>&lt;/h1&gt;&lt;p&gt;&lt;b&gt;friendbook.example&lt;/b&gt; (Social Networking) is allowed for business use only. Activity is logged.&lt;/p&gt;
&lt;p&gt;Rule: Warn Social&lt;/p&gt;

ROAM1&gt; curl crm.salesflow.example
&lt;h1&gt;<span class="hl">SalesFlow CRM · Sign in</span>&lt;/h1&gt;</pre>
<p><b>Monitor, Activity Search</b> mein royal-casino.example event identity BRANCH-DEL, action Blocked aur rule <b>Block Gambling</b> dikhata hai, yahi lab question ka jawab hai. CRM event vikram.singh@nwkings.example, Allowed, rule Allow Sales CRM dikhata hai. PC-BR1 se wahi CRM request ab bhi legacy rule se blocked hai, kyunki branch ki identity tunnel group hai, group Sales nahi.</p>

<div class="eg"><p><b>Worked example: kaunsa rule jeetega?</b> Rules order mein: 1 Allow Sales CRM (group Sales, app SalesFlow CRM), 2 Legacy - Block SaaS (Any, SaaS and B2B), 3 Block Gambling, 4 Warn Social, default Allow. Vikram (Sales) se CRM: rule 1, Allow. PC-BR1 se CRM: rule 1 match nahi (Sales nahi), rule 2 match, Block. Vikram se friendbook.example: rules 1 se 3 match nahi, rule 4, Warn. Koi bhi se news.daily.example: default, Default Security Profile ke saath Allow.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Exception ko bottom par jodna, us broad block ke neeche jise use override karna tha. Test ke dauraan default profile mein security categories "temporarily" off karke bhool jaana. Decryption off hote hue HTTPS par DLP ya file inspection kaam karne ki ummeed karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> First match wins, most specific nahi. Warn log hota hai aur user aage badh sakta hai; Block final hai. Security categories Allow rule ke neeche bhi lagti hain. Decryption ke bina: category aur domain blocking kaam karti hai; DLP, file inspection, tenant controls aur AI prompt inspection nahi.</p></div>

<div class="scn"><h4>Sales CRM nahi khol pa raha</h4><p>Naya rule "Allow Sales CRM" jodne ke baad bhi Sales users ko block page mil raha tha. Activity Search ne blocking rule "Legacy - Block SaaS" dikhaya, rule 1, jabki naya rule position 2 par tha. Engineer ne Up arrow se exception ko broad block ke upar kiya, aur vikram.singh@nwkings.example ki agli request Allow Sales CRM se Allowed hui.</p><p><b>Seekh:</b> jab koi rule ignore hota lage, Activity Search ka Rule column padho; woh us rule ka naam batata hai jo sach mein match hua.</p></div>

<div class="iv"><p class="q">"Aapki security team uploads par DLP chahti hai, par web proxy sirf domains dekhta hai. Kya missing hai aur trade-offs kya hain?"</p><p>Strong answer: HTTPS decryption. Matching rule ke security profile mein ise enable karo, Secure Access root CA endpoints par distribute karo, aur privacy-sensitive categories aur certificate-pinned apps exclude karo. Iske bina aapke paas DNS, domain, category aur app controls rehte hain, par content inspection nahi. User privacy notice aur performance testing bhi mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SWG ek cloud proxy hai jo poori requests, files aur (decrypted) content dekhta hai.</li>
<li>Internet rules: sources, destinations, action Allow, Warn ya Block (RBI ke saath Isolate), top-down, first match wins.</li>
<li>Allow aur Warn rules security categories, decryption aur file inspection wala security profile jodte hain.</li>
<li>DLP, file inspection, tenant controls aur AI guardrails ke liye decryption zaroori hai.</li>
<li>Activity Search ka Rule column dikhata hai ki asal mein kis rule ne decide kiya.</li>
</ul></div>
`}};export{e as default};