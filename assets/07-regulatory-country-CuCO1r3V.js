var e={id:`regulatory-country`,h:{en:`Regulatory domains and country codes: the law of the airwaves`,hi:`Regulatory domains aur country codes: airwaves ka kanoon`},body:{en:`
<h3>Analogy: speed limits differ by country</h3>
<p>A car can physically drive at 200 km/h everywhere, but each country sets a legal limit. A driver crossing a border must follow the new rules. Radio spectrum is the same. Wi-Fi radios can technically transmit on many channels and at high power, yet every country decides which channels are legal, how much power is allowed, whether radar detection is needed and whether a band may be used indoors, outdoors or both. The controller applies these rules through <b>country codes</b>.</p>

<h3>Regulatory domain versus country code</h3>
<dl class="terms">
<dt>Regulatory domain</dt><dd>A group of rules set by a regulator for a region. Cisco APs are sold in specific domains, for example an AP ordered for India carries a domain letter such as D in the part number (C9120AXI-D), while others use A, B, E, Q and so on. The domain is fixed in the AP's hardware and cannot be changed by the customer.</dd>
<dt>Country code</dt><dd>The specific country, written as a two-letter ISO code such as IN for India, US for the United States or DE for Germany. The controller applies the code to the AP to select the legal channel list and power limits.</dd>
</dl>
<p>The country you configure must be one that the AP's hardware domain supports. A US-domain AP cannot legally be set to IN, and the AP will refuse to join or will keep its radios off. In real purchases, always order APs for the correct regulatory domain.</p>

<h3>What the country actually controls</h3>
<ul>
<li><b>Allowed channels</b> in 2.4 GHz and 5 GHz (for example 2.4 GHz channels 1 to 13 in India and in much of the world, but 1 to 11 in the US).</li>
<li><b>Maximum transmit power</b> per channel (EIRP limits).</li>
<li><b>DFS (dynamic frequency selection):</b> some 5 GHz channels are shared with radar. APs must listen for radar and move off the channel if they hear it. This is why DFS channels may take a minute to start.</li>
<li><b>Indoor or outdoor</b> permission for each band.</li>
</ul>
<p>If an AP has no valid country, it has no legal channel list and therefore <b>keeps its radios off</b>. This is a safety design, not a bug.</p>

<h3>Where the country is configured on a 9800-style controller</h3>
<p>There are two places. The controller has a list of <b>allowed countries</b> (it can run APs in several countries at once, for example a global company), and each AP gets a country through its <b>AP profile</b>, linked via the site tag. The effective country of an AP is the one in its AP profile, else the controller default.</p>
<pre class="code"><span class="c">! controller-wide list of allowed countries</span>
WLC1(config)# wireless country IN

<span class="c">! per AP group country, through the AP profile</span>
WLC1(config)# ap profile AP-PROF-US
WLC1(config-ap-profile)# country IN
WLC1(config-ap-profile)# exit</pre>
<pre class="out">WLC1# show wireless country configured
Configured Country............................: IN - India
Configured Country Codes
 IN  - India                    802.11a Indoor/ 802.11b Indoor/ 802.11g Indoor</pre>
<p>The lab rule is simple and realistic: a radio stays off if the AP's country is not in the controller's allowed list. In <code>wl-country-profile</code> the controller allows only IN, but the AP profile AP-PROF-US says US, so both APs register (the join worked) and then keep their radios off. Reading <code>show ap summary</code> lets you compare the Country column with the allowed list.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Country decision">
<rect x="20" y="30" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="12">Controller allowed list</text><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="12">IN</text>
<rect x="250" y="30" width="150" height="50" rx="8" fill="#fde68a"/><text x="325" y="52" text-anchor="middle" class="svg-ink" font-size="12">AP profile country</text><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="12">US (wrong)</text>
<rect x="470" y="30" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="12">AP radios</text><text x="545" y="68" text-anchor="middle" class="svg-ink" font-size="12">OFF</text>
<line x1="170" y1="55" x2="250" y2="55" stroke="#64748b"/><line x1="400" y1="55" x2="470" y2="55" stroke="#64748b"/>
<text x="210" y="45" text-anchor="middle" class="svg-muted" font-size="12">no match</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Fix: ap profile AP-PROF-US, then country IN</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Do not widen the regulatory list: the business is in India only</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">AP joined, controller healthy, radios silent by design</text>
</svg><p class="cap">The AP is registered, yet radios stay off: the country of the AP must match the legal list.</p></div>

<div class="eg"><p><b>Worked example.</b> A company in Mumbai runs 40 APs. The controller allows only IN. An engineer copies an AP profile template from an American site, with country US, and applies it through the site tag ST-CAMPUS. Result: 40 APs registered, 0 SSIDs visible. The right fix is to correct the AP profile to IN. Adding US to the allowed list would hide the problem and also put the company in breach of local rules.</p></div>

<h3>Why not simply allow every country?</h3>
<p>Legally the operator is responsible for transmitting only as the local regulator allows. Using another country's rules in India could exceed the permitted power or use restricted channels, interfering with other services. Keep the allowed list to the countries you really operate in. A short list also prevents accidental mistakes like this one.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing the controller's allowed list to match a wrong AP profile instead of correcting the profile. (2) Copying AP profile templates between countries without reading the country line. (3) Ordering APs of a different regulatory domain. (4) Expecting radios to turn on instantly on DFS channels.</p></div>
<div class="exam"><p><b>Exam trap.</b> Regulatory domain is hardware; country code is configuration inside the domain. Country decides channels, power and DFS rules. An AP with an unsupported country will not serve clients; the controller remains healthy. Real 9800 order of effect: AP profile country, then controller default.</p></div>

<div class="scn"><h4>Radios off after a rollout</h4><p>After a site-tag rollout the Mumbai office saw all APs as Registered but staff reported no Wi-Fi. The engineer opened <code>show ap summary</code> and saw the Country column read US, while <code>show wireless country configured</code> listed only IN. The AP profile in the new site tag held the old template value. One line in the AP profile restored the radios. The allowed list was never touched.</p><p><b>Lesson:</b> compare the country on the AP and on the controller before touching WLANs.</p></div>

<div class="iv"><p class="q">"What is the difference between a regulatory domain and a country code?"</p><p>The regulatory domain is the hardware class of the AP, fixed at manufacture for a region. The country code is the configured country that selects legal channels, power and DFS rules, and must be allowed by both the AP's domain and the controller list. If it is wrong, the AP joins but keeps its radios off.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every country sets its own legal channels, power and DFS rules.</li>
<li>Regulatory domain is fixed in AP hardware; country code is configuration.</li>
<li>The controller keeps an allowed list; the AP profile gives each AP its country.</li>
<li>A country mismatch means registered APs with radios off.</li>
<li>Repair the AP profile, never widen the legal list to hide a mistake.</li>
</ul></div>
`,hi:`
<h3>Analogy: har desh ki speed limit alag hoti hai</h3>
<p>Gaadi physically har jagah 200 km/h chal sakti hai, lekin har desh legal limit set karta hai. Border cross karne wale driver ko naye rules follow karne padte hain. Radio spectrum bhi aisa hi hai. Wi-Fi radios technically kai channels par aur high power par transmit kar sakte hain, phir bhi har desh decide karta hai ki kaun se channels legal hain, kitni power allowed hai, radar detection chahiye ya nahi aur band indoor, outdoor ya dono mein use ho sakta hai. Controller yeh rules <b>country codes</b> ke zariye apply karta hai.</p>

<h3>Regulatory domain versus country code</h3>
<dl class="terms">
<dt>Regulatory domain</dt><dd>Regulator ne region ke liye jo rules set kiye unka group. Cisco APs specific domains ke liye bechte hain, jaise India ke liye order kiye AP ke part number mein D jaisa domain letter hota hai (C9120AXI-D), baaki A, B, E, Q aadi use karte hain. Domain AP ke hardware mein fixed hai aur customer use badal nahi sakta.</dd>
<dt>Country code</dt><dd>Specific country, do-letter ISO code mein, jaise India ke liye IN, United States ke liye US, Germany ke liye DE. Controller code ko AP par apply karke legal channel list aur power limits chunta hai.</dd>
</dl>
<p>Aapka configure kiya hua country woh hona chahiye jise AP ka hardware domain support kare. US-domain AP ko legally IN set nahi kar sakte, aur AP join se mana kar dega ya radios off rakhega. Real purchases mein hamesha sahi regulatory domain ke APs order karo.</p>

<h3>Country asal mein kya control karta hai</h3>
<ul>
<li>2.4 GHz aur 5 GHz mein <b>allowed channels</b> (jaise India mein aur duniya ke zyadatar hisse mein 2.4 GHz channels 1 se 13, lekin US mein 1 se 11).</li>
<li>Har channel ki <b>maximum transmit power</b> (EIRP limits).</li>
<li><b>DFS (dynamic frequency selection):</b> kuch 5 GHz channels radar ke saath shared hain. APs ko radar sunna padta hai aur sunne par channel chhodna padta hai. Isiliye DFS channels ko start hone mein ek minute lag sakta hai.</li>
<li>Har band ke liye <b>indoor ya outdoor</b> permission.</li>
</ul>
<p>Agar AP ke paas valid country nahi hai, to uske paas legal channel list nahi hai aur isliye woh <b>radios off rakhta hai</b>. Yeh safety design hai, bug nahi.</p>

<h3>9800-style controller par country kahan configure hoti hai</h3>
<p>Do jagahein hain. Controller ke paas <b>allowed countries</b> ki list hoti hai (woh kai countries ke APs ek saath chala sakta hai, jaise global company), aur har AP ko apni country <b>AP profile</b> se milti hai, jo site tag se link hoti hai. AP ki effective country AP profile wali hai, nahi to controller default.</p>
<pre class="code"><span class="c">! controller-wide list of allowed countries</span>
WLC1(config)# wireless country IN

<span class="c">! per AP group country, through the AP profile</span>
WLC1(config)# ap profile AP-PROF-US
WLC1(config-ap-profile)# country IN
WLC1(config-ap-profile)# exit</pre>
<pre class="out">WLC1# show wireless country configured
Configured Country............................: IN - India
Configured Country Codes
 IN  - India                    802.11a Indoor/ 802.11b Indoor/ 802.11g Indoor</pre>
<p>Lab rule simple aur realistic hai: radio tab off rehta hai jab AP ki country controller ki allowed list mein na ho. <code>wl-country-profile</code> mein controller sirf IN allow karta hai, lekin AP profile AP-PROF-US US kehta hai, isliye dono APs register hote hain (join chal gaya) aur phir radios off rakhte hain. <code>show ap summary</code> padhkar aap Country column ko allowed list se compare kar sakte ho.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Country decision">
<rect x="20" y="30" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="12">Controller allowed list</text><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="12">IN</text>
<rect x="250" y="30" width="150" height="50" rx="8" fill="#fde68a"/><text x="325" y="52" text-anchor="middle" class="svg-ink" font-size="12">AP profile country</text><text x="325" y="68" text-anchor="middle" class="svg-ink" font-size="12">US (galat)</text>
<rect x="470" y="30" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="12">AP radios</text><text x="545" y="68" text-anchor="middle" class="svg-ink" font-size="12">OFF</text>
<line x1="170" y1="55" x2="250" y2="55" stroke="#64748b"/><line x1="400" y1="55" x2="470" y2="55" stroke="#64748b"/>
<text x="210" y="45" text-anchor="middle" class="svg-muted" font-size="12">match nahi</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Fix: ap profile AP-PROF-US, phir country IN</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Regulatory list widen mat karo: business sirf India mein hai</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">AP joined, controller healthy, radios design ke hisaab se chup</text>
</svg><p class="cap">AP registered hai, phir bhi radios off: AP ki country legal list se match honi chahiye.</p></div>

<div class="eg"><p><b>Worked example.</b> Mumbai ki ek company 40 APs chalati hai. Controller sirf IN allow karta hai. Engineer ek American site se AP profile template copy karta hai, country US, aur use site tag ST-CAMPUS se apply karta hai. Result: 40 APs registered, 0 SSIDs visible. Sahi fix AP profile ko IN karna hai. Allowed list mein US add karne se problem chhup jaati aur company local rules ka ulanghan bhi karti.</p></div>

<h3>Har country allow kyun nahi kar dete?</h3>
<p>Legally operator zimmedaar hai ki woh sirf wahi transmit kare jo local regulator allow karta hai. India mein kisi aur desh ke rules use karne se permitted power exceed ho sakti hai ya restricted channels use ho sakte hain, jo doosri services mein interference karte hain. Allowed list ko un countries tak rakho jahan aap sach mein operate karte ho. Chhoti list is jaisi accidental galtiyon se bhi bachati hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Galat AP profile ke hisaab se controller ki allowed list badalna, profile sahi karne ki jagah. (2) Country line padhe bina countries ke beech AP profile templates copy karna. (3) Alag regulatory domain ke APs order karna. (4) DFS channels par radios ke turant on hone ki ummeed rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Regulatory domain hardware hai; country code domain ke andar configuration hai. Country channels, power aur DFS rules decide karti hai. Unsupported country wala AP clients serve nahi karta; controller healthy rehta hai. Real 9800 mein asar ka order: AP profile country, phir controller default.</p></div>

<div class="scn"><h4>Rollout ke baad radios off</h4><p>Site-tag rollout ke baad Mumbai office mein saare APs Registered dikhe lekin staff ne kaha Wi-Fi nahi hai. Engineer ne <code>show ap summary</code> kholi aur Country column mein US dekha, jabki <code>show wireless country configured</code> mein sirf IN tha. Naye site tag ke AP profile mein purane template ki value thi. AP profile ki ek line ne radios wapas kar diye. Allowed list ko kabhi chhua hi nahi.</p><p><b>Seekh:</b> WLANs ko chhune se pehle AP aur controller par country compare karo.</p></div>

<div class="iv"><p class="q">"Regulatory domain aur country code mein kya difference hai?"</p><p>Regulatory domain AP ka hardware class hai, region ke liye manufacture par fixed. Country code configured country hai jo legal channels, power aur DFS rules chunta hai, aur AP ke domain aur controller list dono se allowed hona chahiye. Galat ho to AP join karta hai lekin radios off rakhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har desh apne legal channels, power aur DFS rules set karta hai.</li>
<li>Regulatory domain AP hardware mein fixed hai; country code configuration hai.</li>
<li>Controller allowed list rakhta hai; AP profile har AP ko uski country deta hai.</li>
<li>Country mismatch ka matlab registered APs lekin radios off.</li>
<li>AP profile repair karo, galti chhupane ke liye legal list widen mat karo.</li>
</ul></div>
`}};export{e as default};