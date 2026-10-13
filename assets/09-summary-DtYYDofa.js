var e={id:`summary`,h:{en:`Summary and exam checklist: PAN-OS SD-WAN and Prisma SD-WAN`,hi:`Summary aur exam checklist: PAN-OS SD-WAN aur Prisma SD-WAN`},body:{en:`
<p>This chapter closes the module. Read it before a practice test, tick the checklist honestly, and go back to the chapter of any item you cannot explain aloud.</p>
<h3>The module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="PAN-OS SD-WAN object chain">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="50" text-anchor="middle" class="svg-ink" font-size="12">Link tag</text>
<rect x="135" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="195" y="42" text-anchor="middle" class="svg-ink" font-size="12">Interface</text><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<rect x="270" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="50" text-anchor="middle" class="svg-ink" font-size="12">sdwan.1</text>
<rect x="395" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="12">Quality</text><text x="450" y="58" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<rect x="520" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="42" text-anchor="middle" class="svg-ink" font-size="12">Distribution</text><text x="575" y="58" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<line x1="120" y1="45" x2="135" y2="45" stroke="#64748b" stroke-width="2"/><line x1="255" y1="45" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="45" x2="395" y2="45" stroke="#64748b" stroke-width="2"/><line x1="505" y1="45" x2="520" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="135" y="120" width="370" height="50" rx="8" fill="#fed7aa"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN policy rule (zones, applications, profiles)</text>
<rect x="135" y="190" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="220" y="215" text-anchor="middle" class="svg-ink" font-size="12">VPN cluster, Auto VPN</text>
<rect x="335" y="190" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="420" y="215" text-anchor="middle" class="svg-ink" font-size="12">Panorama + plugin</text>
<line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-dasharray="4"/>
</svg><p class="cap">Tags and profiles feed the policy rule; clusters build the tunnels; Panorama manages it all.</p></div>
<h3>Exam checklist</h3>
<ul>
<li>I can name the two Palo Alto SD-WAN products and place each term in the right one.</li>
<li>I can describe hub and branch roles, topologies (hub-spoke, mesh, DIA, Prisma Access hub) and the plugin versions the documentation ties to them.</li>
<li>I know that Advanced SD-WAN licensing is required for NGFW, and the limits: same virtual router, no multi-VSYS.</li>
<li>I can explain link tags (one per link), SD-WAN interface profiles (tag, link type, speeds, monitoring) and the virtual SD-WAN interface.</li>
<li>I can state path quality profile parameters, defaults (latency 100 ms, jitter 100 ms, loss 1 percent, bandwidth 100 percent), the OR behaviour and the evaluation order.</li>
<li>I can compare Best Available Path, Top Down Priority and Weighted Session Distribution, including the brownout difference.</li>
<li>I can describe SD-WAN policy rule fields, the SaaS quality profile and error correction limits (MTU 1,340, no DIA, one application per rule, encoder-side).</li>
<li>I can describe VPN clusters: hub-spoke and mesh, four hubs, 20 pool ranges, priority 1 to 4.</li>
<li>I can list the show sdwan commands and run the six-rung troubleshooting ladder.</li>
<li>I can compare PAN-OS SD-WAN with Prisma SD-WAN, choose by requirements and plan a migration as a rebuild from intent.</li>
</ul>
<h3>Quick reference: terms by product</h3>
<table class="cmp"><tr><th>PAN-OS SD-WAN</th><th>Prisma SD-WAN</th></tr>
<tr><td>Link tag, SD-WAN interface profile</td><td>Circuit category, circuit label</td></tr>
<tr><td>Path quality profile, traffic distribution profile</td><td>Performance policy, path policy</td></tr>
<tr><td>Error correction profile</td><td>Performance policy FEC and duplication actions</td></tr>
<tr><td>VPN cluster, Auto VPN</td><td>Secure fabric built by the controller</td></tr>
<tr><td>Panorama with SD-WAN plugin</td><td>Cloud management plane and portal</td></tr>
<tr><td>Hub firewall, branch firewall</td><td>Data center ION, branch ION</td></tr></table>
<div class="warn"><p><b>Last-minute traps.</b> Weighted Session Distribution does not move traffic on brownout. A link has one tag. Packet loss sensitivity has no effect. FEC does not work on DIA. Do not state version minimums or scale numbers that you have not checked.</p></div>
<div class="exam"><p><b>Exam habit.</b> Identify the product from the vocabulary first. Then identify the object (profile, rule, cluster) and the field. Then look for the single detail that does not fit.</p></div>
<div class="scn"><h4>Final scenario: voice breaks after hub failover</h4><p>A branch fails over from DC-EAST to DC-WEST and voice quality drops. Check, in order: tunnels to DC-WEST up; probes healthy; quality values against the voice profile; the matched rule; the distribution method; routing and NAT. The finding is that the voice rule uses Weighted Session Distribution, which does not leave a brownout link. Switching it to Best Available Path fixes the behaviour.</p></div>
<div class="iv"><p class="q">"Summarise PAN-OS SD-WAN in one minute."</p><p>PAN-OS SD-WAN runs on NGFWs managed by Panorama with the SD-WAN plugin. Links get tags through interface profiles and join a virtual SD-WAN interface. SD-WAN policy rules pick applications and apply a path quality profile and a traffic distribution profile, optionally a SaaS quality or error correction profile. VPN clusters with Auto VPN build the tunnels between hubs and branches. I verify with the show sdwan commands and choose it over Prisma SD-WAN when the estate and requirements fit.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know both vocabularies and keep them apart.</li>
<li>Quality profile decides when a path is bad; distribution profile decides which link to use.</li>
<li>Clusters build tunnels; Panorama manages; CLI proves.</li>
<li>Next module: Deployment and Configuration.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko band karta hai. Practice test se pehle ise padho, checklist imaandari se tick karo, aur jis item ko zor se samjha na pao uske chapter par wapas jao.</p>
<h3>Module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="PAN-OS SD-WAN object chain">
<rect x="10" y="20" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="50" text-anchor="middle" class="svg-ink" font-size="12">Link tag</text>
<rect x="135" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="195" y="42" text-anchor="middle" class="svg-ink" font-size="12">Interface</text><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<rect x="270" y="20" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="50" text-anchor="middle" class="svg-ink" font-size="12">sdwan.1</text>
<rect x="395" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="12">Quality</text><text x="450" y="58" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<rect x="520" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="42" text-anchor="middle" class="svg-ink" font-size="12">Distribution</text><text x="575" y="58" text-anchor="middle" class="svg-ink" font-size="12">profile</text>
<line x1="120" y1="45" x2="135" y2="45" stroke="#64748b" stroke-width="2"/><line x1="255" y1="45" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="45" x2="395" y2="45" stroke="#64748b" stroke-width="2"/><line x1="505" y1="45" x2="520" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="135" y="120" width="370" height="50" rx="8" fill="#fed7aa"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN policy rule (zones, applications, profiles)</text>
<rect x="135" y="190" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="220" y="215" text-anchor="middle" class="svg-ink" font-size="12">VPN cluster, Auto VPN</text>
<rect x="335" y="190" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="420" y="215" text-anchor="middle" class="svg-ink" font-size="12">Panorama + plugin</text>
<line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-dasharray="4"/>
</svg><p class="cap">Tags aur profiles policy rule ko feed karte hain; clusters tunnels banate hain; Panorama sab manage karta hai.</p></div>
<h3>Exam checklist</h3>
<ul>
<li>Main do Palo Alto SD-WAN products ke naam bata sakta hoon aur har term ko sahi product mein rakh sakta hoon.</li>
<li>Main hub aur branch roles, topologies (hub-spoke, mesh, DIA, Prisma Access hub) aur documentation dwara unse jode plugin versions describe kar sakta hoon.</li>
<li>Main jaanta hoon ki NGFW ke liye Advanced SD-WAN licensing zaroori hai, aur limits: same virtual router, multi-VSYS nahi.</li>
<li>Main link tags (ek link ka ek), SD-WAN interface profiles (tag, link type, speeds, monitoring) aur virtual SD-WAN interface samjha sakta hoon.</li>
<li>Main path quality profile parameters, defaults (latency 100 ms, jitter 100 ms, loss 1 percent, bandwidth 100 percent), OR behaviour aur evaluation order bata sakta hoon.</li>
<li>Main Best Available Path, Top Down Priority aur Weighted Session Distribution ki tulna kar sakta hoon, brownout ke farak sahit.</li>
<li>Main SD-WAN policy rule fields, SaaS quality profile aur error correction limits (MTU 1,340, DIA nahi, ek rule mein ek application, encoder-side) describe kar sakta hoon.</li>
<li>Main VPN clusters describe kar sakta hoon: hub-spoke aur mesh, chaar hubs, 20 pool ranges, priority 1 se 4.</li>
<li>Main show sdwan commands list kar sakta hoon aur chhe-rung troubleshooting ladder chala sakta hoon.</li>
<li>Main PAN-OS SD-WAN ki Prisma SD-WAN se tulna kar sakta hoon, requirements se chun sakta hoon aur migration ko intent se rebuild ki tarah plan kar sakta hoon.</li>
</ul>
<h3>Quick reference: product ke hisaab se terms</h3>
<table class="cmp"><tr><th>PAN-OS SD-WAN</th><th>Prisma SD-WAN</th></tr>
<tr><td>Link tag, SD-WAN interface profile</td><td>Circuit category, circuit label</td></tr>
<tr><td>Path quality profile, traffic distribution profile</td><td>Performance policy, path policy</td></tr>
<tr><td>Error correction profile</td><td>Performance policy FEC aur duplication actions</td></tr>
<tr><td>VPN cluster, Auto VPN</td><td>Controller dwara banaya secure fabric</td></tr>
<tr><td>SD-WAN plugin ke saath Panorama</td><td>Cloud management plane aur portal</td></tr>
<tr><td>Hub firewall, branch firewall</td><td>Data center ION, branch ION</td></tr></table>
<div class="warn"><p><b>Aakhri minute ke traps.</b> Weighted Session Distribution brownout par traffic move nahi karta. Ek link ka ek tag. Packet loss sensitivity ka koi asar nahi. FEC DIA par kaam nahi karta. Jo version minimums ya scale numbers check nahi kiye unhe state mat karo.</p></div>
<div class="exam"><p><b>Exam habit.</b> Pehle vocabulary se product pehchano. Phir object (profile, rule, cluster) aur field pehchano. Phir wo ek detail dhoondho jo fit nahi hoti.</p></div>
<div class="scn"><h4>Final scenario: hub failover ke baad voice toot jaati hai</h4><p>Branch DC-EAST se DC-WEST par failover karta hai aur voice quality gir jaati hai. Order mein check karo: DC-WEST tak tunnels up; probes healthy; voice profile ke against quality values; matched rule; distribution method; routing aur NAT. Finding yeh hai ki voice rule Weighted Session Distribution use karta hai, jo brownout wale link ko nahi chhodta. Use Best Available Path par badalne se behaviour theek ho jaata hai.</p></div>
<div class="iv"><p class="q">"PAN-OS SD-WAN ko ek minute mein summarise karo."</p><p>PAN-OS SD-WAN NGFWs par chalta hai jo SD-WAN plugin ke saath Panorama se manage hote hain. Links ko interface profiles se tags milte hain aur woh virtual SD-WAN interface mein jaate hain. SD-WAN policy rules applications chunte hain aur path quality profile tatha traffic distribution profile lagate hain, optionally SaaS quality ya error correction profile. Auto VPN wale VPN clusters hubs aur branches ke beech tunnels banate hain. Main show sdwan commands se verify karta hoon aur jab estate aur requirements fit hon to ise Prisma SD-WAN par chunta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dono vocabularies jaano aur alag rakho.</li>
<li>Quality profile decide karta hai path kab kharab hai; distribution profile decide karta hai kaunsa link use ho.</li>
<li>Clusters tunnels banate hain; Panorama manage karta hai; CLI saboot deta hai.</li>
<li>Agla module: Deployment and Configuration.</li>
</ul></div>
`}};export{e as default};