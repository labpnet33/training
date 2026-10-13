var e={id:`ap-profile-site-tag`,h:{en:`AP profiles, site tags and the three tags: how settings reach an AP`,hi:`AP profiles, site tags aur teen tags: settings AP tak kaise pahunchti hain`},body:{en:`
<h3>Analogy: staff badges with three colour stripes</h3>
<p>Imagine every employee badge has three coloured stripes. One stripe says which <b>services</b> the person offers (policy), one says which <b>office rules</b> apply (site) and one says which <b>working-hours settings</b> (RF) apply. A badge is only useful if all stripes point to real, complete profiles. The 9800 works with tags in exactly this way: an AP does not receive a list of settings, it receives three tag names, and each tag points to a profile that carries the real settings.</p>

<h3>The three tags and what each owns</h3>
<table class="cmp"><tr><th>Tag</th><th>Points to</th><th>Carries</th></tr>
<tr><td>Policy tag</td><td>WLAN profiles linked to policy profiles</td><td>Which SSIDs this AP broadcasts and which VLAN and policy each uses</td></tr>
<tr><td>Site tag</td><td>An AP profile (and a flex profile for FlexConnect)</td><td>AP-level behaviour: country, mode-related and join settings, management user, timers</td></tr>
<tr><td>RF tag</td><td>2.4 GHz and 5 GHz RF profiles</td><td>Power, channels, data-rate and band on or off</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Tag structure">
<rect x="260" y="10" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="30" y="100" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="127" text-anchor="middle" class="svg-ink" font-size="12">Policy tag PT-CAMPUS</text>
<rect x="245" y="100" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="12">Site tag ST-CAMPUS</text>
<rect x="460" y="100" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="127" text-anchor="middle" class="svg-ink" font-size="12">RF tag RF-CAMPUS</text>
<line x1="290" y1="54" x2="105" y2="100" stroke="#64748b"/><line x1="320" y1="54" x2="320" y2="100" stroke="#64748b"/><line x1="350" y1="54" x2="535" y2="100" stroke="#64748b"/>
<rect x="30" y="190" width="150" height="44" rx="8" fill="#fde68a"/><text x="105" y="217" text-anchor="middle" class="svg-ink" font-size="12">WLAN to policy profile</text>
<rect x="245" y="190" width="150" height="44" rx="8" fill="#fde68a"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="12">AP-PROF-US (country)</text>
<rect x="460" y="190" width="150" height="44" rx="8" fill="#fde68a"/><text x="535" y="217" text-anchor="middle" class="svg-ink" font-size="12">CAMPUS-5 RF profile</text>
<line x1="105" y1="144" x2="105" y2="190" stroke="#64748b"/><line x1="320" y1="144" x2="320" y2="190" stroke="#64748b"/><line x1="535" y1="144" x2="535" y2="190" stroke="#64748b"/>
</svg><p class="cap">Three tags per AP. In this module the site tag and its AP profile carry the country; the others come from the neighbouring modules.</p></div>
<p>If an AP has no tag of a given type, it uses the <b>default</b> tag (default-policy-tag, default-site-tag, default-rf-tag). The default policy tag has no WLANs, so the AP serves no SSID. The default site tag uses a default AP profile with default country behaviour. That is why a new AP can join and still be useless until tagged.</p>

<h3>AP profile: settings about the AP itself</h3>
<p>An <b>AP profile</b> collects settings that belong to the AP rather than to a WLAN or radio band: regulatory country, management credentials, CAPWAP timers, packet capture options and so on. It is attached to a <b>site tag</b>. In the lab, the object you must remember is the profile AP-PROF-US inside site tag ST-CAMPUS. A site tag is created empty, so it works only after you point it at a profile.</p>
<pre class="code"><span class="c">! build the AP profile and the site tag that uses it</span>
WLC1(config)# ap profile AP-PROF-US
WLC1(config-ap-profile)# country IN
WLC1(config-ap-profile)# exit
WLC1(config)# wireless tag site ST-CAMPUS
WLC1(config-site-tag)# ap-profile AP-PROF-US
WLC1(config-site-tag)# exit

<span class="c">! apply the site tag to an AP, using its Ethernet MAC address</span>
WLC1(config)# ap 0050.7966.6801
WLC1(config-ap-tag)# policy-tag PT-CAMPUS
WLC1(config-ap-tag)# site-tag ST-CAMPUS
WLC1(config-ap-tag)# exit</pre>
<p>You can also tag from privileged mode with <code>ap name AP1 site-tag ST-CAMPUS</code>, as in the earlier module (for policy and RF tags too). Remember that changing a tag on a running AP makes it reload its configuration and may flap its radios for a moment, so apply tag changes in a maintenance window in a real network.</p>

<h3>Verification</h3>
<pre class="out">WLC1# show wireless tag site summary
Number of Site Tags: 2

Site Tag Name        Description
default-site-tag     default site tag
<span class="hl">ST-CAMPUS           </span>

WLC1# show ap tag summary
AP Name   AP Mac          Site Tag Name   Policy Tag Name   RF Tag Name     Misconfigured
AP1       0050.7966.6801  ST-CAMPUS       PT-CAMPUS         default-rf-tag  No
AP2       0050.7966.6802  ST-CAMPUS       PT-CAMPUS         default-rf-tag  No</pre>
<p>Read the columns for each AP. In the country lab, both APs show ST-CAMPUS, which tells you the new AP profile is in play. The Country column of <code>show ap summary</code> then reveals what that profile says. A "Misconfigured" Yes would mean the tag points to something that no longer exists.</p>

<div class="eg"><p><b>Worked example: follow the chain.</b> LAPTOP1 sees no SSID. Step 1: show ap summary, the APs are Registered. Step 2: show ap tag summary, both APs have PT-CAMPUS (SSID mapping is fine) and ST-CAMPUS. Step 3: show wireless country configured shows IN only, and show ap summary shows country US on the APs. The break is in the object that site tag ST-CAMPUS points to: the AP profile AP-PROF-US. One <code>country IN</code> line under that profile repairs all APs which use the tag.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Editing the controller list when the AP profile is wrong. (2) Creating a site tag but never giving it an AP profile. (3) Tagging an AP with the wrong tag name (the AP then uses the tag but with empty or outdated content). (4) Assuming a change to an AP profile instantly reaches APs that use another site tag.</p></div>
<div class="exam"><p><b>Exam trap.</b> The 9800 has policy, site and RF tags. The WLAN-to-VLAN mapping lives in the policy tag; country and AP-level settings live in the AP profile referenced by the site tag; power and channels live in the RF profile referenced by the RF tag. AireOS AP groups are the older equivalent and are not used on the 9800 (older style is only in CCNA and ENCOR modules).</p></div>

<div class="scn"><h4>One line fixed forty APs</h4><p>A retailer rolled out a new site tag to 40 stores. Half of the stores lost Wi-Fi. The engineer wasted a morning on WLANs before reading the Country column: the cloned AP profile said US. Instead of 40 per-AP changes, a single edit of the profile, applied through the shared site tag, repaired all APs at once.</p><p><b>Lesson:</b> tags let one change reach many APs; a mistake in a profile also reaches many APs, so check profiles before rollout.</p></div>

<div class="iv"><p class="q">"What are the three tags on a 9800 and why do they exist?"</p><p>Policy tag maps WLANs to policy profiles, site tag points to an AP profile (and flex profile), and RF tag points to RF profiles. They separate what is served, where and how the AP behaves, and how radios behave, so each can change independently. Mention that an AP with no tag uses a default tag, and the default policy tag has no WLANs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An AP receives three tag names: policy, site and RF. Each points to a profile.</li>
<li>The site tag points to an AP profile that carries AP-level settings such as country.</li>
<li>Default tags apply when none is set; the default policy tag serves no SSID.</li>
<li>show ap tag summary shows the three tags for every AP.</li>
<li>Fix a profile once and every AP that uses its tag is repaired.</li>
</ul></div>
`,hi:`
<h3>Analogy: teen colour stripes wale staff badges</h3>
<p>Kalpana karo har employee badge par teen coloured stripes hain. Ek stripe batati hai ki person kaun si <b>services</b> offer karta hai (policy), ek batati hai kaun se <b>office rules</b> lagu hain (site) aur ek batati hai kaun si <b>working-hours settings</b> (RF) lagu hain. Badge tabhi kaam ka hai jab saari stripes asli aur poore profiles ki taraf point karein. 9800 tags ke saath bilkul aise hi kaam karta hai: AP ko settings ki list nahi milti, use teen tag names milte hain, aur har tag ek profile ki taraf point karta hai jisme asli settings hoti hain.</p>

<h3>Teen tags aur har ek kya own karta hai</h3>
<table class="cmp"><tr><th>Tag</th><th>Kiski taraf point karta hai</th><th>Kya carry karta hai</th></tr>
<tr><td>Policy tag</td><td>Policy profiles se linked WLAN profiles</td><td>Yeh AP kaun se SSIDs broadcast karta hai aur har ek ka VLAN aur policy kya hai</td></tr>
<tr><td>Site tag</td><td>Ek AP profile (aur FlexConnect ke liye flex profile)</td><td>AP-level behaviour: country, mode-related aur join settings, management user, timers</td></tr>
<tr><td>RF tag</td><td>2.4 GHz aur 5 GHz RF profiles</td><td>Power, channels, data-rate aur band on ya off</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Tag structure">
<rect x="260" y="10" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="30" y="100" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="127" text-anchor="middle" class="svg-ink" font-size="12">Policy tag PT-CAMPUS</text>
<rect x="245" y="100" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="12">Site tag ST-CAMPUS</text>
<rect x="460" y="100" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="127" text-anchor="middle" class="svg-ink" font-size="12">RF tag RF-CAMPUS</text>
<line x1="290" y1="54" x2="105" y2="100" stroke="#64748b"/><line x1="320" y1="54" x2="320" y2="100" stroke="#64748b"/><line x1="350" y1="54" x2="535" y2="100" stroke="#64748b"/>
<rect x="30" y="190" width="150" height="44" rx="8" fill="#fde68a"/><text x="105" y="217" text-anchor="middle" class="svg-ink" font-size="12">WLAN se policy profile</text>
<rect x="245" y="190" width="150" height="44" rx="8" fill="#fde68a"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="12">AP-PROF-US (country)</text>
<rect x="460" y="190" width="150" height="44" rx="8" fill="#fde68a"/><text x="535" y="217" text-anchor="middle" class="svg-ink" font-size="12">CAMPUS-5 RF profile</text>
<line x1="105" y1="144" x2="105" y2="190" stroke="#64748b"/><line x1="320" y1="144" x2="320" y2="190" stroke="#64748b"/><line x1="535" y1="144" x2="535" y2="190" stroke="#64748b"/>
</svg><p class="cap">Har AP par teen tags. Is module mein site tag aur uska AP profile country carry karte hain; baaki padosi modules se aate hain.</p></div>
<p>Agar AP ke paas kisi type ka tag nahi hai to woh <b>default</b> tag use karta hai (default-policy-tag, default-site-tag, default-rf-tag). Default policy tag mein koi WLAN nahi, isliye AP koi SSID serve nahi karta. Default site tag default AP profile use karta hai jiska country behaviour default hota hai. Isiliye naya AP join karke bhi tag hone tak bekaar rehta hai.</p>

<h3>AP profile: AP ke apne baare mein settings</h3>
<p><b>AP profile</b> woh settings jama karta hai jo AP ki hain, na ki WLAN ya radio band ki: regulatory country, management credentials, CAPWAP timers, packet capture options aadi. Yeh ek <b>site tag</b> se attach hota hai. Lab mein yaad rakhne wali cheez site tag ST-CAMPUS ke andar profile AP-PROF-US hai. Site tag empty banta hai, isliye tabhi kaam karta hai jab aap use profile ki taraf point karo.</p>
<pre class="code"><span class="c">! build the AP profile and the site tag that uses it</span>
WLC1(config)# ap profile AP-PROF-US
WLC1(config-ap-profile)# country IN
WLC1(config-ap-profile)# exit
WLC1(config)# wireless tag site ST-CAMPUS
WLC1(config-site-tag)# ap-profile AP-PROF-US
WLC1(config-site-tag)# exit

<span class="c">! apply the site tag to an AP, using its Ethernet MAC address</span>
WLC1(config)# ap 0050.7966.6801
WLC1(config-ap-tag)# policy-tag PT-CAMPUS
WLC1(config-ap-tag)# site-tag ST-CAMPUS
WLC1(config-ap-tag)# exit</pre>
<p>Aap privileged mode se bhi tag kar sakte ho <code>ap name AP1 site-tag ST-CAMPUS</code> se, jaisa pichhle module mein tha (policy aur RF tags ke liye bhi). Yaad rakho ki running AP par tag badalne se woh apni configuration reload karta hai aur radios thodi der flap kar sakte hain, isliye real network mein tag changes maintenance window mein karo.</p>

<h3>Verification</h3>
<pre class="out">WLC1# show wireless tag site summary
Number of Site Tags: 2

Site Tag Name        Description
default-site-tag     default site tag
<span class="hl">ST-CAMPUS           </span>

WLC1# show ap tag summary
AP Name   AP Mac          Site Tag Name   Policy Tag Name   RF Tag Name     Misconfigured
AP1       0050.7966.6801  ST-CAMPUS       PT-CAMPUS         default-rf-tag  No
AP2       0050.7966.6802  ST-CAMPUS       PT-CAMPUS         default-rf-tag  No</pre>
<p>Har AP ke columns padho. Country lab mein dono APs ST-CAMPUS dikhate hain, jo batata hai ki naya AP profile kaam mein hai. Phir <code>show ap summary</code> ka Country column batata hai ki woh profile kya kehta hai. "Misconfigured" Yes ka matlab tag aisi cheez ki taraf point karta hai jo ab exist nahi karti.</p>

<div class="eg"><p><b>Worked example: chain follow karo.</b> LAPTOP1 ko koi SSID nahi dikhta. Step 1: show ap summary, APs Registered hain. Step 2: show ap tag summary, dono APs ke paas PT-CAMPUS (SSID mapping theek) aur ST-CAMPUS hai. Step 3: show wireless country configured sirf IN dikhata hai, aur show ap summary APs par country US dikhata hai. Break us object mein hai jiski taraf site tag ST-CAMPUS point karta hai: AP profile AP-PROF-US. Us profile ke neeche ek <code>country IN</code> line us tag ko use karne wale saare APs ko repair kar deti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) AP profile galat ho tab controller list edit karna. (2) Site tag banana lekin use kabhi AP profile na dena. (3) AP ko galat tag name se tag karna (AP tag use karta hai lekin empty ya purane content ke saath). (4) Maan lena ki AP profile ka change turant un APs tak pahunchta hai jo doosra site tag use karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> 9800 mein policy, site aur RF tags hain. WLAN-to-VLAN mapping policy tag mein rehti hai; country aur AP-level settings site tag ke referenced AP profile mein; power aur channels RF tag ke referenced RF profile mein. AireOS AP groups purana equivalent hain aur 9800 par use nahi hote (purana style sirf CCNA aur ENCOR modules mein).</p></div>

<div class="scn"><h4>Ek line ne chalis APs fix kiye</h4><p>Ek retailer ne 40 stores mein naya site tag roll out kiya. Aadhe stores ka Wi-Fi gaya. Engineer ne subah WLANs mein barbaad ki, phir Country column padha: cloned AP profile US kehta tha. 40 per-AP changes ki jagah, shared site tag se apply hone wale profile ke ek edit ne saare APs ek saath repair kar diye.</p><p><b>Seekh:</b> tags ek change ko kai APs tak pahunchate hain; profile ki galti bhi kai APs tak pahunchti hai, isliye rollout se pehle profiles check karo.</p></div>

<div class="iv"><p class="q">"9800 par teen tags kaun se hain aur kyun hain?"</p><p>Policy tag WLANs ko policy profiles se map karta hai, site tag AP profile (aur flex profile) ki taraf point karta hai, aur RF tag RF profiles ki taraf. Yeh alag karte hain ki kya serve hota hai, AP kahan aur kaise behave karta hai, aur radios kaise behave karte hain, taaki har ek independently badal sake. Mention karo ki tag na ho to AP default tag use karta hai, aur default policy tag mein koi WLAN nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP ko teen tag names milte hain: policy, site aur RF. Har ek profile ki taraf point karta hai.</li>
<li>Site tag AP profile ki taraf point karta hai jo country jaisi AP-level settings carry karta hai.</li>
<li>Koi tag set na ho to default tags lagu hote hain; default policy tag koi SSID serve nahi karta.</li>
<li>show ap tag summary har AP ke teen tags dikhata hai.</li>
<li>Profile ek baar fix karo to uska tag use karne wala har AP repair ho jaata hai.</li>
</ul></div>
`}};export{e as default};