var e={id:`contact-addresses-and-nat`,h:{en:`Contact addresses and NAT`,hi:`Contact addresses aur NAT`},body:{en:`
<p>So far NAT touched user traffic. But the SMC also talks to the engines, and that management traffic can be translated too. When it is, the engine can show Unknown or Offline although the network "looks fine". This chapter explains contact addresses, the fix taught in lab fp-nat-3, NAT breaks SMC contact: add the contact address.</p>

<h3>Analogy: the phone number you give to people outside the building</h3>
<p>Inside the company your desk extension is 214. A supplier outside cannot dial 214; they need the full public number that the reception forwards to you. Each person therefore has an internal number and, for outsiders, an outside number. A <b>contact address</b> is the outside number of an SMC component.</p>

<h3>The facts</h3>
<ul>
<li>The SMC and the engines talk to each other: engines report to the Management Server (tcp 8902 in this model) and the SMC reaches the engine on its control IP to send policies and read status.</li>
<li>If NAT sits between them, the real (control) address of one side is not reachable from the other side. The address that the other side must use is the <b>translated</b> address. That is the <b>contact address</b>.</li>
<li>A <b>Location</b> is a group of components that see each other without NAT. Components in the <b>same Location</b> use the primary (control) IP address.</li>
<li>For a component in a <b>different Location</b>, the SMC uses a <b>Location-specific contact address</b> if one is set for that Location. If not, it uses the element <b>Default contact address</b>. If neither is set, it uses the untranslated address.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Contact address lookup">
<rect x="10" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">NK-SMC</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.10</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="12">Location: HQ</text>
<rect x="250" y="40" width="130" height="40" rx="8" fill="#fde68a"/><text x="315" y="65" text-anchor="middle" class="svg-ink" font-size="13">NAT in path</text>
<rect x="440" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">control 10.0.0.1</text><text x="535" y="86" text-anchor="middle" class="svg-muted" font-size="12">Location: Pune</text>
<line x1="200" y1="60" x2="250" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="125" width="340" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">SMC picks the address for the engine:</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">same Location: control IP</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">other Location: Location-specific, else default, else untranslated</text>
</svg><p class="cap">The lookup order the SMC follows when it contacts a component in another Location.</p></div>

<table class="cmp"><tr><th>Situation</th><th>Address the SMC uses</th></tr>
<tr><td>Engine in the same Location</td><td>Primary (control) IP</td></tr>
<tr><td>Engine in another Location, Location-specific contact set</td><td>That Location-specific contact address</td></tr>
<tr><td>Engine in another Location, only Default set</td><td>Default contact address</td></tr>
<tr><td>Nothing set</td><td>Untranslated address (fails if NAT is in the path)</td></tr>
</table>

<h3>Where you set it</h3>
<p>In the Engines page, open the engine and its contact address settings. Choose the Location of the SMC (the side that must reach the engine) and enter the address the engine is known by from there; or set a Default contact address. Then use the Install policy bar. The lab text gives the exact address to enter. For field names in a real SMC, check the documentation for your NGFW version.</p>

<div class="eg"><p><b>Worked example (fp-nat-3).</b> After a NAT change, NK-PUNE-FW shows Unknown. In the Engines page the control address 10.0.0.1 is no longer what the SMC sees: a NAT rule in the path translates it. Symptoms: Monitoring shows no status; Install policy to the engine fails with no contact. Fix: in the engine contact settings add a Location-specific contact address for the SMC Location, with the translated address from the task. Install policy again. The engine becomes Online, and the lab passes after Install.</p></div>

<h3>Node-initiated contact (concept)</h3>
<p>Sometimes the SMC cannot open a connection to the engine at all, for example because the engine has a dynamic IP address or sits behind NAT that the SMC side cannot predict. For such engines there is <b>node-initiated contact</b>: the engine calls the SMC and keeps the channel, so the SMC does not need to dial in. The timers and details are not simulated in CONFIG. If you meet this in a real network, check the documentation for your NGFW version.</p>

<h3>Check list when contact breaks after a NAT change</h3>
<ol>
<li>Is the engine status Unknown? Then the SMC cannot see it.</li>
<li>Does the engine still reach the SMC on tcp 8902? Check the Access rules and NAT for the management network.</li>
<li>Which Location is each side in? Same Location means control IP; different means a contact address is needed.</li>
<li>Is a Location-specific or Default contact address set, and is it the translated address that the SMC can really reach?</li>
<li>Did you install, and did the engine accept?</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Setting the contact address to the translated value on the wrong element or the wrong Location, or putting the engine control IP in the contact field. The contact address is what the OTHER side must dial, not the real interface address.</p></div>

<div class="exam"><p><b>Exam trap.</b> The lookup order: same Location uses the primary IP; other Location uses Location-specific, else Default, else the untranslated address. Also, a contact address does not translate anything; NAT does. The contact address only tells the SMC which address to use.</p></div>

<div class="scn"><h4>The branch that went grey</h4><p>After the ISP changed the path between HQ and the Pune branch, NK-PUNE-FW turned Unknown in the SMC. The engineer found a new NAT hop translating the engine control address. Pune policies could not be installed. He added a Location-specific contact address for the HQ Location, matching the translated address, and re-installed from the Install policy bar. Status returned to Online and the old policy was replaced cleanly.</p><p><b>Lesson:</b> whenever management traffic crosses NAT, tell the SMC the address it must dial.</p></div>

<div class="iv"><p class="q">"What is a contact address and when do you need one?"</p><p>Strong answer: it is the translated address of an SMC component, needed when components in different Locations communicate through NAT. The SMC picks Location-specific first, then Default, then the untranslated address. Add node-initiated contact as the option for dynamic or hidden engine addresses.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A contact address is the translated address of an SMC component.</li>
<li>Same Location uses the primary (control) IP.</li>
<li>Other Location: Location-specific, else Default, else untranslated.</li>
<li>NAT in the management path with no contact address makes the engine Unknown.</li>
<li>Node-initiated contact lets the engine call the SMC; it is a concept here.</li>
</ul></div>
`,hi:`
<p>Ab tak NAT ne user traffic ko chhua. Lekin SMC bhi engines se baat karta hai, aur woh management traffic bhi translate ho sakta hai. Jab aisa hota hai to network "theek lagta hai" phir bhi engine Unknown ya Offline dikha sakta hai. Yeh chapter contact addresses samjhata hai, jo lab fp-nat-3, NAT breaks SMC contact: add the contact address, ka fix hai.</p>

<h3>Analogy: building ke bahar ke logon ko diya jaane wala phone number</h3>
<p>Company ke andar aapke desk ka extension 214 hai. Bahar ka supplier 214 dial nahi kar sakta; use poora public number chahiye jo reception aapko forward karta hai. Isliye har insaan ka internal number hota hai aur bahar walon ke liye outside number. <b>Contact address</b> SMC component ka outside number hai.</p>

<h3>Facts</h3>
<ul>
<li>SMC aur engines aapas mein baat karte hain: engines Management Server ko report karte hain (is model mein tcp 8902) aur SMC policies bhejne aur status padhne ke liye engine ke control IP tak pahunchta hai.</li>
<li>Agar beech mein NAT hai to ek side ka real (control) address doosri side se reachable nahi hota. Doosri side ko jo address use karna hai woh <b>translated</b> address hai. Wahi <b>contact address</b> hai.</li>
<li><b>Location</b> un components ka group hai jo bina NAT ek doosre ko dekhte hain. <b>Same Location</b> ke components primary (control) IP address use karte hain.</li>
<li><b>Alag Location</b> ke component ke liye SMC us Location ka <b>Location-specific contact address</b> use karta hai agar set hai. Nahi to element ka <b>Default contact address</b>. Dono set na hon to untranslated address.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Contact address lookup">
<rect x="10" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">NK-SMC</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.10</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="12">Location: HQ</text>
<rect x="250" y="40" width="130" height="40" rx="8" fill="#fde68a"/><text x="315" y="65" text-anchor="middle" class="svg-ink" font-size="13">Beech mein NAT</text>
<rect x="440" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">control 10.0.0.1</text><text x="535" y="86" text-anchor="middle" class="svg-muted" font-size="12">Location: Pune</text>
<line x1="200" y1="60" x2="250" y2="60" stroke="#64748b" stroke-width="2"/><line x1="380" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="125" width="340" height="70" rx="8" fill="#e2e8f0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">SMC engine ke liye address chunta hai:</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="12">same Location: control IP</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">alag Location: Location-specific, warna default, warna untranslated</text>
</svg><p class="cap">Doosri Location ke component se contact karte waqt SMC jo lookup order follow karta hai.</p></div>

<table class="cmp"><tr><th>Situation</th><th>SMC kaunsa address use karta hai</th></tr>
<tr><td>Engine same Location mein</td><td>Primary (control) IP</td></tr>
<tr><td>Engine alag Location mein, Location-specific contact set</td><td>Woh Location-specific contact address</td></tr>
<tr><td>Engine alag Location mein, sirf Default set</td><td>Default contact address</td></tr>
<tr><td>Kuch set nahi</td><td>Untranslated address (NAT path mein ho to fail)</td></tr>
</table>

<h3>Ise kahan set karte hain</h3>
<p>Engines page mein engine kholo aur uski contact address settings dekho. SMC ki Location chuno (woh side jise engine tak pahunchna hai) aur wahan se engine jis address se jaana jaata hai woh daalo; ya Default contact address set karo. Phir Install policy bar use karo. Lab text exact address batata hai. Real SMC ke field names ke liye apne NGFW version ki documentation check karo.</p>

<div class="eg"><p><b>Worked example (fp-nat-3).</b> NAT change ke baad NK-PUNE-FW Unknown dikhata hai. Engines page mein control address 10.0.0.1 ab woh nahi jo SMC dekhta hai: path mein ek NAT rule use translate karta hai. Symptoms: Monitoring mein status nahi; engine par Install policy no contact se fail. Fix: engine contact settings mein SMC Location ke liye Location-specific contact address add karo, task wala translated address ke saath. Phir Install policy. Engine Online ho jaata hai, aur lab Install ke baad pass hota hai.</p></div>

<h3>Node-initiated contact (concept)</h3>
<p>Kabhi SMC engine tak connection khol hi nahi paata, jaise engine ka dynamic IP address ho ya aisa NAT ho jise SMC side predict nahi kar sakti. Aise engines ke liye <b>node-initiated contact</b> hota hai: engine SMC ko call karta hai aur channel rakhta hai, isliye SMC ko dial in nahi karna padta. CONFIG mein iske timers aur details simulate nahi hote. Real network mein mile to apne NGFW version ki documentation check karo.</p>

<h3>NAT change ke baad contact toote to checklist</h3>
<ol>
<li>Engine status Unknown hai? Matlab SMC use dekh nahi paa raha.</li>
<li>Kya engine abhi bhi SMC tak tcp 8902 par pahunchta hai? Management network ke Access rules aur NAT check karo.</li>
<li>Dono side kis Location mein hain? Same Location matlab control IP; alag matlab contact address chahiye.</li>
<li>Location-specific ya Default contact address set hai, aur kya woh translated address hai jo SMC sach mein reach kar sakta hai?</li>
<li>Install kiya, aur engine ne accept kiya?</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Translated value ko galat element ya galat Location par set karna, ya contact field mein engine ka control IP daal dena. Contact address woh hai jo DOOSRI side ko dial karna hai, real interface address nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Lookup order: same Location primary IP; alag Location Location-specific, warna Default, warna untranslated address. Aur, contact address kuch translate nahi karta; NAT karta hai. Contact address sirf SMC ko batata hai ki kaunsa address use karna hai.</p></div>

<div class="scn"><h4>Branch jo grey ho gayi</h4><p>ISP ne HQ aur Pune branch ke beech ka path badla, uske baad SMC mein NK-PUNE-FW Unknown ho gaya. Engineer ko naya NAT hop mila jo engine control address translate kar raha tha. Pune policies install nahi ho paa rahi thi. Usne HQ Location ke liye Location-specific contact address add kiya, translated address ke barabar, aur Install policy bar se dobara install kiya. Status Online ho gaya aur purani policy saaf tareeke se replace ho gayi.</p><p><b>Lesson:</b> jab bhi management traffic NAT cross kare, SMC ko batao ki use kaunsa address dial karna hai.</p></div>

<div class="iv"><p class="q">"Contact address kya hai aur kab chahiye?"</p><p>Strong answer: yeh SMC component ka translated address hai, jab alag Locations ke components NAT ke through baat karte hain. SMC pehle Location-specific, phir Default, phir untranslated address chunta hai. Dynamic ya hidden engine addresses ke option ke roop mein node-initiated contact bhi bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Contact address SMC component ka translated address hai.</li>
<li>Same Location primary (control) IP use karta hai.</li>
<li>Alag Location: Location-specific, warna Default, warna untranslated.</li>
<li>Management path mein NAT hai aur contact address nahi, to engine Unknown ho jaata hai.</li>
<li>Node-initiated contact engine ko SMC ko call karne deta hai; yahan yeh concept hai.</li>
</ul></div>
`}};export{e as default};