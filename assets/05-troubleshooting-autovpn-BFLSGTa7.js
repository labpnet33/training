var e={id:`troubleshooting-autovpn`,h:{en:`Troubleshooting AutoVPN: a spoke tunnel will not form`,hi:`AutoVPN troubleshooting: spoke tunnel nahi ban raha`},body:{en:`
<h3>A repeatable workflow</h3>
<p>Random clicking wastes time. When the ticket says "the Bengaluru tunnel is down", follow the same six questions in the same order, from the bottom of the stack to the top. Each question matches one condition from chapter 3 and each can be answered by one dashboard page.</p>
<ol>
<li><b>Is the uplink up?</b> Open <b>Uplinks</b> for the spoke and the hub. If a spoke's wan1 is down, nothing else matters yet.</li>
<li><b>Are the mode and hubs right?</b> Open <b>Site-to-site VPN</b> on both sides. Hub must be hub, spoke must be spoke, and the hub must be in the spoke's list.</li>
<li><b>Are subnets enabled?</b> At least one Use VPN yes on each side.</li>
<li><b>Is there a conflict?</b> Look for the conflict status next to a subnet.</li>
<li><b>Is outbound UDP reaching the peer?</b> If everything above is fine and the table says "no response from peer", suspect an upstream block on one of the circuits.</li>
<li><b>Is the licence valid?</b> Check Overview and Alerts, especially if more than one tunnel failed at once.</li>
</ol>
<p>Then ask <b>what changed</b>: open <b>Alerts and events</b> and read the change log around the time of the failure. Most tunnel outages are an edit, a circuit or a licence.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Troubleshooting decision order">
<rect x="20" y="10" width="190" height="36" rx="6" fill="#bae6fd"/><text x="115" y="33" text-anchor="middle" class="svg-ink" font-size="13">1 Uplink up?</text>
<rect x="225" y="10" width="190" height="36" rx="6" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">2 Mode and hubs?</text>
<rect x="430" y="10" width="190" height="36" rx="6" fill="#bae6fd"/><text x="525" y="33" text-anchor="middle" class="svg-ink" font-size="13">3 Subnets enabled?</text>
<rect x="20" y="70" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="115" y="93" text-anchor="middle" class="svg-ink" font-size="13">4 Subnet conflict?</text>
<rect x="225" y="70" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">5 Upstream UDP?</text>
<rect x="430" y="70" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="525" y="93" text-anchor="middle" class="svg-ink" font-size="13">6 Licence valid?</text>
<rect x="20" y="130" width="600" height="40" rx="6" fill="#fde68a"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Then: Alerts and events. What changed, and when?</text>
<rect x="20" y="190" width="600" height="60" rx="6" fill="#bbf7d0"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">Fix one thing, Save changes, re-read the tunnel table</text><text x="320" y="234" text-anchor="middle" class="svg-muted" font-size="12">Change one variable at a time so you know what cured it</text>
</svg><p class="cap">Work from the bottom of the stack upwards and let the tunnel table's detail line confirm each guess.</p></div>

<h3>Walking through the lab: "a spoke tunnel will not form" (mk-vpn-2)</h3>
<p>In the troubleshoot lab, one spoke shows its tunnel to the hub as down. Apply the workflow.</p>
<p><b>Step 1: uplinks.</b> Open Uplinks at Bengaluru and Mumbai.</p>
<pre class="out">Uplinks  (network: Bengaluru Branch)
wan1  BB-BLR-01  ISP-A  198.51.100.20/24  up  active</pre>
<p>Both up, so the circuit is not the cause. <b>Step 2: mode and hubs.</b> Open Site-to-site VPN at Bengaluru.</p>
<pre class="out">Site-to-site VPN  (network: Bengaluru Branch)
Mode : spoke      Hubs : <span class="hl">(none listed)</span>
Tunnel table: no hubs configured</pre>
<p>That is the fault: the spoke has the right mode but an empty hub list, so it has nobody to build to. The event log confirms when it happened.</p>
<pre class="out">Alerts and events
09:05  event  Imran removed hub MX-MUM from the hub list (MX-BLR)</pre>
<p>The fix: add MX-MUM back to the hub list, click <b>Save changes</b>, and the tunnel table moves to up. The same table lines point to the other causes. If the hub list is fine but the Use VPN column is all no, enable the Staff and Servers subnets. If a row says "conflict", renumber. If everything is fine and the detail says "no response from peer", ask the ISP about outbound UDP. If it says "licence", renew it. The lab may plant any one of these, so do not stop after the first thing that looks odd: verify the tunnel really is up after the fix.</p>

<h3>Verify, then prove the traffic</h3>
<p>A tunnel "up" is not the finish line. Prove that the traffic works. From a Bengaluru PC (10.2.10.x) test the Mumbai server 10.1.20.10 with the Live tools in the <b>operations</b> module, and confirm that the firewall order still blocks guests. Record in the ticket what the cause was, what you changed, and the time the tunnel came back.</p>

<div class="eg"><p><b>Worked example, a second pass.</b> Delhi tunnel down. Step 1: Delhi wan1 down (BB-DEL-01). The alert "uplink wan1 is down (MX-DEL)" already tells the story. No need for steps 2-6. Delhi is a single-uplink site, so the fix is with the ISP. Starting from the bottom of the stack saved ten minutes of looking at VPN pages.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once; starting at the hub when only one spoke is down (a hub problem would take down all spokes); not saving; declaring success when the detail line still says down; ignoring the change log.</p></div>
<div class="exam"><p><b>Exam trap.</b> "One spoke is down, others are up." The hub is fine. Look at that spoke: uplink, hub list, subnets, its own upstream. "All spokes are down at once": hub mode, hub uplink, hub upstream or licence.</p></div>

<div class="scn"><h4>Only Bengaluru was down</h4><p>At 09:05 Bengaluru lost the Mumbai servers while Delhi was fine. The engineer started with the hub and wasted time. A colleague pointed out that a hub fault hits every spoke. Opening the Bengaluru VPN page showed an empty hub list, and the log showed who removed it. Re-adding the hub fixed it.</p><p><b>Lesson:</b> compare healthy and failing sites first. The difference points at the cause.</p></div>

<div class="iv"><p class="q">"A spoke tunnel is down. How do you troubleshoot it?"</p><p>Strong answer: bottom up. Uplink state, then mode and hub list, then enabled subnets and conflicts, then upstream UDP, then licence. Cross-check the event log for recent changes. Compare with a working spoke, change one thing at a time, and finish by testing real traffic to the server.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the same six questions in the same order every time.</li>
<li>One spoke down points at the spoke; all spokes down points at the hub, the circuit or the licence.</li>
<li>The detail line of the tunnel table names the failed condition.</li>
<li>The event log shows what changed and who changed it.</li>
<li>After the fix, prove real traffic works, not just the tunnel state.</li>
</ul></div>
`,hi:`
<h3>Ek repeatable workflow</h3>
<p>Randomly click karna time waste karta hai. Jab ticket kehta hai "Bengaluru ka tunnel down hai", to wahi chhe sawal usi order mein follow karo, stack ke neeche se upar tak. Har sawal chapter 3 ki ek condition se match karta hai aur har ek ka jawab ek dashboard page se mil jaata hai.</p>
<ol>
<li><b>Uplink up hai?</b> Spoke aur hub dono ke liye <b>Uplinks</b> kholo. Agar spoke ka wan1 down hai, to abhi aur kuch matter nahi karta.</li>
<li><b>Mode aur hubs sahi hain?</b> Dono sides par <b>Site-to-site VPN</b> kholo. Hub hub hona chahiye, spoke spoke, aur hub spoke ki list mein hona chahiye.</li>
<li><b>Subnets enabled hain?</b> Har side par kam se kam ek Use VPN yes.</li>
<li><b>Conflict hai?</b> Subnet ke saath conflict status dekho.</li>
<li><b>Outbound UDP peer tak pahunch raha hai?</b> Agar upar sab theek hai aur table "no response from peer" kehti hai, to kisi circuit par upstream block ka shak karo.</li>
<li><b>Licence valid hai?</b> Overview aur Alerts check karo, khaaskar jab ek se zyada tunnels ek saath fail hon.</li>
</ol>
<p>Phir poochho <b>kya badla</b>: <b>Alerts and events</b> kholo aur failure ke time ke aaspaas ka change log padho. Zyada tar tunnel outages ek edit, ek circuit ya ek licence hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Troubleshooting decision order">
<rect x="20" y="10" width="190" height="36" rx="6" fill="#bae6fd"/><text x="115" y="33" text-anchor="middle" class="svg-ink" font-size="13">1 Uplink up?</text>
<rect x="225" y="10" width="190" height="36" rx="6" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">2 Mode aur hubs?</text>
<rect x="430" y="10" width="190" height="36" rx="6" fill="#bae6fd"/><text x="525" y="33" text-anchor="middle" class="svg-ink" font-size="13">3 Subnets enabled?</text>
<rect x="20" y="70" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="115" y="93" text-anchor="middle" class="svg-ink" font-size="13">4 Subnet conflict?</text>
<rect x="225" y="70" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">5 Upstream UDP?</text>
<rect x="430" y="70" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="525" y="93" text-anchor="middle" class="svg-ink" font-size="13">6 Licence valid?</text>
<rect x="20" y="130" width="600" height="40" rx="6" fill="#fde68a"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Phir: Alerts and events. Kya badla, aur kab?</text>
<rect x="20" y="190" width="600" height="60" rx="6" fill="#bbf7d0"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">Ek cheez fix karo, Save changes, tunnel table dobara padho</text><text x="320" y="234" text-anchor="middle" class="svg-muted" font-size="12">Ek time par ek variable badlo taaki pata chale kisne theek kiya</text>
</svg><p class="cap">Stack ke neeche se upar kaam karo aur tunnel table ki detail line se har guess confirm karo.</p></div>

<h3>Lab walk-through: "a spoke tunnel will not form" (mk-vpn-2)</h3>
<p>Troubleshoot lab mein ek spoke apna hub tak tunnel down dikhata hai. Workflow lagao.</p>
<p><b>Step 1: uplinks.</b> Bengaluru aur Mumbai par Uplinks kholo.</p>
<pre class="out">Uplinks  (network: Bengaluru Branch)
wan1  BB-BLR-01  ISP-A  198.51.100.20/24  up  active</pre>
<p>Dono up, to circuit cause nahi hai. <b>Step 2: mode aur hubs.</b> Bengaluru par Site-to-site VPN kholo.</p>
<pre class="out">Site-to-site VPN  (network: Bengaluru Branch)
Mode : spoke      Hubs : <span class="hl">(none listed)</span>
Tunnel table: no hubs configured</pre>
<p>Yahi fault hai: spoke ka mode sahi hai lekin hub list khaali hai, to uske paas banane ke liye koi nahi. Event log confirm karta hai ki yeh kab hua.</p>
<pre class="out">Alerts and events
09:05  event  Imran removed hub MX-MUM from the hub list (MX-BLR)</pre>
<p>Fix: MX-MUM ko hub list mein wapas jodo, <b>Save changes</b> click karo aur tunnel table up par chali jaati hai. Wahi table lines doosre causes ki taraf bhi ishara karti hain. Agar hub list theek hai lekin Use VPN column mein sab no hai, to Staff aur Servers subnets enable karo. Agar row "conflict" kehti hai, to renumber karo. Agar sab theek hai aur detail "no response from peer" kehti hai, to ISP se outbound UDP ke baare mein poochho. Agar "licence" kehti hai, to renew karo. Lab inmein se koi bhi plant kar sakti hai, isliye pehli ajeeb cheez par ruko mat: fix ke baad verify karo ki tunnel sach mein up hai.</p>

<h3>Verify karo, phir traffic prove karo</h3>
<p>Tunnel "up" finish line nahi hai. Prove karo ki traffic chalta hai. Bengaluru PC (10.2.10.x) se Mumbai server 10.1.20.10 ko <b>operations</b> module ke Live tools se test karo, aur confirm karo ki firewall order abhi bhi guests ko block karta hai. Ticket mein likho cause kya tha, aapne kya badla, aur tunnel kis time wapas aaya.</p>

<div class="eg"><p><b>Worked example, doosra pass.</b> Delhi tunnel down. Step 1: Delhi wan1 down (BB-DEL-01). Alert "uplink wan1 is down (MX-DEL)" pehle se kahani bata deta hai. Steps 2-6 ki zaroorat nahi. Delhi single-uplink site hai, to fix ISP ke saath hai. Stack ke neeche se shuru karne se VPN pages dekhne mein lagne wale das minute bach gaye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath kai cheezein badalna; jab sirf ek spoke down hai tab hub se shuru karna (hub problem saare spokes ko down karti hai); save na karna; jab detail line abhi bhi down kehti hai tab success declare karna; change log ignore karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Ek spoke down hai, baaki up." Hub theek hai. Us spoke ko dekho: uplink, hub list, subnets, uska apna upstream. "Saare spokes ek saath down": hub mode, hub uplink, hub upstream ya licence.</p></div>

<div class="scn"><h4>Sirf Bengaluru down tha</h4><p>09:05 par Bengaluru ke Mumbai servers chale gaye jabki Delhi theek tha. Engineer ne hub se shuru kiya aur time waste hua. Ek colleague ne bataya ki hub fault har spoke ko hit karta hai. Bengaluru VPN page kholne par hub list khaali dikhi aur log ne bataya kisne hataya. Hub wapas jodne se theek ho gaya.</p><p><b>Seekh:</b> pehle healthy aur failing sites ki tulna karo. Farak cause ki taraf ishara karta hai.</p></div>

<div class="iv"><p class="q">"Ek spoke tunnel down hai. Aap troubleshoot kaise karoge?"</p><p>Strong answer: bottom up. Uplink state, phir mode aur hub list, phir enabled subnets aur conflicts, phir upstream UDP, phir licence. Recent changes ke liye event log cross-check karo. Working spoke se compare karo, ek time par ek cheez badlo, aur end mein server tak real traffic test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har baar wahi chhe sawal usi order mein poochho.</li>
<li>Ek spoke down matlab spoke; saare spokes down matlab hub, circuit ya licence.</li>
<li>Tunnel table ki detail line fail hui condition ka naam batati hai.</li>
<li>Event log dikhata hai kya badla aur kisne badla.</li>
<li>Fix ke baad real traffic prove karo, sirf tunnel state nahi.</li>
</ul></div>
`}};export{e as default};