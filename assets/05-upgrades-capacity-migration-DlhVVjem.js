var e={id:`upgrades-capacity-migration`,h:{en:`Upgrades, capacity, licensing and AireOS to 9800 migration`,hi:`Upgrades, capacity, licensing aur AireOS se 9800 migration`},body:{en:`
<h3>The case: Orion Manufacturing</h3>
<p>Orion Manufacturing runs three plants with 1,100 APs on two older AireOS controllers in an N+1 arrangement. The platform is near end of support. The board wants it replaced with Catalyst 9800 controllers within six months, with no stoppage on the production lines. Plant managers allow only short weekend windows. The network team has to decide how to upgrade software safely, how big the new controllers must be, and how to migrate without breaking roaming.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>No unplanned outage on the lines; planned outages are limited to 90 minutes per plant per weekend.</li>
<li>Roaming between old and new infrastructure must keep working during the migration.</li>
<li>The new design must hold 1,100 APs today, grow by 25 percent, and survive a controller failure.</li>
<li>There must be a tested way back at every step.</li>
</ul>

<h3>Upgrade strategies</h3>
<table class="cmp"><tr><th>Strategy</th><th>How it works</th><th>Impact</th></tr>
<tr><td>N+1 rolling</td><td>Upgrade the spare first. Move a batch of APs to it, upgrade their primary, move them back, repeat.</td><td>Short outage per batch; needs the spare sized for a batch</td></tr>
<tr><td>SSO pair, standby first</td><td>Upgrade the standby, switch over, upgrade the former active. ISSU-style upgrade is supported only on certain source and target releases.</td><td>Seconds per switchover if supported; otherwise a controller reload</td></tr>
<tr><td>Rolling AP upgrade</td><td>APs reload in groups, so neighbours cover for each other</td><td>Reduced capacity, not a blackout</td></tr>
<tr><td>Full reload</td><td>Everything restarts together</td><td>Complete outage; simplest</td></tr>
</table>
<p>Two features cut AP downtime. <b>AP image predownload</b> lets APs fetch the new image while still running the old one, then all swap at once, so the AP outage is one reload rather than download plus reload. For branches, <b>efficient AP image upgrade</b> in a Flex group lets one AP per site download from the controller and share the image with its neighbours across the LAN, saving WAN bandwidth. The 9800 uses install mode:</p>
<pre class="code"><span class="c">! IOS XE install mode on the Catalyst 9800 (image name is an example)</span>
install add file bootflash:C9800-image.bin activate commit</pre>
<p>Whatever the strategy, always back up the configuration, confirm the standby is Standby Hot, read the release notes for the upgrade path, and keep a rollback image.</p>

<h3>Capacity and licensing</h3>
<p>Design capacity from three numbers: <b>APs</b>, <b>clients</b> and <b>throughput</b>. Typical Catalyst 9800 hardware limits are the 9800-L at 250 APs and 5,000 clients, the 9800-40 at 2,000 APs and 32,000 clients, and the 9800-80 at 6,000 APs and 64,000 clients. The virtual 9800-CL comes in small, medium and large sizes up to 6,000 APs. Check the current data sheet for exact values.</p>
<div class="eg"><p><b>Sizing for Orion.</b> 1,100 APs plus 25 percent growth is about 1,400 APs. One 9800-40 holds 2,000 APs, so a 9800-40 SSO pair easily carries the full load alone. For site loss, a second 9800-40 in plant 3 as an N+1 backup also has room for all 1,400 APs. Compare that with a pair of 9800-L controllers, which would not fit.</p></div>
<p>Licensing follows the AP. Catalyst controllers use Cisco DNA licence tiers per AP and Smart Licensing, in current releases through a policy-based model. An SSO pair needs the licences for the APs once, not twice. For an N+1 backup, confirm the shared licence pool covers the APs that would join after a failure, otherwise the first failure also becomes a licensing incident.</p>

<h3>Migration design: AireOS to Catalyst 9800</h3>
<p>The 9800 is built differently from AireOS. AP groups and WLAN-to-interface bindings become <b>tags</b>: a <b>policy tag</b> links WLAN profiles to policy profiles, a <b>site tag</b> defines AP join and Flex behaviour, and an <b>RF tag</b> defines radio settings. A configuration converter tool helps translate an AireOS configuration into a 9800 starting point, but always review the output and test it. Check the AP compatibility matrix for the target release, because very old AP models are not supported.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Phased migration">
<rect x="30" y="20" width="200" height="60" rx="12" fill="#fed7aa"/><text x="130" y="48" text-anchor="middle" class="svg-ink" font-size="13">AireOS controllers</text><text x="130" y="66" text-anchor="middle" class="svg-muted" font-size="12">Old, shrinking</text>
<rect x="410" y="20" width="200" height="60" rx="12" fill="#bae6fd"/><text x="510" y="48" text-anchor="middle" class="svg-ink" font-size="13">Catalyst 9800 SSO pair</text><text x="510" y="66" text-anchor="middle" class="svg-muted" font-size="12">New, growing</text>
<line x1="230" y1="50" x2="410" y2="50" stroke="#f97316" stroke-width="3"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">Mobility peer</text>
<rect x="30" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="85" y="157" text-anchor="middle" class="svg-ink" font-size="13">Wave 0 pilot</text>
<rect x="165" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="220" y="157" text-anchor="middle" class="svg-ink" font-size="13">Wave 1 plant 1</text>
<rect x="300" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="355" y="157" text-anchor="middle" class="svg-ink" font-size="13">Wave 2 plant 2</text>
<rect x="435" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="490" y="157" text-anchor="middle" class="svg-ink" font-size="13">Wave 3 plant 3</text>
<line x1="140" y1="153" x2="165" y2="153" stroke="#64748b" stroke-width="2"/><line x1="275" y1="153" x2="300" y2="153" stroke="#64748b" stroke-width="2"/><line x1="410" y1="153" x2="435" y2="153" stroke="#64748b" stroke-width="2"/>
<rect x="545" y="130" width="85" height="46" rx="8" fill="#e2e8f0"/><text x="587" y="157" text-anchor="middle" class="svg-ink" font-size="13">Retire</text>
<line x1="545" y1="153" x2="545" y2="153" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="205" width="14" height="14" fill="#fed7aa"/><text x="50" y="217" class="svg-muted" font-size="12">Old platform</text>
<rect x="160" y="205" width="14" height="14" fill="#bae6fd"/><text x="180" y="217" class="svg-muted" font-size="12">New platform</text>
<rect x="290" y="205" width="14" height="14" fill="#bbf7d0"/><text x="310" y="217" class="svg-muted" font-size="12">Migration wave</text>
</svg><p class="cap">Move plant by plant. Old and new controllers stay linked by a mobility peering so clients roam between them.</p></div>

<h3>Options and the chosen design</h3>
<table class="cmp"><tr><th>Approach</th><th>Pro</th><th>Con</th></tr>
<tr><td>Big bang over one weekend</td><td>Short project</td><td>Huge risk; no rollback; plants differ</td></tr>
<tr><td>Phased by plant or zone, with mobility peering</td><td>Small blast radius, rollback per wave</td><td>Longer; two platforms to operate</td></tr>
<tr><td>Parallel new network, cut over by SSID</td><td>Clean slate</td><td>Double RF load; channel planning is hard</td></tr>
</table>
<p>Orion picks the phased approach. A pilot of 30 APs in the training room goes first. Each wave then points the plant's APs at the 9800 as primary, with the AireOS controller kept as secondary for rollback. The two platforms are joined by mobility peering so that clients roaming across the boundary keep their sessions. RF groups are kept separate during the transition and the channel plan of each plant is reviewed after the cutover, so no two platforms fight over the same channels. Each wave ends with a validation checklist (next chapter) before the next one is allowed to start.</p>

<div class="warn"><p><b>Post-mortem.</b> At a similar migration, a team moved APs to the new controller but forgot that the old RADIUS configuration had the AireOS controller addresses as clients. The 9800 was not defined as a RADIUS client, so every 802.1X login failed. Fix: add the new controllers to RADIUS before moving any AP.</p></div>
<div class="exam"><p><b>Exam traps.</b> An SSO pair has the licence and capacity of one unit. Predownload reduces AP downtime; it does not remove the reload. AireOS AP groups map to tags on the 9800, not to the same objects.</p></div>

<div class="scn"><h4>The upgrade that missed an AP model</h4><p>A hospital upgraded its controller pair and 40 older APs failed to join afterward, because the new release no longer supported that model. The compatibility matrix would have shown it. Now every upgrade plan starts with a model-by-model check against the target release.</p><p><b>Lesson:</b> the first step of any upgrade or migration is the compatibility matrix.</p></div>

<div class="iv"><p class="q">"How would you migrate 1,000 APs from AireOS to a 9800 without an outage?"</p><p>Strong answer: phased waves with a pilot first; mobility peering between old and new so roaming works; tags built from the converted configuration; RADIUS and DHCP updated beforehand; AireOS kept as secondary for rollback; validation after each wave. Mention that not every AP model is supported.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose the upgrade method by impact: N+1 rolling, SSO standby first, rolling AP upgrade, or reload.</li>
<li>AP image predownload and efficient AP image upgrade cut AP downtime and WAN load.</li>
<li>Size controllers for AP count, clients and growth; an SSO pair is the size of one unit.</li>
<li>Licences follow APs; check the pool for backup controllers.</li>
<li>Migrate in waves with mobility peering, tags, a pilot and a rollback path.</li>
</ul></div>
`,hi:`
<h3>Case: Orion Manufacturing</h3>
<p>Orion Manufacturing ke teen plants hain jinmein 1,100 APs do purane AireOS controllers par N+1 arrangement mein chalte hain. Platform end of support ke kareeb hai. Board chahta hai ki chhe mahine mein ise Catalyst 9800 controllers se replace kiya jaaye, production lines par koi stoppage nahi. Plant managers sirf chhoti weekend windows dete hain. Network team ko decide karna hai ki software safely kaise upgrade karein, naye controllers kitne bade hon, aur roaming tode bina migrate kaise karein.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Lines par koi unplanned outage nahi; planned outage har plant ko har weekend 90 minute tak.</li>
<li>Migration ke dauran purane aur naye infrastructure ke beech roaming chalni chahiye.</li>
<li>Naya design aaj 1,100 APs hold kare, 25 percent badhe, aur controller failure survive kare.</li>
<li>Har step par tested wapsi ka raasta ho.</li>
</ul>

<h3>Upgrade strategies</h3>
<table class="cmp"><tr><th>Strategy</th><th>Kaise kaam karti hai</th><th>Impact</th></tr>
<tr><td>N+1 rolling</td><td>Pehle spare upgrade karo. APs ka ek batch uspe le jao, unka primary upgrade karo, wapas le aao, repeat.</td><td>Har batch ka chhota outage; spare ko batch ke hisaab se size karna padta hai</td></tr>
<tr><td>SSO pair, pehle standby</td><td>Standby upgrade karo, switchover karo, purane active ko upgrade karo. ISSU-style upgrade sirf kuch source aur target releases par supported hai.</td><td>Supported ho to switchover mein seconds; warna controller reload</td></tr>
<tr><td>Rolling AP upgrade</td><td>APs groups mein reload hote hain, neighbours cover karte hain</td><td>Capacity kam, blackout nahi</td></tr>
<tr><td>Full reload</td><td>Sab ek saath restart</td><td>Poora outage; sabse simple</td></tr>
</table>
<p>Do features AP downtime kam karte hain. <b>AP image predownload</b> APs ko purani image chalate hue nayi image fetch karne deta hai, phir sab ek saath swap karte hain, isliye AP outage download plus reload nahi, sirf ek reload hota hai. Branches ke liye Flex group mein <b>efficient AP image upgrade</b> har site ke ek AP ko controller se download karne deta hai aur woh image LAN par neighbours ke saath share karta hai, jisse WAN bandwidth bachti hai. 9800 install mode use karta hai:</p>
<pre class="code"><span class="c">! Catalyst 9800 par IOS XE install mode (image ka naam example hai)</span>
install add file bootflash:C9800-image.bin activate commit</pre>
<p>Strategy koi bhi ho, configuration ka backup lo, confirm karo ki standby Standby Hot hai, upgrade path ke liye release notes padho, aur rollback image rakho.</p>

<h3>Capacity aur licensing</h3>
<p>Capacity ko teen numbers se design karo: <b>APs</b>, <b>clients</b> aur <b>throughput</b>. Typical Catalyst 9800 hardware limits hain: 9800-L par 250 APs aur 5,000 clients, 9800-40 par 2,000 APs aur 32,000 clients, 9800-80 par 6,000 APs aur 64,000 clients. Virtual 9800-CL small, medium aur large sizes mein aata hai, 6,000 APs tak. Exact values ke liye current data sheet dekho.</p>
<div class="eg"><p><b>Orion ke liye sizing.</b> 1,100 APs plus 25 percent growth lagbhag 1,400 APs hai. Ek 9800-40 2,000 APs hold karta hai, isliye 9800-40 SSO pair poora load akele aaram se uthata hai. Site loss ke liye plant 3 mein doosra 9800-40 N+1 backup ke roop mein bhi saare 1,400 APs ke liye jagah rakhta hai. Iski tulna 9800-L controllers ke pair se karo, jo fit nahi hota.</p></div>
<p>Licensing AP ke saath chalti hai. Catalyst controllers per AP Cisco DNA licence tiers aur Smart Licensing use karte hain, current releases mein policy-based model ke through. SSO pair ko licences ek baar chahiye, do baar nahi. N+1 backup ke liye confirm karo ki shared licence pool un APs ko cover karta hai jo failure ke baad join honge, warna pehli failure licensing incident bhi ban jaati hai.</p>

<h3>Migration design: AireOS se Catalyst 9800</h3>
<p>9800 AireOS se alag tarah bana hai. AP groups aur WLAN-to-interface bindings <b>tags</b> ban jaate hain: <b>policy tag</b> WLAN profiles ko policy profiles se jodta hai, <b>site tag</b> AP join aur Flex behaviour define karta hai, aur <b>RF tag</b> radio settings define karta hai. Configuration converter tool AireOS configuration ko 9800 ke starting point mein translate karne mein madad karta hai, lekin output hamesha review aur test karo. Target release ki AP compatibility matrix check karo, kyunki bahut purane AP models supported nahi hain.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Phased migration">
<rect x="30" y="20" width="200" height="60" rx="12" fill="#fed7aa"/><text x="130" y="48" text-anchor="middle" class="svg-ink" font-size="13">AireOS controllers</text><text x="130" y="66" text-anchor="middle" class="svg-muted" font-size="12">Purane, ghat rahe</text>
<rect x="410" y="20" width="200" height="60" rx="12" fill="#bae6fd"/><text x="510" y="48" text-anchor="middle" class="svg-ink" font-size="13">Catalyst 9800 SSO pair</text><text x="510" y="66" text-anchor="middle" class="svg-muted" font-size="12">Naye, badh rahe</text>
<line x1="230" y1="50" x2="410" y2="50" stroke="#f97316" stroke-width="3"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">Mobility peer</text>
<rect x="30" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="85" y="157" text-anchor="middle" class="svg-ink" font-size="13">Wave 0 pilot</text>
<rect x="165" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="220" y="157" text-anchor="middle" class="svg-ink" font-size="13">Wave 1 plant 1</text>
<rect x="300" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="355" y="157" text-anchor="middle" class="svg-ink" font-size="13">Wave 2 plant 2</text>
<rect x="435" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="490" y="157" text-anchor="middle" class="svg-ink" font-size="13">Wave 3 plant 3</text>
<line x1="140" y1="153" x2="165" y2="153" stroke="#64748b" stroke-width="2"/><line x1="275" y1="153" x2="300" y2="153" stroke="#64748b" stroke-width="2"/><line x1="410" y1="153" x2="435" y2="153" stroke="#64748b" stroke-width="2"/>
<rect x="545" y="130" width="85" height="46" rx="8" fill="#e2e8f0"/><text x="587" y="157" text-anchor="middle" class="svg-ink" font-size="13">Retire</text>
<line x1="545" y1="153" x2="545" y2="153" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="205" width="14" height="14" fill="#fed7aa"/><text x="50" y="217" class="svg-muted" font-size="12">Purana platform</text>
<rect x="160" y="205" width="14" height="14" fill="#bae6fd"/><text x="180" y="217" class="svg-muted" font-size="12">Naya platform</text>
<rect x="290" y="205" width="14" height="14" fill="#bbf7d0"/><text x="310" y="217" class="svg-muted" font-size="12">Migration wave</text>
</svg><p class="cap">Plant by plant move karo. Purane aur naye controllers mobility peering se jude rehte hain taaki clients unke beech roam karein.</p></div>

<h3>Options aur chosen design</h3>
<table class="cmp"><tr><th>Approach</th><th>Fayda</th><th>Nuksaan</th></tr>
<tr><td>Ek weekend mein big bang</td><td>Chhota project</td><td>Bada risk; rollback nahi; plants alag hote hain</td></tr>
<tr><td>Plant ya zone ke hisaab se phased, mobility peering ke saath</td><td>Chhota blast radius, har wave ka rollback</td><td>Lamba; do platforms operate karne padte hain</td></tr>
<tr><td>Parallel naya network, SSID se cutover</td><td>Clean slate</td><td>Double RF load; channel planning mushkil</td></tr>
</table>
<p>Orion phased approach chunta hai. Pehle training room ke 30 APs ka pilot. Phir har wave plant ke APs ko 9800 par primary point karti hai, AireOS controller rollback ke liye secondary rehta hai. Dono platforms mobility peering se jude hain taaki boundary cross karne wale clients ke sessions bache rahein. Transition mein RF groups alag rakhe jaate hain aur cutover ke baad har plant ka channel plan review hota hai, taaki do platforms same channels par na ladein. Har wave ek validation checklist (agla chapter) par khatam hoti hai, uske baad hi agli wave shuru hoti hai.</p>

<div class="warn"><p><b>Post-mortem.</b> Aisi hi ek migration mein team ne APs naye controller par move kar diye lekin bhool gayi ki purani RADIUS configuration mein AireOS controller ke addresses clients the. 9800 RADIUS client define nahi tha, isliye har 802.1X login fail hua. Fix: kisi bhi AP ko move karne se pehle naye controllers RADIUS mein add karo.</p></div>
<div class="exam"><p><b>Exam traps.</b> SSO pair ki licence aur capacity ek unit jitni hoti hai. Predownload AP downtime kam karta hai; reload hatata nahi. AireOS AP groups 9800 par tags se map hote hain, same objects se nahi.</p></div>

<div class="scn"><h4>Upgrade jo ek AP model bhool gaya</h4><p>Ek hospital ne controller pair upgrade kiya aur baad mein 40 purane APs join nahi kar paaye, kyunki naya release woh model support nahi karta tha. Compatibility matrix yeh dikha deti. Ab har upgrade plan target release ke saath model-by-model check se shuru hota hai.</p><p><b>Seekh:</b> kisi bhi upgrade ya migration ka pehla step compatibility matrix hai.</p></div>

<div class="iv"><p class="q">"1,000 APs ko AireOS se 9800 par bina outage ke kaise migrate karoge?"</p><p>Strong answer: pehle pilot, phir phased waves; purane aur naye ke beech mobility peering taaki roaming chale; converted configuration se tags; RADIUS aur DHCP pehle se update; rollback ke liye AireOS secondary; har wave ke baad validation. Yeh bhi kaho ki har AP model supported nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Upgrade method impact se chuno: N+1 rolling, pehle SSO standby, rolling AP upgrade, ya reload.</li>
<li>AP image predownload aur efficient AP image upgrade AP downtime aur WAN load kam karte hain.</li>
<li>Controllers ko AP count, clients aur growth ke hisaab se size karo; SSO pair ek unit ke size ka hota hai.</li>
<li>Licences APs ke saath chalte hain; backup controllers ke liye pool check karo.</li>
<li>Waves mein migrate karo: mobility peering, tags, pilot aur rollback path ke saath.</li>
</ul></div>
`}};export{e as default};