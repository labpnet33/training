var e={id:`router-id`,h:{en:`The router ID: how it is chosen and how to change it`,hi:`Router ID: kaise chuna jaata hai aur kaise badalte hain`},body:{en:`
<p>In a large company every employee has an employee ID. Two people can share a name, but never an ID, and every record in HR is filed under that ID. In OSPF the <b>router ID (RID)</b> plays that role. It is a 32-bit number written like an IPv4 address, for example 1.1.1.1, and it names the router everywhere: in its LSAs, in its neighbours' tables and in the DR election. If two routers share a RID, the map of the network becomes nonsense.</p>

<h3>How IOS picks the router ID</h3>
<p>When the OSPF process starts, IOS chooses the RID <b>once</b>, using the first rule that gives an answer:</p>
<ol>
<li>The <code>router-id</code> command under <code>router ospf</code>, if configured.</li>
<li>Otherwise, the <b>highest IPv4 address on a loopback interface</b> that is up.</li>
<li>Otherwise, the <b>highest IPv4 address on any other interface</b> that is up.</li>
</ol>
<p>Two details catch people out. First, a loopback wins over a physical interface <b>even when the physical address is numerically higher</b>. Second, the interface does <b>not</b> have to be enabled for OSPF; any up interface counts. If a router has no up interface with an IPv4 address and no <code>router-id</code>, the process cannot start and logs <code>%OSPF-4-NORTRID: OSPF process 1 failed to allocate unique router-id and cannot start</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Router ID selection order">
<rect x="10" y="40" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. router-id command</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">always wins</text>
<rect x="225" y="40" width="190" height="70" rx="10" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. Highest up loopback</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">if no command</text>
<rect x="440" y="40" width="190" height="70" rx="10" fill="#e2e8f0"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. Highest up interface</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">if no loopback</text>
<line x1="200" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Chosen once at process start; a change needs clear ip ospf process</text>
</svg><p class="cap">The first rule that produces an address decides the router ID.</p></div>

<div class="eg"><p><b>Worked example (Lab 3 before you touch it).</b> The four core routers have no <code>router-id</code> command. R1 has Gi0/0 10.10.0.1 and Gi0/1 10.14.0.1, no loopback, so its RID is <b>10.14.0.1</b>. R2 has Loopback0 172.16.2.1, so its RID is <b>172.16.2.1</b>. R3 likewise becomes <b>172.16.3.1</b>. R4 has no loopback and three interfaces (10.10.0.4, 10.14.0.2 and 192.168.4.1), so its RID is <b>192.168.4.1</b>. These IDs work, but they are hard to read in outputs, which is exactly why the lab asks you to set 1.1.1.1 to 4.4.4.4.</p></div>

<h3>Setting and changing the router ID</h3>
<pre class="code"><span class="c">! Set a readable, stable RID</span>
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
% OSPF: Reload or use "clear ip ospf process" command, for this to take effect
R1(config-router)# end
<span class="c">! Restart OSPF so the new RID is used (drops all adjacencies briefly)</span>
R1# clear ip ospf process
Reset ALL OSPF processes? [no]: yes</pre>
<p>Good habit on a new router: type <code>router-id</code> as the very first command under <code>router ospf</code>, before enabling any interfaces, so the planned RID is used from the start. On a running process IOS prints the reminder above and keeps the old RID until the process restarts. <code>clear ip ospf process</code> tears down every adjacency and rebuilds them, so on a production router do it in a maintenance window.</p>

<pre class="out">R1# show ip protocols | include Router ID
<span class="hl">  Router ID 1.1.1.1</span>
R1# show ip ospf | include ID
<span class="hl"> Routing Process "ospf 1" with ID 1.1.1.1</span></pre>

<h3>Why hard-code it?</h3>
<ul>
<li><b>Stability.</b> An automatically chosen RID can change after a reload if someone added or removed a loopback, which changes LSAs and can change the DR election.</li>
<li><b>Readability.</b> 1.1.1.1 to 4.4.4.4, or the router's management loopback address, makes every output easier to read at 3 a.m.</li>
<li><b>Uniqueness.</b> A planned RID scheme prevents duplicates when routers are built from the same template.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Configuring <code>router-id</code> and walking away without clearing the process, so nothing changes until the next reload months later. Copying a full configuration from another router, including its <code>router-id</code>. Assuming the RID must be an address on the router; a manual RID can be any unique dotted value, and it does not need to be reachable.</p></div>

<div class="exam"><p><b>Exam traps.</b> A router with Loopback0 1.1.1.1 and Gi0/0 192.168.1.1 uses RID <b>1.1.1.1</b> (loopback before physical). After changing <code>router-id</code> on a running process, the old RID stays until <code>clear ip ospf process</code> or a reload. Duplicate RIDs between neighbours log <code>%OSPF-4-DUP_RTRID_NBR</code> and the adjacency never forms.</p></div>

<div class="scn"><h4>The router built from a template</h4><p>A retail chain opened a new store and built its router by pasting the configuration of an existing store and editing the addresses. The engineer forgot the <code>router-id 10.255.0.1</code> line. The new router's link to the core never came up, and the console showed <code>%OSPF-4-DUP_RTRID_NBR: OSPF detected duplicate router-id 10.255.0.1 from 10.9.1.1 on interface GigabitEthernet0/0</code>. Changing the RID to the store's own 10.255.0.37 and running <code>clear ip ospf process</code> brought the adjacency to FULL in under a minute.</p><p><b>Lesson:</b> templates must never carry per-router identities. RID, hostname and addresses are unique per device.</p></div>

<div class="iv"><p class="q">"How does OSPF choose its router ID, and would you leave it automatic?"</p><p>Strong answer: the <code>router-id</code> command first, then the highest up loopback address, then the highest up interface address, chosen once when the process starts. I always set it manually, usually equal to the management loopback, because an automatic RID can change after a reload and a planned scheme avoids duplicates. Changing it on a live router needs <code>clear ip ospf process</code>, which resets all adjacencies, so it belongs in a change window. Mention the duplicate RID log message to show hands-on experience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The RID is a unique 32-bit ID written like an IPv4 address; it names the router in every LSA and neighbour table.</li>
<li>Order: <code>router-id</code> command, highest up loopback, highest up interface. Loopback beats physical even if lower.</li>
<li>The RID is chosen once; after changing it run <code>clear ip ospf process</code> (or reload).</li>
<li>Duplicate RIDs stop adjacencies (<code>%OSPF-4-DUP_RTRID_NBR</code>) and corrupt the LSDB.</li>
<li>Best practice: set it manually from a planned scheme.</li>
</ul></div>
`,hi:`
<p>Badi company mein har employee ki ek employee ID hoti hai. Do logon ka naam same ho sakta hai, lekin ID kabhi nahi, aur HR ka har record usi ID ke under file hota hai. OSPF mein yahi role <b>router ID (RID)</b> ka hai. Yeh ek 32-bit number hai jo IPv4 address ki tarah likha jaata hai, jaise 1.1.1.1, aur yeh router ko har jagah naam deta hai: uske LSAs mein, neighbours ki tables mein aur DR election mein. Agar do routers ka RID same ho, to network ka map bekaar ho jaata hai.</p>

<h3>IOS router ID kaise chunta hai</h3>
<p>Jab OSPF process start hota hai, IOS RID <b>ek baar</b> chunta hai, us pehle rule se jo answer de:</p>
<ol>
<li><code>router ospf</code> ke andar <code>router-id</code> command, agar configured hai.</li>
<li>Nahi to, kisi up <b>loopback interface ka sabse bada IPv4 address</b>.</li>
<li>Nahi to, kisi bhi up <b>dusre interface ka sabse bada IPv4 address</b>.</li>
</ol>
<p>Do details logon ko phasa deti hain. Pehli, loopback physical interface se jeet jaata hai <b>chahe physical address numerically bada ho</b>. Dusri, interface par OSPF enable hona <b>zaroori nahi</b>; koi bhi up interface count hota hai. Agar router ke paas IPv4 address wala koi up interface nahi hai aur <code>router-id</code> bhi nahi, to process start nahi ho sakta aur <code>%OSPF-4-NORTRID: OSPF process 1 failed to allocate unique router-id and cannot start</code> log karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Router ID selection ka order">
<rect x="10" y="40" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">1. router-id command</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">hamesha jeetta hai</text>
<rect x="225" y="40" width="190" height="70" rx="10" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">2. Sabse bada up loopback</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">agar command nahi</text>
<rect x="440" y="40" width="190" height="70" rx="10" fill="#e2e8f0"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">3. Sabse bada up interface</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">agar loopback nahi</text>
<line x1="200" y1="75" x2="225" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Process start par ek baar chuna jaata hai; badalne ke liye clear ip ospf process</text>
</svg><p class="cap">Jo pehla rule address deta hai, wahi router ID decide karta hai.</p></div>

<div class="eg"><p><b>Worked example (Lab 3 ko chhoone se pehle).</b> Chaaron core routers par koi <code>router-id</code> command nahi hai. R1 ke paas Gi0/0 10.10.0.1 aur Gi0/1 10.14.0.1 hai, koi loopback nahi, isliye uska RID <b>10.14.0.1</b> hai. R2 ke paas Loopback0 172.16.2.1 hai, isliye uska RID <b>172.16.2.1</b> hai. R3 isi tarah <b>172.16.3.1</b> banta hai. R4 ke paas loopback nahi aur teen interfaces hain (10.10.0.4, 10.14.0.2 aur 192.168.4.1), isliye uska RID <b>192.168.4.1</b> hai. Yeh IDs kaam karte hain, lekin outputs mein padhna mushkil hai, isiliye lab aapse 1.1.1.1 se 4.4.4.4 set karwati hai.</p></div>

<h3>Router ID set karna aur badalna</h3>
<pre class="code"><span class="c">! Padhne mein aasaan, stable RID set karo</span>
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
% OSPF: Reload or use "clear ip ospf process" command, for this to take effect
R1(config-router)# end
<span class="c">! OSPF restart karo taaki naya RID use ho (saari adjacencies thodi der ke liye girti hain)</span>
R1# clear ip ospf process
Reset ALL OSPF processes? [no]: yes</pre>
<p>Naye router par achhi aadat: <code>router ospf</code> ke andar sabse pehli command <code>router-id</code> type karo, koi bhi interface enable karne se pehle, taaki planned RID shuru se use ho. Chalte process par IOS upar wala reminder print karta hai aur process restart hone tak purana RID rakhta hai. <code>clear ip ospf process</code> har adjacency tod kar dobara banata hai, isliye production router par ise maintenance window mein karo.</p>

<pre class="out">R1# show ip protocols | include Router ID
<span class="hl">  Router ID 1.1.1.1</span>
R1# show ip ospf | include ID
<span class="hl"> Routing Process "ospf 1" with ID 1.1.1.1</span></pre>

<h3>Hard-code kyun karein?</h3>
<ul>
<li><b>Stability.</b> Automatically chuna RID reload ke baad badal sakta hai agar kisi ne loopback joda ya hataya, jisse LSAs badalte hain aur DR election bhi badal sakta hai.</li>
<li><b>Readability.</b> 1.1.1.1 se 4.4.4.4, ya router ka management loopback address, raat 3 baje har output padhna aasaan kar deta hai.</li>
<li><b>Uniqueness.</b> Planned RID scheme duplicates rokti hai jab routers same template se bante hain.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> <code>router-id</code> configure karke process clear kiye bina chale jaana, jisse mahino baad agle reload tak kuch nahi badalta. Dusre router ki poori configuration copy karna, uske <code>router-id</code> samet. Yeh maan lena ki RID router ka koi address hi hona chahiye; manual RID koi bhi unique dotted value ho sakta hai, aur use reachable hona zaroori nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Loopback0 1.1.1.1 aur Gi0/0 192.168.1.1 wala router RID <b>1.1.1.1</b> use karta hai (physical se pehle loopback). Chalte process par <code>router-id</code> badalne ke baad purana RID <code>clear ip ospf process</code> ya reload tak rehta hai. Neighbours ke beech duplicate RIDs <code>%OSPF-4-DUP_RTRID_NBR</code> log karte hain aur adjacency kabhi nahi banti.</p></div>

<div class="scn"><h4>Template se bana router</h4><p>Ek retail chain ne naya store khola aur uska router ek existing store ki configuration paste karke aur addresses edit karke banaya. Engineer <code>router-id 10.255.0.1</code> line bhool gaya. Naye router ka core wala link kabhi up nahi hua, aur console par <code>%OSPF-4-DUP_RTRID_NBR: OSPF detected duplicate router-id 10.255.0.1 from 10.9.1.1 on interface GigabitEthernet0/0</code> dikha. RID ko store ke apne 10.255.0.37 par badalne aur <code>clear ip ospf process</code> chalane se adjacency ek minute se kam mein FULL ho gayi.</p><p><b>Seekh:</b> templates mein kabhi per-router identities nahi honi chahiye. RID, hostname aur addresses har device ke liye unique hain.</p></div>

<div class="iv"><p class="q">"OSPF apna router ID kaise chunta hai, aur kya aap ise automatic chhodoge?"</p><p>Strong answer: pehle <code>router-id</code> command, phir sabse bada up loopback address, phir sabse bada up interface address, process start hone par ek baar chuna jaata hai. Main hamesha ise manually set karta hoon, aam taur par management loopback ke barabar, kyunki automatic RID reload ke baad badal sakta hai aur planned scheme duplicates se bachati hai. Live router par ise badalne ke liye <code>clear ip ospf process</code> chahiye, jo saari adjacencies reset karta hai, isliye yeh change window ka kaam hai. Hands-on experience dikhane ke liye duplicate RID wala log message mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RID ek unique 32-bit ID hai jo IPv4 address ki tarah likha jaata hai; yeh har LSA aur neighbour table mein router ka naam hai.</li>
<li>Order: <code>router-id</code> command, sabse bada up loopback, sabse bada up interface. Loopback physical se jeetta hai chahe chhota ho.</li>
<li>RID ek baar chuna jaata hai; badalne ke baad <code>clear ip ospf process</code> (ya reload) chalao.</li>
<li>Duplicate RIDs adjacencies rok dete hain (<code>%OSPF-4-DUP_RTRID_NBR</code>) aur LSDB kharab karte hain.</li>
<li>Best practice: planned scheme se ise manually set karo.</li>
</ul></div>
`}};export{e as default};