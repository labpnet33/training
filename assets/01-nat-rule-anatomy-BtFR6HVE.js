var e={id:`nat-rule-anatomy`,h:{en:`NAT rule anatomy`,hi:`NAT rule ki anatomy`},body:{en:`
<p><b>What you will learn in this module.</b> You will read and write NAT rules in the Policies page of the console, build dynamic NAT for Internet access, publish a DMZ server with destination NAT, understand how NAT and Access rules work together, fix an engine that the SMC can no longer reach because of NAT, and keep a VPN working when NAT is present. These are the ideas behind the three labs: fp-nat-1, fp-nat-2 and fp-nat-3. This is independent training based on published documentation; it does not claim to cover any certification. Click-ops, but you understand what each click does.</p>
<p><b>Prerequisites.</b> You should know what an IP address, a subnet and a default route are, and you should have finished the earlier modules: the Pune branch topology, interfaces and routing, and Access rules with templates and sub-policies.</p>

<h3>Start with an analogy: the office reception desk</h3>
<p>Staff inside an office have internal extension numbers. When they call out, the reception desk uses one public phone number for everybody. When a customer calls the public number and asks for sales, the desk forwards the call to the right extension. The desk keeps a small notebook of who called whom so the replies go back to the right person. NAT is that reception desk for IP addresses.</p>
<p><b>NAT</b> (Network Address Translation) changes an address, and sometimes a port, in a packet while it passes through the engine. Private addresses such as 10.1.1.0/24 are not routable on the Internet, so the engine replaces them with a public address on the way out.</p>

<h3>The two places where an address can change</h3>
<ul>
<li><b>Source NAT</b> changes who the packet says it is from. Used for staff going out to the Internet.</li>
<li><b>Destination NAT</b> changes where the packet says it is going. Used to publish a server from the DMZ.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NAT on the engine">
<rect x="10" y="50" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="76" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="85" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10</text>
<rect x="245" y="30" width="150" height="100" rx="8" fill="#bae6fd"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="320" y="86" text-anchor="middle" class="svg-accent" font-size="12">NAT rule here</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">eth1 203.0.113.2</text>
<rect x="480" y="50" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="555" y="76" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="555" y="96" text-anchor="middle" class="svg-muted" font-size="12">via ISP</text>
<line x1="160" y1="80" x2="245" y2="80" stroke="#64748b" stroke-width="2"/><line x1="395" y1="80" x2="480" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="202" y="72" text-anchor="middle" class="svg-muted" font-size="12">src 10.1.1.10</text><text x="437" y="72" text-anchor="middle" class="svg-muted" font-size="12">src 203.0.113.2</text>
</svg><p class="cap">The same packet leaves the engine with a different source address.</p></div>

<h3>What is inside a NAT rule</h3>
<p>In the Policies page, the NAT rules editor holds an ordered list of rules. Every rule has the same parts, and each one is a question the engine asks about a new connection.</p>
<table class="cmp"><tr><th>Part</th><th>Question it answers</th><th>Example</th></tr>
<tr><td><b>Source</b></td><td>Who started the connection (original source)?</td><td>net-staff</td></tr>
<tr><td><b>Destination</b></td><td>Where is it going (original destination)?</td><td>any, or a public address</td></tr>
<tr><td><b>Service</b></td><td>Which protocol and port?</td><td>any, HTTP, HTTPS</td></tr>
<tr><td><b>NAT type</b></td><td>Source NAT, destination NAT, or no NAT?</td><td>src, dst, none</td></tr>
<tr><td><b>Translated address</b></td><td>What do we change it to?</td><td>interface-ip, srv-web</td></tr>
</table>
<p>For source NAT you also choose the mode: <b>dynamic</b> (many hosts share the address, ports are used to tell them apart) or <b>static</b> (one private address maps to one public address, 1:1). The next chapters go deep on both.</p>

<h3>The rules of the game</h3>
<ol>
<li><b>Top down, first match wins.</b> The engine reads the NAT rules from the top and uses the first rule that matches. One rule carries all NAT of a connection, so later rules are not applied.</li>
<li><b>No NAT is a rule too.</b> A rule with NAT type none says: do not translate this traffic. Place it above a general rule to make an exception.</li>
<li><b>Sub-policies cannot hold NAT rules.</b> A Jump to a sub-policy is for Access rules only. Keep NAT in the main policy or its template.</li>
<li><b>Only stateful connections.</b> NAT applies to connections the engine tracks (connection tracking). The engine remembers the translation so replies are mapped back automatically; you never write a rule for the reply.</li>
<li><b>Install is the boundary.</b> A NAT rule saved in the SMC does nothing until you use the Install policy bar and the engine takes the new policy. Existing simulated connections are cleared on install.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Network Kings Pune has these NAT rules. Rule 1: source net-staff, destination net-dmz, no NAT. Rule 2: source net-staff, destination any, dynamic source NAT to interface-ip. STAFF-PC 10.1.1.10 opens WEB1 172.16.20.20: rule 1 matches first, no translation, the DMZ server sees 10.1.1.10. STAFF-PC opens a website on the Internet: rule 1 does not match (destination is not net-dmz), rule 2 matches, source becomes the WAN address. Swap the order and rule 2 would catch the DMZ traffic first, which is a common surprise.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting NAT to allow traffic. NAT only rewrites addresses. If the Access rules do not allow the connection, it is dropped before NAT is ever looked at. You always need both.</p></div>

<div class="exam"><p><b>Exam trap.</b> Putting a NAT rule inside a Firewall Sub-Policy. It cannot be done: sub-policies do not contain NAT rules. For details that differ between releases, check the documentation for your NGFW version.</p></div>

<div class="scn"><h4>The exception that sat at the bottom</h4><p>A Pune engineer added a no-NAT rule for traffic between Staff and the DMZ, but added it at the bottom of the list, below the general dynamic rule. Staff reached WEB1, yet the web logs showed the WAN address, not the staff address, so the access list on the server rejected it. The engineer moved the no-NAT rule above the dynamic rule, used Install policy, and the server saw 10.1.1.10 again.</p><p><b>Lesson:</b> NAT is first match. Specific rules go above general ones.</p></div>

<div class="iv"><p class="q">"What does a NAT rule match on, and what happens when two rules match?"</p><p>Strong answer: source, destination and service of the original connection. The first matching rule from the top is used and the rest are ignored for that connection. Mention the no-NAT exception, that NAT is for tracked connections, and that sub-policies cannot hold NAT rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A NAT rule has Source, Destination, Service, NAT type and a translated address.</li>
<li>Rules are read top down; the first match wins and carries all NAT of the connection.</li>
<li>A no-NAT rule above a general rule creates an exception.</li>
<li>Sub-policies cannot contain NAT rules.</li>
<li>NAT is for stateful connections; replies are translated back automatically.</li>
<li>Nothing changes on the engine until you Install policy.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap console ke Policies page mein NAT rules padhna aur likhna seekhoge, Internet access ke liye dynamic NAT banaoge, DMZ server ko destination NAT se publish karoge, samjhoge ki NAT aur Access rules saath mein kaise kaam karte hain, aisa engine fix karoge jisse NAT ki wajah se SMC contact nahi kar paa raha, aur NAT ke saath VPN ko chalta rakhna seekhoge. Yeh teeno labs ke peeche ke ideas hain: fp-nat-1, fp-nat-2 aur fp-nat-3. Yeh independent training hai jo published documentation par based hai; yeh kisi certification ko cover karne ka claim nahi karti. Click-ops, but you understand what each click does.</p>
<p><b>Prerequisites.</b> Aapko IP address, subnet aur default route aana chahiye, aur pichhle modules complete hone chahiye: Pune branch topology, interfaces aur routing, aur templates tatha sub-policies ke saath Access rules.</p>

<h3>Analogy se shuru karo: office ka reception desk</h3>
<p>Office ke andar staff ke paas internal extension numbers hote hain. Jab woh bahar call karte hain, reception desk sabke liye ek hi public phone number use karta hai. Jab customer public number par call karke sales maangta hai, desk call ko sahi extension par forward kar deta hai. Desk ek chhoti notebook rakhta hai ki kisne kisko call kiya, taaki reply sahi person ke paas jaye. NAT IP addresses ke liye wahi reception desk hai.</p>
<p><b>NAT</b> (Network Address Translation) packet ka address, aur kabhi kabhi port, engine se guzarte waqt badal deta hai. 10.1.1.0/24 jaise private addresses Internet par routable nahi hote, isliye engine bahar jaate waqt unhe public address se replace karta hai.</p>

<h3>Address kahan badal sakta hai: do jagah</h3>
<ul>
<li><b>Source NAT</b> badalta hai ki packet khud ko kisse aaya batata hai. Staff ke Internet jaane ke liye use hota hai.</li>
<li><b>Destination NAT</b> badalta hai ki packet kahan ja raha hai. DMZ server publish karne ke liye use hota hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Engine par NAT">
<rect x="10" y="50" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="76" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="85" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10</text>
<rect x="245" y="30" width="150" height="100" rx="8" fill="#bae6fd"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="320" y="86" text-anchor="middle" class="svg-accent" font-size="12">NAT rule yahan</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">eth1 203.0.113.2</text>
<rect x="480" y="50" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="555" y="76" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="555" y="96" text-anchor="middle" class="svg-muted" font-size="12">ISP ke through</text>
<line x1="160" y1="80" x2="245" y2="80" stroke="#64748b" stroke-width="2"/><line x1="395" y1="80" x2="480" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="202" y="72" text-anchor="middle" class="svg-muted" font-size="12">src 10.1.1.10</text><text x="437" y="72" text-anchor="middle" class="svg-muted" font-size="12">src 203.0.113.2</text>
</svg><p class="cap">Wahi packet engine se alag source address ke saath nikalta hai.</p></div>

<h3>NAT rule ke andar kya hota hai</h3>
<p>Policies page mein NAT rules editor ek ordered list rakhta hai. Har rule ke parts same hote hain, aur har part ek sawaal hai jo engine naye connection ke baare mein poochta hai.</p>
<table class="cmp"><tr><th>Part</th><th>Kis sawaal ka jawab</th><th>Example</th></tr>
<tr><td><b>Source</b></td><td>Connection kisne shuru kiya (original source)?</td><td>net-staff</td></tr>
<tr><td><b>Destination</b></td><td>Kahan ja raha hai (original destination)?</td><td>any, ya ek public address</td></tr>
<tr><td><b>Service</b></td><td>Kaunsa protocol aur port?</td><td>any, HTTP, HTTPS</td></tr>
<tr><td><b>NAT type</b></td><td>Source NAT, destination NAT, ya no NAT?</td><td>src, dst, none</td></tr>
<tr><td><b>Translated address</b></td><td>Kis mein badalna hai?</td><td>interface-ip, srv-web</td></tr>
</table>
<p>Source NAT ke liye aap mode bhi chunte ho: <b>dynamic</b> (kai hosts ek address share karte hain, ports se alag pehchane jaate hain) ya <b>static</b> (ek private address ka ek public address se 1:1 mapping). Agle chapters dono mein gehraai se jaayenge.</p>

<h3>Khel ke rules</h3>
<ol>
<li><b>Upar se neeche, first match jeetta hai.</b> Engine NAT rules upar se padhta hai aur pehla matching rule use karta hai. Ek rule connection ka poora NAT carry karta hai, isliye baad ke rules apply nahi hote.</li>
<li><b>No NAT bhi ek rule hai.</b> NAT type none wala rule kehta hai: is traffic ko translate mat karo. Exception banane ke liye ise general rule ke upar rakho.</li>
<li><b>Sub-policies mein NAT rules nahi ho sakte.</b> Sub-policy mein Jump sirf Access rules ke liye hai. NAT ko main policy ya uske template mein rakho.</li>
<li><b>Sirf stateful connections.</b> NAT un connections par lagta hai jinhe engine track karta hai (connection tracking). Engine translation yaad rakhta hai, isliye replies automatically wapas map ho jaate hain; reply ke liye rule nahi likhna padta.</li>
<li><b>Install hi boundary hai.</b> SMC mein save kiya NAT rule tab tak engine par kuch nahi karta jab tak aap Install policy bar use karke nayi policy engine tak nahi pahunchate. Install par existing simulated connections clear ho jaate hain.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Network Kings Pune ke NAT rules: Rule 1: source net-staff, destination net-dmz, no NAT. Rule 2: source net-staff, destination any, dynamic source NAT to interface-ip. STAFF-PC 10.1.1.10 WEB1 172.16.20.20 kholta hai: rule 1 pehle match hota hai, translation nahi, DMZ server ko 10.1.1.10 dikhta hai. STAFF-PC Internet website kholta hai: rule 1 match nahi karta (destination net-dmz nahi hai), rule 2 match karta hai, source WAN address ban jaata hai. Order ulta kar do to rule 2 DMZ traffic ko pehle pakad lega, jo common surprise hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki NAT traffic allow karta hai. NAT sirf addresses rewrite karta hai. Agar Access rules connection allow nahi karte to NAT dekhne se pehle hi drop ho jaata hai. Dono chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> NAT rule ko Firewall Sub-Policy ke andar rakhna. Yeh possible nahi hai: sub-policies mein NAT rules nahi hote. Jo details releases ke beech alag hain, unke liye apne NGFW version ki documentation check karo.</p></div>

<div class="scn"><h4>Exception jo sabse neeche baithi thi</h4><p>Pune ke ek engineer ne Staff aur DMZ ke beech traffic ke liye no-NAT rule banaya, par use list ke bottom mein, general dynamic rule ke neeche daal diya. Staff WEB1 tak pahunch gaya, lekin web logs mein staff address nahi, WAN address dikha, isliye server ki access list ne reject kar diya. Engineer ne no-NAT rule ko dynamic rule ke upar move kiya, Install policy kiya, aur server ko phir 10.1.1.10 dikhne laga.</p><p><b>Lesson:</b> NAT first match hai. Specific rules general rules ke upar jaate hain.</p></div>

<div class="iv"><p class="q">"NAT rule kis par match karta hai, aur do rules match karein to kya hota hai?"</p><p>Strong answer: original connection ke source, destination aur service par. Upar se pehla matching rule use hota hai, baaki us connection ke liye ignore hote hain. No-NAT exception, NAT ka tracked connections ke liye hona, aur sub-policies mein NAT rules na hona zaroor mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT rule mein Source, Destination, Service, NAT type aur translated address hota hai.</li>
<li>Rules upar se neeche padhe jaate hain; first match poora NAT carry karta hai.</li>
<li>General rule ke upar no-NAT rule exception banata hai.</li>
<li>Sub-policies mein NAT rules nahi ho sakte.</li>
<li>NAT stateful connections ke liye hai; replies automatically wapas translate hote hain.</li>
<li>Install policy tak engine par kuch change nahi hota.</li>
</ul></div>
`}};export{e as default};